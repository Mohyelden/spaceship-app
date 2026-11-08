import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Celebration } from '@/src/components/Celebration';
import { Button } from '@/src/components/ui/Button';
import { useRequireLogin } from '@/src/components/useGuard';
import { playSound } from '@/src/sound/sounds';
import { starsOf, useStudent } from '@/src/store/gameStore';

export default function PrepComplete() {
  const ok = useRequireLogin();
  const router = useRouter();
  const student = useStudent();
  useEffect(() => playSound('win'), []);
  if (!ok || !student) return null;

  return (
    <Celebration
      stars={starsOf(student)}
      bigStars={1}
      title="أتممت المستوى التمهيدي!"
      message="رائع يا قائد! أصلحت المحرك الأول وحصلت على النجمة الأولى ⭐ وامتلأ ثلث شريط التقدم."
    >
      <Button title="انتقل للمستوى الأول: القسمة على رقم واحد" icon="🚀" variant="success" onPress={() => router.replace('/level1/video')} />
      <Button title="بنك المسائل للتدريب الحر" icon="🏦" variant="secondary" size="md" onPress={() => router.replace('/bank/prep')} />
      <Button title="كرر المغامرة" icon="🔁" variant="secondary" size="md" onPress={() => router.replace('/prep/phase1')} />
      <Button title="خريطة المستويات" icon="🗺️" variant="secondary" size="md" onPress={() => router.replace('/map')} />
    </Celebration>
  );
}
