import { useEffect, useRef, useState } from 'react';
import { FigureFull } from '../components/FacetView';
import { SessionTop } from '../components/SessionTop';
import type { Deck } from '../logic/decks';

interface Props {
  deck: Deck;
  onExit: () => void;
}

const SWIPE_PX = 50;

/** Режим «Знакомство»: листаем карточки колоды со всеми представлениями, без проверки */
export function StudyScreen({ deck, onExit }: Props) {
  const [index, setIndex] = useState(0);
  const n = deck.figures.length;
  const figure = deck.figures[index];
  const swipeFrom = useRef<number | null>(null);

  const go = (delta: number) => setIndex((i) => (i + delta + n) % n);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setIndex((i) => (i + 1) % n);
      else if (e.key === 'ArrowLeft') setIndex((i) => (i - 1 + n) % n);
      else if (e.key === 'Escape') onExit();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [n, onExit]);

  return (
    <main className="screen study">
      <SessionTop done={index + 1} total={n} onExit={onExit} />

      <section
        key={figure.id}
        className="card card--study"
        onPointerDown={(e) => (swipeFrom.current = e.clientX)}
        onPointerUp={(e) => {
          if (swipeFrom.current === null) return;
          const dx = e.clientX - swipeFrom.current;
          swipeFrom.current = null;
          if (Math.abs(dx) >= SWIPE_PX) go(dx < 0 ? 1 : -1);
        }}
      >
        <FigureFull figure={figure} glyphSize={figure.kind === 'hexagram' ? 110 : 130} anatomy />
      </section>

      <div className="study__nav">
        <button className="btn" onClick={() => go(-1)} aria-label="Предыдущая карточка">
          ← Назад
        </button>
        <button className="btn btn--primary" onClick={() => go(1)} aria-label="Следующая карточка">
          Дальше →
        </button>
      </div>
      <p className="hint">Листайте свайпом или стрелками ← →</p>
    </main>
  );
}
