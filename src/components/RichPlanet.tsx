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
  onPress,
  onBank,
}: Props) {
  const float = useSharedValue(0);
  const spin = useSharedValue(0);
  const palette = SKINS[skin];
  const id = `p-${skin}-${size}`;

  useEffect(() => {
    float.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, { duration: 2600 + delay, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      )
    );
    spin.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration: 12000, easing: Easing.linear }), -1, false)
    );
  }, [delay, float, spin]);

  const wrapStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: float.value * -10 }],
  }));

  const r = size / 2;

  return (
    <Animated.View style={[styles.wrap, wrapStyle, { width: size + 36 }]}>
      <Pressable disabled={!open} onPress={onPress} style={{ alignItems: 'center' }}>
        <View style={{ width: size + 24, height: size + 24, alignItems: 'center', justifyContent: 'center' }}>
          {/* glow */}
          <View
            style={[
              styles.glow,
              {
                width: size * 1.35,
                height: size * 1.35,
                borderRadius: size,
                backgroundColor: open ? `${palette.c1}55` : '#ffffff18',
              },
            ]}
          />
          <Svg width={size + 24} height={size + 24}>
            <Defs>
              <RadialGradient id={`${id}-body`} cx="35%" cy="30%" r="70%">
                <Stop offset="0%" stopColor={open ? palette.c0 : '#6B7280'} />
                <Stop offset="55%" stopColor={open ? palette.c1 : '#4B5563'} />
                <Stop offset="100%" stopColor={open ? palette.c2 : '#1F2937'} />
              </RadialGradient>
              <LinearGradient id={`${id}-band`} x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor={palette.band || palette.c0} stopOpacity="0.55" />
                <Stop offset="100%" stopColor={palette.c2} stopOpacity="0.15" />
              </LinearGradient>
            </Defs>

            {palette.ring ? (
              <G
                transform={`rotate(-22 ${(size + 24) / 2} ${(size + 24) / 2})`}
              >
                <Ellipse
                  cx={(size + 24) / 2}
                  cy={(size + 24) / 2 + 6}
                  rx={r * 1.25}
                  ry={r * 0.28}
                  stroke={open ? palette.ring : '#6B7280'}
                  strokeWidth={5}
                  fill="none"
                  opacity={0.95}
                />
              </G>
            ) : null}

            <Circle
              cx={(size + 24) / 2}
              cy={(size + 24) / 2}
              r={r}
              fill={`url(#${id}-body)`}
            />

            {/* atmosphere bands */}
            <Ellipse
              cx={(size + 24) / 2}
              cy={(size + 24) / 2 - r * 0.15}
              rx={r * 0.82}
              ry={r * 0.18}
              fill={`url(#${id}-band)`}
            />
            <Ellipse
              cx={(size + 24) / 2}
              cy={(size + 24) / 2 + r * 0.22}
              rx={r * 0.78}
              ry={r * 0.14}
              fill={open ? palette.c2 : '#111'}
              opacity={0.28}
            />

            {/* craters / spots */}
            <Circle
              cx={(size + 24) / 2 - r * 0.28}
              cy={(size + 24) / 2 + r * 0.1}
              r={r * 0.12}
              fill="#000"
              opacity={0.18}
            />
            <Circle
              cx={(size + 24) / 2 + r * 0.22}
              cy={(size + 24) / 2 - r * 0.25}
              r={r * 0.08}
              fill="#fff"
              opacity={0.22}
            />

            {/* shine */}
            <Ellipse
              cx={(size + 24) / 2 - r * 0.28}
              cy={(size + 24) / 2 - r * 0.32}
              rx={r * 0.28}
              ry={r * 0.16}
              fill="#fff"
              opacity={0.28}
            />

            {palette.ring ? (
              <G
                transform={`rotate(-22 ${(size + 24) / 2} ${(size + 24) / 2})`}
              >
                <Ellipse
                  cx={(size + 24) / 2}
                  cy={(size + 24) / 2 + 6}
                  rx={r * 1.25}
                  ry={r * 0.28}
                  stroke={open ? palette.ring : '#6B7280'}
                  strokeWidth={3}
                  fill="none"
                  opacity={0.55}
                  strokeDasharray="2 6"
                />
              </G>
            ) : null}
          </Svg>

          {!open ? (
            <View style={styles.lockBadge}>
              <Text style={styles.lockText}>مقفل</Text>
            </View>
          ) : done ? (
            <View style={[styles.lockBadge, styles.doneBadge]}>
              <Text style={styles.doneText}>★ تم</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.sub}>{subtitle}</Text>
          {open ? (
            <Text style={styles.cta}>{done ? 'ادخل مجددًا' : 'اضغط للدخول'}</Text>
          ) : (
            <Text style={styles.ctaMuted}>أكمل السابق أولًا</Text>
          )}
        </View>
      </Pressable>

      {done && onBank ? (
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
    bottom: 10,
    backgroundColor: 'rgba(15,18,28,0.85)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#6B7280',
  },
  lockText: { color: '#D1D5DB', fontFamily: fonts.bodyBold, fontSize: 11 },
  doneBadge: { borderColor: '#F5C451', backgroundColor: 'rgba(80,50,10,0.9)' },
  doneText: { color: '#F5C451', fontFamily: fonts.bodyBold, fontSize: 11 },
  card: {
    marginTop: 4,
    backgroundColor: 'rgba(10,14,26,0.82)',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,200,120,0.28)',
    minWidth: 124,
  },
  label: {
    fontFamily: fonts.bodyExtra,
    color: '#FFF4DF',
    fontSize: 13,
    textAlign: 'center',
  },
  sub: {
    fontFamily: fonts.body,
    color: '#B7C0D6',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
  },
  cta: {
    fontFamily: fonts.bodyBold,
    color: '#FFC56E',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 5,
  },
  ctaMuted: {
    fontFamily: fonts.body,
    color: '#8B93A7',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 5,
  },
  bank: {
    marginTop: 8,
    backgroundColor: '#FFC56E',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  bankText: { fontFamily: fonts.bodyBold, color: '#1A1208', fontSize: 11 },
});
