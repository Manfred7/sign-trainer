import { useState } from 'react';
import { FigureFull } from '../components/FacetView';
import { HEXAGRAMS } from '../data/hexagrams';

const KEY = 'sign-trainer:lookup';

const loadLast = () => {
  try {
    return localStorage.getItem(KEY) ?? '';
  } catch {
    return '';
  }
};

const saveLast = (value: string) => {
  try {
    localStorage.setItem(KEY, value);
  } catch {
    // хранилище недоступно — просто не запоминаем
  }
};

/** Справочник по номеру: ввёл номер — увидел гексаграмму, её название и перевод */
export function LookupScreen({ onExit }: { onExit: () => void }) {
  const [value, setValue] = useState(loadLast);
  const number = Number(value);
  const figure = value !== '' ? HEXAGRAMS.find((h) => h.number === number) : undefined;

  const update = (next: string) => {
    const digits = next.replace(/\D/g, '').slice(0, 2);
    setValue(digits);
    saveLast(digits);
  };

  // Листаем по кругу: после 64 идёт 1
  const step = (delta: number) => {
    const from = figure ? number : delta > 0 ? 0 : 65;
    update(String(((from - 1 + delta + 64) % 64) + 1));
  };

  return (
    <main className="screen lookup">
      <div className="quiz__top">
        <button className="icon-btn" onClick={onExit} aria-label="В меню">
          ←
        </button>
        <h2 className="table__title">Знак по номеру</h2>
      </div>

      <div className="lookup__input-row">
        <button className="btn lookup__step" onClick={() => step(-1)} aria-label="Предыдущий номер">
          ‹
        </button>
        <input
          className="lookup__input"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          autoFocus
          placeholder="1–64"
          aria-label="Номер гексаграммы, от 1 до 64"
          value={value}
          onChange={(e) => update(e.target.value)}
          onFocus={(e) => e.target.select()}
        />
        <button className="btn lookup__step" onClick={() => step(1)} aria-label="Следующий номер">
          ›
        </button>
      </div>

      <section className="card lookup__card" aria-live="polite">
        {figure ? (
          <FigureFull key={figure.id} figure={figure} glyphSize={110} anatomy />
        ) : (
          <p className="card__prompt">{value === '' ? 'Введите номер гексаграммы' : 'Номер должен быть от 1 до 64'}</p>
        )}
      </section>
    </main>
  );
}
