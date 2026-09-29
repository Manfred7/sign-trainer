import { FigureFull } from '../components/FacetView';
import type { Figure } from '../data/types';
import { type Answer, isCorrect } from '../logic/quiz';

export interface SessionSummary {
  deckTitle: string;
  masteryBefore: number;
  masteryAfter: number;
  /** Названия колод, открывшихся за эту сессию */
  newlyUnlocked: string[];
}

const pct = (x: number) => `${Math.round(x * 100)}%`;

interface Props {
  answers: Answer[];
  summary: SessionSummary;
  onRetryMistakes: (figures: Figure[]) => void;
  onRestart: () => void;
  onMenu: () => void;
}

export function ResultScreen({ answers, summary, onRetryMistakes, onRestart, onMenu }: Props) {
  const right = answers.filter(isCorrect).length;
  const accuracy = answers.length ? right / answers.length : 0;

  const mistakes = new Map<string, { figure: Figure; count: number }>();
  for (const a of answers) {
    if (isCorrect(a)) continue;
    const f = a.question.figure;
    const entry = mistakes.get(f.id) ?? { figure: f, count: 0 };
    entry.count++;
    mistakes.set(f.id, entry);
  }
  const hardest = [...mistakes.values()].sort((a, b) => b.count - a.count);

  return (
    <main className="screen result">
      <section className="result__score">
        <div className="result__pct">{pct(accuracy)}</div>
        <p className="muted">
          {right} из {answers.length} верно
        </p>
      </section>

      <section className="panel result__mastery">
        <div className="result__mastery-row">
          <span>Освоено: {summary.deckTitle}</span>
          <strong>
            {pct(summary.masteryBefore)} → {pct(summary.masteryAfter)}
          </strong>
        </div>
        <div className="bar">
          <div className="bar__fill" style={{ width: pct(summary.masteryAfter) }} />
        </div>
        {summary.newlyUnlocked.map((title) => (
          <p key={title} className="result__unlocked">
            Открыта колода «{title}»
          </p>
        ))}
      </section>

      {hardest.length > 0 ? (
        <section className="panel">
          <h2>Стоит повторить</h2>
          <ul className="mistakes">
            {hardest.map(({ figure, count }) => (
              <li key={figure.id}>
                <FigureFull figure={figure} glyphSize={44} showComposition={false} />
                <span className="mistakes__count">×{count}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <p className="result__perfect">Без ошибок</p>
      )}

      <div className="result__actions">
        {hardest.length > 0 && (
          <button className="btn btn--primary btn--wide" onClick={() => onRetryMistakes(hardest.map((m) => m.figure))}>
            Повторить ошибки
          </button>
        )}
        <button className={`btn btn--wide ${hardest.length ? '' : 'btn--primary'}`} onClick={onRestart}>
          Ещё сессия
        </button>
        <button className="btn btn--ghost btn--wide" onClick={onMenu}>
          В меню
        </button>
      </div>
    </main>
  );
}
