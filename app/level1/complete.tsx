import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Celebration } from '@/src/components/Celebration';
import { Button } from '@/src/components/ui/Button';
import { useRequireLogin } from '@/src/components/useGuard';
import { playSound } from '@/src/sound/sounds';
import { starsOf, useStudent } from '@/src/store/gameStore';

export default function Level1Complete() {
  const ok = useRequireLogin();
  const router = useRouter();
  const student = useStudent();
  useEffect(() => playSound('win'), []);
  if (!ok || !student) return null;

  return (
    <Celebration
      stars={starsOf(student)}
      bigStars={2}
      title="أتممت المستوى الأول!"
      message="أضاءت الشاشات الأربع باللون الأخضر! حصلت على نجمتين ⭐⭐ وامتلأ ثلثا شريط التقدم."
    >
      <Button title="انتقل للمستوى الثاني: القسمة على رقمين" icon="🚀" variant="success" onPress={() => router.replace('/level2/video')} />
      <Button title="بنك المسائل للتدريب الحر" icon="🏦" variant="secondary" size="md" onPress={() => router.replace('/bank/level1')} />
      <Button title="كرر المغامرة" icon="🔁" variant="secondary" size="md" onPress={() => router.replace('/level1/cabin')} />
      <Button title="خريطة المستويات" icon="🗺️" variant="secondary" size="md" onPress={() => router.replace('/map')} />
    </Celebration>
  );
}
