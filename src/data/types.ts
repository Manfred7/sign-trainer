/** 0 — инь (прерывистая), 1 — ян (сплошная) */
export type Line = 0 | 1;

export interface Figure {
  kind: 'trigram' | 'hexagram';
  id: string;
  /** Номер по порядку Вэнь-вана, только для гексаграмм */
  number?: number;
  /** Линии СНИЗУ вверх: 3 для триграммы, 6 для гексаграммы */
  lines: Line[];
  /** Название в кириллице */
  name: string;
  hanzi: string;
  /** Варианты перевода; в интерфейсе выводятся через « / » */
  meaning: string[];
  /** id нижней и верхней триграмм, только для гексаграмм */
  lower?: string;
  upper?: string;
}
