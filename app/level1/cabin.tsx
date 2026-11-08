import { useLocalSearchParams, useRouter } from 'expo-router';
import { CabinDivision } from '@/src/components/CabinDivision';
import { LEVEL1_MAIN, LEVEL1_RETRY } from '@/src/data/problems/division';

export default function Level1CabinScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ retry?: string }>();
  const problem = params.retry === '1' ? LEVEL1_RETRY : LEVEL1_MAIN;

  return (
    <CabinDivision
      problem={problem}
      onSuccess={() => router.replace('/level1/complete')}
      onRetryWithNew={() =>
        router.replace({ pathname: '/level1/cabin', params: { retry: '1' } })
      }
    />
  );
}
