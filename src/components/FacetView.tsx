import { compositionText } from '../data/trigrams';
import type { Figure } from '../data/types';
import { type Facet, meaningText } from '../logic/quiz';
import { FigureGlyph } from './FigureGlyph';
import { HexagramAnatomy } from './HexagramAnatomy';

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
      // У гексаграмм есть совпадающие названия (Ли 10 и 30, И 27 и 42…) — различаем иероглифом
      return (
        <span className="facet-name">
          {figure.name}
          {figure.kind === 'hexagram' && <span className="hanzi facet-name__hanzi"> {figure.hanzi}</span>}
        </span>
      );
    case 'meaning':
      return <span className="facet-meaning">{meaningText(figure)}</span>;
  }
}

/** Что нужно собрать в режиме «Сборка»: номер, название, иероглиф, перевод */
export function BuildTarget({ figure }: { figure: Figure }) {
  return (
    <div className="build-target">
      <div className="build-target__name">
        {figure.number !== undefined && <span className="figure-full__num">{figure.number} · </span>}
        {figure.name} <span className="hanzi">{figure.hanzi}</span>
      </div>
      <div className="build-target__meaning">{meaningText(figure)}</div>
    </div>
  );
}

interface FullProps {
  figure: Figure;
  glyphSize?: number;
  /** Подпись состава «Вода над Огнём» у гексаграмм */
  showComposition?: boolean;
  /** Вместо простого глифа — гексаграмма с подписями триграмм */
  anatomy?: boolean;
}

/** Полная карточка: изображение + название + иероглиф + перевод */
export function FigureFull({ figure, glyphSize = 96, showComposition = true, anatomy = false }: FullProps) {
  const composition = showComposition ? compositionText(figure) : null;
  return (
    <div className="figure-full">
      {anatomy && figure.kind === 'hexagram' ? (
        <HexagramAnatomy figure={figure} size={glyphSize} />
      ) : (
        <FigureGlyph figure={figure} size={glyphSize} labelled={false} />
      )}
      <div className="figure-full__text">
        <div className="figure-full__title">
          {figure.number !== undefined && <span className="figure-full__num">{figure.number} · </span>}
          {figure.name} <span className="hanzi">{figure.hanzi}</span>
        </div>
        <div className="figure-full__meaning">{meaningText(figure)}</div>
        {composition && <div className="figure-full__composition">{composition}</div>}
      </div>
    </div>
  );
}
