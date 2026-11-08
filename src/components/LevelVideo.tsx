import { useRouter, type Href } from 'expo-router';
import { helpTip } from '@/src/data/videos';
import type { VideoId } from '@/src/storage/progress';
import { useGameStore, useHintMode, useStudent } from '@/src/store/gameStore';
import { useRequireLogin } from './useGuard';
import { VideoScreen } from './VideoScreen';

/** Level explainer video: skip locked first time, auto-continue to the live game */
export function LevelVideo({ id, next }: { id: VideoId; next: Href }) {
  const ok = useRequireLogin();
  const router = useRouter();
  const student = useStudent();
  const mode = useHintMode();
  const markVideoSeen = useGameStore((s) => s.markVideoSeen);
  if (!ok || !student) return null;

  return (
    <VideoScreen
      videoId={id}
      canSkip={!!student.videosSeen[id]}
      endTip={helpTip(mode)}
      onBack={() => router.replace('/map')}
      onFinished={async () => {
        await markVideoSeen(id);
        router.replace(next);
      }}
    />
  );
}
