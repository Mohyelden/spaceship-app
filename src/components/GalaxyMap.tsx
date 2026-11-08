import { useEffect } from 'react';
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
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

/** Vertical responsive path — no absolute overlap on phones */
export function GalaxyMap({ levels }: { levels: PlanetLevel[] }) {
  const { width } = useWindowDimensions();
  const mapW = Math.min(width - 24, 420);
  const pulse = useSharedValue(0.5);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, [pulse]);

  const lineStyle = useAnimatedStyle(() => ({ opacity: 0.35 + pulse.value * 0.5 }));

  return (
    <View style={[styles.wrap, { width: mapW }]}>
      <ImageBackground
        source={require('../../assets/images/galaxy-pixel.png')}
        style={styles.bg}
        imageStyle={styles.bgImage}
        resizeMode="cover"
      >
        <View style={styles.inner}>
          {levels.map((level, i) => {
            const align = i % 2 === 0 ? 'flex-start' : 'flex-end';
            return (
              <View key={level.id} style={styles.step}>
                {i > 0 ? (
                  <Animated.View style={[styles.connector, lineStyle]}>
                    <View style={styles.dash} />
                    <Text style={styles.arrow}>↓</Text>
                    <View style={styles.dash} />
                  </Animated.View>
                ) : null}

                <Animated.View
                  entering={FadeInDown.delay(i * 160).duration(500)}
                  style={[styles.row, { justifyContent: align }]}
                >
                  <View style={styles.planetBlock}>
                    <RichPlanet
                      skin={level.skin}
                      size={Math.min(96, mapW * 0.28)}
                      open={level.open}
                      done={level.done}
                      label={level.title}
                      subtitle={level.subtitle}
                      delay={i * 120}
                      onPress={level.onPress}
                      onBank={level.onBank}
                    />
                    {level.open ? (
                      <Pressable
                        onPress={level.onPress}
                        style={[
                          styles.enterBtn,
                          level.done ? styles.enterDone : null,
                        ]}
                      >
                        <Text style={styles.enterText}>
                          {level.done ? 'دخول المستوى' : 'ابدأ المستوى'}
                        </Text>
                      </Pressable>
                    ) : null}
                  </View>
                </Animated.View>
              </View>
            );
          })}
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignSelf: 'center' },
  bg: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,200,120,0.28)',
  },
  bgImage: { borderRadius: 24 },
  inner: {
    paddingVertical: 18,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(6,10,20,0.22)',
    gap: 4,
  },
  step: { width: '100%' },
  connector: {
    alignItems: 'center',
    paddingVertical: 4,
    gap: 2,
  },
  dash: {
    width: 3,
    height: 10,
    borderRadius: 2,
    backgroundColor: '#FFE08A',
  },
  arrow: {
    color: '#FFE08A',
    fontSize: 14,
    fontFamily: fonts.bodyBold,
  },
  row: {
    width: '100%',
    flexDirection: 'row',
  },
  planetBlock: {
    alignItems: 'center',
    maxWidth: '78%',
  },
  enterBtn: {
    marginTop: 8,
    backgroundColor: '#FFC56E',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  enterDone: { backgroundColor: '#3DDC97' },
  enterText: {
    fontFamily: fonts.bodyBold,
    color: '#1A1208',
    fontSize: 13,
  },
});
