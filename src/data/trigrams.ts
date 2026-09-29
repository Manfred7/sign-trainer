import type { Figure } from './types';

export const TRIGRAMS: Figure[] = [
  { kind: 'trigram', id: 'qian', lines: [1, 1, 1], name: 'Цянь', hanzi: '乾', meaning: ['Небо'] },
  { kind: 'trigram', id: 'dui', lines: [1, 1, 0], name: 'Дуй', hanzi: '兌', meaning: ['Водоём', 'Озеро'] },
  { kind: 'trigram', id: 'li', lines: [1, 0, 1], name: 'Ли', hanzi: '離', meaning: ['Огонь'] },
  { kind: 'trigram', id: 'zhen', lines: [1, 0, 0], name: 'Чжэнь', hanzi: '震', meaning: ['Гром'] },
  { kind: 'trigram', id: 'xun', lines: [0, 1, 1], name: 'Сюнь', hanzi: '巽', meaning: ['Ветер', 'Дерево'] },
  { kind: 'trigram', id: 'kan', lines: [0, 1, 0], name: 'Кань', hanzi: '坎', meaning: ['Вода'] },
  { kind: 'trigram', id: 'gen', lines: [0, 0, 1], name: 'Гэнь', hanzi: '艮', meaning: ['Гора'] },
  { kind: 'trigram', id: 'kun', lines: [0, 0, 0], name: 'Кунь', hanzi: '坤', meaning: ['Земля'] },
];

export const trigramById = (id: string) => TRIGRAMS.find((t) => t.id === id)!;

/** Творительный падеж первого перевода — для подписи состава «Вода над Огнём» */
const INSTRUMENTAL: Record<string, string> = {
  qian: 'Небом',
  dui: 'Водоёмом',
  li: 'Огнём',
  zhen: 'Громом',
  xun: 'Ветром',
  kan: 'Водой',
  gen: 'Горой',
  kun: 'Землёй',
};

/** «Вода над Огнём» для гексаграммы; null для триграммы */
export function compositionText(f: { lower?: string; upper?: string }): string | null {
  if (!f.lower || !f.upper) return null;
  return `${trigramById(f.upper).meaning[0]} над ${INSTRUMENTAL[f.lower]}`;
}
