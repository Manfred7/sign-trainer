import { FigureGlyph } from '../components/FigureGlyph';
import { TRIGRAMS } from '../data/trigrams';
import { DIRECTIONS } from '../logic/quiz';
import { SESSION_LENGTHS, type Settings } from '../logic/settings';

interface Props {
  settings: Settings;
  onChange: (s: Settings) => void;
  onStart: () => void;
}

export function StartScreen({ settings, onChange, onStart }: Props) {
  const toggle = (id: string) => {
    const has = settings.directionIds.includes(id);
    const directionIds = has ? settings.directionIds.filter((d) => d !== id) : [...settings.directionIds, id];
    onChange({ ...settings, directionIds });
  };
  const allOn = settings.directionIds.length === DIRECTIONS.length;
  const canStart = settings.directionIds.length > 0;

  return (
    <main className="screen start">
      <header className="start__hero">
        <div className="start__glyphs" aria-hidden>
          {TRIGRAMS.map((t) => (
            <FigureGlyph key={t.id} figure={t} size={28} labelled={false} />
          ))}
        </div>
        <h1>Триграммы</h1>
        <p className="muted">Изображение, название и смысл восьми знаков ба-гуа</p>
      </header>

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
        Начать
      </button>
      {!canStart && <p className="hint">Выберите хотя бы одно направление</p>}
    </main>
  );
}
