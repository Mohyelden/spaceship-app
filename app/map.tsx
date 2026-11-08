import { useRouter } from 'expo-router';
import { useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { GalaxyMap } from '@/src/components/GalaxyMap';
import { ProgressBar } from '@/src/components/ProgressBar';
import { SafeScreen } from '@/src/components/SafeScreen';
import { SpaceBackground } from '@/src/components/SpaceBackground';
import { useRequireSplash } from '@/src/components/SplashGate';
import { useGameStore } from '@/src/store/gameStore';
import { colors } from '@/src/theme/colors';
import { fonts, type } from '@/src/theme/typography';

export default function MapScreen() {
  useRequireSplash();
  const router = useRouter();
  const unlocked = useGameStore((s) => s.unlocked);
  const completed = useGameStore((s) => s.completed);
  const stars = useGameStore((s) => s.stars);
  const xp = useGameStore((s) => s.xp);
  const studentCode = useGameStore((s) => s.studentCode);
  const progressFraction = useGameStore((s) => s.progressFraction);
  const [mapSize, setMapSize] = useState({ w: 0, h: 0 });

  function onMapLayout(e: LayoutChangeEvent) {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) {
      setMapSize({ w: width, h: height });
    }
  }

  return (
    <SpaceBackground>
      <SafeScreen bottomExtra={6} style={styles.safe}>
        <Animated.View entering={FadeIn.duration(350)} style={styles.header}>
          <Text style={styles.kicker}>خريطة المستويات</Text>
          <Text style={styles.title}>مسار إصلاح المحركات</Text>
          <Text style={styles.pilot}>القائد · {studentCode || '—'}</Text>
          <ProgressBar fraction={progressFraction()} stars={stars} />
          <Text style={styles.xp}>{xp} XP · 🔒 = مقفل · ★ = مكتمل</Text>
        </Animated.View>

        <View style={styles.mapSlot} onLayout={onMapLayout}>
          {mapSize.w > 0 && mapSize.h > 0 ? (
            <GalaxyMap
              width={mapSize.w}
              height={mapSize.h}
              levels={[
                {
                  id: 'prep',
                  title: 'التمهيدي',
                  subtitle: 'نموذج المستطيل',
                  skin: 'ember',
                  open: unlocked.prep,
                  done: completed.prep,
                  onPress: () => router.push('/prep/video'),
                  onBank: () => router.push('/bank/prep'),
                },
                {
                  id: 'level1',
                  title: 'المستوى 1',
                  subtitle: 'قسمة رقم واحد',
                  skin: 'ocean',
                  open: unlocked.level1,
                  done: completed.level1,
                  onPress: () => router.push('/level1/video'),
                  onBank: () => router.push('/bank/level1'),
                },
                {
                  id: 'level2',
                  title: 'المستوى 2',
                  subtitle: 'قسمة رقمين',
                  skin: 'ringed',
                  open: unlocked.level2,
                  done: completed.level2,
                  onPress: () => router.push('/level2/video'),
                  onBank: () => router.push('/bank/level2'),
                },
              ]}
            />
          ) : null}
        </View>

        <View style={styles.footer}>
          {completed.level2 ? (
            <Pressable style={styles.finaleBtn} onPress={() => router.push('/finale')}>
              <Text style={styles.finaleText}>تدشين السفينة</Text>
            </Pressable>
          ) : null}
          <View style={styles.footerRow}>
            <Pressable
              style={styles.ghostBtn}
              onPress={() => router.push('/intro-video')}
            >
              <Text style={styles.ghostText}>فيديو القصة</Text>
            </Pressable>
            <Pressable style={styles.ghostBtn} onPress={() => router.push('/login')}>
              <Text style={styles.ghostText}>تغيير الكود</Text>
            </Pressable>
          </View>
        </View>
      </SafeScreen>
    </SpaceBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 14,
    paddingBottom: 6,
  },
  kicker: { ...type.caption, color: colors.copperBright, fontSize: 11 },
  title: {
    fontFamily: fonts.bodyExtra,
    color: colors.parchment,
    fontSize: 20,
    textAlign: 'center',
  },
  pilot: {
    fontFamily: fonts.body,
    color: colors.mist,
    fontSize: 12,
    marginBottom: 2,
  },
  xp: {
    fontFamily: fonts.body,
    color: colors.copperBright,
    fontSize: 10,
    marginTop: 2,
  },
  mapSlot: {
    flex: 1,
    marginHorizontal: 10,
    minHeight: 260,
  },
  footer: {
    paddingHorizontal: 12,
    paddingTop: 8,
    gap: 6,
  },
  footerRow: { flexDirection: 'row', gap: 8 },
  ghostBtn: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.horizon,
    backgroundColor: colors.inkSoft,
    paddingVertical: 10,
    alignItems: 'center',
  },
  ghostText: {
    fontFamily: fonts.bodyBold,
    color: colors.parchment,
    fontSize: 12,
  },
  finaleBtn: {
    backgroundColor: colors.success,
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
  },
  finaleText: {
    fontFamily: fonts.bodyBold,
    color: colors.chalk,
    fontSize: 14,
  },
});
