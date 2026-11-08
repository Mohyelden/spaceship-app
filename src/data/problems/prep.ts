export type CardRole = 'dividend' | 'divisor' | 'quotient' | 'remainder';

export type PrepPhase1Problem = {
  id: string;
  dividend: number;
  divisor: number;
  quotient: number;
  remainder: number;
};

export type AreaSlotId =
  | 'q_hundreds'
  | 'q_tens'
  | 'q_ones'
  | 'partial_hundreds'
  | 'partial_tens'
  | 'partial_ones'
  | 'product_hundreds'
  | 'product_tens'
  | 'product_ones'
  | 'remain_hundreds'
  | 'remain_tens'
  | 'remain_ones';

export type PrepPhase2Problem = {
  id: string;
  dividend: number;
  divisor: number;
  quotient: number;
  /** Correct values for each slot */
  solution: Partial<Record<AreaSlotId, number>>;
  /** Number tiles available to drag */
  tiles: number[];
  /** Multiple choice for quotient confirmation */
  mcOptions?: number[];
  mcAnswer?: number;
};

export const PREP_PHASE1_MAIN: PrepPhase1Problem = {
  id: 'prep1-625-5',
  dividend: 625,
  divisor: 5,
  quotient: 125,
  remainder: 0,
};

export const PREP_PHASE1_RETRY: PrepPhase1Problem = {
  id: 'prep1-1394-5',
  dividend: 1394,
  divisor: 5,
  quotient: 278,
  remainder: 4,
};

export const PREP_PHASE2_MAIN: PrepPhase2Problem = {
  id: 'prep2-872-4',
  dividend: 872,
  divisor: 4,
  quotient: 218,
  solution: {
    q_hundreds: 200,
    q_tens: 10,
    q_ones: 8,
    partial_hundreds: 800,
    partial_tens: 72,
    partial_ones: 32,
    product_hundreds: 800,
    product_tens: 40,
    product_ones: 32,
    remain_hundreds: 72,
    remain_tens: 32,
    remain_ones: 0,
  },
  tiles: [40, 10, 72, 0, 32, 8, 200, 800, 100],
};

export const PREP_PHASE2_RETRY: PrepPhase2Problem = {
  id: 'prep2-1120-4',
  dividend: 1120,
  divisor: 4,
  quotient: 280,
  solution: {
    q_hundreds: 200,
    q_tens: 80,
    q_ones: 0,
    partial_hundreds: 800,
    partial_tens: 320,
    partial_ones: 0,
    product_hundreds: 800,
    product_tens: 320,
    product_ones: 0,
    remain_hundreds: 320,
    remain_tens: 0,
    remain_ones: 0,
  },
  tiles: [200, 120, 72, 0, 320, 8, 50, 800, 80, 30],
  mcOptions: [280, 250, 270],
  mcAnswer: 280,
};

export const PREP_BANK: PrepPhase1Problem[] = [
  PREP_PHASE1_MAIN,
  PREP_PHASE1_RETRY,
  { id: 'bank-p1-486-3', dividend: 486, divisor: 3, quotient: 162, remainder: 0 },
  { id: 'bank-p1-848-4', dividend: 848, divisor: 4, quotient: 212, remainder: 0 },
  { id: 'bank-p1-963-3', dividend: 963, divisor: 3, quotient: 321, remainder: 0 },
  { id: 'bank-p1-735-5', dividend: 735, divisor: 5, quotient: 147, remainder: 0 },
];

export function roleValue(
  problem: PrepPhase1Problem,
  role: CardRole
): number {
  switch (role) {
    case 'dividend':
      return problem.dividend;
    case 'divisor':
      return problem.divisor;
    case 'quotient':
      return problem.quotient;
    case 'remainder':
      return problem.remainder;
  }
}

export const ROLE_LABELS: Record<CardRole, string> = {
  dividend: 'المقسوم',
  divisor: 'المقسوم عليه',
  quotient: 'ناتج القسمة',
  remainder: 'الباقي',
};
