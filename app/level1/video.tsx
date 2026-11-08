import { useRouter } from 'expo-router';
import { MissionVideoPlayer } from '@/src/components/MissionVideoPlayer';
import { useGameStore } from '@/src/store/gameStore';

export default function Level1VideoScreen() {
  const router = useRouter();
  const hasSeen = useGameStore((s) => s.hasSeenVideo);
  const markVideoSeen = useGameStore((s) => s.markVideoSeen);

  return (
    <MissionVideoPlayer
      videoId="level1"
      canSkip={hasSeen('level1')}
      onFinished={async () => {
        await markVideoSeen('level1');
        router.replace('/level1/cabin');
      }}
    />
  );
}
