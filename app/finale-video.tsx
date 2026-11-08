import { useRouter } from 'expo-router';
import { VideoScreen } from '@/src/components/VideoScreen';
import { useRequireLogin } from '@/src/components/useGuard';

/** Short launch animation of the repaired ship */
export default function FinaleVideo() {
  const ok = useRequireLogin();
  const router = useRouter();
  if (!ok) return null;
  return <VideoScreen videoId="finale" canSkip onBack={() => router.back()} onFinished={() => router.back()} />;
}
