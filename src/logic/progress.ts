import type { Figure } from '../data/types';
import { type Answer, type Direction, MAX_LEVEL, isCorrect } from './quiz';

/** С этого уровня пара (знак × направление) считается освоенной */
export const MASTERED_LEVEL = 3;
/** Доля освоенных пар, при которой открывается следующая колода */
export const UNLOCK_SHARE = 0.8;

export interface PairStats {
  level: number;
  seen: number;
  correct: number;
}

export interface Progress {
  pairs: Record<string, PairStats>;
  /** Колоды, открытые по порогу; раз открытая колода больше не закрывается */
  unlocked: string[];
}

export const EMPTY_PROGRESS: Progress = { pairs: {}, unlocked: [] };

const pairKey = (figureId: string, directionId: string) => `${figureId}:${directionId}`;

export const levelOf = (p: Progress, figureId: string, directionId: string) =>
  p.pairs[pairKey(figureId, directionId)]?.level ?? 0;

export function recordAnswer(p: Progress, a: Answer): Progress {
  const key = pairKey(a.question.figure.id, a.question.direction.id);
  const prev = p.pairs[key] ?? { level: 0, seen: 0, correct: 0 };
  const ok = isCorrect(a);
  const next: PairStats = {
    level: ok ? Math.min(MAX_LEVEL, prev.level + 1) : 0,
    seen: prev.seen + 1,
    correct: prev.correct + (ok ? 1 : 0),
  };
  return { ...p, pairs: { ...p.pairs, [key]: next } };
}

/** Доля освоенных пар среди знаков колоды в выбранных направлениях, 0…1 */
export function mastery(p: Progress, figures: Figure[], directions: Direction[]): number {
  const total = figures.length * directions.length;
  if (!total) return 0;
  let mastered = 0;
  for (const f of figures) {
    for (const d of directions) {
      if (levelOf(p, f.id, d.id) >= MASTERED_LEVEL) mastered++;
    }
  }
  return mastered / total;
}

const KEY = 'sign-trainer:progress';

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY_PROGRESS;
    const parsed = JSON.parse(raw) as Partial<Progress>;
    return {
      pairs: parsed.pairs && typeof parsed.pairs === 'object' ? parsed.pairs : {},
      unlocked: Array.isArray(parsed.unlocked) ? parsed.unlocked : [],
    };
  } catch {
    return EMPTY_PROGRESS;
  }
}

export function saveProgress(p: Progress) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    // хранилище недоступно — прогресс живёт до перезагрузки
  }
}
