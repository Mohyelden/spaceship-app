import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ShipMark } from '@/src/components/ShipMark';
import { SpaceBackground } from '@/src/components/SpaceBackground';
import { StarField } from '@/src/components/StarField';
import { colors, radii } from '@/src/theme/colors';
import { fonts, type } from '@/src/theme/typography';

export type CinemaScene = {
  heading: string;
  body: string;
  visual:
    | 'shipAlarm'
    | 'levelMap'
    | 'helpDemo'
    | 'launch'
    | 'cabin'
    | 'rectangle'
    | 'engines';
};

type Props = {
  title: string;
  scenes: CinemaScene[];
  canSkip: boolean;
  onFinished: () => void;
  hintAboutHelp?: string;
};

function VisualShipAlarm() {
  const flash = useSharedValue(0);
  useEffect(() => {
    flash.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 350 }),
        withTiming(0.2, { duration: 350 })
      ),
      -1,
      false
    );
  }, [flash]);
  const alarm = useAnimatedStyle(() => ({
    opacity: interpolate(flash.value, [0, 1], [0.15, 0.55]),
  }));
  const shake = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(flash.value, [0, 1], [-3, 3]) }],
  }));

  return (
    <View style={styles.visualStage}>
      <Animated.View style={[styles.alarmWash, alarm]} />
      <Animated.View style={shake}>
        <ShipMark size={110} />
      </Animated.View>
      <View style={styles.engineRow}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={styles.engine}>
            <View style={styles.spark} />
          </View>
        ))}
      </View>
      <Text style={styles.visualCaption}>المحركات الأربعة · عطل مفاجئ</Text>
    </View>
  );
}

function VisualLevelMap() {
  const bob = useSharedValue(0);
  useEffect(() => {
    bob.value = withRepeat(withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [bob]);
  const a = useAnimatedStyle(() => ({ transform: [{ translateY: bob.value * -6 }] }));
  const b = useAnimatedStyle(() => ({ transform: [{ translateY: (1 - bob.value) * -6 }] }));

  return (
    <View style={styles.visualStage}>
      <View style={styles.pathLine} />
      <Animated.View style={[styles.planetMini, { left: 30, backgroundColor: '#C4843A' }, a]}>
        <Text style={styles.planetMiniText}>1</Text>
      </Animated.View>
      <Animated.View style={[styles.planetMini, { left: 118, top: 70, backgroundColor: '#5B8DEF' }, b]}>
        <Text style={styles.planetMiniText}>2</Text>
      </Animated.View>
      <View style={[styles.planetMini, { left: 210, top: 36, backgroundColor: '#3A4258' }]}>
        <Text style={styles.planetMiniText}>🔒</Text>
      </View>
      <Text style={styles.visualCaption}>3 محطات · افتحها بالترتيب</Text>
    </View>
  );
}

function VisualHelpDemo() {
  const pulse = useSharedValue(0.7);
  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 900 }), -1, true);
  }, [pulse]);
  const s = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  return (
    <View style={styles.visualStage}>
      <Animated.View style={[styles.helpOrb, s]}>
        <Text style={styles.helpOrbText}>مساعدة</Text>
      </Animated.View>
      <View style={styles.arrowDemo}>
        <Text style={styles.arrowText}>⟵ تلميح بصري</Text>
      </View>
      <Text style={styles.visualCaption}>بعد خطأين متتاليين يظهر التوجيه</Text>
    </View>
  );
}

function VisualLaunch() {
  const y = useSharedValue(40);
  useEffect(() => {
    y.value = withRepeat(
      withSequence(
        withTiming(-20, { duration: 1400, easing: Easing.out(Easing.cubic) }),
        withTiming(40, { duration: 0 })
      ),
      -1,
      false
    );
  }, [y]);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }, { scale: interpolate(y.value, [40, -20], [0.85, 1.1]) }],
  }));

  return (
    <View style={styles.visualStage}>
      <Animated.View style={style}>
        <ShipMark size={100} />
      </Animated.View>
      <Text style={styles.visualCaption}>جاهز للمغامرة؟</Text>
    </View>
  );
}

function VisualCabin() {
  const lit = useSharedValue(0);
  useEffect(() => {
    lit.value = withRepeat(withTiming(4, { duration: 3200 }), -1, false);
  }, [lit]);
  const labels = ['اقسم', 'اضرب', 'اطرح', 'نزل'];

  return (
    <View style={styles.visualStage}>
      <View style={styles.cabinGrid}>
        {labels.map((l, i) => (
          <CabinScreen key={l} label={l} index={i} lit={lit} />
        ))}
      </View>
      <Text style={styles.visualCaption}>كابينة القيادة · 4 شاشات</Text>
    </View>
  );
}

function CabinScreen({
  label,
  index,
  lit,
}: {
  label: string;
  index: number;
  lit: SharedValue<number>;
}) {
  const style = useAnimatedStyle(() => {
    const on = lit.value > index ? 1 : 0.25;
    return {
      opacity: on,
      borderColor: lit.value > index ? colors.success : colors.horizon,
      backgroundColor: lit.value > index ? '#1F4F32' : colors.inkSoft,
    };
  });
  return (
    <Animated.View style={[styles.cabinScreen, style]}>
      <Text style={styles.cabinLabel}>{label}</Text>
    </Animated.View>
  );
}

function VisualRectangle() {
  return (
    <View style={styles.visualStage}>
      <View style={styles.rectModel}>
        <Text style={styles.rectTagTop}>ناتج</Text>
        <View style={styles.rectRow}>
          <Text style={styles.rectTagSide}>÷</Text>
          <View style={styles.rectBox}>
            <Text style={styles.rectInside}>المقسوم</Text>
          </View>
        </View>
        <Text style={styles.rectTagBottom}>الباقي</Text>
      </View>
      <Text style={styles.visualCaption}>نموذج مساحة المستطيل</Text>
    </View>
  );
}

function VisualEngines() {
  const g = useSharedValue(0);
  useEffect(() => {
    g.value = withRepeat(withTiming(1, { duration: 700 }), -1, true);
  }, [g]);
  const flame = useAnimatedStyle(() => ({
    opacity: interpolate(g.value, [0, 1], [0.4, 1]),
    transform: [{ scaleY: interpolate(g.value, [0, 1], [0.7, 1.2]) }],
  }));

  return (
    <View style={styles.visualStage}>
      <ShipMark size={96} />
      <View style={styles.engineRow}>
        {[0, 1, 2, 3].map((i) => (
          <Animated.View key={i} style={[styles.flame, flame]} />
        ))}
      </View>
      <Text style={styles.visualCaption}>المحركات تعمل</Text>
    </View>
  );
}

function SceneVisual({ kind }: { kind: CinemaScene['visual'] }) {
  switch (kind) {
    case 'shipAlarm':
      return <VisualShipAlarm />;
    case 'levelMap':
      return <VisualLevelMap />;
    case 'helpDemo':
      return <VisualHelpDemo />;
    case 'launch':
      return <VisualLaunch />;
    case 'cabin':
      return <VisualCabin />;
    case 'rectangle':
      return <VisualRectangle />;
    case 'engines':
      return <VisualEngines />;
    default:
      return <VisualLaunch />;
  }
}

export function CinematicPlayer({
  title,
  scenes,
  canSkip,
  onFinished,
  hintAboutHelp,
}: Props) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(false);
  const scene = scenes[index];
  const isLast = index >= scenes.length - 1;

  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => {
      if (!isLast) setIndex((i) => i + 1);
    }, 5600);
    return () => clearTimeout(t);
  }, [index, playing, isLast]);

  const bars = useMemo(() => Array.from({ length: scenes.length }), [scenes.length]);

  return (
    <SpaceBackground>
      <StarField count={36} />
      <View style={styles.container}>
        <View style={styles.topBar}>
          <Text style={styles.kicker}>سينما المهمة</Text>
          <Text style={styles.title}>{title}</Text>
        </View>

        <View style={styles.filmFrame}>
          <View style={styles.filmHoleCol}>
            {Array.from({ length: 8 }).map((_, i) => (
              <View key={i} style={styles.filmHole} />
            ))}
          </View>

          <View style={styles.filmCenter}>
            <Animated.View
              key={`v-${index}`}
              entering={FadeIn.duration(450)}
              exiting={FadeOut.duration(200)}
              style={{ flex: 1 }}
            >
              <SceneVisual kind={scene.visual} />
            </Animated.View>

            <Animated.View
              key={`t-${index}`}
              entering={FadeIn.delay(120).duration(400)}
              style={styles.captionBox}
            >
              <Text style={styles.sceneHeading}>{scene.heading}</Text>
              <Text style={styles.sceneBody}>{scene.body}</Text>
            </Animated.View>
          </View>

          <View style={styles.filmHoleCol}>
            {Array.from({ length: 8 }).map((_, i) => (
              <View key={i} style={styles.filmHole} />
            ))}
          </View>
        </View>

        <View style={styles.progressRow}>
          {bars.map((_, i) => (
            <View
              key={i}
              style={[
                styles.seg,
                i <= index && styles.segOn,
                i === index && styles.segActive,
              ]}
            />
          ))}
        </View>

        {hintAboutHelp ? <Text style={styles.helpHint}>{hintAboutHelp}</Text> : null}

        <View style={styles.transport}>
          <Pressable style={styles.iconBtn} onPress={() => setPlaying((p) => !p)}>
            <Text style={styles.iconBtnText}>{playing ? '❚❚' : '▶'}</Text>
          </Pressable>
          <Pressable style={styles.iconBtn} onPress={() => setMuted((m) => !m)}>
            <Text style={styles.iconBtnText}>{muted ? '🔇' : '🔊'}</Text>
          </Pressable>
          <View style={styles.timeBox}>
            <Text style={styles.timeText}>
              {index + 1}/{scenes.length}
            </Text>
          </View>
          <View style={{ flex: 1 }} />
          <PrimaryButton
            title={isLast ? 'انطلق 🚀' : 'التالي'}
            onPress={() => {
              if (isLast) onFinished();
              else setIndex((i) => i + 1);
            }}
            style={{ minWidth: 120 }}
          />
        </View>

        <PrimaryButton
          title={canSkip ? 'تخطي الفيديو' : 'التخطي مقفل حتى أول مشاهدة'}
          variant="ghost"
          disabled={!canSkip}
          onPress={onFinished}
        />
      </View>
    </SpaceBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 48, gap: 10 },
  topBar: { alignItems: 'center', gap: 2 },
  kicker: { ...type.caption, color: colors.copperBright },
  title: { ...type.title, color: colors.parchment, fontSize: 22 },
  filmFrame: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#0A0E18',
    borderRadius: radii.lg,
    borderWidth: 2,
    borderColor: colors.copperDim,
    overflow: 'hidden',
    minHeight: 340,
  },
  filmHoleCol: {
    width: 18,
    backgroundColor: '#151A28',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: 6,
  },
  filmHole: {
    width: 10,
    height: 14,
    borderRadius: 3,
    backgroundColor: '#0A0E18',
    borderWidth: 1,
    borderColor: '#2A3348',
  },
  filmCenter: { flex: 1, padding: 12, gap: 8 },
  visualStage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  visualCaption: {
    fontFamily: fonts.bodyBold,
    color: colors.copperBright,
    fontSize: 12,
  },
  alarmWash: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.danger,
  },
  engineRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  engine: {
    width: 22,
    height: 28,
    borderRadius: 6,
    backgroundColor: colors.inkSoft,
    borderWidth: 1,
    borderColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 4,
  },
  spark: {
    width: 8,
    height: 10,
    borderRadius: 4,
    backgroundColor: colors.copperBright,
  },
  pathLine: {
    position: 'absolute',
    width: 200,
    height: 2,
    backgroundColor: colors.copper,
    opacity: 0.5,
    top: 90,
  },
  planetMini: {
    position: 'absolute',
    top: 50,
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.parchment,
  },
  planetMiniText: { color: colors.chalk, fontWeight: '800' },
  helpOrb: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: colors.warnSoft,
    borderWidth: 2,
    borderColor: colors.copper,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpOrbText: {
    fontFamily: fonts.bodyExtra,
    color: colors.copperDim,
    fontSize: 16,
  },
  arrowDemo: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.inkSoft,
    borderRadius: 8,
  },
  arrowText: { color: colors.parchment, fontFamily: fonts.bodyBold },
  cabinGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    width: 220,
  },
  cabinScreen: {
    width: 100,
    height: 64,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cabinLabel: {
    fontFamily: fonts.bodyBold,
    color: colors.parchment,
    fontSize: 14,
  },
  rectModel: { alignItems: 'center', gap: 6 },
  rectTagTop: { color: colors.copperBright, fontFamily: fonts.bodyBold },
  rectTagBottom: { color: colors.mist, fontFamily: fonts.bodyBold },
  rectTagSide: { color: colors.parchment, fontSize: 22, marginRight: 8 },
  rectRow: { flexDirection: 'row', alignItems: 'center' },
  rectBox: {
    width: 140,
    height: 80,
    borderWidth: 3,
    borderColor: colors.copper,
    borderRadius: 8,
    backgroundColor: colors.inkSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rectInside: { color: colors.parchment, fontFamily: fonts.bodyBold },
  flame: {
    width: 10,
    height: 18,
    backgroundColor: colors.copperBright,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  captionBox: {
    backgroundColor: 'rgba(243,230,208,0.95)',
    borderRadius: radii.md,
    padding: 12,
    gap: 6,
  },
  sceneHeading: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.ink,
    textAlign: 'center',
  },
  sceneBody: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 22,
    color: colors.inkSoft,
    textAlign: 'center',
  },
  progressRow: { flexDirection: 'row', gap: 6 },
  seg: {
    flex: 1,
    height: 4,
    borderRadius: 4,
    backgroundColor: colors.inkSoft,
  },
  segOn: { backgroundColor: colors.copperDim },
  segActive: { backgroundColor: colors.copperBright },
  helpHint: {
    fontFamily: fonts.body,
    color: colors.copperBright,
    textAlign: 'center',
    fontSize: 12,
  },
  transport: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.inkSoft,
    borderWidth: 1,
    borderColor: colors.horizon,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnText: { color: colors.parchment, fontSize: 14 },
  timeBox: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: colors.inkSoft,
  },
  timeText: {
    fontFamily: fonts.bodyBold,
    color: colors.mist,
    fontSize: 12,
  },
});
