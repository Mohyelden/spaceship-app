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
  withTiming,
} from 'react-native-reanimated';
import { SafeScreen } from '@/src/components/SafeScreen';
import { ShipMark } from '@/src/components/ShipMark';
import { APP_NAME } from '@/src/config/env';
import { useGameStore } from '@/src/store/gameStore';
import { useSessionStore } from '@/src/store/sessionStore';
import { fonts } from '@/src/theme/typography';

export default function SplashScreen() {
  const router = useRouter();
  const studentCode = useGameStore((s) => s.studentCode);
  const markSplashSeen = useSessionStore((s) => s.markSplashSeen);

  const zoom = useSharedValue(1.1);
  const shipY = useSharedValue(40);
  const shipOp = useSharedValue(0);
  const ring = useSharedValue(0);
  const titleY = useSharedValue(28);

  useEffect(() => {
    zoom.value = withTiming(1, { duration: 3200, easing: Easing.out(Easing.cubic) });
    shipOp.value = withTiming(1, { duration: 700 });
    shipY.value = withTiming(0, { duration: 1100, easing: Easing.out(Easing.cubic) });
    ring.value = withDelay(
      500,
      withRepeat(withTiming(1, { duration: 2200, easing: Easing.out(Easing.quad) }), -1, false)
    );
    titleY.value = withDelay(
      450,
      withTiming(0, { duration: 850, easing: Easing.out(Easing.cubic) })
    );

    // Word: splash ~3 seconds then login
    const t = setTimeout(() => {
      markSplashSeen();
      if (studentCode) router.replace('/map');
      else router.replace('/login');
    }, 3200);

    return () => clearTimeout(t);
  }, [router, studentCode, markSplashSeen, zoom, shipY, shipOp, ring, titleY]);

  const bgStyle = useAnimatedStyle(() => ({
    transform: [{ scale: zoom.value }],
  }));
  const shipStyle = useAnimatedStyle(() => ({
    opacity: shipOp.value,
    transform: [
      { translateY: shipY.value },
      { scale: interpolate(shipY.value, [40, 0], [0.75, 1]) },
    ],
  }));
  const ringStyle = useAnimatedStyle(() => ({
    opacity: interpolate(ring.value, [0, 1], [0.65, 0]),
    transform: [{ scale: interpolate(ring.value, [0, 1], [0.85, 1.75]) }],
  }));
  const titleStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: titleY.value }],
    opacity: interpolate(titleY.value, [28, 0], [0, 1]),
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
      <View style={styles.vignetteTop} pointerEvents="none" />
      <View style={styles.vignetteBottom} pointerEvents="none" />

      <SafeScreen style={styles.safe}>
        <View style={styles.center}>
          <View style={styles.shipWrap}>
            <Animated.View style={[styles.ring, ringStyle]} />
            <Animated.View style={[styles.ring, ringStyle, { width: 150, height: 150 }]} />
            <Animated.View style={shipStyle}>
              <ShipMark size={108} />
            </Animated.View>
          </View>

          <Animated.View style={titleStyle}>
            <Text style={styles.brand}>{APP_NAME}</Text>
          </Animated.View>

          <Animated.Text
            entering={FadeInDown.delay(500).duration(550)}
            style={styles.english}
          >
            SPACE MISSION
          </Animated.Text>

          <Animated.View
            entering={FadeIn.delay(750).duration(500)}
            style={styles.rule}
          />

          <Animated.Text
            entering={FadeInUp.delay(900).duration(550)}
            style={styles.sub}
          >
            مغامرة إصلاح المحركات · القسمة المطولة
          </Animated.Text>
        </View>

        <Animated.Text
          entering={FadeIn.delay(1400).duration(500)}
          style={styles.loading}
        >
          الانتقال لتسجيل الدخول…
        </Animated.Text>
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
    height: 70,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  vignetteBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  safe: { flex: 1 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    gap: 8,
  },
  shipWrap: {
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  ring: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 99,
    borderWidth: 2,
    borderColor: '#FFC56E',
  },
  brand: {
    fontFamily: fonts.display,
    fontSize: 44,
    lineHeight: 58,
    color: '#FFF7E8',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.85)',
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
    width: 64,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#FFC56E',
    marginVertical: 2,
  },
  sub: {
    fontFamily: fonts.body,
    color: '#F2F5FF',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 300,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowRadius: 5,
  },
  loading: {
    fontFamily: fonts.bodyBold,
    color: '#FFD089',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
  },
});
