/**
 * ضع ملفات الفيديو هنا:
 * assets/videos/intro.mp4
 * assets/videos/prep.mp4
 * assets/videos/level1.mp4
 * assets/videos/level2.mp4
 *
 * حتى تتوفر ملفاتكم، يُستخدم رابط تجريبي فضائي لإظهار المشغّل الحقيقي.
 */
export type VideoId = 'intro' | 'prep' | 'level1' | 'level2';

const DEMO_SPACE =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4';

/** Remote/demo sources — استبدلها بـ require() لما الملفات تكون جاهزة */
export const VIDEO_SOURCES: Record<
  VideoId,
  { uri: string; title: string; isDemo: boolean }
> = {
  intro: {
    uri: DEMO_SPACE,
    title: 'قصة سفينة الفضاء',
    isDemo: true,
  },
  prep: {
    uri: DEMO_SPACE,
    title: 'المستوى التمهيدي — نموذج المستطيل',
    isDemo: true,
  },
  level1: {
    uri: DEMO_SPACE,
    title: 'المستوى الأول — قسمة على رقم واحد',
    isDemo: true,
  },
  level2: {
    uri: DEMO_SPACE,
    title: 'المستوى الثاني — قسمة على رقمين',
    isDemo: true,
  },
};
