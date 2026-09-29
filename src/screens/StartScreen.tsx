import { FigureGlyph } from '../components/FigureGlyph';
import { TRIGRAMS } from '../data/trigrams';
import { type Deck, DECKS, isUnlocked } from '../logic/decks';
import { type Progress, UNLOCK_SHARE, mastery } from '../logic/progress';
import { DIRECTIONS } from '../logic/quiz';
import { SESSION_LENGTHS, type Settings } from '../logic/settings';

interface Props {
  settings: Settings;
  progress: Progress;
  /** Колода, которая реально будет запущена (выбранная, если она открыта) */
  deck: Deck;
  onChange: (s: Settings) => void;
  onResetProgress: () => void;
  onStart: () => void;
}

const pct = (x: number) => `${Math.round(x * 100)}%`;

export function StartScreen({ settings, progress, deck, onChange, onResetProgress, onStart }: Props) {
  const directions = DIRECTIONS.filter((d) => settings.directionIds.includes(d.id));
  const toggle = (id: string) => {
    const has = settings.directionIds.includes(id);
    const directionIds = has ? settings.directionIds.filter((d) => d !== id) : [...settings.directionIds, id];
    onChange({ ...settings, directionIds });
  };
  const allOn = settings.directionIds.length === DIRECTIONS.length;
  const canStart = directions.length > 0;

  const reset = () => {
    if (window.confirm('Сбросить весь прогресс? Открытые колоды снова закроются.')) onResetProgress();
  };

  return (
    <main className="screen start">
      <header className="start__hero">
        <div className="start__glyphs" aria-hidden>
          {TRIGRAMS.map((t) => (
            <FigureGlyph key={t.id} figure={t} size={28} labelled={false} />
          ))}
        </div>
        <h1>Знаки перемен</h1>
        <p className="muted">Триграммы и гексаграммы: изображение, название и смысл</p>
      </header>

      <section className="panel">
        <div className="panel__head">
          <h2>Колода</h2>
          <button className="link" onClick={() => onChange({ ...settings, unlockAll: !settings.unlockAll })}>
            {settings.unlockAll ? 'Открывать по порядку' : 'Открыть все'}
          </button>
        </div>
        <ul className="decks" role="radiogroup" aria-label="Колода">
          {DECKS.map((d) => {
            const open = isUnlocked(d, progress, settings.unlockAll);
            const m = mastery(progress, d.figures, directions);
            const on = d.id === deck.id;
            return (
              <li key={d.id}>
                <button
                  role="radio"
                  aria-checked={on}
                  disabled={!open}
                  className={`deck ${on ? 'is-on' : ''}`}
                  onClick={() => onChange({ ...settings, deckId: d.id })}
                >
                  <span className="deck__main">
                    <span className="deck__title">{d.title}</span>
                    <span className="deck__sub">
                      {open ? d.subtitle : `Нужно ${pct(UNLOCK_SHARE)} в предыдущей`}
                    </span>
                  </span>
                  {open ? (
                    <span className="deck__progress">
                      <span className="deck__pct">{pct(m)}</span>
                      <span className="bar bar--small">
                        <span className="bar__fill" style={{ width: pct(m) }} />
                      </span>
                    </span>
                  ) : (
                    <span className="deck__lock" aria-hidden>
                      🔒
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="panel">
        <div className="panel__head">
          <h2>Направления</h2>
          <button
            className="link"
            onClick={() => onChange({ ...settings, directionIds: allOn ? [] : DIRECTIONS.map((d) => d.id) })}
          >
            {allOn ? 'Снять все' : 'Выбрать все'}
          </button>
        </div>
        <ul className="checks">
          {DIRECTIONS.map((d) => (
            <li key={d.id}>
              <label className="check">
                <input type="checkbox" checked={settings.directionIds.includes(d.id)} onChange={() => toggle(d.id)} />
                <span>{d.label}</span>
              </label>
            </li>
          ))}
        </ul>
        <p className="panel__note">Процент освоения считается по выбранным направлениям.</p>
      </section>

      <section className="panel">
        <h2>Карточек за сессию</h2>
        <div className="segmented" role="radiogroup" aria-label="Карточек за сессию">
          {SESSION_LENGTHS.map((n) => (
            <button
              key={n}
              role="radio"
              aria-checked={settings.length === n}
              className={settings.length === n ? 'is-on' : ''}
              onClick={() => onChange({ ...settings, length: n })}
            >
              {n}
            </button>
          ))}
        </div>
      </section>

      <button className="btn btn--primary btn--wide" disabled={!canStart} onClick={onStart}>
        Начать: {deck.title}
      </button>
      {!canStart && <p className="hint">Выберите хотя бы одно направление</p>}

      <button className="btn btn--ghost btn--small" onClick={reset}>
        Сбросить прогресс
      </button>
    </main>
  );
}
