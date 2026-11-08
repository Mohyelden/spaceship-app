import { useRouter } from 'expo-router';
import { MissionVideoPlayer } from '@/src/components/MissionVideoPlayer';
import { HINT_MODE } from '@/src/config/env';
import { useGameStore } from '@/src/store/gameStore';

export default function PrepVideoScreen() {
  const router = useRouter();
  const hasSeen = useGameStore((s) => s.hasSeenVideo);
  const markVideoSeen = useGameStore((s) => s.markVideoSeen);

  return (
    <MissionVideoPlayer
      videoId="prep"
      canSkip={hasSeen('prep')}
      hintAboutHelp={
        HINT_MODE === 'on_demand'
          ? 'زر المساعدة يُفعَّل بعد خطأين'
          : 'التلميحات تظهر تلقائيًا بعد خطأين'
      }
      onFinished={async () => {
        await markVideoSeen('prep');
        router.replace('/prep/phase1');
      }}
    />
  );
}
