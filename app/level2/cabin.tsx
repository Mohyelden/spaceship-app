import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { CabinGame } from '@/src/components/game/CabinGame';
import { useRequireLogin } from '@/src/components/useGuard';
import { LEVEL2_MAIN, LEVEL2_RETRIES, randomLevel2 } from '@/src/data/problems/division';
import { useGameStore } from '@/src/store/gameStore';

/** Level 2 · long division by two digits (782 ÷ 23); new problem after a shown solution */
export default function Level2Cabin() {
  const ok = useRequireLogin();
  const router = useRouter();
  const completeLevel = useGameStore((s) => s.completeLevel);
  const { n } = useLocalSearchParams<{ n?: string }>();
  const attempt = Number(n ?? 0);
  const problem = useMemo(
    () => (attempt === 0 ? LEVEL2_MAIN : LEVEL2_RETRIES[attempt - 1] ?? randomLevel2([782])),
    [attempt]
  );
  if (!ok) return null;

  return (
    <CabinGame
      key={attempt}
      problem={problem}
      stat="level2"
      twoDigit
      title="كابينة القيادة"
      subtitle="المستوى الثاني"
      onBack={() => router.replace('/map')}
      onRetry={() => router.replace({ pathname: '/level2/cabin', params: { n: String(attempt + 1) } })}
      successButton="أطلق السفينة 🚀"
      onSuccess={async () => {
        await completeLevel('level2');
        router.replace('/finale');
      }}
    />
  );
}
