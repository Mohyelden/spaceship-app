import { memo, type ReactNode, useEffect, useMemo, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

import { Animated, Easing, Platform, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { colors } from '@/src/theme/colors';

/** Deterministic pseudo random so stars don't jump between renders */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const Stars = memo(function Stars() {
  const stars = useMemo(() => {
    const r = seeded(7);
    return Array.from({ length: 70 }, () => ({
      x: r() * 100,
      y: r() * 100,
      size: r() < 0.85 ? 0.8 + r() * 1.2 : 2 + r() * 1.4,
      o: 0.35 + r() * 0.6,
    }));
  }, []);
  return (
    <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
      <Defs>
        <RadialGradient id="neb1" cx="20%" cy="18%" r="45%">
          <Stop offset="0" stopColor="#7C5CFF" stopOpacity="0.35" />
          <Stop offset="1" stopColor="#7C5CFF" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="neb2" cx="85%" cy="78%" r="50%">
          <Stop offset="0" stopColor="#FF7AC6" stopOpacity="0.22" />
          <Stop offset="1" stopColor="#FF7AC6" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Circle cx="20%" cy="18%" r="60%" fill="url(#neb1)" />
      <Circle cx="85%" cy="78%" r="60%" fill="url(#neb2)" />
      {stars.map((s, i) => (
        <Circle key={i} cx={`${s.x}%`} cy={`${s.y}%`} r={s.size} fill="#FFFFFF" opacity={s.o} />
      ))}
    </Svg>
  );
});

function Twinkles() {
  const v = useState(() => new Animated.Value(0))[0];
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [v]);
  const pts = [
    { top: '12%', left: '78%' },
    { top: '34%', left: '8%' },
    { top: '62%', left: '88%' },
    { top: '86%', left: '22%' },
  ] as const;
  return (
    <>
      {pts.map((p, i) => (
        <Animated.Text
          key={i}
          style={[
            styles.twinkle,
            { top: p.top, left: p.left, opacity: i % 2 ? v : Animated.subtract(1, v) },
          ]}
        >
          ✦
        </Animated.Text>
      ))}
    </>
  );
}

export function SpaceBackground({ children }: { children?: ReactNode }) {
  return (
    <View style={[styles.root, Platform.OS === 'web' && ({ userSelect: 'none' } as object)]}>
      <LinearGradient
        colors={[colors.sky0, colors.sky1, colors.sky2]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Stars />
        <Twinkles />
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.sky0, overflow: 'hidden' },
  twinkle: { position: 'absolute', color: '#FFE9A8', fontSize: 14 },
});
