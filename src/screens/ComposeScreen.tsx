import { useCallback, useEffect, useReducer } from 'react';
import { FigureFull } from '../components/FacetView';
import { FigureGlyph } from '../components/FigureGlyph';
import { SessionTop } from '../components/SessionTop';
import { HEXAGRAMS } from '../data/hexagrams';
import { TRIGRAMS, trigramById } from '../data/trigrams';
import type { Figure } from '../data/types';
import { type Answer, COMPOSE_DIRECTION, type Weight, makeQuestion, unseenFirst } from '../logic/quiz';
import type { QuizConfig } from './QuizScreen';

interface State {
  current: Figure;
  lower: string | null;
  upper: string | null;
  answers: Answer[];
}

type Action = { type: 'pick'; id: string } | { type: 'next'; figure: Figure };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'pick':
      if (state.lower === null) return { ...state, lower: action.id };
      if (state.upper === null) {
        return {
          ...state,
          upper: action.id,
          answers: [...state.answers, toAnswer(state.current, state.lower, action.id)],
        };
      }
      return state;
    case 'next':
      return { ...state, current: action.figure, lower: null, upper: null };
  }
}

/**
 * Ответ записывается как обычный выбор: «выбранной» считается гексаграмма,
 * собранная из указанных триграмм. Верно — если она совпала с загаданной.
 */
function toAnswer(figure: Figure, lower: string, upper: string): Answer {
  const picked = HEXAGRAMS.find((h) => h.lower === lower && h.upper === upper)!;
  return { question: { figure, direction: COMPOSE_DIRECTION, options: [] }, pickedId: picked.id };
}

const AUTO_NEXT_MS = 1000;

interface Props {
  config: QuizConfig;
  weight: Weight;
  onAnswer: (answer: Answer) => void;
  onFinish: (answers: Answer[]) => void;
  onExit: () => void;
}

export function ComposeScreen({ config, weight, onAnswer, onFinish, onExit }: Props) {
  const nextFigure = (prevId?: string) =>
    makeQuestion(config.pool, config.all, [COMPOSE_DIRECTION], weight, prevId).figure;

  const [state, dispatch] = useReducer(reducer, null, () => ({
    current: nextFigure(),
    lower: null,
    upper: null,
    answers: [],
  }));
  const { current, lower, upper, answers } = state;

  const step = lower === null ? 'lower' : upper === null ? 'upper' : 'done';
  const lowerOk = lower === current.lower;
  const upperOk = upper === current.upper;
  const correct = step === 'done' && lowerOk && upperOk;

  const pick = useCallback(
    (id: string) => {
      if (step === 'done') return;
      dispatch({ type: 'pick', id });
      if (step === 'upper') onAnswer(toAnswer(current, lower!, id));
    },
    [step, current, lower, onAnswer],
  );

  const next = useCallback(() => {
    if (answers.length >= config.length) {
      onFinish(answers);
      return;
    }
    dispatch({
      type: 'next',
      figure: makeQuestion(unseenFirst(config.pool, answers), config.all, [COMPOSE_DIRECTION], weight, current.id)
        .figure,
    });
  }, [answers, config, weight, current.id, onFinish]);

  useEffect(() => {
    if (!correct) return;
    const t = setTimeout(next, AUTO_NEXT_MS);
    return () => clearTimeout(t);
  }, [correct, next]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const n = Number(e.key);
      if (step !== 'done' && n >= 1 && n <= TRIGRAMS.length) pick(TRIGRAMS[n - 1].id);
      else if (step === 'done' && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [step, pick, next]);

  // На шаге «сверху» подсвечиваем только выбор снизу; после ответа — оба
  const buttonState = (id: string) => {
    if (step === 'done') {
      if (id === current.upper) return 'answer--ok';
      if (id === upper) return 'answer--bad';
      return 'answer--dim';
    }
    return '';
  };

  return (
    <main className="screen quiz">
      <SessionTop done={answers.length} total={config.length} onExit={onExit} />

      <section
        key={answers.length - (step === 'done' ? 1 : 0)}
        className={`card ${step === 'done' ? (correct ? 'card--ok' : 'card--bad') : ''}`}
        aria-live="polite"
      >
        {step === 'done' ? (
          <FigureFull figure={current} glyphSize={100} anatomy />
        ) : (
          <>
            <div className="card__ask">
              <FigureGlyph figure={current} size={130} highlight={step} />
            </div>
            <p className="card__prompt">{step === 'lower' ? 'Какая триграмма снизу?' : 'Какая триграмма сверху?'}</p>
          </>
        )}
      </section>

      {lower !== null && (
        <div className="compose__picks">
          <PickChip label="Снизу" picked={lower} right={current.lower!} />
          {upper !== null && <PickChip label="Сверху" picked={upper} right={current.upper!} />}
        </div>
      )}

      <div className="picker">
        {TRIGRAMS.map((t, i) => (
          <button
            key={t.id}
            className={`answer picker__btn ${buttonState(t.id)}`}
            disabled={step === 'done'}
            onClick={() => pick(t.id)}
          >
            <span className="answer__key" aria-hidden>
              {i + 1}
            </span>
            <span className="picker__meaning">{t.meaning[0]}</span>
            <span className="picker__name">{t.name}</span>
          </button>
        ))}
      </div>

      <div className="quiz__footer">
        {step === 'done' && !correct && (
          <button className="btn btn--primary btn--wide" onClick={next} autoFocus>
            Дальше
          </button>
        )}
      </div>
    </main>
  );
}

function PickChip({ label, picked, right }: { label: string; picked: string; right: string }) {
  const ok = picked === right;
  const p = trigramById(picked);
  const r = trigramById(right);
  return (
    <div className={`chip ${ok ? 'chip--ok' : 'chip--bad'}`}>
      <span className="chip__label">{label}:</span> {p.meaning[0]} {ok ? '✓' : `✗ — верно ${r.meaning[0]}`}
    </div>
  );
}
