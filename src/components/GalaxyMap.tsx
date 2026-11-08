import { useEffect } from 'react';
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { RichPlanet, type PlanetSkin } from '@/src/components/RichPlanet';
import { fonts } from '@/src/theme/typography';

export type PlanetLevel = {
  id: string;
  title: string;
  subtitle: string;
  open: boolean;
  done: boolean;
  skin: PlanetSkin;
  onPress: () => void;
  onBank?: () => void;
};

type Props = {
  levels: PlanetLevel[];
  width: number;
  height: number;
};

/** Single-screen galaxy path — 3 planets connected, no scroll */
export function GalaxyMap({ levels, width, height }: Props) {
  const pulse = useSharedValue(0.5);
  const mapW = width;
  const mapH = Math.max(height, 280);
  const planetSize = Math.min(78, mapW * 0.22, mapH * 0.18);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, [pulse]);

  // Zigzag nodes — all visible inside one frame
  const nodes = [
    { x: mapW * 0.28, y: mapH * 0.18 },
    { x: mapW * 0.72, y: mapH * 0.48 },
    { x: mapW * 0.30, y: mapH * 0.78 },
  ];

  const pathD = `M ${nodes[0].x} ${nodes[0].y}
    C ${mapW * 0.55} ${mapH * 0.18}, ${mapW * 0.88} ${mapH * 0.32}, ${nodes[1].x} ${nodes[1].y}
    S ${mapW * 0.12} ${mapH * 0.65}, ${nodes[2].x} ${nodes[2].y}`;

  const trailStyle = useAnimatedStyle(() => ({
    opacity: 0.4 + pulse.value * 0.55,
  }));

  return (
    <Animated.View entering={FadeIn.duration(500)} style={{ width: mapW, height: mapH }}>
      <ImageBackground
        source={require('../../assets/images/galaxy-pixel.png')}
        style={styles.bg}
        imageStyle={styles.bgImage}
        resizeMode="cover"
      >
        <View style={styles.dim} pointerEvents="none" />

        <Animated.View style={[StyleSheet.absoluteFill, trailStyle]} pointerEvents="none">
          <Svg width={mapW} height={mapH}>
            <Defs>
              <LinearGradient id="trailGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#FFE08A" stopOpacity="0.95" />
                <Stop offset="1" stopColor="#5B8DEF" stopOpacity="0.85" />
              </LinearGradient>
            </Defs>
            <Path
              d={pathD}
              stroke="rgba(255,220,140,0.22)"
              strokeWidth={14}
              fill="none"
              strokeLinecap="round"
            />
            <Path
              d={pathD}
              stroke="url(#trailGrad)"
              strokeWidth={3.5}
              fill="none"
              strokeDasharray="8 12"
              strokeLinecap="round"
            />
            {nodes.map((n, i) => (
              <Circle
                key={i}
                cx={n.x}
                cy={n.y}
                r={planetSize * 0.72}
                fill="none"
                stroke={levels[i]?.open ? '#FFE08A' : '#6B7280'}
                strokeOpacity={0.35}
                strokeWidth={2}
              />
            ))}
          </Svg>
        </Animated.View>

        {levels.map((level, i) => {
          const n = nodes[i];
          const cardW = Math.min(132, mapW * 0.38);
          return (
            <View
              key={level.id}
              style={[
                styles.node,
                {
                  left: Math.max(4, Math.min(n.x - cardW / 2, mapW - cardW - 4)),
                  top: Math.max(2, n.y - planetSize * 0.55),
                  width: cardW,
                },
              ]}
            >
              <Pressable
                disabled={!level.open}
                onPress={level.onPress}
                style={styles.press}
              >
                <RichPlanet
                  skin={level.skin}
                  size={planetSize}
                  open={level.open}
                  done={level.done}
                  label={level.title}
                  subtitle={level.subtitle}
                  delay={i * 100}
                  compact
                  onPress={level.onPress}
                />
              </Pressable>
              {level.done && level.onBank ? (
                <Pressable onPress={level.onBank} style={styles.bankChip}>
                  <Text style={styles.bankText}>بنك</Text>
                </Pressable>
              ) : null}
            </View>
          );
        })}
      </ImageBackground>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,200,120,0.3)',
  },
  bgImage: { borderRadius: 22 },
  dim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(4,8,18,0.15)',
  },
  node: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 5,
  },
  press: { alignItems: 'center' },
  bankChip: {
    marginTop: 4,
    backgroundColor: '#FFC56E',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  bankText: {
    fontFamily: fonts.bodyBold,
    color: '#1A1208',
    fontSize: 10,
  },
});
