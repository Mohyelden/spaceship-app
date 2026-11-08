/* ---------------- Phase 1: name cards around the rectangle ---------------- */

export type CardRole = 'dividend' | 'divisor' | 'quotient' | 'remainder';

export type Phase1Problem = {
  dividend: number;
  divisor: number;
  quotient: number;
  remainder: number;
};

export const ROLE_LABELS: Record<CardRole, string> = {
  dividend: 'المقسوم',
  divisor: 'المقسوم عليه',
  quotient: 'ناتج القسمة',
  remainder: 'الباقي',
};

export const ROLE_ORDER: CardRole[] = ['dividend', 'divisor', 'quotient', 'remainder'];

export const makePhase1 = (dividend: number, divisor: number): Phase1Problem => ({
  dividend,
  divisor,
  quotient: Math.floor(dividend / divisor),
  remainder: dividend % divisor,
});

export const roleValue = (p: Phase1Problem, r: CardRole) => p[r];

/** 625 ÷ 5 from the document. Retry: 1394 ÷ 5 (= 278, remainder 4). */
export const PHASE1_MAIN = makePhase1(625, 5);
export const PHASE1_RETRY = makePhase1(1394, 5);

/* ---------------- Phase 2: area model (hundreds / tens / ones) ---------------- */

export type Col = 0 | 1 | 2; // 0 = hundreds, 1 = tens, 2 = ones
export type Row = 'top' | 'partial' | 'product' | 'rest';

export type AreaSlot = { row: Row; col: Col; value: number };

export type AreaProblem = {
  dividend: number;
  divisor: number;
  quotient: number;
  /** quotient split into place values, e.g. [200, 10, 8] */
  parts: [number, number, number];
  slots: AreaSlot[]; // in the order the child fills them
  tiles: number[];
  mc: { options: number[]; answer: number };
};

const PLACE = [100, 10, 1];

export function makeArea(dividend: number, divisor: number, mcOptions?: number[]): AreaProblem {
  const parts: number[] = [];
  const partial: number[] = [];
  const product: number[] = [];
  const rest: number[] = [];
  let left = dividend;
  for (let c = 0; c < 3; c++) {
    partial.push(left);
    const part = Math.floor(left / (divisor * PLACE[c])) * PLACE[c];
    parts.push(part);
    product.push(part * divisor);
    left -= part * divisor;
    rest.push(left);
  }

  // Fill order per column: quotient part → product → subtraction → carry into next column
  const slots: AreaSlot[] = [];
  for (let c = 0 as Col; c < 3; c = (c + 1) as Col) {
    if (c > 0) slots.push({ row: 'partial', col: c, value: partial[c] });
    slots.push({ row: 'top', col: c, value: parts[c] });
    slots.push({ row: 'product', col: c, value: product[c] });
    slots.push({ row: 'rest', col: c, value: rest[c] });
  }

  const needed = Array.from(new Set(slots.map((s) => s.value)));
  const distractors = new Set<number>();
  for (const p of parts) {
    if (p >= 10) distractors.add(p / 10);
    if (p > 0 && p * 10 < 1000) distractors.add(p * 10);
  }
  distractors.add(parts[0] / 2 >= 10 ? parts[0] / 2 : 100);
  distractors.add(100);
  // extra "near" numbers like the document's palettes (120, 50, 30, 72 ...)
  [120, 50, 30, 72, 300, 60].forEach((n) => distractors.add(n));
  const extra = [...distractors].filter((d) => !needed.includes(d) && Number.isInteger(d));
  const tiles = [...needed, ...extra.slice(0, Math.max(4, 12 - needed.length))].sort(
    () => Math.random() - 0.5
  );

  const quotient = parts.reduce((a, b) => a + b, 0);
  const options = mcOptions ?? [quotient, quotient - 30, quotient - 10].sort(() => Math.random() - 0.5);

  return {
    dividend,
    divisor,
    quotient,
    parts: parts as [number, number, number],
    slots,
    tiles,
    mc: { options, answer: quotient },
  };
}

export const PHASE2_MAIN = () => makeArea(872, 4);
/** Reinforcement problem + multiple choice (280 - 250 - 270) from the document */
export const PHASE2_REINFORCE = () => makeArea(1120, 4, [280, 250, 270]);
export const PHASE2_EXTRA = [() => makeArea(936, 4), () => makeArea(756, 3), () => makeArea(985, 5)];

export const PREP_BANK: Phase1Problem[] = [
  makePhase1(486, 3),
  makePhase1(848, 4),
  makePhase1(963, 3),
  makePhase1(735, 5),
  makePhase1(1394, 5),
];

export function randomPhase1(): Phase1Problem {
  const d = 2 + Math.floor(Math.random() * 8);
  const n = 200 + Math.floor(Math.random() * 800);
  return makePhase1(n, d);
}

export function randomArea(): AreaProblem {
  for (let i = 0; i < 300; i++) {
    const d = 2 + Math.floor(Math.random() * 8);
    const q = 111 + Math.floor(Math.random() * 300);
    const n = q * d;
    if (n >= 1000) continue;
    const a = makeArea(n, d);
    if (a.parts.every((p) => p > 0)) return a;
  }
  return makeArea(872, 4);
}

export const PLACE_NAMES = ['مئات', 'عشرات', 'آحاد'];
