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
      <SafeScreen bottomExtra={16}>
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          bounces
        >
          <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
            <Text style={styles.kicker}>خريطة المستويات · حسب الوثيقة</Text>
            <Text style={styles.title}>اختر المستوى</Text>
            <Text style={styles.pilot}>القائد · {studentCode || '—'}</Text>
            <ProgressBar fraction={progressFraction()} stars={stars} />
            <Text style={styles.xp}>{xp} XP</Text>
          </Animated.View>

          <GalaxyMap
            levels={[
              {
                id: 'prep',
                title: 'المستوى التمهيدي',
                subtitle: 'نموذج مساحة المستطيل',
                skin: 'ember',
                open: unlocked.prep,
                done: completed.prep,
                onPress: () => router.push('/prep/video'),
                onBank: () => router.push('/bank/prep'),
              },
              {
                id: 'level1',
                title: 'المستوى الأول',
                subtitle: 'القسمة المطولة على رقم واحد',
                skin: 'ocean',
                open: unlocked.level1,
                done: completed.level1,
                onPress: () => router.push('/level1/video'),
                onBank: () => router.push('/bank/level1'),
              },
              {
                id: 'level2',
                title: 'المستوى الثاني',
                subtitle: 'القسمة المطولة على رقمين',
                skin: 'ringed',
                open: unlocked.level2,
                done: completed.level2,
                onPress: () => router.push('/level2/video'),
                onBank: () => router.push('/bank/level2'),
              },
            ]}
          />

          <View style={styles.footer}>
            <Text style={styles.hint}>
              القفل التالي يُفتح بعد إتمام المستوى الحالي والحصول على النجوم
            </Text>
            {completed.level2 ? (
              <PrimaryButton
                title="تدشين السفينة"
                variant="success"
                onPress={() => router.push('/finale')}
              />
            ) : null}
            <View style={styles.footerRow}>
              <PrimaryButton
                title="فيديو القصة"
                variant="ghost"
                onPress={() => router.push('/intro-video')}
                style={{ flex: 1 }}
              />
              <PrimaryButton
                title="تغيير الكود"
                variant="secondary"
                onPress={() => router.push('/login')}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </ScrollView>
      </SafeScreen>
    </SpaceBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 28,
    gap: 14,
  },
  header: {
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
  },
  kicker: { ...type.caption, color: colors.copperBright },
  title: { ...type.title, color: colors.parchment, fontSize: 24 },
  pilot: { ...type.subtitle, color: colors.mist },
  xp: {
    fontFamily: fonts.bodyBold,
    color: colors.copperBright,
    fontSize: 12,
  },
  footer: {
    paddingHorizontal: 16,
    gap: 10,
    marginTop: 8,
  },
  footerRow: { flexDirection: 'row', gap: 8 },
  hint: {
    fontFamily: fonts.body,
    color: colors.mist,
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 18,
  },
});
