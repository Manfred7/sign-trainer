import { DIRECTIONS } from './quiz';

export type Mode = 'quiz' | 'study' | 'compose' | 'build';
export type BuildInput = 'trigrams' | 'lines';

export const MODES: { id: Mode; label: string }[] = [
  { id: 'quiz', label: 'Тренировка' },
  { id: 'study', label: 'Знакомство' },
  { id: 'compose', label: 'Состав' },
  { id: 'build', label: 'Сборка' },
];

export interface Settings {
  mode: Mode;
  deckId: string;
  directionIds: string[];
  length: number;
  /** Все колоды доступны сразу, без порога */
  unlockAll: boolean;
  buildInput: BuildInput;
}

export const SESSION_LENGTHS = [10, 20, 40];

const KEY = 'sign-trainer:settings';

const DEFAULTS: Settings = {
  mode: 'quiz',
  deckId: 'trigrams',
  directionIds: ['image>meaning', 'meaning>image'],
  length: 20,
  unlockAll: false,
  buildInput: 'trigrams',
};

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<Settings>;
    const known = new Set(DIRECTIONS.map((d) => d.id));
    const directionIds = (parsed.directionIds ?? []).filter((id) => known.has(id));
    return {
      mode: MODES.some((m) => m.id === parsed.mode) ? parsed.mode! : DEFAULTS.mode,
      deckId: typeof parsed.deckId === 'string' ? parsed.deckId : DEFAULTS.deckId,
      directionIds: directionIds.length ? directionIds : DEFAULTS.directionIds,
      length: SESSION_LENGTHS.includes(parsed.length ?? 0) ? parsed.length! : DEFAULTS.length,
      unlockAll: parsed.unlockAll === true,
      buildInput: parsed.buildInput === 'lines' ? 'lines' : 'trigrams',
    };
  } catch {
    return DEFAULTS;
  }
}

export function saveSettings(s: Settings) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    // хранилище недоступно (приватный режим и т. п.) — настройки живут до перезагрузки
  }
}
