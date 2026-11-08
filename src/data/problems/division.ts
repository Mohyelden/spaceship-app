/** Long division (levels 1 & 2): divide → multiply → subtract → bring down */

export type CabinStep = 'start' | 'divide' | 'multiply' | 'subtract' | 'bringDown';

export type Cycle = {
  /** number being divided in this cycle (e.g. 6, 12, 25) */
  working: number;
  /** index (in dividend digits) of the last digit included in `working` */
  endIdx: number;
  digit: number;
  product: number;
  remainder: number;
  /** index of the digit brought down after this cycle, null for last cycle */
  bringIdx: number | null;
  bringDigit: number | null;
  nextWorking: number | null;
};

export type DivisionProblem = {
  id: string;
  dividend: number;
  divisor: number;
  digits: number[];
  quotient: number;
  remainder: number;
  cycles: Cycle[];
};

export function makeDivision(dividend: number, divisor: number, id = `${dividend}÷${divisor}`): DivisionProblem {
  const digits = String(dividend).split('').map(Number);
  const cycles: Cycle[] = [];
  let idx = 0;
  let working = digits[0];
  while (working < divisor && idx < digits.length - 1) {
    idx += 1;
    working = working * 10 + digits[idx];
  }
  for (;;) {
    const digit = Math.floor(working / divisor);
    const product = digit * divisor;
    const remainder = working - product;
    const bringIdx = idx + 1 < digits.length ? idx + 1 : null;
    const bringDigit = bringIdx === null ? null : digits[bringIdx];
    const nextWorking = bringDigit === null ? null : remainder * 10 + bringDigit;
    cycles.push({ working, endIdx: idx, digit, product, remainder, bringIdx, bringDigit, nextWorking });
    if (bringIdx === null) break;
    idx = bringIdx;
    working = nextWorking!;
  }
  return {
    id,
    dividend,
    divisor,
    digits,
    quotient: Math.floor(dividend / divisor),
    remainder: dividend % divisor,
    cycles,
  };
}

/** Index of the digits the child must pick to start ("78" for 782 ÷ 23) */
export const startNumber = (p: DivisionProblem) => p.cycles[0].working;

const rand = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));

/** "Nice" problems: no zero quotient digits, exact (remainder 0), 3-digit dividend */
function isNice(p: DivisionProblem) {
  return p.remainder === 0 && p.cycles.every((c) => c.digit > 0) && p.dividend < 1000;
}

export function randomLevel1(exclude: number[] = []): DivisionProblem {
  for (let i = 0; i < 500; i++) {
    const d = rand(2, 9);
    const q = rand(100, 999);
    const p = makeDivision(q * d, d);
    if (isNice(p) && p.cycles.length === 3 && !exclude.includes(p.dividend)) return p;
  }
  return makeDivision(936, 4);
}

export function randomLevel2(exclude: number[] = []): DivisionProblem {
  for (let i = 0; i < 500; i++) {
    const d = rand(11, 39);
    const q = rand(12, 49);
    const p = makeDivision(q * d, d);
    if (isNice(p) && p.cycles.length === 2 && !exclude.includes(p.dividend)) return p;
  }
  return makeDivision(946, 22);
}

/* Document problems */
export const LEVEL1_MAIN = makeDivision(625, 5);
export const LEVEL1_RETRIES = [makeDivision(936, 4), makeDivision(852, 6), makeDivision(975, 5)];
export const LEVEL2_MAIN = makeDivision(782, 23);
export const LEVEL2_RETRIES = [makeDivision(946, 22), makeDivision(851, 37), makeDivision(988, 26)];

export const LEVEL1_BANK = [486, 3, 848, 4, 735, 5, 972, 6, 868, 7, 744, 8].reduce<DivisionProblem[]>(
  (acc, n, i, arr) => (i % 2 === 0 ? [...acc, makeDivision(n, arr[i + 1])] : acc),
  []
);
export const LEVEL2_BANK = [
  makeDivision(946, 22),
  makeDivision(851, 37),
  makeDivision(858, 26),
  makeDivision(966, 23),
  makeDivision(875, 25),
  makeDivision(672, 16),
];

export const STEP_INFO: Record<Exclude<CabinStep, 'start'>, { label: string; icon: string }> = {
  divide: { label: 'اقسم', icon: '➗' },
  multiply: { label: 'اضرب', icon: '✖️' },
  subtract: { label: 'اطرح', icon: '➖' },
  bringDown: { label: 'نزّل', icon: '⬇️' },
};

export const SCREENS: Exclude<CabinStep, 'start'>[] = ['divide', 'multiply', 'subtract', 'bringDown'];
