export type HintMode = 'auto' | 'on_demand';

/** Build flavor: auto hints vs help button after 2 consecutive errors */
export const HINT_MODE: HintMode =
  (process.env.EXPO_PUBLIC_HINT_MODE as HintMode) || 'on_demand';

export const APP_NAME = 'سفينة الفضاء';
