import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ProgressBar } from '@/src/components/ProgressBar';
import { ShipMark } from '@/src/components/ShipMark';
import { SpaceBackground } from '@/src/components/SpaceBackground';
import { useGameStore } from '@/src/store/gameStore';
import { colors, radii } from '@/src/theme/colors';
import { fonts, type } from '@/src/theme/typography';

export default function FinaleScreen() {
  const router = useRouter();
  const completeLevel = useGameStore((s) => s.completeLevel);
  const addXp = useGameStore((s) => s.addXp);
  const badges = useGameStore((s) => s.badges);
  const xp = useGameStore((s) => s.xp);
  const fly = useSharedValue(0);

  useEffect(() => {
    (async () => {
      await completeLevel('level2');
      await addXp(100, 'بطل الرياضيات الذهبي');
    })();
    fly.value = withRepeat(
      withSequence(
        withTiming(-24, { duration: 1600, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1600, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );
  }, [completeLevel, addXp, fly]);

  const shipStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: fly.value }, { rotate: `${fly.value * 0.2}deg` }],
  }));

  return (
    <SpaceBackground>
      <View style={styles.container}>
        <Animated.View entering={FadeIn.duration(700)} style={shipStyle}>
          <ShipMark size={120} />
        </Animated.View>

        <Animated.Text entering={FadeInDown.delay(200).duration(600)} style={styles.title}>
          تدشين السفينة نجح!
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(350).duration(600)} style={styles.sub}>
          تهانينا يا قائد الفضاء العظيم — أصلحت المحركات الأربعة بمهارتك في القسمة المطولة
        </Animated.Text>

        <View style={styles.starsRow}>
          <Text style={styles.stars}>★ ★ ★</Text>
        </View>

        <ProgressBar fraction={1} stars={3} />
        <Text style={styles.xp}>
          XP: {xp}
          {badges.length ? ` · ${badges.join(' · ')}` : ''}
        </Text>

        <View style={styles.panel}>
          <Text style={styles.panelText}>انطلقت السفينة في عمق المجرة</Text>
        </View>

        <PrimaryButton title="عودة لخريطة الكواكب" onPress={() => router.replace('/map')} />
        <PrimaryButton
          title="بنك المسائل"
          variant="secondary"
          onPress={() => router.push('/bank/level2')}
        />
        <PrimaryButton
          title="تسجيل قائد آخر"
          variant="ghost"
          onPress={() => router.replace('/login')}
        />
      </View>
    </SpaceBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 22,
    gap: 12,
    alignItems: 'center',
  },
  title: {
    ...type.title,
    color: colors.parchment,
    fontSize: 28,
  },
  sub: {
    ...type.subtitle,
    color: colors.mist,
    maxWidth: 340,
  },
  starsRow: {
    paddingVertical: 4,
  },
  stars: {
    fontSize: 34,
    color: colors.copperBright,
    letterSpacing: 8,
  },
  xp: {
    fontFamily: fonts.bodyBold,
    color: colors.copperBright,
    textAlign: 'center',
  },
  panel: {
    backgroundColor: colors.parchment,
    borderRadius: radii.md,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 8,
  },
  panelText: {
    fontFamily: fonts.bodyBold,
    color: colors.ink,
    textAlign: 'center',
  },
});
