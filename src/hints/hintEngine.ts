import type { HintMode } from '@/src/config/env';

/**
 * Hint rules from the design document (per step):
 *  error 1            -> "حاول مرة أخرى ❌"
 *  error 2 (in a row) -> hint 1   (auto: shown at once | on demand: 💡 button unlocks)
 *  error 3 (in a row) -> hint 2   (auto: shown at once | on demand: available on 💡)
 *  error 4 (in a row) -> the game solves it and asks for a new adventure
 * A correct answer resets the counter (new step = fresh start).
 */
export type HintLevel = 0 | 1 | 2;

export type StepHints = {
  errors: number;
  /** highest hint level the child is allowed to see now */
  available: HintLevel;
  /** hint level currently on screen */
  shown: HintLevel;
  solved: boolean;
};

export const SOLVE_AFTER_ERRORS = 4;

export const freshHints = (): StepHints => ({ errors: 0, available: 0, shown: 0, solved: false });

export function registerWrong(s: StepHints, mode: HintMode): StepHints {
  const errors = s.errors + 1;
  const available: HintLevel = errors >= 3 ? 2 : errors >= 2 ? 1 : 0;
  const solved = errors >= SOLVE_AFTER_ERRORS;
  // In auto mode the hint is shown immediately. In on-demand mode the hint already
  // on screen stays; the next level waits for a press on 💡.
  const shown: HintLevel = mode === 'auto' ? available : s.shown;
  return { errors, available, shown, solved };
}

/** on-demand: child pressed 💡 → reveal the next allowed hint level */
export function pressHelp(s: StepHints): StepHints {
  if (s.available === 0) return s;
  const next = Math.min(s.available, Math.max(s.shown + 1, 1)) as HintLevel;
  return { ...s, shown: next };
}

export const helpEnabled = (s: StepHints) => s.available > 0 && s.shown < s.available;

export function feedbackFor(s: StepHints, mode: HintMode): string {
  if (s.solved) return 'لا بأس يا بطل! شاهد الحل جيدًا ثم كرر المغامرة بمسألة جديدة 💪';
  if (s.errors === 1) return 'حاول مرة أخرى ❌';
  if (mode === 'on_demand' && s.shown < s.available) return 'يمكنك الآن الضغط على زر المساعدة 💡';
  if (s.shown === 1) return 'انظر إلى التلميح 👇 ثم حاول';
  if (s.shown === 2) return 'تلميح أقوى 👇 انظر جيدًا إلى الألوان';
  return 'حاول مرة أخرى ❌';
}
