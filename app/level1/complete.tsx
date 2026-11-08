import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ProgressBar } from '@/src/components/ProgressBar';
import { SpaceBackground } from '@/src/components/SpaceBackground';
import { useGameStore } from '@/src/store/gameStore';
import { colors } from '@/src/theme/colors';

export default function Level1CompleteScreen() {
  const router = useRouter();
  const completeLevel = useGameStore((s) => s.completeLevel);
  const stars = useGameStore((s) => s.stars);
  const progressFraction = useGameStore((s) => s.progressFraction);

  useEffect(() => {
    completeLevel('level1');
  }, [completeLevel]);

  return (
    <SpaceBackground>
      <View style={styles.container}>
        <Text style={styles.emoji}>⭐⭐</Text>
        <Text style={styles.title}>أنجزت القسمة على رقم واحد!</Text>
        <Text style={styles.sub}>الشاشات الأربع تضيء — ثلثا الطريق مكتمل</Text>
        <ProgressBar
          fraction={Math.max(progressFraction(), 2 / 3)}
          stars={Math.max(stars, 2)}
        />
        <PrimaryButton
          title="انتقل للمستوى الثاني"
          variant="success"
          onPress={() => router.replace('/level2/video')}
        />
        <PrimaryButton
          title="بنك المسائل"
          variant="secondary"
          onPress={() => router.push('/bank/level1')}
        />
        <PrimaryButton
          title="الخريطة"
          variant="secondary"
          onPress={() => router.replace('/map')}
        />
      </View>
    </SpaceBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 14,
  },
  emoji: { fontSize: 48, textAlign: 'center' },
  title: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
  },
  sub: { color: colors.cyan, textAlign: 'center' },
});
