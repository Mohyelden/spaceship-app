import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useGameStore } from '@/src/store/gameStore';

/**
 * Every game screen needs a logged-in student. If the app was reloaded on a
 * deep link (web refresh, Android process kill) we go back to the splash →
 * login flow instead of showing a broken/empty screen.
 */
export function useRequireLogin() {
  const router = useRouter();
  const code = useGameStore((s) => s.code);
  useEffect(() => {
    if (!code) {
      const t = setTimeout(() => router.replace('/'), 0);
      return () => clearTimeout(t);
    }
  }, [code, router]);
  return !!code;
}
