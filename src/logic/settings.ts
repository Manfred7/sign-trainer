import { DIRECTIONS } from './quiz';

export interface Settings {
  deckId: string;
  directionIds: string[];
  length: number;
  /** Все колоды доступны сразу, без порога */
  unlockAll: boolean;
}

export const SESSION_LENGTHS = [10, 20, 40];

const KEY = 'sign-trainer:settings';

const DEFAULTS: Settings = {
  deckId: 'trigrams',
  directionIds: ['image>meaning', 'meaning>image'],
  length: 20,
  unlockAll: false,
};

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<Settings>;
    const known = new Set(DIRECTIONS.map((d) => d.id));
    const directionIds = (parsed.directionIds ?? []).filter((id) => known.has(id));
    return {
      deckId: typeof parsed.deckId === 'string' ? parsed.deckId : DEFAULTS.deckId,
      directionIds: directionIds.length ? directionIds : DEFAULTS.directionIds,
      length: SESSION_LENGTHS.includes(parsed.length ?? 0) ? parsed.length! : DEFAULTS.length,
      unlockAll: parsed.unlockAll === true,
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
