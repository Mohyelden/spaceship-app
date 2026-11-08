/**
 * نسختا الدعم في البحث:
 *  - auto      : التلميحات تظهر تلقائيًا بعد الخطأ الثاني المتتالي
 *  - on_demand : زر "طلب المساعدة 💡" يُفعَّل فقط بعد الخطأ الثاني المتتالي
 *
 * القيمة الافتراضية تأتي من EXPO_PUBLIC_HINT_MODE (ملف ‎.env)،
 * ويمكن للمعلم تغييرها من "لوحة المعلم" (ضغطة مطولة على الشعار في شاشة الدخول).
 */
export type HintMode = 'auto' | 'on_demand';

export const DEFAULT_HINT_MODE: HintMode =
  process.env.EXPO_PUBLIC_HINT_MODE === 'auto' ? 'auto' : 'on_demand';

export const APP_NAME = 'سفينة الفضاء';
