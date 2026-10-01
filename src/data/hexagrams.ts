import { trigramById } from './trigrams';
import type { Figure, Line } from './types';

type TrigramId = 'qian' | 'dui' | 'li' | 'zhen' | 'xun' | 'kan' | 'gen' | 'kun';

interface HexagramSource {
  number: number;
  name: string;
  hanzi: string;
  /** Переводы по Б. Виногродскому, сверены с книгой; варианты — через слэш в интерфейсе */
  meaning: string[];
  upper: TrigramId;
  lower: TrigramId;
}

// Порядок Вэнь-вана. Линии не хранятся — они собираются из триграмм, чтобы не ошибиться в рисунке.
const SOURCE: HexagramSource[] = [
  { number: 1, name: 'Цянь', hanzi: '乾', meaning: ['Небо'], upper: 'qian', lower: 'qian' },
  { number: 2, name: 'Кунь', hanzi: '坤', meaning: ['Земля'], upper: 'kun', lower: 'kun' },
  { number: 3, name: 'Чжунь', hanzi: '屯', meaning: ['Затруднение'], upper: 'kan', lower: 'zhen' },
  { number: 4, name: 'Мэн', hanzi: '蒙', meaning: ['Незрелость'], upper: 'gen', lower: 'kan' },
  { number: 5, name: 'Сюй', hanzi: '需', meaning: ['Выжидание'], upper: 'kan', lower: 'qian' },
  { number: 6, name: 'Сун', hanzi: '訟', meaning: ['Тяжба'], upper: 'qian', lower: 'kan' },
  { number: 7, name: 'Ши', hanzi: '師', meaning: ['Войско'], upper: 'kun', lower: 'kan' },
  { number: 8, name: 'Би', hanzi: '比', meaning: ['Сближение'], upper: 'kan', lower: 'kun' },
  { number: 9, name: 'Сяо сюй', hanzi: '小畜', meaning: ['Малое накопление'], upper: 'xun', lower: 'qian' },
  { number: 10, name: 'Люй', hanzi: '履', meaning: ['Поведение'], upper: 'qian', lower: 'dui' },
  { number: 11, name: 'Тай', hanzi: '泰', meaning: ['Согласованность'], upper: 'kun', lower: 'qian' },
  { number: 12, name: 'Пи', hanzi: '否', meaning: ['Несогласованность'], upper: 'qian', lower: 'kun' },
  { number: 13, name: 'Тун жэнь', hanzi: '同人', meaning: ['Общее в человеке'], upper: 'qian', lower: 'li' },
  { number: 14, name: 'Да ю', hanzi: '大有', meaning: ['Большое владение'], upper: 'li', lower: 'qian' },
  { number: 15, name: 'Цянь', hanzi: '謙', meaning: ['Скромность'], upper: 'kun', lower: 'gen' },
  { number: 16, name: 'Юй', hanzi: '豫', meaning: ['Довольство'], upper: 'zhen', lower: 'kun' },
  { number: 17, name: 'Суй', hanzi: '隨', meaning: ['Следование'], upper: 'dui', lower: 'zhen' },
  { number: 18, name: 'Гу', hanzi: '蠱', meaning: ['Брожение'], upper: 'gen', lower: 'xun' },
  { number: 19, name: 'Линь', hanzi: '臨', meaning: ['Надзор'], upper: 'kun', lower: 'dui' },
  { number: 20, name: 'Гуань', hanzi: '觀', meaning: ['Обзор'], upper: 'xun', lower: 'kun' },
  { number: 21, name: 'Ши хэ', hanzi: '噬嗑', meaning: ['Прокусывание'], upper: 'li', lower: 'zhen' },
  { number: 22, name: 'Би', hanzi: '賁', meaning: ['Красота'], upper: 'gen', lower: 'li' },
  { number: 23, name: 'Бо', hanzi: '剝', meaning: ['Обдирание'], upper: 'gen', lower: 'kun' },
  { number: 24, name: 'Фу', hanzi: '復', meaning: ['Возврат'], upper: 'kun', lower: 'zhen' },
  { number: 25, name: 'У ван', hanzi: '無妄', meaning: ['Отсутствие заблуждений'], upper: 'qian', lower: 'zhen' },
  { number: 26, name: 'Да чу', hanzi: '大畜', meaning: ['Большое накопление'], upper: 'gen', lower: 'qian' },
  { number: 27, name: 'И', hanzi: '頤', meaning: ['Питание'], upper: 'gen', lower: 'zhen' },
  { number: 28, name: 'Да го', hanzi: '大過', meaning: ['Большое преобладание'], upper: 'dui', lower: 'xun' },
  { number: 29, name: 'Кань', hanzi: '坎', meaning: ['Двойная опасность'], upper: 'kan', lower: 'kan' },
  { number: 30, name: 'Ли', hanzi: '離', meaning: ['Связность'], upper: 'li', lower: 'li' },
  { number: 31, name: 'Сянь', hanzi: '咸', meaning: ['Соощущение'], upper: 'dui', lower: 'gen' },
  { number: 32, name: 'Хэн', hanzi: '恆', meaning: ['Постоянство'], upper: 'zhen', lower: 'xun' },
  { number: 33, name: 'Дунь', hanzi: '遯', meaning: ['Уход'], upper: 'qian', lower: 'gen' },
  { number: 34, name: 'Да чжуан', hanzi: '大壯', meaning: ['Большая мощь'], upper: 'zhen', lower: 'qian' },
  { number: 35, name: 'Цзинь', hanzi: '晉', meaning: ['Восхождение'], upper: 'li', lower: 'kun' },
  { number: 36, name: 'Мин и', hanzi: '明夷', meaning: ['Поражение ясности'], upper: 'kun', lower: 'li' },
  { number: 37, name: 'Цзя жэнь', hanzi: '家人', meaning: ['Семейный человек'], upper: 'xun', lower: 'li' },
  { number: 38, name: 'Куй', hanzi: '睽', meaning: ['Разлад'], upper: 'li', lower: 'dui' },
  { number: 39, name: 'Цзянь', hanzi: '蹇', meaning: ['Непроходимость'], upper: 'kan', lower: 'gen' },
  { number: 40, name: 'Цзе', hanzi: '解', meaning: ['Освобождение'], upper: 'zhen', lower: 'kan' },
  { number: 41, name: 'Сунь', hanzi: '損', meaning: ['Убавление'], upper: 'gen', lower: 'dui' },
  { number: 42, name: 'И', hanzi: '益', meaning: ['Прибавление'], upper: 'xun', lower: 'zhen' },
  { number: 43, name: 'Гуай', hanzi: '夬', meaning: ['Прорыв'], upper: 'dui', lower: 'qian' },
  { number: 44, name: 'Гоу', hanzi: '姤', meaning: ['Столкновение'], upper: 'qian', lower: 'xun' },
  { number: 45, name: 'Цуй', hanzi: '萃', meaning: ['Собирание'], upper: 'dui', lower: 'kun' },
  { number: 46, name: 'Шэн', hanzi: '升', meaning: ['Рост'], upper: 'kun', lower: 'xun' },
  { number: 47, name: 'Кунь', hanzi: '困', meaning: ['Истощение'], upper: 'dui', lower: 'kan' },
  { number: 48, name: 'Цзин', hanzi: '井', meaning: ['Колодец'], upper: 'kan', lower: 'xun' },
  { number: 49, name: 'Гэ', hanzi: '革', meaning: ['Преобразование'], upper: 'dui', lower: 'li' },
  { number: 50, name: 'Дин', hanzi: '鼎', meaning: ['Жертвенник'], upper: 'li', lower: 'xun' },
  { number: 51, name: 'Чжэнь', hanzi: '震', meaning: ['Возбуждение'], upper: 'zhen', lower: 'zhen' },
  { number: 52, name: 'Гэнь', hanzi: '艮', meaning: ['Неподвижность'], upper: 'gen', lower: 'gen' },
  { number: 53, name: 'Цзянь', hanzi: '漸', meaning: ['Постепенность'], upper: 'xun', lower: 'gen' },
  { number: 54, name: 'Гуй мэй', hanzi: '歸妹', meaning: ['Приход девы'], upper: 'zhen', lower: 'dui' },
  { number: 55, name: 'Фэн', hanzi: '豐', meaning: ['Изобилие'], upper: 'zhen', lower: 'li' },
  { number: 56, name: 'Люй', hanzi: '旅', meaning: ['Странствия'], upper: 'li', lower: 'gen' },
  { number: 57, name: 'Сюнь', hanzi: '巽', meaning: ['Проникновение'], upper: 'xun', lower: 'xun' },
  { number: 58, name: 'Дуй', hanzi: '兌', meaning: ['Проводимость'], upper: 'dui', lower: 'dui' },
  { number: 59, name: 'Хуань', hanzi: '渙', meaning: ['Рассеяние'], upper: 'xun', lower: 'kan' },
  { number: 60, name: 'Цзе', hanzi: '節', meaning: ['Мера'], upper: 'kan', lower: 'dui' },
  { number: 61, name: 'Чжун фу', hanzi: '中孚', meaning: ['Доверие к внутреннему'], upper: 'xun', lower: 'dui' },
  { number: 62, name: 'Сяо го', hanzi: '小過', meaning: ['Малое преобладание'], upper: 'zhen', lower: 'gen' },
  { number: 63, name: 'Цзи цзи', hanzi: '既濟', meaning: ['Уже справились'], upper: 'kan', lower: 'li' },
  { number: 64, name: 'Вэй цзи', hanzi: '未濟', meaning: ['Ещё не справились'], upper: 'li', lower: 'kan' },
];

export const HEXAGRAMS: Figure[] = SOURCE.map((h) => ({
  kind: 'hexagram',
  id: `hex-${h.number}`,
  number: h.number,
  name: h.name,
  hanzi: h.hanzi,
  meaning: h.meaning,
  lower: h.lower,
  upper: h.upper,
  lines: [...trigramById(h.lower).lines, ...trigramById(h.upper).lines] as Line[],
}));
