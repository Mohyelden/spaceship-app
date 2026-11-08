import { useRouter } from 'expo-router';
import { MissionVideoPlayer } from '@/src/components/MissionVideoPlayer';
import { useGameStore } from '@/src/store/gameStore';

export default function Level2VideoScreen() {
  const router = useRouter();
  const hasSeen = useGameStore((s) => s.hasSeenVideo);
  const markVideoSeen = useGameStore((s) => s.markVideoSeen);

  return (
    <MissionVideoPlayer
      videoId="level2"
      canSkip={hasSeen('level2')}
      onFinished={async () => {
        await markVideoSeen('level2');
        router.replace('/level2/cabin');
      }}
    />
  );
}
