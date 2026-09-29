import { TRIGRAMS } from './trigrams';
import type { Figure, Line } from './types';

type TrigramId = 'qian' | 'dui' | 'li' | 'zhen' | 'xun' | 'kan' | 'gen' | 'kun';

interface HexagramSource {
  number: number;
  name: string;
  hanzi: string;
  /** Переводы по Б. Виногродскому (kitaed.ru, «Знаки Гуа»); варианты — через слэш в интерфейсе */
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
  { number: 9, name: 'Сяо чу', hanzi: '小畜', meaning: ['Скопление в малом'], upper: 'xun', lower: 'qian' },
  { number: 10, name: 'Ли', hanzi: '履', meaning: ['Поступь'], upper: 'qian', lower: 'dui' },
  { number: 11, name: 'Тай', hanzi: '泰', meaning: ['Согласованность'], upper: 'kun', lower: 'qian' },
  { number: 12, name: 'Пи', hanzi: '否', meaning: ['Несогласованность'], upper: 'qian', lower: 'kun' },
  { number: 13, name: 'Тун жэнь', hanzi: '同人', meaning: ['Общее в человеке'], upper: 'qian', lower: 'li' },
  { number: 14, name: 'Да ю', hanzi: '大有', meaning: ['Большое имение'], upper: 'li', lower: 'qian' },
  { number: 15, name: 'Цянь', hanzi: '謙', meaning: ['Скромность'], upper: 'kun', lower: 'gen' },
  { number: 16, name: 'Юй', hanzi: '豫', meaning: ['Готовность'], upper: 'zhen', lower: 'kun' },
  { number: 17, name: 'Суй', hanzi: '隨', meaning: ['Следование'], upper: 'dui', lower: 'zhen' },
  { number: 18, name: 'Гу', hanzi: '蠱', meaning: ['Брожение'], upper: 'gen', lower: 'xun' },
  { number: 19, name: 'Линь', hanzi: '臨', meaning: ['Подход'], upper: 'kun', lower: 'dui' },
  { number: 20, name: 'Гуань', hanzi: '觀', meaning: ['Видение'], upper: 'xun', lower: 'kun' },
  { number: 21, name: 'Ши хэ', hanzi: '噬嗑', meaning: ['Прокусить насквозь'], upper: 'li', lower: 'zhen' },
  { number: 22, name: 'Би', hanzi: '賁', meaning: ['Красота'], upper: 'gen', lower: 'li' },
  { number: 23, name: 'Бо', hanzi: '剝', meaning: ['Обдирание'], upper: 'gen', lower: 'kun' },
  { number: 24, name: 'Фу', hanzi: '復', meaning: ['Возврат'], upper: 'kun', lower: 'zhen' },
  { number: 25, name: 'У ван', hanzi: '無妄', meaning: ['Отсутствие иллюзий'], upper: 'qian', lower: 'zhen' },
  { number: 26, name: 'Да чу', hanzi: '大畜', meaning: ['Большое скопление'], upper: 'gen', lower: 'qian' },
  { number: 27, name: 'И', hanzi: '頤', meaning: ['Челюсти'], upper: 'gen', lower: 'zhen' },
  { number: 28, name: 'Да го', hanzi: '大過', meaning: ['Чрезмерность в большом'], upper: 'dui', lower: 'xun' },
  { number: 29, name: 'Кань', hanzi: '坎', meaning: ['Двойная ловушка'], upper: 'kan', lower: 'kan' },
  { number: 30, name: 'Ли', hanzi: '離', meaning: ['Сияние'], upper: 'li', lower: 'li' },
  { number: 31, name: 'Сянь', hanzi: '咸', meaning: ['Соощущение'], upper: 'dui', lower: 'gen' },
  { number: 32, name: 'Хэн', hanzi: '恆', meaning: ['Дление'], upper: 'zhen', lower: 'xun' },
  { number: 33, name: 'Дунь', hanzi: '遯', meaning: ['Уход'], upper: 'qian', lower: 'gen' },
  { number: 34, name: 'Да чжуан', hanzi: '大壯', meaning: ['Большая мощь'], upper: 'zhen', lower: 'qian' },
  { number: 35, name: 'Цзинь', hanzi: '晉', meaning: ['Восход'], upper: 'li', lower: 'kun' },
  { number: 36, name: 'Мин и', hanzi: '明夷', meaning: ['Рассеяние ясности'], upper: 'kun', lower: 'li' },
  { number: 37, name: 'Цзя жэнь', hanzi: '家人', meaning: ['Люди в семье'], upper: 'xun', lower: 'li' },
  { number: 38, name: 'Куй', hanzi: '睽', meaning: ['Разлад'], upper: 'li', lower: 'dui' },
  { number: 39, name: 'Цзянь', hanzi: '蹇', meaning: ['Непроходимость'], upper: 'kan', lower: 'gen' },
  { number: 40, name: 'Цзе', hanzi: '解', meaning: ['Освобождение'], upper: 'zhen', lower: 'kan' },
  { number: 41, name: 'Сунь', hanzi: '損', meaning: ['Убыль'], upper: 'gen', lower: 'dui' },
  { number: 42, name: 'И', hanzi: '益', meaning: ['Прибыль'], upper: 'xun', lower: 'zhen' },
  { number: 43, name: 'Гуай', hanzi: '夬', meaning: ['Прорыв'], upper: 'dui', lower: 'qian' },
  { number: 44, name: 'Гоу', hanzi: '姤', meaning: ['Навстречу'], upper: 'qian', lower: 'xun' },
  { number: 45, name: 'Цуй', hanzi: '萃', meaning: ['Собирание'], upper: 'dui', lower: 'kun' },
  { number: 46, name: 'Шэн', hanzi: '升', meaning: ['Рост'], upper: 'kun', lower: 'xun' },
  { number: 47, name: 'Кунь', hanzi: '困', meaning: ['Отключение'], upper: 'dui', lower: 'kan' },
  { number: 48, name: 'Цзин', hanzi: '井', meaning: ['Колодец'], upper: 'kan', lower: 'xun' },
  { number: 49, name: 'Гэ', hanzi: '革', meaning: ['Преображение'], upper: 'dui', lower: 'li' },
  { number: 50, name: 'Дин', hanzi: '鼎', meaning: ['Треножник'], upper: 'li', lower: 'xun' },
  { number: 51, name: 'Чжэнь', hanzi: '震', meaning: ['Гром'], upper: 'zhen', lower: 'zhen' },
  { number: 52, name: 'Гэнь', hanzi: '艮', meaning: ['Сосредоточенность'], upper: 'gen', lower: 'gen' },
  { number: 53, name: 'Цзянь', hanzi: '漸', meaning: ['Постепенность'], upper: 'xun', lower: 'gen' },
  { number: 54, name: 'Гуй мэй', hanzi: '歸妹', meaning: ['Приход девы'], upper: 'zhen', lower: 'dui' },
  { number: 55, name: 'Фэн', hanzi: '豐', meaning: ['Изобилие'], upper: 'zhen', lower: 'li' },
  { number: 56, name: 'Люй', hanzi: '旅', meaning: ['Странствие'], upper: 'li', lower: 'gen' },
  { number: 57, name: 'Сюнь', hanzi: '巽', meaning: ['Ветер'], upper: 'xun', lower: 'xun' },
  { number: 58, name: 'Дуй', hanzi: '兌', meaning: ['Выражение'], upper: 'dui', lower: 'dui' },
  { number: 59, name: 'Хуань', hanzi: '渙', meaning: ['Разлив'], upper: 'xun', lower: 'kan' },
  { number: 60, name: 'Цзе', hanzi: '節', meaning: ['Мера'], upper: 'kan', lower: 'dui' },
  { number: 61, name: 'Чжун фу', hanzi: '中孚', meaning: ['Срединное доверие'], upper: 'xun', lower: 'dui' },
  { number: 62, name: 'Сяо го', hanzi: '小過', meaning: ['Малая чрезмерность'], upper: 'zhen', lower: 'gen' },
  { number: 63, name: 'Цзи цзи', hanzi: '既濟', meaning: ['Уже справились', 'Уже переправились'], upper: 'kan', lower: 'li' },
  { number: 64, name: 'Вэй цзи', hanzi: '未濟', meaning: ['Ещё не справились'], upper: 'li', lower: 'kan' },
];

const trigram = (id: TrigramId) => TRIGRAMS.find((t) => t.id === id)!;

export const HEXAGRAMS: Figure[] = SOURCE.map((h) => ({
  kind: 'hexagram',
  id: `hex-${h.number}`,
  number: h.number,
  name: h.name,
  hanzi: h.hanzi,
  meaning: h.meaning,
  lower: h.lower,
  upper: h.upper,
  lines: [...trigram(h.lower).lines, ...trigram(h.upper).lines] as Line[],
}));
