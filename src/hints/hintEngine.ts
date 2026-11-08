import { HINT_MODE, type HintMode } from '@/src/config/env';

export type HintTier = 0 | 1 | 2 | 3;

export type HintState = {
  consecutiveErrors: number;
  tier: HintTier;
  helpUnlocked: boolean;
  showSolution: boolean;
};

export function createHintState(): HintState {
  return {
    consecutiveErrors: 0,
    tier: 0,
    helpUnlocked: false,
    showSolution: false,
  };
}

export function onCorrect(state: HintState): HintState {
  return {
    ...state,
    consecutiveErrors: 0,
    tier: 0,
    helpUnlocked: false,
    showSolution: false,
  };
}

export function onWrong(
  state: HintState,
  mode: HintMode = HINT_MODE
): HintState {
  const consecutiveErrors = state.consecutiveErrors + 1;

  if (consecutiveErrors === 1) {
    return { ...state, consecutiveErrors, tier: 0 };
  }

  if (consecutiveErrors === 2) {
    if (mode === 'auto') {
      return {
        ...state,
        consecutiveErrors,
        tier: 1,
        helpUnlocked: true,
      };
    }
    return {
      ...state,
      consecutiveErrors,
      tier: 0,
      helpUnlocked: true,
    };
  }

  if (consecutiveErrors === 3) {
    return {
      ...state,
      consecutiveErrors,
      tier: Math.max(state.tier, 2) as HintTier,
      helpUnlocked: true,
    };
  }

  return {
    ...state,
    consecutiveErrors,
    tier: 3,
    helpUnlocked: true,
    showSolution: true,
  };
}

/** User pressed help button (on_demand only) */
export function requestHelp(state: HintState): HintState {
  if (!state.helpUnlocked) return state;
  if (state.tier === 0) return { ...state, tier: 1 };
  if (state.tier === 1) return { ...state, tier: 2 };
  return { ...state, tier: 3, showSolution: true };
}

export function resetStepHints(): HintState {
  return createHintState();
}
