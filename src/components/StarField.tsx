import { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '@/src/theme/colors';

function Twinkle({
  top,
  left,
  size,
  delay,
}: {
  top: string;
  left: string;
  size: number;
  delay: number;
}) {
  const o = useSharedValue(0.2);
  useEffect(() => {
    o.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 900 + delay * 0.2, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.15, { duration: 1100, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      )
    );
  }, [delay, o]);

  const style = useAnimatedStyle(() => ({ opacity: o.value }));

  return (
    <Animated.View
      style={[
        styles.star,
        style,
        { top, left, width: size, height: size, borderRadius: size },
      ]}
    />
  );
}

export function StarField({ count = 42 }: { count?: number }) {
  const stars = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        top: `${(i * 17 + 7) % 96}%`,
        left: `${(i * 29 + 3) % 97}%`,
        size: 1.5 + (i % 4),
        delay: (i * 120) % 2400,
      })),
    [count]
  );

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {stars.map((s) => (
        <Twinkle key={s.id} {...s} />
      ))}
      <View style={styles.nebulaA} />
      <View style={styles.nebulaB} />
    </View>
  );
}

const styles = StyleSheet.create({
  star: {
    position: 'absolute',
    backgroundColor: colors.parchment,
  },
  nebulaA: {
    position: 'absolute',
    top: '10%',
    right: '-10%',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(196,132,58,0.07)',
  },
  nebulaB: {
    position: 'absolute',
    bottom: '8%',
    left: '-16%',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(80,120,200,0.06)',
  },
});
