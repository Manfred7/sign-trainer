import { HEXAGRAMS } from '../data/hexagrams';
import { TRIGRAMS } from '../data/trigrams';
import type { Figure } from '../data/types';
import { type Progress, UNLOCK_SHARE, mastery } from './progress';
import { BUILD_DIRECTION, BUILD_LINES_DIRECTION, COMPOSE_DIRECTION, type Direction, GRID_DIRECTION } from './quiz';
import type { BuildInput, Mode } from './settings';

export interface Deck {
  id: string;
  title: string;
  subtitle: string;
  figures: Figure[];
  /** Колода, которую нужно освоить, чтобы открылась эта */
  requires?: string;
}

const DOUBLED = [1, 2, 29, 30, 51, 52, 57, 58];
const byNumbers = (nums: number[]) => HEXAGRAMS.filter((h) => nums.includes(h.number!));
const eightFrom = (from: number) => Array.from({ length: 8 }, (_, i) => from + i);
const rangeId = (from: number) => `hex-${from}-${from + 7}`;

const RANGE_STARTS = [1, 9, 17, 25, 33, 41, 49, 57];

// Порядок важен: каждая колода требует предыдущую
export const DECKS: Deck[] = [
  { id: 'trigrams', title: 'Триграммы', subtitle: '8 знаков ба-гуа', figures: TRIGRAMS },
  {
    id: 'hex-doubled',
    title: 'Удвоенные гексаграммы',
    subtitle: DOUBLED.join(', '),
    figures: byNumbers(DOUBLED),
    requires: 'trigrams',
  },
  ...RANGE_STARTS.map((from, i) => ({
    id: rangeId(from),
    title: `Гексаграммы ${from}–${from + 7}`,
    subtitle: byNumbers(eightFrom(from))
      .map((h) => h.name)
      .join(', '),
    figures: byNumbers(eightFrom(from)),
    requires: i === 0 ? 'hex-doubled' : rangeId(RANGE_STARTS[i - 1]),
  })),
  {
    id: 'hex-all',
    title: 'Все гексаграммы',
    subtitle: '64 знака',
    figures: HEXAGRAMS,
    requires: rangeId(RANGE_STARTS[RANGE_STARTS.length - 1]),
  },
];

export const deckById = (id: string) => DECKS.find((d) => d.id === id) ?? DECKS[0];

export const isUnlocked = (deck: Deck, p: Progress, unlockAll: boolean) =>
  unlockAll || !deck.requires || p.unlocked.includes(deck.id);

/**
 * Можно ли запустить колоду в этом режиме: знакомиться можно с любой,
 * «Состав» не требует знания названий и открыт для всех гексаграмм,
 * тренировка — по порогу.
 */
export function isAvailable(deck: Deck, mode: Mode, p: Progress, unlockAll: boolean) {
  if (mode === 'study') return true;
  if (mode === 'table') return deck.id === 'hex-all';
  if (mode === 'compose') return deck.id !== 'trigrams';
  return isUnlocked(deck, p, unlockAll);
}

/** Триграмму из триграмм не собрать — для неё сборка всегда по линиям */
export const buildInputFor = (deck: Deck, input: BuildInput): BuildInput => (deck.id === 'trigrams' ? 'lines' : input);

/** Направления, по которым считается освоение в режиме */
export function modeDirections(mode: Mode, selected: Direction[], buildInput: BuildInput): Direction[] {
  if (mode === 'compose') return [COMPOSE_DIRECTION];
  if (mode === 'table') return [GRID_DIRECTION];
  if (mode === 'build') return [buildInput === 'lines' ? BUILD_LINES_DIRECTION : BUILD_DIRECTION];
  return selected;
}

/** Открывает колоды, у которых предыдущая освоена на UNLOCK_SHARE */
export function withUnlocks(p: Progress, directions: Direction[]): Progress {
  let unlocked = p.unlocked;
  for (const deck of DECKS) {
    if (!deck.requires || unlocked.includes(deck.id)) continue;
    const req = deckById(deck.requires);
    const reqOpen = !req.requires || unlocked.includes(req.id);
    if (reqOpen && mastery(p, req.figures, directions) >= UNLOCK_SHARE) {
      unlocked = [...unlocked, deck.id];
    }
  }
  return unlocked === p.unlocked ? p : { ...p, unlocked };
}
