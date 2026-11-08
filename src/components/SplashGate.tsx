import { useRouter, usePathname } from 'expo-router';
import { useEffect } from 'react';
import { useSessionStore } from '@/src/store/sessionStore';

/** Any deep link / refresh must see splash first this session */
export function useRequireSplash() {
  const router = useRouter();
  const pathname = usePathname();
  const splashSeen = useSessionStore((s) => s.splashSeen);

  useEffect(() => {
    if (!splashSeen && pathname !== '/') {
      router.replace('/');
    }
  }, [splashSeen, pathname, router]);
}
