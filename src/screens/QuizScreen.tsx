import { useCallback, useEffect, useReducer } from 'react';
import { FacetView, FigureFull } from '../components/FacetView';
import type { Figure } from '../data/types';
import { type Answer, type Direction, type Question, makeQuestion } from '../logic/quiz';

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
  onFinish: (answers: Answer[]) => void;
  onExit: () => void;
}

export function QuizScreen({ config, onFinish, onExit }: Props) {
  const [state, dispatch] = useReducer(reducer, config, (c) => ({
    current: makeQuestion(c.pool, c.all, c.directions),
    pickedId: null,
    answers: [],
  }));

  const { current, pickedId, answers } = state;
  const revealed = pickedId !== null;
  const correct = pickedId === current.figure.id;

  const next = useCallback(() => {
    if (answers.length >= config.length) {
      onFinish(answers);
      return;
    }
    dispatch({
      type: 'next',
      question: makeQuestion(config.pool, config.all, config.directions, current.figure.id),
    });
  }, [answers, config, current.figure.id, onFinish]);

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
        dispatch({ type: 'answer', id: current.options[n - 1].id });
      } else if (revealed && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [revealed, current, next]);

  const progress = answers.length / config.length;
  const answerIsImage = current.direction.answer === 'image';

  return (
    <main className="screen quiz">
      <div className="quiz__top">
        <button className="icon-btn" onClick={onExit} aria-label="В меню">
          ←
        </button>
        <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={config.length} aria-valuenow={answers.length}>
          <div className="progress__fill" style={{ width: `${progress * 100}%` }} />
        </div>
        <span className="quiz__count">
          {answers.length}/{config.length}
        </span>
      </div>

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
            <button
              key={opt.id}
              className={cls}
              disabled={revealed}
              onClick={() => dispatch({ type: 'answer', id: opt.id })}
            >
              <span className="answer__key" aria-hidden>
                {i + 1}
              </span>
              <FacetView figure={opt} facet={current.direction.answer} glyphSize={56} />
              {revealed && isRight && <span className="answer__mark" aria-label="верно">✓</span>}
              {revealed && isPicked && !isRight && <span className="answer__mark" aria-label="неверно">✗</span>}
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
