import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  LinearGradient,
  RadialGradient,
  Stop,
  G,
} from 'react-native-svg';
import { fonts } from '@/src/theme/typography';

export type PlanetSkin = 'ember' | 'ocean' | 'ringed' | 'violet';

const SKINS: Record<
  PlanetSkin,
  { c0: string; c1: string; c2: string; ring?: string; band?: string }
> = {
  ember: {
    c0: '#FFD27A',
    c1: '#E67A2E',
    c2: '#8B2E12',
    band: '#F0A04B',
  },
  ocean: {
    c0: '#9FE7FF',
    c1: '#2F7FE8',
    c2: '#123B8C',
    band: '#5BB8FF',
  },
  ringed: {
    c0: '#FFC56E',
    c1: '#D9782C',
    c2: '#7A3A12',
    ring: '#C6F26D',
    band: '#E8A24A',
  },
  violet: {
    c0: '#E2B7FF',
    c1: '#8A4FD1',
    c2: '#3B1A74',
    band: '#B57AE8',
  },
};

type Props = {
  skin: PlanetSkin;
  size?: number;
  open: boolean;
  done: boolean;
  label: string;
  subtitle: string;
  delay?: number;
  compact?: boolean;
  onPress: () => void;
  onBank?: () => void;
};

export function RichPlanet({
  skin,
  size = 108,
  open,
  done,
  label,
  subtitle,
  delay = 0,
  compact = false,
  onPress,
  onBank,
}: Props) {
  const float = useSharedValue(0);
  const palette = SKINS[skin];
  const id = `p-${skin}-${Math.round(size)}`;

  useEffect(() => {
    float.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, {
          duration: 2400 + delay,
          easing: Easing.inOut(Easing.sin),
        }),
        -1,
        true
      )
    );
  }, [delay, float]);

  const wrapStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: float.value * (compact ? -4 : -8) }],
  }));

  const r = size / 2;
  const box = size + (compact ? 12 : 24);

  return (
    <Animated.View
      style={[styles.wrap, wrapStyle, { width: compact ? size + 28 : size + 36 }]}
    >
      <Pressable disabled={!open} onPress={onPress} style={{ alignItems: 'center' }}>
        <View
          style={{
            width: box,
            height: box,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <View
            style={[
              styles.glow,
              {
                width: size * 1.3,
                height: size * 1.3,
                borderRadius: size,
                backgroundColor: open ? `${palette.c1}55` : '#ffffff12',
              },
            ]}
          />
          <Svg width={box} height={box}>
            <Defs>
              <RadialGradient id={`${id}-body`} cx="35%" cy="30%" r="70%">
                <Stop offset="0%" stopColor={open ? palette.c0 : '#6B7280'} />
                <Stop offset="55%" stopColor={open ? palette.c1 : '#4B5563'} />
                <Stop offset="100%" stopColor={open ? palette.c2 : '#1F2937'} />
              </RadialGradient>
              <LinearGradient id={`${id}-band`} x1="0" y1="0" x2="0" y2="1">
                <Stop
                  offset="0%"
                  stopColor={palette.band || palette.c0}
                  stopOpacity="0.55"
                />
                <Stop offset="100%" stopColor={palette.c2} stopOpacity="0.15" />
              </LinearGradient>
            </Defs>

            {palette.ring ? (
              <G transform={`rotate(-22 ${box / 2} ${box / 2})`}>
                <Ellipse
                  cx={box / 2}
                  cy={box / 2 + 4}
                  rx={r * 1.22}
                  ry={r * 0.26}
                  stroke={open ? palette.ring : '#6B7280'}
                  strokeWidth={compact ? 3.5 : 5}
                  fill="none"
                />
              </G>
            ) : null}

            <Circle cx={box / 2} cy={box / 2} r={r} fill={`url(#${id}-body)`} />
            <Ellipse
              cx={box / 2}
              cy={box / 2 - r * 0.15}
              rx={r * 0.8}
              ry={r * 0.16}
              fill={`url(#${id}-band)`}
            />
            <Ellipse
              cx={box / 2 - r * 0.28}
              cy={box / 2 - r * 0.3}
              rx={r * 0.24}
              ry={r * 0.14}
              fill="#fff"
              opacity={0.28}
            />
          </Svg>

          {!open ? (
            <View style={[styles.lockBadge, compact && styles.lockCompact]}>
              <Text style={styles.lockIcon}>🔒</Text>
            </View>
          ) : done ? (
            <View style={[styles.lockBadge, styles.doneBadge, compact && styles.lockCompact]}>
              <Text style={styles.doneText}>★</Text>
            </View>
          ) : (
            <View style={[styles.lockBadge, styles.openBadge, compact && styles.lockCompact]}>
              <Text style={styles.openText}>▶</Text>
            </View>
          )}
        </View>

        <View style={[styles.card, compact && styles.cardCompact]}>
          <Text style={[styles.label, compact && styles.labelCompact]} numberOfLines={1}>
            {label}
          </Text>
          {!compact ? (
            <Text style={styles.sub} numberOfLines={2}>
              {subtitle}
            </Text>
          ) : (
            <Text style={styles.subCompact} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
          {!compact ? (
            open ? (
              <Text style={styles.cta}>{done ? 'ادخل مجددًا' : 'اضغط للدخول'}</Text>
            ) : (
              <Text style={styles.ctaMuted}>أكمل السابق أولًا</Text>
            )
          ) : null}
        </View>
      </Pressable>

      {!compact && done && onBank ? (
        <Pressable onPress={onBank} style={styles.bank}>
          <Text style={styles.bankText}>بنك المسائل</Text>
        </Pressable>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  glow: { position: 'absolute' },
  lockBadge: {
    position: 'absolute',
    bottom: 6,
    backgroundColor: 'rgba(15,18,28,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#6B7280',
  },
  lockCompact: { bottom: 2, paddingHorizontal: 6, paddingVertical: 2 },
  lockIcon: { fontSize: 11 },
  doneBadge: { borderColor: '#F5C451', backgroundColor: 'rgba(80,50,10,0.92)' },
  doneText: { color: '#F5C451', fontFamily: fonts.bodyBold, fontSize: 11 },
  openBadge: { borderColor: '#FFC56E', backgroundColor: 'rgba(60,40,10,0.9)' },
  openText: { color: '#FFC56E', fontSize: 10, fontFamily: fonts.bodyBold },
  card: {
    marginTop: 2,
    backgroundColor: 'rgba(10,14,26,0.88)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,200,120,0.28)',
    minWidth: 110,
  },
  cardCompact: {
    minWidth: 0,
    width: '100%',
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 10,
  },
  label: {
    fontFamily: fonts.bodyExtra,
    color: '#FFF4DF',
    fontSize: 12,
    textAlign: 'center',
  },
  labelCompact: { fontSize: 10 },
  sub: {
    fontFamily: fonts.body,
    color: '#B7C0D6',
    fontSize: 9,
    textAlign: 'center',
    marginTop: 2,
  },
  subCompact: {
    fontFamily: fonts.body,
    color: '#B7C0D6',
    fontSize: 8,
    textAlign: 'center',
    marginTop: 1,
  },
  cta: {
    fontFamily: fonts.bodyBold,
    color: '#FFC56E',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 3,
  },
  ctaMuted: {
    fontFamily: fonts.body,
    color: '#8B93A7',
    fontSize: 9,
    textAlign: 'center',
    marginTop: 3,
  },
  bank: {
    marginTop: 6,
    backgroundColor: '#FFC56E',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  bankText: { fontFamily: fonts.bodyBold, color: '#1A1208', fontSize: 10 },
});
