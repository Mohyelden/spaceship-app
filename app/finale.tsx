import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Celebration } from '@/src/components/Celebration';
import { Button } from '@/src/components/ui/Button';
import { useRequireLogin } from '@/src/components/useGuard';
import { playSound } from '@/src/sound/sounds';
import { starsOf, useGameStore, useStudent } from '@/src/store/gameStore';

/** Part 3: final screen – ship fully repaired, 3 gold stars, 100% progress */
export default function Finale() {
  const ok = useRequireLogin();
  const router = useRouter();
  const student = useStudent();
  const logout = useGameStore((s) => s.logout);
  useEffect(() => playSound('win'), []);
  if (!ok || !student) return null;

  return (
    <Celebration
      stars={starsOf(student)}
      bigStars={3}
      title="تهانينا يا قائد الفضاء العظيم!"
      message="لقد أصلحت المحركات الأربعة بمهارتك في القسمة المطوّلة! 🚀"
    >
      <Button title="شاهد انطلاق السفينة" icon="🎬" variant="success" onPress={() => router.push('/finale-video')} />
      <Button title="إعادة المغامرة بمسألة جديدة" icon="🔁" size="md" onPress={() => router.replace('/map')} />
      <Button
        title="خروج"
        icon="👋"
        variant="secondary"
        size="md"
        onPress={() => {
          logout();
          router.replace('/login');
        }}
      />
    </Celebration>
  );
}
