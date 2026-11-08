import type { VideoSource } from 'expo-video';
import type { VideoId } from '@/src/storage/progress';

/**
 * Mission videos (vertical 1080×1920, Arabic voice-over) bundled with the app.
 * They can be regenerated from the ../video-studio folder.
 */
export const VIDEO_SOURCES: Record<VideoId, { source: VideoSource; title: string }> = {
  intro: { source: require('../../assets/videos/intro.mp4'), title: 'قصة سفينة الفضاء' },
  prep: { source: require('../../assets/videos/prep.mp4'), title: 'المستوى التمهيدي: نموذج المستطيل' },
  level1: { source: require('../../assets/videos/level1.mp4'), title: 'المستوى الأول: القسمة على رقم' },
  level2: { source: require('../../assets/videos/level2.mp4'), title: 'المستوى الثاني: القسمة على رقمين' },
  finale: { source: require('../../assets/videos/finale.mp4'), title: 'انطلاق سفينة الفضاء' },
};

export const helpTip = (mode: 'auto' | 'on_demand') =>
  mode === 'on_demand'
    ? '💡 تذكّر: إذا أخطأت مرتين متتاليتين يضيء زر المساعدة، اضغطه ليرشدك!'
    : '💡 تذكّر: إذا أخطأت مرتين متتاليتين ستظهر لك تلميحات تلقائيًا لترشدك!';
