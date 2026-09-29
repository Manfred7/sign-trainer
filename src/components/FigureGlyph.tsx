import type { Figure } from '../data/types';

const W = 100;
const LINE_H = 12;
const GAP = 10;
/** Дополнительный зазор между триграммами внутри гексаграммы */
const HEX_GAP = 10;
const YIN_HOLE = 16;

interface Props {
  figure: Figure;
  /** Ширина в px; высота считается из пропорций */
  size?: number;
  /** false — глиф декоративный (например, рядом уже есть подпись) */
  labelled?: boolean;
}

export function FigureGlyph({ figure, size = 120, labelled = true }: Props) {
  const n = figure.lines.length;
  const split = n === 6;
  const height = n * LINE_H + (n - 1) * GAP + (split ? HEX_GAP : 0);

  const yOf = (i: number) => height - LINE_H - i * (LINE_H + GAP) - (split && i >= 3 ? HEX_GAP : 0);
  const half = (W - YIN_HOLE) / 2;

  const described = figure.lines.map((l) => (l ? 'сплошная' : 'прерывистая')).join(', ');

  return (
    <svg
      className="glyph"
      viewBox={`0 0 ${W} ${height}`}
      width={size}
      height={(size * height) / W}
      role={labelled ? 'img' : undefined}
      aria-label={labelled ? `Линии снизу вверх: ${described}` : undefined}
      aria-hidden={labelled ? undefined : true}
    >
      {figure.lines.map((line, i) =>
        line ? (
          <rect key={i} x={0} y={yOf(i)} width={W} height={LINE_H} rx={2} />
        ) : (
          <g key={i}>
            <rect x={0} y={yOf(i)} width={half} height={LINE_H} rx={2} />
            <rect x={W - half} y={yOf(i)} width={half} height={LINE_H} rx={2} />
          </g>
        ),
      )}
    </svg>
  );
}
