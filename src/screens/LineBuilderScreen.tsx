import { useCallback, useEffect, useReducer } from 'react';
import { BuildTarget, FigureFull } from '../components/FacetView';
import { SessionTop } from '../components/SessionTop';
import { HEXAGRAMS } from '../data/hexagrams';
import { TRIGRAMS } from '../data/trigrams';
import type { Figure, Line } from '../data/types';
import { type Answer, BUILD_LINES_DIRECTION, type LevelOf, makeQuestion, unseenFirst } from '../logic/quiz';
import type { QuizConfig } from './QuizScreen';

interface State {
  current: Figure;
  lines: Line[];
  checked: boolean;
  answers: Answer[];
}

type Action = { type: 'toggle'; index: number } | { type: 'check' } | { type: 'next'; figure: Figure };

/** Начинаем со всех сплошных линий: сколько линий в знаке — столько и кнопок */
const blank = (f: Figure): Line[] => f.lines.map(() => 1);

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'toggle':
      if (state.checked) return state;
      return { ...state, lines: state.lines.map((l, i) => (i === action.index ? ((1 - l) as Line) : l)) };
    case 'check':
      if (state.checked) return state;
      return { ...state, checked: true, answers: [...state.answers, toAnswer(state.current, state.lines)] };
    case 'next':
      return { current: action.figure, lines: blank(action.figure), checked: false, answers: state.answers };
  }
}

/** «Выбранный» знак — тот, чьи линии собрал пользователь */
function toAnswer(figure: Figure, lines: Line[]): Answer {
  const universe = figure.kind === 'trigram' ? TRIGRAMS : HEXAGRAMS;
  const picked = universe.find((f) => f.lines.join('') === lines.join(''))!;
  return { question: { figure, direction: BUILD_LINES_DIRECTION, options: [] }, pickedId: picked.id };
}

const AUTO_NEXT_MS = 1000;

interface Props {
  config: QuizConfig;
  levelOf: LevelOf;
  onAnswer: (answer: Answer) => void;
  onFinish: (answers: Answer[]) => void;
  onExit: () => void;
}

/** Режим «Сборка» по линиям: тап по линии переключает ян ↔ инь, затем «Проверить» */
export function LineBuilderScreen({ config, levelOf, onAnswer, onFinish, onExit }: Props) {
  const [state, dispatch] = useReducer(reducer, null, () => {
    const figure = makeQuestion(config.pool, config.all, [BUILD_LINES_DIRECTION], levelOf).figure;
    return { current: figure, lines: blank(figure), checked: false, answers: [] };
  });
  const { current, lines, checked, answers } = state;
  const correct = checked && lines.join('') === current.lines.join('');

  const check = useCallback(() => {
    if (checked) return;
    dispatch({ type: 'check' });
    onAnswer(toAnswer(current, lines));
  }, [checked, current, lines, onAnswer]);

  const next = useCallback(() => {
    if (answers.length >= config.length) {
      onFinish(answers);
      return;
    }
    const figure = makeQuestion(
      unseenFirst(config.pool, answers),
      config.all,
      [BUILD_LINES_DIRECTION],
      levelOf,
      current.id,
    ).figure;
    dispatch({ type: 'next', figure });
  }, [answers, config, levelOf, current.id, onFinish]);

  useEffect(() => {
    if (!correct) return;
    const t = setTimeout(next, AUTO_NEXT_MS);
    return () => clearTimeout(t);
  }, [correct, next]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const n = Number(e.key);
      if (!checked && n >= 1 && n <= lines.length) dispatch({ type: 'toggle', index: n - 1 });
      else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (checked) next();
        else check();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [checked, lines.length, check, next]);

  // Рисуем сверху вниз, а нумеруем снизу вверх, как принято в И-цзин
  const order = lines.map((_, i) => lines.length - 1 - i);
  const split = lines.length === 6;

  return (
    <main className="screen quiz">
      <SessionTop done={answers.length} total={config.length} onExit={onExit} />

      <section
        key={answers.length - (checked ? 1 : 0)}
        className={`card card--builder ${checked ? (correct ? 'card--ok' : 'card--bad') : ''}`}
        aria-live="polite"
      >
        {checked && !correct ? (
          <FigureFull figure={current} glyphSize={90} anatomy={current.kind === 'hexagram'} />
        ) : (
          <>
            <BuildTarget figure={current} />
            <p className="card__prompt">Соберите знак: тап по линии меняет её</p>
          </>
        )}
      </section>

      <div className="builder" role="group" aria-label="Линии знака, снизу вверх">
        {order.map((i) => {
          const wrong = checked && lines[i] !== current.lines[i];
          const state = checked ? (wrong ? 'builder__row--bad' : 'builder__row--ok') : '';
          return (
            <button
              key={i}
              className={`builder__row ${state} ${split && i === 2 ? 'builder__row--split' : ''}`}
              disabled={checked}
              onClick={() => dispatch({ type: 'toggle', index: i })}
              aria-label={`Линия ${i + 1}: ${lines[i] ? 'сплошная' : 'прерывистая'}`}
            >
              <span className="builder__num">{i + 1}</span>
              <span className={`builder__line ${lines[i] ? '' : 'builder__line--yin'}`}>
                <span />
                <span />
              </span>
            </button>
          );
        })}
      </div>

      <div className="quiz__footer">
        {!checked ? (
          <button className="btn btn--primary btn--wide" onClick={check}>
            Проверить
          </button>
        ) : (
          !correct && (
            <button className="btn btn--primary btn--wide" onClick={next} autoFocus>
              Дальше
            </button>
          )
        )}
      </div>
    </main>
  );
}
