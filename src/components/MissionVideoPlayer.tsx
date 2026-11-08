import { ResizeMode, Video, AVPlaybackStatus } from 'expo-av';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
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
  const ref = useRef<Video>(null);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(false);
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ended, setEnded] = useState(false);

  useEffect(() => {
    return () => {
      ref.current?.unloadAsync();
    };
  }, []);

  async function togglePlay() {
    if (!ref.current) return;
    if (playing) {
      await ref.current.pauseAsync();
      setPlaying(false);
    } else {
      await ref.current.playAsync();
      setPlaying(true);
    }
  }

  function onStatus(status: AVPlaybackStatus) {
    if (!status.isLoaded) return;
    setReady(true);
    if (status.durationMillis) {
      setProgress(status.positionMillis / status.durationMillis);
    }
    if (status.didJustFinish) {
      setEnded(true);
      setPlaying(false);
    }
  }

  return (
    <SpaceBackground>
      <SafeScreen style={styles.safe}>
        <Text style={styles.kicker}>فيديو المهمة</Text>
        <Text style={styles.title}>{meta.title}</Text>

        <View style={styles.playerShell}>
          {!ready ? (
            <View style={styles.loading}>
              <ActivityIndicator color={colors.copperBright} size="large" />
              <Text style={styles.loadingText}>تحميل الفيديو…</Text>
            </View>
          ) : null}

          <Video
            ref={ref}
            style={styles.video}
            source={{ uri: meta.uri }}
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay
            isLooping={false}
            isMuted={muted}
            useNativeControls={false}
            onPlaybackStatusUpdate={onStatus}
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
          <View style={[styles.fill, { width: `${Math.min(progress, 1) * 100}%` }]} />
        </View>

        {hintAboutHelp ? (
          <Text style={styles.helpHint}>{hintAboutHelp}</Text>
        ) : null}

        <View style={styles.row}>
          <Pressable style={styles.iconBtn} onPress={togglePlay}>
            <Text style={styles.iconTxt}>{playing ? '❚❚' : '▶'}</Text>
          </Pressable>
          <Pressable
            style={styles.iconBtn}
            onPress={() => setMuted((m) => !m)}
          >
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
  loading: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    backgroundColor: '#000',
  },
  loadingText: {
    color: colors.mist,
    fontFamily: fonts.body,
    marginTop: 10,
  },
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
