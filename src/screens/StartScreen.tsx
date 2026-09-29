import { FigureGlyph } from '../components/FigureGlyph';
import { TRIGRAMS } from '../data/trigrams';
import { type Deck, DECKS, buildInputFor, isAvailable, modeDirections } from '../logic/decks';
import { type Progress, UNLOCK_SHARE, mastery } from '../logic/progress';
import { useInstall } from '../logic/install';
import { DIRECTIONS } from '../logic/quiz';
import { type BuildInput, MODES, SESSION_LENGTHS, type Settings, type TableView } from '../logic/settings';

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

const MODE_NOTES = {
  quiz: 'Карточка и четыре варианта ответа.',
  study: 'Листайте карточки со всеми представлениями знака, без проверки.',
  compose: 'Определите, из каких триграмм сложена гексаграмма: сначала нижнюю, потом верхнюю.',
  build: 'По названию и переводу соберите знак: из двух триграмм или по линиям.',
  table: 'Все 64 гексаграммы в таблице 8×8: строки — нижняя триграмма, столбцы — верхняя.',
} as const;

const TABLE_VIEWS: { id: TableView; label: string }[] = [
  { id: 'reference', label: 'Справочник' },
  { id: 'find', label: 'Найди клетку' },
];

const BUILD_INPUTS: { id: BuildInput; label: string }[] = [
  { id: 'trigrams', label: 'Из триграмм' },
  { id: 'lines', label: 'По линиям' },
];

export function StartScreen({ settings, progress, deck, onChange, onResetProgress, onStart }: Props) {
  const { mode } = settings;
  const { canInstall, iosHint, install } = useInstall();
  const selectedDirections = DIRECTIONS.filter((d) => settings.directionIds.includes(d.id));
  const directionsFor = (d: Deck) => modeDirections(mode, selectedDirections, buildInputFor(d, settings.buildInput));
  const directions = directionsFor(deck);
  const toggle = (id: string) => {
    const has = settings.directionIds.includes(id);
    const directionIds = has ? settings.directionIds.filter((d) => d !== id) : [...settings.directionIds, id];
    onChange({ ...settings, directionIds });
  };
  const allOn = settings.directionIds.length === DIRECTIONS.length;
  const canStart = directions.length > 0;
  const tableReference = mode === 'table' && settings.tableView === 'reference';
  const startText =
    mode === 'table'
      ? tableReference
        ? 'Открыть таблицу'
        : 'Начать поиск'
      : `${mode === 'study' ? 'Смотреть' : 'Начать'}: ${deck.title}`;

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
        <h2>Режим</h2>
        <div className="segmented" role="radiogroup" aria-label="Режим">
          {MODES.map((m) => (
            <button
              key={m.id}
              role="radio"
              aria-checked={mode === m.id}
              className={mode === m.id ? 'is-on' : ''}
              onClick={() => onChange({ ...settings, mode: m.id })}
            >
              {m.label}
            </button>
          ))}
        </div>
        <p className="panel__note">{MODE_NOTES[mode]}</p>
      </section>

      {mode === 'table' && (
        <section className="panel">
          <h2>Вид</h2>
          <div className="segmented segmented--2" role="radiogroup" aria-label="Вид таблицы">
            {TABLE_VIEWS.map((v) => (
              <button
                key={v.id}
                role="radio"
                aria-checked={settings.tableView === v.id}
                className={settings.tableView === v.id ? 'is-on' : ''}
                onClick={() => onChange({ ...settings, tableView: v.id })}
              >
                {v.label}
              </button>
            ))}
          </div>
          <p className="panel__note">
            {settings.tableView === 'reference'
              ? 'Нажмите на клетку, чтобы открыть карточку знака.'
              : `Клетки пустые — найдите знак по его триграммам. Освоено: ${pct(mastery(progress, deck.figures, directions))}.`}
          </p>
        </section>
      )}

      {mode !== 'table' && (
        <section className="panel">
          <div className="panel__head">
            <h2>Колода</h2>
            {(mode === 'quiz' || mode === 'build') && (
              <button className="link" onClick={() => onChange({ ...settings, unlockAll: !settings.unlockAll })}>
                {settings.unlockAll ? 'Открывать по порядку' : 'Открыть все'}
              </button>
            )}
          </div>
          <ul className="decks" role="radiogroup" aria-label="Колода">
            {DECKS.map((d) => {
              const open = isAvailable(d, mode, progress, settings.unlockAll);
              const m = mastery(progress, d.figures, directionsFor(d));
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
                        {open
                          ? d.subtitle
                          : mode === 'compose'
                            ? 'Только для гексаграмм'
                            : `Нужно ${pct(UNLOCK_SHARE)} в предыдущей`}
                      </span>
                    </span>
                    {open && mode !== 'study' ? (
                      <span className="deck__progress">
                        <span className="deck__pct">{pct(m)}</span>
                        <span className="bar bar--small">
                          <span className="bar__fill" style={{ width: pct(m) }} />
                        </span>
                      </span>
                    ) : open ? null : (
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
      )}

      {mode === 'build' && (
        <section className="panel">
          <h2>Ввод</h2>
          <div className="segmented segmented--2" role="radiogroup" aria-label="Ввод">
            {BUILD_INPUTS.map((b) => (
              <button
                key={b.id}
                role="radio"
                aria-checked={settings.buildInput === b.id}
                className={settings.buildInput === b.id ? 'is-on' : ''}
                onClick={() => onChange({ ...settings, buildInput: b.id })}
              >
                {b.label}
              </button>
            ))}
          </div>
          <p className="panel__note">Триграммы всегда собираются по линиям. Прогресс у двух способов отдельный.</p>
        </section>
      )}

      {mode === 'quiz' && (
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
      )}

      {mode !== 'study' && !tableReference && (
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
      )}

      <button className="btn btn--primary btn--wide" disabled={!canStart} onClick={onStart}>
        {startText}
      </button>
      {!canStart && <p className="hint">Выберите хотя бы одно направление</p>}

      {canInstall && (
        <button className="btn btn--wide" onClick={install}>
          Установить приложение
        </button>
      )}

      {iosHint && (
        <p className="hint">Чтобы установить на iPhone: «Поделиться» → «На экран „Домой“». Работает и без интернета.</p>
      )}

      <button className="btn btn--ghost btn--small" onClick={reset}>
        Сбросить прогресс
      </button>
    </main>
  );
}
