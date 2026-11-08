import { type ReactNode, useEffect, useState } from 'react';

import { Animated, Easing, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { colors, radii } from '@/src/theme/colors';
import { fonts } from '@/src/theme/typography';
import { Robot } from './ui/Art';
import { Screen } from './ui/Screen';
import { StarsProgress } from './ui/StarsProgress';

const PIECES = ['★', '✦', '●', '▲', '■'];
const PIECE_COLORS = [colors.sun, colors.sea, colors.pink, colors.mint, colors.peach, colors.grape];

export function Confetti({ count = 28 }: { count?: number }) {
  const { width, height } = useWindowDimensions();
  const [items] = useState(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: Math.random() * width,
        delay: Math.random() * 900,
        dur: 2200 + Math.random() * 1800,
        ch: PIECES[i % PIECES.length],
        color: PIECE_COLORS[i % PIECE_COLORS.length],
        size: 12 + Math.random() * 12,
        v: new Animated.Value(0),
      }))
  );

  useEffect(() => {
    const anims = items.map((it) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(it.delay),
          Animated.timing(it.v, { toValue: 1, duration: it.dur, easing: Easing.linear, useNativeDriver: true }),
        ])
      )
    );
    anims.forEach((a) => a.start());
    return () => anims.forEach((a) => a.stop());
  }, [items]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {items.map((it, i) => (
        <Animated.Text
          key={i}
          style={{
            position: 'absolute',
            left: it.x,
            top: -30,
            fontSize: it.size,
            color: it.color,
            transform: [
              { translateY: it.v.interpolate({ inputRange: [0, 1], outputRange: [0, height + 60] }) },
              { rotate: it.v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '540deg'] }) },
            ],
          }}
        >
          {it.ch}
        </Animated.Text>
      ))}
    </View>
  );
}

/** Level complete / final screen: big stars, message, progress bar, actions */
export function Celebration({
  stars,
  bigStars,
  title,
  message,
  children,
}: {
  /** stars for the progress bar (total earned) */
  stars: number;
  /** how many big stars to show in the middle */
  bigStars: number;
  title: string;
  message: string;
  children: ReactNode;
}) {
  const pop = useState(() => new Animated.Value(0))[0];
  const spin = useState(() => new Animated.Value(0))[0];
  useEffect(() => {
    Animated.spring(pop, { toValue: 1, friction: 4, tension: 60, useNativeDriver: true }).start();
    Animated.loop(Animated.timing(spin, { toValue: 1, duration: 9000, easing: Easing.linear, useNativeDriver: true })).start();
  }, [pop, spin]);

  return (
    <Screen scroll center>
      <Confetti />
      <View style={styles.wrap}>
        <View style={styles.burstWrap}>
          <Animated.View
            style={[
              styles.burst,
              { transform: [{ rotate: spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] },
            ]}
          />
          <Animated.View style={[styles.starsRow, { transform: [{ scale: pop }] }]}>
            {Array.from({ length: bigStars }, (_, i) => (
              <Text key={i} style={[styles.bigStar, bigStars > 1 && i !== Math.floor(bigStars / 2) && styles.sideStar]}>
                ★
              </Text>
            ))}
          </Animated.View>
        </View>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.msgRow}>
          <Robot size={52} />
          <Text style={styles.msg}>{message}</Text>
        </View>
        <View style={styles.card}>
          <StarsProgress stars={stars} />
        </View>
        <View style={styles.actions}>{children}</View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 14, paddingVertical: 16 },
  burstWrap: { width: 220, height: 170, alignItems: 'center', justifyContent: 'center' },
  burst: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 40,
    backgroundColor: 'rgba(255,200,61,0.16)',
    borderWidth: 2,
    borderColor: 'rgba(255,200,61,0.35)',
  },
  starsRow: { flexDirection: 'row', alignItems: 'flex-end' },
  bigStar: {
    fontSize: 110,
    lineHeight: 130,
    color: colors.sun,
    textShadowColor: 'rgba(255,200,61,0.9)',
    textShadowRadius: 18,
  },
  sideStar: { fontSize: 70, lineHeight: 90 },
  title: { fontFamily: fonts.black, color: colors.white, fontSize: 26, lineHeight: 40, textAlign: 'center' },
  msgRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10, paddingHorizontal: 8 },
  msg: { flex: 1, fontFamily: fonts.bold, color: colors.onDarkSoft, fontSize: 16, lineHeight: 26, textAlign: 'right' },
  card: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radii.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.glassLine,
  },
  actions: { width: '100%', gap: 12, marginTop: 4 },
});
