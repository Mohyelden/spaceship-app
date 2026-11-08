import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeScreen } from '@/src/components/SafeScreen';
import { APP_NAME } from '@/src/config/env';
import { useGameStore } from '@/src/store/gameStore';
import { useSessionStore } from '@/src/store/sessionStore';
import { fonts } from '@/src/theme/typography';

export default function SplashScreen() {
  const router = useRouter();
  const studentCode = useGameStore((s) => s.studentCode);
  const markSplashSeen = useSessionStore((s) => s.markSplashSeen);

  const zoom = useSharedValue(1.08);
  const pulse = useSharedValue(0);
  const titleY = useSharedValue(20);

  useEffect(() => {
    zoom.value = withTiming(1, { duration: 3800, easing: Easing.out(Easing.cubic) });
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1100 }),
        withTiming(0.4, { duration: 1100 })
      ),
      -1,
      false
    );
    titleY.value = withDelay(
      350,
      withTiming(0, { duration: 800, easing: Easing.out(Easing.cubic) })
    );

    const t = setTimeout(() => {
      markSplashSeen();
      // Word doc: splash → login (or map if already logged in)
      if (studentCode) router.replace('/map');
      else router.replace('/login');
    }, 4000);

    return () => clearTimeout(t);
  }, [router, studentCode, markSplashSeen, zoom, pulse, titleY]);

  const bgStyle = useAnimatedStyle(() => ({
    transform: [{ scale: zoom.value }],
  }));
  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 1], [0.2, 0.55]),
  }));
  const titleStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: titleY.value }],
    opacity: interpolate(titleY.value, [20, 0], [0, 1]),
  }));

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.bgLayer, bgStyle]}>
        <ImageBackground
          source={require('../assets/images/space-explorer.png')}
          style={styles.bgImage}
          resizeMode="cover"
        />
      </Animated.View>
      {/* light vignette only at edges — keep art vivid */}
      <View style={styles.vignetteTop} pointerEvents="none" />
      <View style={styles.vignetteBottom} pointerEvents="none" />

      <SafeScreen style={styles.safe}>
        <View style={styles.center}>
          <Animated.View style={[styles.glowOrb, glowStyle]} />
          <Animated.View style={titleStyle}>
            <Text style={styles.brand}>{APP_NAME}</Text>
          </Animated.View>
          <Animated.Text
            entering={FadeInDown.delay(600).duration(600)}
            style={styles.english}
          >
            SPACE MISSION
          </Animated.Text>
          <Animated.View
            entering={FadeIn.delay(900).duration(600)}
            style={styles.rule}
          />
          <Animated.Text
            entering={FadeInUp.delay(1100).duration(600)}
            style={styles.sub}
          >
            مهمة إصلاح المحركات عبر القسمة المطولة
          </Animated.Text>
        </View>
        <Text style={styles.loading}>التالي: تسجيل الدخول بكود الطالب</Text>
      </SafeScreen>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#070B18' },
  bgLayer: { ...StyleSheet.absoluteFill },
  bgImage: { width: '100%', height: '100%' },
  vignetteTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 90,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  vignetteBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 110,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  safe: { flex: 1 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 8,
  },
  glowOrb: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,170,70,0.18)',
  },
  brand: {
    fontFamily: fonts.display,
    fontSize: 48,
    lineHeight: 62,
    color: '#FFF7E8',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 10,
  },
  english: {
    fontFamily: fonts.bodyExtra,
    color: '#FFD089',
    letterSpacing: 3,
    fontSize: 12,
  },
  rule: {
    width: 72,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#FFC56E',
    marginVertical: 4,
  },
  sub: {
    fontFamily: fonts.body,
    color: '#F2F5FF',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 300,
    textShadowColor: 'rgba(0,0,0,0.85)',
    textShadowRadius: 5,
  },
  loading: {
    fontFamily: fonts.bodyBold,
    color: '#FFD089',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 6,
  },
});
