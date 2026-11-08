import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { GalaxyMap } from '@/src/components/GalaxyMap';
import { PrimaryButton } from '@/src/components/PrimaryButton';
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

  return (
    <SpaceBackground>
      <SafeScreen bottomExtra={12}>
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInDown.duration(450)} style={styles.header}>
            <Text style={styles.kicker}>مجرّة سفينة الفضاء</Text>
            <Text style={styles.title}>اختر كوكب المهمة</Text>
            <Text style={styles.pilot}>القائد · {studentCode || '—'}</Text>
            <View style={styles.progressBox}>
              <ProgressBar fraction={progressFraction()} stars={stars} />
              <Text style={styles.xp}>{xp} XP</Text>
            </View>
          </Animated.View>

          <GalaxyMap
            levels={[
              {
                id: 'prep',
                title: 'كوكب المستطيل',
                subtitle: 'المستوى التمهيدي',
                skin: 'ember',
                open: unlocked.prep,
                done: completed.prep,
                onPress: () => router.push('/prep/video'),
                onBank: () => router.push('/bank/prep'),
              },
              {
                id: 'level1',
                title: 'كوكب الرقم الواحد',
                subtitle: 'قسمة مطولة',
                skin: 'ocean',
                open: unlocked.level1,
                done: completed.level1,
                onPress: () => router.push('/level1/video'),
                onBank: () => router.push('/bank/level1'),
              },
              {
                id: 'level2',
                title: 'كوكب الرقمين',
                subtitle: 'التحدي الأخير',
                skin: 'ringed',
                open: unlocked.level2,
                done: completed.level2,
                onPress: () => router.push('/level2/video'),
                onBank: () => router.push('/bank/level2'),
              },
            ]}
          />

          <View style={styles.footer}>
            {completed.level2 ? (
              <PrimaryButton
                title="تدشين السفينة"
                variant="success"
                onPress={() => router.push('/finale')}
              />
            ) : (
              <Text style={styles.hint}>
                افتح الكواكب بالترتيب بعد فيديو كل مستوى
              </Text>
            )}
            <PrimaryButton
              title="إعادة فيديو القصة"
              variant="ghost"
              onPress={() => router.push('/intro-video')}
            />
            <PrimaryButton
              title="تغيير كود الطالب"
              variant="secondary"
              onPress={() => router.push('/login')}
            />
          </View>
        </ScrollView>
      </SafeScreen>
    </SpaceBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 16,
    gap: 10,
  },
  header: { alignItems: 'center', gap: 6, paddingHorizontal: 14 },
  kicker: { ...type.caption, color: colors.copperBright },
  title: { ...type.title, color: colors.parchment, fontSize: 24 },
  pilot: { ...type.subtitle, color: colors.mist },
  progressBox: { width: '100%', marginTop: 4, gap: 4, paddingHorizontal: 4 },
  xp: {
    fontFamily: fonts.bodyBold,
    color: colors.copperBright,
    textAlign: 'center',
    fontSize: 12,
  },
  footer: { paddingHorizontal: 14, gap: 10, marginTop: 4 },
  hint: {
    fontFamily: fonts.body,
    color: colors.mist,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 20,
  },
});
