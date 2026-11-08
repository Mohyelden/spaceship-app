import type { VideoSource } from 'expo-video';

/**
 * فيديوهات المهمة (عمودية 1080×1920، تعليق صوتي عربي) — ملفات محلية داخل التطبيق:
 * assets/videos/intro.mp4
 * assets/videos/prep.mp4
 * assets/videos/level1.mp4
 * assets/videos/level2.mp4
 * assets/videos/finale.mp4 (احتفال قصير — اختياري)
 *
 * مصدر الفيديوهات قابل للتعديل وإعادة التوليد من مجلد video-studio بجوار التطبيق.
 */
export type VideoId = 'intro' | 'prep' | 'level1' | 'level2' | 'finale';

export const VIDEO_SOURCES: Record<
  VideoId,
  { source: VideoSource; title: string; isDemo: boolean }
> = {
  intro: {
    source: require('../../assets/videos/intro.mp4'),
    title: 'قصة سفينة الفضاء',
    isDemo: false,
  },
  prep: {
    source: require('../../assets/videos/prep.mp4'),
    title: 'المستوى التمهيدي — نموذج المستطيل',
    isDemo: false,
  },
  level1: {
    source: require('../../assets/videos/level1.mp4'),
    title: 'المستوى الأول — قسمة على رقم واحد',
    isDemo: false,
  },
  level2: {
    source: require('../../assets/videos/level2.mp4'),
    title: 'المستوى الثاني — قسمة على رقمين',
    isDemo: false,
  },
  finale: {
    source: require('../../assets/videos/finale.mp4'),
    title: 'تهانينا يا قائد الفضاء',
    isDemo: false,
  },
};
