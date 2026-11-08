import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { G, Line, Path, Polygon, Rect, Text as SvgText } from 'react-native-svg';
import { colors } from '@/src/theme/colors';

/**
 * Number-line "rulers" and arrows used by the hints in the document
 * (ruler of length 6 with arrow head, 12 split into fives, 78 split into 23s ...)
 */
export type Seg = { len: number; color: string; label?: string };

export type BarSpec = {
  /** total length drawn as an outlined ruler (uncolored part stays white) */
  outline?: number;
  /** colored segments drawn from 0, one after the other */
  segs?: Seg[];
  /** draw segments as separate arrows with a small gap (repeated addition) */
  separate?: boolean;
  /** tick every N units */
  tickEvery?: number;
  /** text shown at the start of the bar */
  label?: string;
  arrow?: boolean;
};

const ROW_H = 46;
const LABEL_W = 44;

export function Bars({
  bars,
  width,
  scaleMax,
  signs,
}: {
  bars: BarSpec[];
  width: number;
  scaleMax?: number;
  /** sign drawn between consecutive bars (e.g. "−") */
  signs?: string;
}) {
  const max =
    scaleMax ??
    Math.max(
      ...bars.map((b) =>
        Math.max(b.outline ?? 0, (b.segs ?? []).reduce((a, s) => a + s.len, 0) + (b.separate ? (b.segs?.length ?? 1) * 0.6 : 0))
      ),
      1
    );
  const usable = width - LABEL_W - 18;
  const k = usable / max;
  const height = bars.length * ROW_H + (signs ? (bars.length - 1) * 4 : 0) + 6;

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        {bars.map((b, row) => {
          const y = 6 + row * ROW_H;
          const barY = y + 6;
          const bh = 18;
          const elems: ReactNode[] = [];
          const x0 = LABEL_W;

          if (b.label) {
            elems.push(
              <SvgText fontFamily="Cairo_800ExtraBold" key="lbl" x={LABEL_W - 8} y={barY + 15} fontSize={16} fontWeight="bold" fill={colors.ink} textAnchor="end">
                {b.label}
              </SvgText>
            );
          }

          if (b.outline) {
            elems.push(
              <Rect key="out" x={x0} y={barY} width={b.outline * k} height={bh} rx={4} fill="#FFFFFF" stroke={colors.ink} strokeWidth={2} />
            );
          }

          let x = x0;
          (b.segs ?? []).forEach((s, i) => {
            const w = s.len * k;
            const gap = b.separate && i > 0 ? 0.6 * k : 0;
            x += gap;
            elems.push(
              <Rect key={`s${i}`} x={x} y={barY} width={Math.max(w - (b.separate ? 2 : 0), 2)} height={bh} rx={4} fill={s.color} stroke={colors.ink} strokeWidth={1.5} />
            );
            if (b.separate) {
              elems.push(
                <Polygon key={`h${i}`} points={`${x + w - 2},${barY - 3} ${x + w + 8},${barY + bh / 2} ${x + w - 2},${barY + bh + 3}`} fill={s.color} stroke={colors.ink} strokeWidth={1.5} />
              );
            }
            if (s.label) {
              elems.push(
                <SvgText fontFamily="Cairo_800ExtraBold" key={`l${i}`} x={x + w / 2} y={barY + bh + 16} fontSize={13} fontWeight="bold" fill={colors.ink} textAnchor="middle">
                  {s.label}
                </SvgText>
              );
            }
            x += w;
          });

          const total = b.outline ?? (b.segs ?? []).reduce((a, s) => a + s.len, 0);
          if (b.tickEvery && total > 0) {
            for (let t = b.tickEvery; t < total; t += b.tickEvery) {
              elems.push(<Line key={`t${t}`} x1={x0 + t * k} x2={x0 + t * k} y1={barY - 4} y2={barY + bh + 4} stroke={colors.ink} strokeWidth={2} />);
              elems.push(
                <SvgText fontFamily="Cairo_800ExtraBold" key={`tl${t}`} x={x0 + t * k} y={barY + bh + 16} fontSize={11} fill={colors.inkSoft} textAnchor="middle">
                  {t}
                </SvgText>
              );
            }
          }

          if (b.arrow && !b.separate) {
            const ex = x0 + total * k;
            elems.push(
              <Polygon key="arrow" points={`${ex},${barY - 5} ${ex + 12},${barY + bh / 2} ${ex},${barY + bh + 5}`} fill={colors.ink} />
            );
          }

          return <G key={row}>{elems}</G>;
        })}
        {signs && bars.length > 1 ? (
          <SvgText fontFamily="Cairo_800ExtraBold" x={14} y={ROW_H + 10} fontSize={26} fontWeight="bold" fill={colors.coral} textAnchor="middle">
            {signs}
          </SvgText>
        ) : null}
      </Svg>
    </View>
  );
}

/** Curved arrow "a ⤻ b" with an operator on top — used for × hints */
export function CurvedLink({
  from,
  to,
  op,
  width = 220,
  color = colors.grape,
}: {
  from: string;
  to: string;
  op: string;
  width?: number;
  color?: string;
}) {
  const h = 92;
  return (
    <View style={{ width, height: h }}>
      <Svg width={width} height={h}>
        <Rect x={6} y={46} width={58} height={40} rx={10} fill={colors.sunSoft} stroke={colors.sun} strokeWidth={2} />
        <SvgText fontFamily="Cairo_800ExtraBold" x={35} y={74} fontSize={22} fontWeight="bold" fill={colors.ink} textAnchor="middle">
          {from}
        </SvgText>
        <Rect x={width - 64} y={46} width={58} height={40} rx={10} fill={colors.seaSoft} stroke={colors.sea} strokeWidth={2} />
        <SvgText fontFamily="Cairo_800ExtraBold" x={width - 35} y={74} fontSize={22} fontWeight="bold" fill={colors.ink} textAnchor="middle">
          {to}
        </SvgText>
        <Path d={`M35 44 Q${width / 2} -6 ${width - 40} 40`} stroke={color} strokeWidth={4} fill="none" />
        <Polygon points={`${width - 48},34 ${width - 34},44 ${width - 30},28`} fill={color} />
        <Rect x={width / 2 - 18} y={6} width={36} height={30} rx={15} fill={color} />
        <SvgText fontFamily="Cairo_800ExtraBold" x={width / 2} y={28} fontSize={20} fontWeight="bold" fill="#FFFFFF" textAnchor="middle">
          {op}
        </SvgText>
      </Svg>
    </View>
  );
}

/** Yellow bent arrow (like the document's figure) that rises from the slot and points at the place name */
export function CurvedPointer({ size = 30, color = colors.sunDeep }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size + 6} viewBox="0 0 30 36">
      <Path d="M8 34 L8 16 Q8 8 16 8 L20 8" stroke={colors.ink} strokeWidth={7} fill="none" strokeLinecap="round" />
      <Path d="M8 34 L8 16 Q8 8 16 8 L20 8" stroke={color} strokeWidth={4.5} fill="none" strokeLinecap="round" />
      <Polygon points="19,1 29,8 19,15" fill={color} stroke={colors.ink} strokeWidth={1.5} />
    </Svg>
  );
}
