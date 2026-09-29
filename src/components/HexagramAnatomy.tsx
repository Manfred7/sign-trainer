import { trigramById } from '../data/trigrams';
import type { Figure } from '../data/types';
import { FigureGlyph, type Half } from './FigureGlyph';

interface Props {
  figure: Figure;
  size?: number;
  highlight?: Half | null;
}

/** Гексаграмма с подписями триграмм у каждой половины */
export function HexagramAnatomy({ figure, size = 120, highlight = null }: Props) {
  const halves: Half[] = ['upper', 'lower'];
  return (
    <div className="anatomy">
      <div className="anatomy__glyph">
        <FigureGlyph figure={figure} size={size} highlight={highlight} />
      </div>
      {halves.map((half) => {
        const t = trigramById(half === 'upper' ? figure.upper! : figure.lower!);
        return (
          <div key={half} className={`anatomy__label anatomy__label--${half}`}>
            <span className="anatomy__caption">{half === 'upper' ? 'сверху' : 'снизу'}</span>
            <span className="anatomy__name">
              {t.name} <span className="hanzi">{t.hanzi}</span>
            </span>
            <span className="anatomy__meaning">{t.meaning.join(' / ')}</span>
          </div>
        );
      })}
    </div>
  );
}
