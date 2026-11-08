export type CabinStep = 'divide' | 'multiply' | 'subtract' | 'bringDown';

export type DivisionCycle = {
  /** Current working number for divide step */
  working: number;
  divisor: number;
  /** Correct quotient digit for this cycle */
  digit: number;
  product: number;
  remainder: number;
  /** Digit brought down (null if last cycle) */
  bringDownDigit: number | null;
  /** After bring-down, next working number */
  nextWorking: number | null;
};

export type DivisionProblem = {
  id: string;
  dividend: number;
  divisor: number;
  quotient: number;
  cycles: DivisionCycle[];
  /** How many digits to take at start (1 or 2) */
  startDigits: number;
};

function buildCycles(dividend: number, divisor: number): DivisionCycle[] {
  const digits = String(dividend).split('').map(Number);
  const cycles: DivisionCycle[] = [];
  let index = 0;
  let working = 0;

  // Take enough leading digits
  while (index < digits.length && working < divisor) {
    working = working * 10 + digits[index];
    index += 1;
  }

  while (true) {
    const digit = Math.floor(working / divisor);
    const product = digit * divisor;
    const remainder = working - product;
    const bringDownDigit = index < digits.length ? digits[index] : null;
    let nextWorking: number | null = null;

    if (bringDownDigit !== null) {
      nextWorking = remainder * 10 + bringDownDigit;
      index += 1;
    }

    cycles.push({
      working,
      divisor,
      digit,
      product,
      remainder,
      bringDownDigit,
      nextWorking,
    });

    if (bringDownDigit === null) break;
    working = nextWorking!;
  }

  return cycles;
}

export function makeDivisionProblem(
  id: string,
  dividend: number,
  divisor: number
): DivisionProblem {
  const cycles = buildCycles(dividend, divisor);
  const quotient = Math.floor(dividend / divisor);
  const startDigits = String(cycles[0]?.working ?? dividend).length;

  return { id, dividend, divisor, quotient, cycles, startDigits };
}

export const LEVEL1_MAIN = makeDivisionProblem('l1-625-5', 625, 5);
export const LEVEL1_RETRY = makeDivisionProblem('l1-748-4', 748, 4);

export const LEVEL2_MAIN = makeDivisionProblem('l2-782-23', 782, 23);
export const LEVEL2_RETRY = makeDivisionProblem('l2-946-22', 946, 22);

export const LEVEL1_BANK = [
  LEVEL1_MAIN,
  LEVEL1_RETRY,
  makeDivisionProblem('bank-l1-486-3', 486, 3),
  makeDivisionProblem('bank-l1-864-4', 864, 4),
  makeDivisionProblem('bank-l1-945-5', 945, 5),
  makeDivisionProblem('bank-l1-728-4', 728, 4),
];

export const LEVEL2_BANK = [
  LEVEL2_MAIN,
  LEVEL2_RETRY,
  makeDivisionProblem('bank-l2-858-26', 858, 26),
  makeDivisionProblem('bank-l2-966-23', 966, 23),
  makeDivisionProblem('bank-l2-875-25', 875, 25),
];

export const STEP_LABELS: Record<CabinStep, string> = {
  divide: 'اقسم',
  multiply: 'اضرب',
  subtract: 'اطرح',
  bringDown: 'نزل',
};

export const STEP_ORDER: CabinStep[] = [
  'divide',
  'multiply',
  'subtract',
  'bringDown',
];
