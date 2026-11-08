import { useEvent, useEventListener } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { SafeScreen } from '@/src/components/SafeScreen';
import { SpaceBackground } from '@/src/components/SpaceBackground';
import { VIDEO_SOURCES, type VideoId } from '@/src/data/videos';
import { colors, radii } from '@/src/theme/colors';
import { fonts, type } from '@/src/theme/typography';

type Props = {
  videoId: VideoId;
  canSkip: boolean;
  onFinished: () => void;
  hintAboutHelp?: string;
};

export function MissionVideoPlayer({
  videoId,
  canSkip,
  onFinished,
  hintAboutHelp,
}: Props) {
  const meta = VIDEO_SOURCES[videoId];
  const [ended, setEnded] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);

  const player = useVideoPlayer(meta.uri, (p) => {
    p.loop = false;
    p.play();
  });

  const { isPlaying } = useEvent(player, 'playingChange', {
    isPlaying: player.playing,
  });

  useEventListener(player, 'playToEnd', () => {
    setEnded(true);
  });

  useEffect(() => {
    player.muted = muted;
  }, [muted, player]);

  useEffect(() => {
    const id = setInterval(() => {
      const duration = player.duration;
      if (duration > 0) {
        setProgress(player.currentTime / duration);
      }
    }, 400);
    return () => clearInterval(id);
  }, [player]);

  function togglePlay() {
    if (player.playing) player.pause();
    else player.play();
  }

  return (
    <SpaceBackground>
      <SafeScreen style={styles.safe}>
        <Text style={styles.kicker}>فيديو المهمة</Text>
        <Text style={styles.title}>{meta.title}</Text>

        <View style={styles.playerShell}>
          <VideoView
            style={styles.video}
            player={player}
            contentFit="contain"
            nativeControls={false}
          />

          {meta.isDemo ? (
            <View style={styles.demoBadge}>
              <Text style={styles.demoText}>
                فيديو تجريبي — ضع ملفكم في assets/videos/{videoId}.mp4
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.track}>
          <View
            style={[styles.fill, { width: `${Math.min(progress, 1) * 100}%` }]}
          />
        </View>

        {hintAboutHelp ? (
          <Text style={styles.helpHint}>{hintAboutHelp}</Text>
        ) : null}

        <View style={styles.row}>
          <Pressable style={styles.iconBtn} onPress={togglePlay}>
            <Text style={styles.iconTxt}>{isPlaying ? '❚❚' : '▶'}</Text>
          </Pressable>
          <Pressable style={styles.iconBtn} onPress={() => setMuted((m) => !m)}>
            <Text style={styles.iconTxt}>{muted ? '🔇' : '🔊'}</Text>
          </Pressable>
          <View style={{ flex: 1 }} />
          <PrimaryButton
            title={ended ? 'متابعة المهمة' : 'التالي بعد الفيديو'}
            onPress={onFinished}
            disabled={!ended && !canSkip}
            style={{ minWidth: 150 }}
          />
        </View>

        <PrimaryButton
          title={
            canSkip
              ? 'تخطي الفيديو'
              : 'التخطي مقفل — شاهد الفيديو أول مرة كاملًا'
          }
          variant="ghost"
          disabled={!canSkip}
          onPress={onFinished}
        />
      </SafeScreen>
    </SpaceBackground>
  );
}

const styles = StyleSheet.create({
  safe: { paddingHorizontal: 14, gap: 10 },
  kicker: { ...type.caption, color: colors.copperBright, textAlign: 'center' },
  title: {
    ...type.title,
    color: colors.parchment,
    fontSize: 20,
    marginBottom: 4,
  },
  playerShell: {
    flex: 1,
    minHeight: 240,
    borderRadius: radii.lg,
    overflow: 'hidden',
    backgroundColor: '#000',
    borderWidth: 2,
    borderColor: colors.copperDim,
  },
  video: { width: '100%', height: '100%', minHeight: 240 },
  demoBadge: {
    position: 'absolute',
    left: 8,
    right: 8,
    bottom: 8,
    backgroundColor: 'rgba(0,0,0,0.72)',
    borderRadius: 10,
    padding: 8,
  },
  demoText: {
    color: colors.copperBright,
    fontFamily: fonts.body,
    fontSize: 11,
    textAlign: 'center',
  },
  track: {
    height: 5,
    borderRadius: 99,
    backgroundColor: colors.inkSoft,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: colors.copperBright },
  helpHint: {
    fontFamily: fonts.body,
    color: colors.copperBright,
    textAlign: 'center',
    fontSize: 12,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: colors.inkSoft,
    borderWidth: 1,
    borderColor: colors.horizon,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconTxt: { color: colors.parchment, fontSize: 15 },
});
