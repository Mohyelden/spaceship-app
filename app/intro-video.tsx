import { useRouter } from 'expo-router';
import { MissionVideoPlayer } from '@/src/components/MissionVideoPlayer';
import { useRequireSplash } from '@/src/components/SplashGate';
import { HINT_MODE } from '@/src/config/env';
import { useGameStore } from '@/src/store/gameStore';

export default function IntroVideoScreen() {
  useRequireSplash();
  const router = useRouter();
  const hasSeen = useGameStore((s) => s.hasSeenVideo);
  const markVideoSeen = useGameStore((s) => s.markVideoSeen);
  const canSkip = hasSeen('intro');

  return (
    <MissionVideoPlayer
      videoId="intro"
      canSkip={canSkip}
      hintAboutHelp={
        HINT_MODE === 'on_demand'
          ? 'في اللعب: زر المساعدة بعد خطأين متتاليين'
          : 'في اللعب: التلميحات تظهر تلقائيًا بعد خطأين'
      }
      onFinished={async () => {
        await markVideoSeen('intro');
        router.replace('/map');
      }}
    />
  );
}
