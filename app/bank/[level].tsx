import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CabinGame } from '@/src/components/game/CabinGame';
import { Phase1Game } from '@/src/components/game/Phase1Game';
import { Phase2Game } from '@/src/components/game/Phase2Game';
import { Button } from '@/src/components/ui/Button';
import { Feedback } from '@/src/components/ui/Feedback';
import { Screen } from '@/src/components/ui/Screen';
import { TopBar } from '@/src/components/ui/TopBar';
import { useRequireLogin } from '@/src/components/useGuard';
import {
  LEVEL1_BANK,
  LEVEL2_BANK,
  randomLevel1,
  randomLevel2,
  type DivisionProblem,
} from '@/src/data/problems/division';
import {
  makeArea,
  PREP_BANK,
  randomArea,
  randomPhase1,
  type AreaProblem,
  type Phase1Problem,
} from '@/src/data/problems/prep';
import type { LevelId } from '@/src/storage/progress';
import { isUnlocked, useGameStore, useStudent } from '@/src/store/gameStore';
import { colors, radii } from '@/src/theme/colors';
import { fonts } from '@/src/theme/typography';

type Item =
  | { kind: 'cards'; p: Phase1Problem }
  | { kind: 'area'; p: AreaProblem }
  | { kind: 'div'; p: DivisionProblem; two: boolean };

const LEVEL_TITLES: Record<LevelId, string> = {
  prep: 'بنك مسائل المستوى التمهيدي',
  level1: 'بنك مسائل القسمة على رقم',
  level2: 'بنك مسائل القسمة على رقمين',
};

const BADGE = 'وسام بطل الرياضيات الذهبي 🏅';
const DIFF = ['سهل', 'سهل', 'متوسط', 'متوسط', 'صعب', 'صعب'];

function listFor(level: LevelId): Item[] {
  if (level === 'prep')
    return [
      ...PREP_BANK.slice(0, 3).map((p) => ({ kind: 'cards' as const, p })),
      ...[
        [848, 4],
        [756, 3],
        [936, 4],
        [985, 5],
      ].map(([a, b]) => ({ kind: 'area' as const, p: makeArea(a, b) })),
    ];
  const src = level === 'level1' ? LEVEL1_BANK : LEVEL2_BANK;
  return [...src].sort((a, b) => a.dividend / a.divisor - b.dividend / b.divisor).map((p) => ({ kind: 'div' as const, p, two: level === 'level2' }));
}

function randomFor(level: LevelId, kind?: Item['kind']): Item {
  if (level === 'prep') return kind === 'cards' ? { kind: 'cards', p: randomPhase1() } : { kind: 'area', p: randomArea() };
  return level === 'level1' ? { kind: 'div', p: randomLevel1(), two: false } : { kind: 'div', p: randomLevel2(), two: true };
}

const label = (it: Item) => `${it.p.dividend} ÷ ${it.p.divisor}`;

export default function Bank() {
  const ok = useRequireLogin();
  const router = useRouter();
  const student = useStudent();
  const addXp = useGameStore((s) => s.addXp);
  const { level: raw } = useLocalSearchParams<{ level: string }>();
  const level: LevelId = raw === 'level1' || raw === 'level2' ? raw : 'prep';
  const [playing, setPlaying] = useState<{ item: Item; key: number } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [round, setRound] = useState(0);

  const locked = !!student && !isUnlocked(student, level);
  useEffect(() => {
    if (locked) router.replace('/map');
  }, [locked, router]);

  if (!ok || !student || locked) return null;

  const start = (item: Item) => {
    setRound((r) => r + 1);
    setPlaying({ item, key: round + 1 });
  };
  const back = () => setPlaying(null);
  const win = async () => {
    const gain = 15;
    const earnBadge = student.xp + gain >= 100 && !student.badges.includes(BADGE);
    await addXp(gain, earnBadge ? BADGE : undefined);
    setToast(earnBadge ? `مبروك! حصلت على ${BADGE} و +${gain} XP` : `أحسنت! +${gain} نقطة خبرة ⚡`);
    setPlaying(null);
  };
  const another = () => playing && start(randomFor(level, playing.item.kind));

  if (playing) {
    const { item, key } = playing;
    const common = { stat: 'bank' as const, onBack: back };
    if (item.kind === 'cards')
      return (
        <Phase1Game
          key={key}
          {...common}
          problem={item.p}
          title="بنك المسائل"
          subtitle="تدريب حر: بطاقات المستطيل"
          onSuccess={win}
          onRetry={another}
          successText="أحسنت! حللت مسألة التدريب 🎉"
          successButton="استلم نقاط الخبرة ⚡"
          retryButton="مسألة جديدة 🎲"
        />
      );
    if (item.kind === 'area')
      return (
        <Phase2Game
          key={key}
          {...common}
          problem={item.p}
          title="بنك المسائل"
          subtitle="تدريب حر: نموذج المستطيل"
          withChoice={false}
          onSuccess={win}
          onRetry={another}
          successButton="استلم نقاط الخبرة ⚡"
        />
      );
    return (
      <CabinGame
        key={key}
        {...common}
        problem={item.p}
        twoDigit={item.two}
        title="بنك المسائل"
        subtitle={`تدريب حر: ${label(item)}`}
        onSuccess={win}
        onRetry={another}
        successButton="استلم نقاط الخبرة ⚡"
        retryButton="مسألة جديدة 🎲"
      />
    );
  }

  const items = listFor(level);

  return (
    <Screen
      scroll
      header={<TopBar title={LEVEL_TITLES[level]} subtitle="تدريب حر لا يؤثر على نجومك" onBack={() => router.replace('/map')} backIcon="🏠" backLabel="العودة للخريطة" />}
      footer={<Button title="مسألة جديدة" icon="🎲" onPress={() => start(randomFor(level))} />}
    >
      <View style={styles.stats}>
        <Text style={styles.stat}>⚡ {student.xp} XP</Text>
        <Text style={styles.stat}>{student.badges.includes(BADGE) ? '🏅 حصلت على الوسام الذهبي' : `🏅 الوسام الذهبي عند 100 XP`}</Text>
      </View>
      {toast ? (
        <View style={{ marginBottom: 10 }}>
          <Feedback message={toast} tone="success" />
        </View>
      ) : null}
      <Text style={styles.section}>اختر مسألتك</Text>
      <View style={styles.grid}>
        {items.map((it, i) => (
          <Pressable
            key={`${it.kind}-${label(it)}`}
            onPress={() => start(it)}
            style={({ pressed }) => [styles.item, pressed && { transform: [{ scale: 0.97 }] }]}
            accessibilityRole="button"
            accessibilityLabel={`مسألة ${label(it)}`}
          >
            <Text style={styles.itemKind}>
              {it.kind === 'cards' ? 'بطاقات المستطيل' : it.kind === 'area' ? 'نموذج المستطيل' : 'القسمة المطوّلة'}
            </Text>
            <Text style={styles.itemProblem}>{label(it)}</Text>
            <Text style={[styles.diff, { color: i < 2 ? colors.mint : i < 4 ? colors.sun : colors.peach }]}>
              {DIFF[Math.min(i, DIFF.length - 1)]}
            </Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 12 },
  stat: {
    fontFamily: fonts.bold,
    color: colors.white,
    fontSize: 14,
    backgroundColor: colors.glass,
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    overflow: 'hidden',
  },
  section: { fontFamily: fonts.black, color: colors.white, fontSize: 18, textAlign: 'right', marginBottom: 8 },
  grid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 10 },
  item: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: 14,
    alignItems: 'center',
    borderBottomWidth: 5,
    borderBottomColor: colors.paperLine,
  },
  itemKind: { fontFamily: fonts.bold, color: colors.inkSoft, fontSize: 12 },
  itemProblem: { fontFamily: fonts.black, color: colors.ink, fontSize: 24, lineHeight: 36 },
  diff: { fontFamily: fonts.black, fontSize: 13 },
});
