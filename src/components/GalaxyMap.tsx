import { useEffect } from 'react';
import {
  ImageBackground,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
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

export function GalaxyMap({ levels }: { levels: PlanetLevel[] }) {
  const { width } = useWindowDimensions();
  const mapW = Math.min(width - 8, 440);
  const mapH = 560;
  const pulse = useSharedValue(0.45);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, [pulse]);

  const nodes = [
    { x: mapW * 0.28, y: mapH * 0.16 },
    { x: mapW * 0.72, y: mapH * 0.42 },
    { x: mapW * 0.34, y: mapH * 0.72 },
  ];

  const pathD = `M ${nodes[0].x} ${nodes[0].y} C ${mapW * 0.58} ${mapH * 0.1}, ${mapW * 0.9} ${mapH * 0.26}, ${nodes[1].x} ${nodes[1].y} S ${mapW * 0.12} ${mapH * 0.6}, ${nodes[2].x} ${nodes[2].y}`;

  const trailStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));

  return (
    <Animated.View entering={FadeIn.duration(800)} style={[styles.wrap, { width: mapW }]}>
      <ImageBackground
        source={require('../../assets/images/galaxy-pixel.png')}
        style={{ width: mapW, height: mapH, borderRadius: 28, overflow: 'hidden' }}
        imageStyle={{ borderRadius: 28 }}
        resizeMode="cover"
      >
        <View style={styles.dim} pointerEvents="none" />

        <Animated.View style={[StyleSheet.absoluteFill, trailStyle]} pointerEvents="none">
          <Svg width={mapW} height={mapH}>
            <Path
              d={pathD}
              stroke="rgba(255,220,140,0.3)"
              strokeWidth={12}
              fill="none"
              strokeLinecap="round"
            />
            <Path
              d={pathD}
              stroke="#FFE08A"
              strokeWidth={3}
              fill="none"
              strokeDasharray="10 14"
              strokeLinecap="round"
            />
          </Svg>
        </Animated.View>

        {levels.map((level, i) => {
          const n = nodes[i];
          return (
            <View
              key={level.id}
              style={[
                styles.node,
                {
                  left: n.x - 78,
                  top: n.y - 70,
                },
              ]}
            >
              <RichPlanet
                skin={level.skin}
                size={i === 1 ? 118 : 104}
                open={level.open}
                done={level.done}
                label={level.title}
                subtitle={level.subtitle}
                delay={i * 180}
                onPress={level.onPress}
                onBank={level.onBank}
              />
            </View>
          );
        })}

        <View style={styles.banner}>
          <Text style={styles.bannerText}>مسار المجرّة · اضغط الكوكب المفتوح</Text>
        </View>
      </ImageBackground>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignSelf: 'center' },
  dim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(4,8,18,0.08)',
  },
  node: {
    position: 'absolute',
    width: 156,
    alignItems: 'center',
    zIndex: 4,
  },
  banner: {
    position: 'absolute',
    bottom: 14,
    alignSelf: 'center',
    left: 20,
    right: 20,
    backgroundColor: 'rgba(8,12,22,0.72)',
    borderRadius: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,200,120,0.3)',
  },
  bannerText: {
    fontFamily: fonts.bodyBold,
    color: '#FFE6B8',
    textAlign: 'center',
    fontSize: 12,
  },
});
