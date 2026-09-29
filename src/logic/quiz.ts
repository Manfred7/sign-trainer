import type { Figure } from '../data/types';

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

const pick = <T,>(items: T[]): T => items[Math.floor(Math.random() * items.length)];

export type Weight = (figureId: string, directionId: string) => number;

/** Пока в сессии есть непоказанные знаки, спрашиваем из них — чтобы каждый выпал хотя бы раз */
export function unseenFirst(pool: Figure[], answers: Answer[]): Figure[] {
  const shown = new Set(answers.map((a) => a.question.figure.id));
  const fresh = pool.filter((f) => !shown.has(f.id));
  return fresh.length ? fresh : pool;
}

/**
 * pool — из каких фигур спрашивать, all — откуда брать неверные варианты.
 * Пара (фигура, направление) выбирается пропорционально весу.
 * Одна фигура не выпадает дважды подряд, если в пуле есть из чего выбрать.
 */
export function makeQuestion(
  pool: Figure[],
  all: Figure[],
  directions: Direction[],
  weight: Weight,
  prevId?: string,
  optionCount = 4,
): Question {
  const figures = pool.length > 1 ? pool.filter((f) => f.id !== prevId) : pool;
  const pairs = figures.flatMap((figure) =>
    directions.map((direction) => ({ figure, direction, w: weight(figure.id, direction.id) })),
  );
  let r = Math.random() * pairs.reduce((sum, p) => sum + p.w, 0);
  const { figure, direction } = pairs.find((p) => (r -= p.w) < 0) ?? pick(pairs);

  const distractors = shuffle(all.filter((f) => f.id !== figure.id)).slice(0, optionCount - 1);
  return { figure, direction, options: shuffle([figure, ...distractors]) };
}
