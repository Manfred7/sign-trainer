import type { Figure } from '../data/types';
import { type Facet, meaningText } from '../logic/quiz';
import { FigureGlyph } from './FigureGlyph';

interface Props {
  figure: Figure;
  facet: Facet;
  glyphSize?: number;
}

/** Одно представление фигуры: изображение, название или перевод */
export function FacetView({ figure, facet, glyphSize }: Props) {
  switch (facet) {
    case 'image':
      return <FigureGlyph figure={figure} size={glyphSize} />;
    case 'name':
      return <span className="facet-name">{figure.name}</span>;
    case 'meaning':
      return <span className="facet-meaning">{meaningText(figure)}</span>;
  }
}

/** Полная карточка: изображение + название + иероглиф + перевод */
export function FigureFull({ figure, glyphSize = 96 }: { figure: Figure; glyphSize?: number }) {
  return (
    <div className="figure-full">
      <FigureGlyph figure={figure} size={glyphSize} labelled={false} />
      <div className="figure-full__text">
        <div className="figure-full__title">
          {figure.number !== undefined && <span className="figure-full__num">{figure.number} · </span>}
          {figure.name} <span className="hanzi">{figure.hanzi}</span>
        </div>
        <div className="figure-full__meaning">{meaningText(figure)}</div>
      </div>
    </div>
  );
}
