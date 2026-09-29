import { type ReactNode, useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { BuildTarget, FigureFull } from '../components/FacetView';
import { FigureGlyph } from '../components/FigureGlyph';
import { SessionTop } from '../components/SessionTop';
import { HEXAGRAMS } from '../data/hexagrams';
import { TRIGRAMS } from '../data/trigrams';
import type { Figure } from '../data/types';
import { type Answer, GRID_DIRECTION, type LevelOf, makeQuestion, unseenFirst } from '../logic/quiz';
import type { QuizConfig } from './QuizScreen';

const hexAt = (lower: string, upper: string) => HEXAGRAMS.find((h) => h.lower === lower && h.upper === upper)!;

interface GridProps {
  /** Содержимое клетки */
  renderCell: (h: Figure) => ReactNode;
  /** Дополнительный класс клетки: подсветка выбора, верного ответа и т. п. */
  cellClass?: (h: Figure) => string;
  onCell: (h: Figure) => void;
  disabled?: boolean;
}

/** Таблица 8×8: строки — нижняя триграмма, столбцы — верхняя */
function HexGrid({ renderCell, cellClass, onCell, disabled }: GridProps) {
  return (
    <div className="hexgrid" role="grid" aria-label="Таблица гексаграмм: строки — нижняя триграмма, столбцы — верхняя">
      <div className="hexgrid__corner" aria-hidden>
        <span>верх →</span>
        <span>низ ↓</span>
      </div>
      {TRIGRAMS.map((t) => (
        <div key={t.id} className="hexgrid__head" role="columnheader" title={`Сверху ${t.name}`}>
          <FigureGlyph figure={t} size={18} labelled={false} />
          <span>{t.meaning[0]}</span>
        </div>
      ))}
      {TRIGRAMS.map((lower) => (
        <div key={lower.id} className="hexgrid__row" role="row">
          <div className="hexgrid__head hexgrid__head--row" role="rowheader" title={`Снизу ${lower.name}`}>
            <FigureGlyph figure={lower} size={18} labelled={false} />
            <span>{lower.meaning[0]}</span>
          </div>
          {TRIGRAMS.map((upper) => {
            const h = hexAt(lower.id, upper.id);
            return (
              <button
                key={upper.id}
                role="gridcell"
                className={`hexgrid__cell ${cellClass?.(h) ?? ''}`}
                disabled={disabled}
                onClick={() => onCell(h)}
                aria-label={`${upper.meaning[0]} над ${lower.meaning[0]}`}
              >
                {renderCell(h)}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/** Справочник: вся таблица с номерами и рисунками, по тапу — карточка знака */
export function TableReferenceScreen({ onExit }: { onExit: () => void }) {
  const [selected, setSelected] = useState<Figure | null>(null);
  const detail = useRef<HTMLElement>(null);

  useEffect(() => {
    if (selected) detail.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [selected]);

  return (
    <main className="screen screen--wide table">
      <div className="quiz__top">
        <button className="icon-btn" onClick={onExit} aria-label="В меню">
          ←
        </button>
        <h2 className="table__title">Таблица гексаграмм</h2>
      </div>

      <HexGrid
        renderCell={(h) => (
          <>
            <span className="hexgrid__num">{h.number}</span>
            <FigureGlyph figure={h} size={16} labelled={false} />
          </>
        )}
        cellClass={(h) => (h.id === selected?.id ? 'hexgrid__cell--on' : '')}
        onCell={setSelected}
      />

      <section ref={detail} className="card table__detail" aria-live="polite">
        {selected ? (
          <FigureFull key={selected.id} figure={selected} glyphSize={90} anatomy />
        ) : (
          <p className="card__prompt">Нажмите на клетку, чтобы открыть карточку</p>
        )}
      </section>
    </main>
  );
}

interface FindState {
  current: Figure;
  pickedId: string | null;
  answers: Answer[];
}

type FindAction = { type: 'pick'; id: string } | { type: 'next'; figure: Figure };

function findReducer(state: FindState, action: FindAction): FindState {
  switch (action.type) {
    case 'pick': {
      if (state.pickedId !== null) return state;
      const answer: Answer = {
        question: { figure: state.current, direction: GRID_DIRECTION, options: [] },
        pickedId: action.id,
      };
      return { ...state, pickedId: action.id, answers: [...state.answers, answer] };
    }
    case 'next':
      return { current: action.figure, pickedId: null, answers: state.answers };
  }
}

const AUTO_NEXT_MS = 900;

interface FindProps {
  config: QuizConfig;
  levelOf: LevelOf;
  onAnswer: (answer: Answer) => void;
  onFinish: (answers: Answer[]) => void;
  onExit: () => void;
}

/** Игра «Найди клетку»: по названию указать место гексаграммы; клетки пустые, опора — только триграммы */
export function TableFindScreen({ config, levelOf, onAnswer, onFinish, onExit }: FindProps) {
  const [state, dispatch] = useReducer(findReducer, null, () => ({
    current: makeQuestion(config.pool, config.all, [GRID_DIRECTION], levelOf).figure,
    pickedId: null,
    answers: [],
  }));
  const { current, pickedId, answers } = state;
  const revealed = pickedId !== null;
  const correct = pickedId === current.id;

  const pick = useCallback(
    (h: Figure) => {
      if (revealed) return;
      dispatch({ type: 'pick', id: h.id });
      onAnswer({ question: { figure: current, direction: GRID_DIRECTION, options: [] }, pickedId: h.id });
    },
    [revealed, current, onAnswer],
  );

  const next = useCallback(() => {
    if (answers.length >= config.length) {
      onFinish(answers);
      return;
    }
    const figure = makeQuestion(
      unseenFirst(config.pool, answers),
      config.all,
      [GRID_DIRECTION],
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
      if (revealed && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [revealed, next]);

  const cellClass = (h: Figure) => {
    if (!revealed) return '';
    if (h.id === current.id) return 'hexgrid__cell--ok';
    if (h.id === pickedId) return 'hexgrid__cell--bad';
    return '';
  };

  return (
    <main className="screen screen--wide table">
      <SessionTop done={answers.length} total={config.length} onExit={onExit} />

      <section
        key={answers.length - (revealed ? 1 : 0)}
        className={`card table__ask ${revealed ? (correct ? 'card--ok' : 'card--bad') : ''}`}
        aria-live="polite"
      >
        {revealed && !correct ? (
          <FigureFull figure={current} glyphSize={64} anatomy />
        ) : (
          <>
            <BuildTarget figure={current} showNumber={false} />
            <p className="card__prompt">{GRID_DIRECTION.prompt}</p>
          </>
        )}
      </section>

      <HexGrid
        renderCell={(h) =>
          revealed && (h.id === current.id || h.id === pickedId) ? (
            <FigureGlyph figure={h} size={16} labelled={false} />
          ) : null
        }
        cellClass={cellClass}
        onCell={pick}
        disabled={revealed}
      />

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
