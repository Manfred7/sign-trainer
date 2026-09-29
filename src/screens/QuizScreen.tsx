import { useCallback, useEffect, useReducer } from 'react';
import { FacetView, FigureFull } from '../components/FacetView';
import { SessionTop } from '../components/SessionTop';
import type { Figure } from '../data/types';
import { type Answer, type Direction, type Question, type Weight, makeQuestion, unseenFirst } from '../logic/quiz';

export interface QuizConfig {
  /** Из каких фигур спрашивать */
  pool: Figure[];
  /** Откуда брать неверные варианты */
  all: Figure[];
  directions: Direction[];
  length: number;
}

interface State {
  current: Question;
  pickedId: string | null;
  answers: Answer[];
}

type Action = { type: 'answer'; id: string } | { type: 'next'; question: Question };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'answer':
      if (state.pickedId !== null) return state;
      return {
        ...state,
        pickedId: action.id,
        answers: [...state.answers, { question: state.current, pickedId: action.id }],
      };
    case 'next':
      return { ...state, current: action.question, pickedId: null };
  }
}

const AUTO_NEXT_MS = 800;

interface Props {
  config: QuizConfig;
  /** Вес пары для планировщика; берётся из текущего прогресса */
  weight: Weight;
  onAnswer: (answer: Answer) => void;
  onFinish: (answers: Answer[]) => void;
  onExit: () => void;
}

export function QuizScreen({ config, weight, onAnswer, onFinish, onExit }: Props) {
  const [state, dispatch] = useReducer(reducer, config, (c) => ({
    current: makeQuestion(c.pool, c.all, c.directions, weight),
    pickedId: null,
    answers: [],
  }));

  const { current, pickedId, answers } = state;
  const revealed = pickedId !== null;
  const correct = pickedId === current.figure.id;

  const answer = useCallback(
    (id: string) => {
      if (pickedId !== null) return;
      dispatch({ type: 'answer', id });
      onAnswer({ question: current, pickedId: id });
    },
    [pickedId, current, onAnswer],
  );

  const next = useCallback(() => {
    if (answers.length >= config.length) {
      onFinish(answers);
      return;
    }
    dispatch({
      type: 'next',
      question: makeQuestion(
        unseenFirst(config.pool, answers),
        config.all,
        config.directions,
        weight,
        current.figure.id,
      ),
    });
  }, [answers, config, weight, current.figure.id, onFinish]);

  useEffect(() => {
    if (!revealed || !correct) return;
    const t = setTimeout(next, AUTO_NEXT_MS);
    return () => clearTimeout(t);
  }, [revealed, correct, next]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const n = Number(e.key);
      if (!revealed && n >= 1 && n <= current.options.length) {
        answer(current.options[n - 1].id);
      } else if (revealed && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [revealed, current, next, answer]);

  const answerIsImage = current.direction.answer === 'image';

  return (
    <main className="screen quiz">
      <SessionTop done={answers.length} total={config.length} onExit={onExit} />

      <section
        key={answers.length - (revealed ? 1 : 0)}
        className={`card ${revealed ? (correct ? 'card--ok' : 'card--bad') : ''}`}
        aria-live="polite"
      >
        {revealed ? (
          <FigureFull figure={current.figure} glyphSize={110} />
        ) : (
          <>
            <div className="card__ask">
              <FacetView figure={current.figure} facet={current.direction.ask} glyphSize={140} />
            </div>
            <p className="card__prompt">{current.direction.prompt}</p>
          </>
        )}
      </section>

      <div className={`answers ${answerIsImage ? 'answers--glyphs' : ''}`}>
        {current.options.map((opt, i) => {
          const isRight = opt.id === current.figure.id;
          const isPicked = opt.id === pickedId;
          let cls = 'answer';
          if (revealed) {
            if (isRight) cls += ' answer--ok';
            else if (isPicked) cls += ' answer--bad';
            else cls += ' answer--dim';
          }
          return (
            <button key={opt.id} className={cls} disabled={revealed} onClick={() => answer(opt.id)}>
              <span className="answer__key" aria-hidden>
                {i + 1}
              </span>
              <FacetView figure={opt} facet={current.direction.answer} glyphSize={56} />
              {revealed && isRight && (
                <span className="answer__mark" aria-label="верно">
                  ✓
                </span>
              )}
              {revealed && isPicked && !isRight && (
                <span className="answer__mark" aria-label="неверно">
                  ✗
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="quiz__footer">
        {revealed && !correct && (
          <button className="btn btn--primary btn--wide" onClick={next} autoFocus>
            Дальше
          </button>
        )}
      </div>
    </main>
  );
}
