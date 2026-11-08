import { useEvent, useEventListener } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { VIDEO_SOURCES } from '@/src/data/videos';
import type { VideoId } from '@/src/storage/progress';
import { colors, radii } from '@/src/theme/colors';
import { fonts } from '@/src/theme/typography';
import { Button, IconButton } from './ui/Button';
import { Screen } from './ui/Screen';
import { TopBar } from './ui/TopBar';

type Props = {
  videoId: VideoId;
  /** Skip is locked the first time (document rule), unlocked afterwards */
  canSkip: boolean;
  onFinished: () => void;
  onBack?: () => void;
  /** Short tip shown over the last seconds of the video (help button reminder) */
  endTip?: string;
};

export function VideoScreen({ videoId, canSkip, onFinished, onBack, endTip }: Props) {
  const meta = VIDEO_SOURCES[videoId];
  const [progress, setProgress] = useState(0);
  const [needsTap, setNeedsTap] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const finishedRef = useRef(false);

  const player = useVideoPlayer(meta.source, (p) => {
    p.loop = false;
    p.timeUpdateEventInterval = 0.25;
    try {
      p.play();
    } catch {
      // autoplay blocked (web) – handled below
    }
  });

  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });
  const { status } = useEvent(player, 'statusChange', { status: player.status });
  const { muted } = useEvent(player, 'mutedChange', { muted: player.muted });
  const failed = status === 'error';

  const finish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    try {
      player.pause();
    } catch {
      // ignore
    }
    onFinished();
  };

  useEventListener(player, 'playToEnd', () => {
    setProgress(1);
    finish();
  });

  useEventListener(player, 'timeUpdate', ({ currentTime }) => {
    const d = player.duration;
    if (d > 0) {
      setProgress(currentTime / d);
      if (endTip) setShowTip(d - currentTime < 7);
    }
  });

  // Browsers block autoplay with sound until the user taps: show a big play button.
  useEffect(() => {
    if (isPlaying) return;
    const t = setTimeout(() => {
      if (!player.playing && !finishedRef.current) setNeedsTap(true);
    }, 1500);
    return () => clearTimeout(t);
  }, [isPlaying, player]);

  const toggleMute = () => {
    // expo-video exposes mute as a settable property (documented API)
    // eslint-disable-next-line react-hooks/immutability
    player.muted = !player.muted;
  };

  const toggle = () => {
    if (player.playing) player.pause();
    else player.play();
  };

  const loading = status === 'loading' || status === 'idle';

  return (
    <Screen
      header={<TopBar title={meta.title} subtitle="فيديو المهمة" onBack={onBack} />}
      footer={
        <View style={styles.footer}>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${Math.min(progress, 1) * 100}%` }]} />
          </View>
          <View style={styles.controls}>
            <IconButton icon={isPlaying ? '❚❚' : '▶'} label={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'} onPress={toggle} />
            <IconButton icon={muted ? '🔇' : '🔊'} label={muted ? 'تشغيل الصوت' : 'كتم الصوت'} onPress={toggleMute} />
            <View style={{ flex: 1 }}>
              {canSkip || failed ? (
                <Button title="تخطي" icon="⏭" variant="secondary" size="md" onPress={finish} />
              ) : (
                <View style={styles.locked} accessibilityLabel="التخطي غير متاح في المشاهدة الأولى">
                  <Text style={styles.lockedText}>🔒 التخطي متاح بعد المشاهدة الأولى</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      }
    >
      <View style={styles.player}>
        <VideoView style={styles.video} player={player} contentFit="contain" nativeControls={false} />

        {loading && !failed ? (
          <View style={styles.overlay}>
            <ActivityIndicator size="large" color={colors.sun} />
            <Text style={styles.overlayText}>جاري تحميل الفيديو…</Text>
          </View>
        ) : null}

        {needsTap && !isPlaying && !failed && !loading ? (
          <Pressable style={styles.overlay} onPress={() => player.play()} accessibilityLabel="تشغيل الفيديو">
            <View style={styles.bigPlay}>
              <Text style={styles.bigPlayIcon}>▶</Text>
            </View>
            <Text style={styles.overlayText}>اضغط لتشغيل الفيديو</Text>
          </Pressable>
        ) : null}

        {failed ? (
          <View style={styles.overlay}>
            <Text style={styles.overlayText}>تعذّر تشغيل الفيديو على هذا الجهاز</Text>
            <Button title="متابعة المهمة" icon="🚀" onPress={finish} style={{ minWidth: 220 }} />
          </View>
        ) : null}

        {showTip && endTip ? (
          <View style={styles.tip}>
            <Text style={styles.tipText}>{endTip}</Text>
          </View>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  player: {
    flex: 1,
    minHeight: 240,
    borderRadius: radii.lg,
    overflow: 'hidden',
    backgroundColor: '#000',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  video: { width: '100%', height: '100%' },
  overlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    backgroundColor: 'rgba(10,7,35,0.6)',
    padding: 16,
  },
  overlayText: { fontFamily: fonts.bold, color: colors.white, fontSize: 16, textAlign: 'center' },
  bigPlay: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.sun,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 5,
    borderColor: '#FFF1B8',
  },
  bigPlayIcon: { fontSize: 40, color: colors.ink, marginLeft: 6 },
  tip: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    backgroundColor: colors.sun,
    borderRadius: radii.md,
    padding: 12,
  },
  tipText: { fontFamily: fonts.black, color: colors.ink, fontSize: 15, textAlign: 'center', lineHeight: 24 },
  footer: { gap: 10 },
  track: { height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.15)', overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.sun },
  controls: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10 },
  locked: {
    minHeight: 50,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.glassLine,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  lockedText: { fontFamily: fonts.bold, color: colors.onDarkSoft, fontSize: 13, textAlign: 'center' },
});
