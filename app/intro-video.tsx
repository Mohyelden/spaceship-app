import { useRouter } from 'expo-router';
import { VideoScreen } from '@/src/components/VideoScreen';
import { useRequireLogin } from '@/src/components/useGuard';
import { helpTip } from '@/src/data/videos';
import { useGameStore, useHintMode, useStudent } from '@/src/store/gameStore';

/** 1.3 Story video → map. Skip locked on the student's first login. */
export default function IntroVideo() {
  const ok = useRequireLogin();
  const router = useRouter();
  const student = useStudent();
  const mode = useHintMode();
  const markVideoSeen = useGameStore((s) => s.markVideoSeen);
  if (!ok || !student) return null;

  return (
    <VideoScreen
      videoId="intro"
      canSkip={!!student.videosSeen.intro}
      endTip={helpTip(mode)}
      onFinished={async () => {
        await markVideoSeen('intro');
        router.replace('/map');
      }}
    />
  );
}
