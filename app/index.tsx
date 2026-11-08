import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';

import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { RocketLogo } from '@/src/components/ui/Art';
import { SpaceBackground } from '@/src/components/ui/SpaceBackground';
import { playSound } from '@/src/sound/sounds';
import { colors } from '@/src/theme/colors';
import { fonts } from '@/src/theme/typography';

/** 1.1 Splash: logo + game name, motivating sound, auto → login after 3 s */
export default function Splash() {
  const router = useRouter();
  const rise = useState(() => new Animated.Value(0))[0];
  const float = useState(() => new Animated.Value(0))[0];
  const title = useState(() => new Animated.Value(0))[0];

  useEffect(() => {
    playSound('launch');
    Animated.sequence([
      Animated.timing(rise, { toValue: 1, duration: 900, easing: Easing.out(Easing.back(1.4)), useNativeDriver: true }),
      Animated.timing(title, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 1200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
    const t = setTimeout(() => router.replace('/login'), 3000);
    return () => clearTimeout(t);
  }, [router, rise, float, title]);

  return (
    <SpaceBackground>
      <View style={styles.center}>
        <Animated.View
          style={{
            opacity: rise,
            transform: [
              { translateY: rise.interpolate({ inputRange: [0, 1], outputRange: [120, 0] }) },
              { translateY: float.interpolate({ inputRange: [0, 1], outputRange: [0, -10] }) },
            ],
          }}
        >
          <View style={styles.halo}>
            <RocketLogo size={150} />
          </View>
        </Animated.View>
        <Animated.View
          style={{
            opacity: title,
            alignItems: 'center',
            transform: [{ scale: title.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }],
          }}
        >
          <Text style={styles.name}>سفينة الفضاء</Text>
          <Text style={styles.tag}>مغامرة إصلاح المحركات بالقسمة المطوّلة</Text>
        </Animated.View>
      </View>
      <View style={styles.dots}>
        {[0, 1, 2].map((i) => (
          <Animated.View
            key={i}
            style={[
              styles.dot,
              { opacity: float.interpolate({ inputRange: [0, 1], outputRange: i === 1 ? [1, 0.3] : [0.3, 1] }) },
            ]}
          />
        ))}
      </View>
    </SpaceBackground>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 18, padding: 24 },
  halo: {
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontFamily: fonts.black,
    fontSize: 46,
    lineHeight: 70,
    color: colors.white,
    textAlign: 'center',
    textShadowColor: 'rgba(139,92,246,0.9)',
    textShadowRadius: 18,
  },
  tag: { fontFamily: fonts.bold, fontSize: 16, color: colors.sun, textAlign: 'center' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingBottom: 48 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.white },
});
