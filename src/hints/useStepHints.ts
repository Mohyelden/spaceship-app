import { useCallback, useRef, useState } from 'react';
import { playSound } from '@/src/sound/sounds';
import type { StatKey } from '@/src/storage/progress';
import { useGameStore, useHintMode } from '@/src/store/gameStore';
import { freshHints, helpEnabled, pressHelp, registerWrong, type StepHints } from './hintEngine';

/** Hint state for "the current step" + sounds + research statistics */
export function useStepHints(stat: StatKey) {
  const mode = useHintMode();
  const track = useGameStore((s) => s.track);
  const [hints, setHints] = useState<StepHints>(freshHints());
  const ref = useRef(hints);

  const wrong = useCallback((): StepHints => {
    const next = registerWrong(ref.current, mode);
    track(stat, 'errors');
    if (next.solved) track(stat, 'solutionsShown');
    if (next.shown > ref.current.shown) track(stat, 'hintsShown');
    playSound(next.shown > ref.current.shown ? 'hint' : 'wrong');
    ref.current = next;
    setHints(next);
    return next;
  }, [mode, stat, track]);

  const correct = useCallback(() => {
    track(stat, 'correct');
    playSound('correct');
    ref.current = freshHints();
    setHints(ref.current);
  }, [stat, track]);

  const help = useCallback((): StepHints => {
    const next = pressHelp(ref.current);
    track(stat, 'helpPresses');
    if (next.shown > ref.current.shown) track(stat, 'hintsShown');
    playSound('hint');
    ref.current = next;
    setHints(next);
    return next;
  }, [stat, track]);

  const reset = useCallback(() => {
    ref.current = freshHints();
    setHints(ref.current);
  }, []);

  return { hints, mode, wrong, correct, help, reset, helpOn: helpEnabled(hints) };
}
