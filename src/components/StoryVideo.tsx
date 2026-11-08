import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { SpaceBackground } from '@/src/components/SpaceBackground';
import { colors, radii } from '@/src/theme/colors';
import { fonts, type } from '@/src/theme/typography';

type Props = {
  title: string;
  scenes: { heading: string; body: string }[];
  canSkip: boolean;
  onFinished: () => void;
  hintAboutHelp?: string;
};

export function StoryVideo({
  title,
  scenes,
  canSkip,
  onFinished,
  hintAboutHelp,
}: Props) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const scene = scenes[index];
  const isLast = index >= scenes.length - 1;
  const progress = (index + 1) / scenes.length;

  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => {
      if (!isLast) setIndex((i) => i + 1);
    }, 5200);
    return () => clearTimeout(t);
  }, [index, playing, isLast]);

  return (
    <SpaceBackground>
      <View style={styles.container}>
        <Text style={styles.kicker}>فيلم المهمة</Text>
        <Text style={styles.title}>{title}</Text>

        <View style={styles.track}>
          <View style={[styles.fill, { width: `${progress * 100}%` }]} />
        </View>

        <Animated.View
          key={index}
          entering={FadeIn.duration(400)}
          exiting={FadeOut.duration(200)}
          style={styles.stage}
        >
          <Text style={styles.sceneHeading}>{scene?.heading}</Text>
          <Text style={styles.sceneBody}>{scene?.body}</Text>
          <Text style={styles.progress}>
            مشهد {index + 1} من {scenes.length}
          </Text>
        </Animated.View>

        {hintAboutHelp ? (
          <Text style={styles.helpHint}>{hintAboutHelp}</Text>
        ) : null}

        <View style={styles.controls}>
          <PrimaryButton
            title={playing ? 'إيقاف مؤقت' : 'تشغيل'}
            variant="secondary"
            onPress={() => setPlaying((p) => !p)}
          />
          <PrimaryButton
            title={isLast ? 'لنبدأ المغامرة' : 'المشهد التالي'}
            onPress={() => {
              if (isLast) onFinished();
              else setIndex((i) => i + 1);
            }}
          />
          <PrimaryButton
            title="تخطي"
            variant="ghost"
            disabled={!canSkip}
            onPress={onFinished}
          />
        </View>
        {!canSkip ? (
          <Text style={styles.skipNote}>
            التخطي يُفعَّل بعد مشاهدة الفيديو للمرة الأولى
          </Text>
        ) : null}
      </View>
    </SpaceBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 56,
    gap: 12,
  },
  kicker: {
    ...type.caption,
    color: colors.copperBright,
    textAlign: 'center',
  },
  title: {
    ...type.title,
    color: colors.parchment,
    fontSize: 22,
  },
  track: {
    height: 4,
    backgroundColor: colors.inkSoft,
    borderRadius: 99,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.copper,
  },
  stage: {
    flex: 1,
    backgroundColor: colors.parchment,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.parchmentDeep,
    padding: 22,
    justifyContent: 'center',
    gap: 16,
  },
  sceneHeading: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.ink,
    textAlign: 'center',
  },
  sceneBody: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 28,
    color: colors.inkSoft,
    textAlign: 'center',
  },
  progress: {
    fontFamily: fonts.body,
    color: colors.copperDim,
    textAlign: 'center',
    marginTop: 8,
  },
  helpHint: {
    fontFamily: fonts.body,
    color: colors.copperBright,
    textAlign: 'center',
    fontSize: 13,
  },
  controls: { gap: 8 },
  skipNote: {
    ...type.caption,
    color: colors.steel,
    textAlign: 'center',
  },
});
