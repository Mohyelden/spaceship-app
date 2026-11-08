import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { CabinGame } from '@/src/components/game/CabinGame';
import { useRequireLogin } from '@/src/components/useGuard';
import { LEVEL1_MAIN, LEVEL1_RETRIES, randomLevel1 } from '@/src/data/problems/division';
import { useGameStore } from '@/src/store/gameStore';

/** Level 1 · long division by one digit (625 ÷ 5); new problem after a shown solution */
export default function Level1Cabin() {
  const ok = useRequireLogin();
  const router = useRouter();
  const completeLevel = useGameStore((s) => s.completeLevel);
  const { n } = useLocalSearchParams<{ n?: string }>();
  const attempt = Number(n ?? 0);
  const problem = useMemo(
    () => (attempt === 0 ? LEVEL1_MAIN : LEVEL1_RETRIES[attempt - 1] ?? randomLevel1([625])),
    [attempt]
  );
  if (!ok) return null;

  return (
    <CabinGame
      key={attempt}
      problem={problem}
      stat="level1"
      title="كابينة القيادة"
      subtitle="المستوى الأول"
      onBack={() => router.replace('/map')}
      onRetry={() => router.replace({ pathname: '/level1/cabin', params: { n: String(attempt + 1) } })}
      onSuccess={async () => {
        await completeLevel('level1');
        router.replace('/level1/complete');
      }}
    />
  );
}
