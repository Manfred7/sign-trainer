import { HEXAGRAMS } from '../data/hexagrams';
import { TRIGRAMS } from '../data/trigrams';
import type { Figure } from '../data/types';

/** Уровни Лейтнера: 0 — не знаю, 5 — знаю твёрдо */
export const MAX_LEVEL = 5;

export type Facet = 'image' | 'name' | 'meaning';

export interface Direction {
  id: string;
  ask: Facet;
  answer: Facet;
  label: string;
  prompt: string;
}

export const DIRECTIONS: Direction[] = [
  { id: 'image>meaning', ask: 'image', answer: 'meaning', label: 'Изображение → Перевод', prompt: 'Что обозначает?' },
  { id: 'meaning>image', ask: 'meaning', answer: 'image', label: 'Перевод → Изображение', prompt: 'Как выглядит?' },
  { id: 'image>name', ask: 'image', answer: 'name', label: 'Изображение → Название', prompt: 'Как называется?' },
  { id: 'name>image', ask: 'name', answer: 'image', label: 'Название → Изображение', prompt: 'Как выглядит?' },
  { id: 'name>meaning', ask: 'name', answer: 'meaning', label: 'Название → Перевод', prompt: 'Что обозначает?' },
  { id: 'meaning>name', ask: 'meaning', answer: 'name', label: 'Перевод → Название', prompt: 'Как называется?' },
];

/** Режим «Состав»: по изображению гексаграммы назвать её триграммы. В общий список направлений не входит. */
export const COMPOSE_DIRECTION: Direction = {
  id: 'compose',
  ask: 'image',
  answer: 'image',
  label: 'Состав',
  prompt: 'Из каких триграмм состоит?',
};

/** Режим «Сборка»: по названию собрать гексаграмму из двух триграмм */
export const BUILD_DIRECTION: Direction = {
  id: 'build',
  ask: 'name',
  answer: 'image',
  label: 'Сборка из триграмм',
  prompt: 'Соберите из триграмм',
};

/** Режим «Сборка»: по названию собрать знак по линиям */
export const BUILD_LINES_DIRECTION: Direction = {
  id: 'build-lines',
  ask: 'name',
  answer: 'image',
  label: 'Сборка по линиям',
  prompt: 'Соберите по линиям',
};

/** Режим «Таблица», поиск клетки: по названию найти место гексаграммы в таблице 8×8 */
export const GRID_DIRECTION: Direction = {
  id: 'grid',
  ask: 'name',
  answer: 'image',
  label: 'Поиск в таблице',
  prompt: 'Где эта гексаграмма в таблице?',
};

export interface Question {
  figure: Figure;
  direction: Direction;
  options: Figure[];
}

export interface Answer {
  question: Question;
  pickedId: string;
}

export const isCorrect = (a: Answer) => a.pickedId === a.question.figure.id;

export const meaningText = (f: Figure) => f.meaning.join(' / ');

export function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const pick = <T>(items: T[]): T => items[Math.floor(Math.random() * items.length)];

/** Уровень пары (знак × направление) по текущему прогрессу */
export type LevelOf = (figureId: string, directionId: string) => number;

/** Пока в сессии есть непоказанные знаки, спрашиваем из них — чтобы каждый выпал хотя бы раз */
export function unseenFirst(pool: Figure[], answers: Answer[]): Figure[] {
  const shown = new Set(answers.map((a) => a.question.figure.id));
  const fresh = pool.filter((f) => !shown.has(f.id));
  return fresh.length ? fresh : pool;
}

const lineDiff = (a: Figure, b: Figure) => a.lines.filter((l, i) => l !== b.lines[i]).length;
const isFlipOf = (a: Figure, b: Figure) => a.lines.join('') === [...b.lines].reverse().join('');
const isSwapOf = (a: Figure, b: Figure) => a.kind === 'hexagram' && a.lower === b.upper && a.upper === b.lower;

/**
 * «Похожие» знаки — трудные неверные варианты, сложность растёт с уровнем пары:
 * 0–1 — нет (варианты случайные), 2–3 — общая триграмма (у триграмм — отличие в одну линию),
 * 4–5 — отличие в одну линию, знак вверх ногами, переставленные триграммы (11 ↔ 12, 63 ↔ 64).
 */
function similar(figure: Figure, level: number): Figure[] {
  const universe = (figure.kind === 'trigram' ? TRIGRAMS : HEXAGRAMS).filter((f) => f.id !== figure.id);
  if (level >= 4) {
    return universe.filter((f) => lineDiff(figure, f) === 1 || isFlipOf(f, figure) || isSwapOf(f, figure));
  }
  if (level >= 2) {
    return figure.kind === 'hexagram'
      ? universe.filter((f) => f.lower === figure.lower || f.upper === figure.upper)
      : universe.filter((f) => lineDiff(figure, f) === 1);
  }
  return [];
}

const facetText = (f: Figure, facet: Facet) =>
  facet === 'name' ? f.name : facet === 'meaning' ? meaningText(f) : f.lines.join('');

/**
 * Неверные варианты: сначала похожие по уровню, затем из колоды, затем из всех знаков того же вида.
 * Отбрасываются варианты, которые выглядят так же, как верный ответ (например, 10 Ли и 30 Ли).
 */
function pickDistractors(figure: Figure, deck: Figure[], level: number, answer: Facet, n: number): Figure[] {
  const chosen: Figure[] = [];
  const shown = new Set([facetText(figure, answer)]);
  const take = (candidates: Figure[]) => {
    for (const f of shuffle(candidates)) {
      if (chosen.length >= n) return;
      const text = facetText(f, answer);
      if (shown.has(text)) continue;
      shown.add(text);
      chosen.push(f);
    }
  };
  take(similar(figure, level));
  take(deck);
  take(figure.kind === 'trigram' ? TRIGRAMS : HEXAGRAMS);
  return chosen;
}

/**
 * pool — из каких фигур спрашивать, all — колода, откуда в первую очередь берутся неверные варианты.
 * Пара (фигура, направление) выбирается с весом MAX_LEVEL + 1 − уровень: слабые пары выпадают чаще.
 * Одна фигура не выпадает дважды подряд, если в пуле есть из чего выбрать.
 */
export function makeQuestion(
  pool: Figure[],
  all: Figure[],
  directions: Direction[],
  levelOf: LevelOf,
  prevId?: string,
  optionCount = 4,
): Question {
  const figures = pool.length > 1 ? pool.filter((f) => f.id !== prevId) : pool;
  const pairs = figures.flatMap((figure) =>
    directions.map((direction) => ({ figure, direction, w: MAX_LEVEL + 1 - levelOf(figure.id, direction.id) })),
  );
  let r = Math.random() * pairs.reduce((sum, p) => sum + p.w, 0);
  const { figure, direction } = pairs.find((p) => (r -= p.w) < 0) ?? pick(pairs);

  const level = levelOf(figure.id, direction.id);
  const distractors = pickDistractors(figure, all, level, direction.answer, optionCount - 1);
  return { figure, direction, options: shuffle([figure, ...distractors]) };
}
