import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Phase2Game } from '@/src/components/game/Phase2Game';
import { useRequireLogin } from '@/src/components/useGuard';
import { PHASE2_EXTRA, PHASE2_MAIN, PHASE2_REINFORCE, randomArea } from '@/src/data/problems/prep';
import { useGameStore } from '@/src/store/gameStore';

/**
 * Prep level · phase 2 (area model)
 *  stage 0 : 872 ÷ 4
 *  stage 1 : reinforcement 1120 ÷ 4 + "ناتج القسمة هو (280 - 250 - 270)"
 *  stage 2+: new problem when the solution had to be shown
 */
export default function PrepPhase2() {
  const ok = useRequireLogin();
  const router = useRouter();
  const completeLevel = useGameStore((s) => s.completeLevel);
  const { stage } = useLocalSearchParams<{ stage?: string }>();
  const n = Number(stage ?? 0);
  const problem = useMemo(
    () => (n === 0 ? PHASE2_MAIN() : n === 1 ? PHASE2_REINFORCE() : (PHASE2_EXTRA[n - 2] ?? randomArea)()),
    [n]
  );
  if (!ok) return null;

  const go = (s: number) => router.replace({ pathname: '/prep/phase2', params: { stage: String(s) } });

  return (
    <Phase2Game
      key={n}
      problem={problem}
      stat="prep"
      title="المرحلة الثانية"
      subtitle={n === 0 ? 'إدخال الأرقام داخل النموذج' : 'مسألة تعزيزية لتثبيت الفهم'}
      withChoice={n >= 1}
      onBack={() => router.replace('/map')}
      onRetry={() => go(Math.max(n + 1, 1))}
      onSuccess={async () => {
        if (n === 0) return go(1);
        await completeLevel('prep');
        router.replace('/prep/complete');
      }}
      successButton={n === 0 ? 'إلى المسألة التعزيزية' : 'أكمل المستوى'}
    />
  );
}
