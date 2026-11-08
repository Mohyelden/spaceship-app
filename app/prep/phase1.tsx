import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Phase1Game } from '@/src/components/game/Phase1Game';
import { useRequireLogin } from '@/src/components/useGuard';
import { PHASE1_MAIN, PHASE1_RETRY, randomPhase1 } from '@/src/data/problems/prep';

/** Prep level · phase 1 (625 ÷ 5). After a shown solution: repeat with 1394 ÷ 5, then random. */
export default function PrepPhase1() {
  const ok = useRequireLogin();
  const router = useRouter();
  const { n } = useLocalSearchParams<{ n?: string }>();
  const attempt = Number(n ?? 0);
  const problem = useMemo(
    () => (attempt === 0 ? PHASE1_MAIN : attempt === 1 ? PHASE1_RETRY : randomPhase1()),
    [attempt]
  );
  if (!ok) return null;

  return (
    <Phase1Game
      key={attempt}
      problem={problem}
      stat="prep"
      title="المرحلة الأولى"
      subtitle={attempt ? 'مغامرة جديدة لتثبيت الفهم' : 'المفاهيم الأساسية للقسمة'}
      onBack={() => router.replace('/map')}
      onSuccess={() => router.replace('/prep/phase2')}
      onRetry={() => router.replace({ pathname: '/prep/phase1', params: { n: String(attempt + 1) } })}
    />
  );
}
