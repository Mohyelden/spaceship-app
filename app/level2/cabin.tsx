import { useLocalSearchParams, useRouter } from 'expo-router';
import { CabinDivision } from '@/src/components/CabinDivision';
import { LEVEL2_MAIN, LEVEL2_RETRY } from '@/src/data/problems/division';

export default function Level2CabinScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ retry?: string }>();
  const problem = params.retry === '1' ? LEVEL2_RETRY : LEVEL2_MAIN;

  return (
    <CabinDivision
      problem={problem}
      onSuccess={() => router.replace('/finale')}
      onRetryWithNew={() =>
        router.replace({ pathname: '/level2/cabin', params: { retry: '1' } })
      }
    />
  );
}
