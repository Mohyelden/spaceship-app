import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { FeedbackBanner } from '@/src/components/FeedbackBanner';
import { HelpButton } from '@/src/components/HelpButton';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { SelectableTiles } from '@/src/components/SelectableTiles';
import { SafeScreen } from '@/src/components/SafeScreen';
import { SpaceBackground } from '@/src/components/SpaceBackground';
import { HINT_MODE } from '@/src/config/env';
import {
  PREP_PHASE2_MAIN,
  PREP_PHASE2_RETRY,
  type AreaSlotId,
  type PrepPhase2Problem,
} from '@/src/data/problems/prep';
import {
  createHintState,
  onCorrect,
  onWrong,
  requestHelp,
} from '@/src/hints/hintEngine';
import { colors } from '@/src/theme/colors';

const SLOT_ORDER: { id: AreaSlotId; label: string; hint1: string }[] = [
  { id: 'q_hundreds', label: 'ناتج · مئات', hint1: 'خانة المئات تحتاج رقمًا بصفرين' },
  { id: 'q_tens', label: 'ناتج · عشرات', hint1: 'خانة العشرات تحتاج رقم عشرات' },
  { id: 'q_ones', label: 'ناتج · آحاد', hint1: 'خانة الآحاد تحتاج رقم آحاد' },
  {
    id: 'partial_hundreds',
    label: 'تجزئة مئات',
    hint1: 'الرقم يساوي قيمة خانة المئات أعلاه',
  },
  {
    id: 'product_hundreds',
    label: 'ضرب مئات',
    hint1: 'اضرب المقسوم عليه × ناتج المئات',
  },
  {
    id: 'remain_hundreds',
    label: 'باقي مئات',
    hint1: 'اطرح ناتج الضرب من الجزء العلوي',
  },
  {
    id: 'partial_tens',
    label: 'تجزئة عشرات',
    hint1: 'الرقم يساوي قيمة خانة العشرات',
  },
  {
    id: 'product_tens',
    label: 'ضرب عشرات',
    hint1: 'اضرب المقسوم عليه × ناتج العشرات',
  },
  {
    id: 'remain_tens',
    label: 'باقي عشرات',
    hint1: 'اطرح ناتج الضرب من الجزء العلوي',
  },
  {
    id: 'partial_ones',
    label: 'تجزئة آحاد',
    hint1: 'الرقم يساوي قيمة خانة الآحاد',
  },
  {
    id: 'product_ones',
    label: 'ضرب آحاد',
    hint1: 'اضرب المقسوم عليه × ناتج الآحاد',
  },
  {
    id: 'remain_ones',
    label: 'باقي آحاد',
    hint1: 'اطرح حتى تصل للصفر',
  },
];

export default function PrepPhase2Screen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ retry?: string }>();
  const problem: PrepPhase2Problem =
    params.retry === '1' ? PREP_PHASE2_RETRY : PREP_PHASE2_MAIN;

  const slots = useMemo(
    () => SLOT_ORDER.filter((s) => problem.solution[s.id] != null),
    [problem]
  );

  const [step, setStep] = useState(0);
  const [filled, setFilled] = useState<Partial<Record<AreaSlotId, number>>>({});
  const [usedIndexes, setUsedIndexes] = useState<Set<number>>(new Set());
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [hint, setHint] = useState(createHintState());
  const [message, setMessage] = useState<string | null>('ضع الرقم في الخانة المضيئة');
  const [tone, setTone] = useState<'info' | 'error' | 'success' | 'hint'>('info');
  const [showSolution, setShowSolution] = useState(false);
  const [mcDone, setMcDone] = useState(false);

  const current = slots[step];
  const expected = current ? problem.solution[current.id] : undefined;
  const allFilled = step >= slots.length;

  const highlightedValues = useMemo(() => {
    if (hint.tier < 2 || expected == null) return [];
    const pool = problem.tiles.filter((t, i) => !usedIndexes.has(i));
    const set = new Set<number>([expected]);
    for (const t of pool) {
      if (set.size >= 3) break;
      set.add(t);
    }
    return Array.from(set);
  }, [hint.tier, expected, problem.tiles, usedIndexes]);

  function tryPlace() {
    if (selectedIdx == null || expected == null || !current || showSolution) return;
    const value = problem.tiles[selectedIdx];

    if (value === expected) {
      setFilled((f) => ({ ...f, [current.id]: value }));
      setUsedIndexes((u) => new Set(u).add(selectedIdx));
      setSelectedIdx(null);
      setHint(onCorrect(hint));
      setMessage('أحسنت!');
      setTone('success');
      setStep((s) => s + 1);
      return;
    }

    const next = onWrong(hint);
    setHint(next);
    if (next.consecutiveErrors === 1) {
      setMessage('حاول مرة أخرى ❌');
      setTone('error');
    } else if (HINT_MODE === 'auto' || next.tier >= 1) {
      setMessage(current.hint1);
      setTone('hint');
    } else if (next.helpUnlocked) {
      setMessage('يمكنك الآن طلب المساعدة 💡');
      setTone('hint');
    }

    if (next.tier >= 2) {
      setMessage('أضأنا الخانة وضيّقنا خيارات لوحة الأرقام');
      setTone('hint');
    }

    if (next.showSolution) {
      setShowSolution(true);
      setFilled({ ...problem.solution });
      setMessage('إليك الحل. كرر المغامرة بمسألة جديدة.');
      setTone('error');
    }
    setSelectedIdx(null);
  }

  function finishToComplete() {
    router.replace('/prep/complete');
  }

  return (
    <SpaceBackground>
      <SafeScreen>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>المرحلة الثانية — نموذج المساحة</Text>
        <Text style={styles.problem}>
          {problem.dividend} ÷ {problem.divisor}
        </Text>

        <View style={styles.headerRow}>
          <Text style={styles.col}>مئات</Text>
          <Text style={styles.col}>عشرات</Text>
          <Text style={styles.col}>آحاد</Text>
        </View>

        <View style={styles.grid}>
          {slots.map((s) => (
            <Pressable
              key={s.id}
              onPress={() => {
                if (current?.id === s.id) tryPlace();
              }}
              style={[
                styles.cell,
                current?.id === s.id && styles.cellActive,
                hint.tier >= 2 && current?.id === s.id && styles.cellHi,
                filled[s.id] != null && styles.cellFilled,
              ]}
            >
              <Text style={styles.cellLabel}>{s.label}</Text>
              <Text style={styles.cellValue}>
                {filled[s.id] != null ? filled[s.id] : '…'}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.helpRow}>
          <HelpButton
            unlocked={hint.helpUnlocked}
            onPress={() => {
              if (!current) return;
              const next = requestHelp(hint);
              setHint(next);
              setMessage(current.hint1);
              setTone('hint');
            }}
          />
        </View>

        <FeedbackBanner message={message} tone={tone} />
        {hint.tier >= 1 && current ? (
          <FeedbackBanner message={current.hint1} tone="hint" />
        ) : null}

        {!allFilled && !showSolution ? (
          <>
            <SelectableTiles
              tiles={problem.tiles}
              selected={selectedIdx}
              onSelect={(_, index) => setSelectedIdx(index)}
              usedIndexes={usedIndexes}
              highlightedValues={highlightedValues}
              hideFarValues={hint.tier >= 2}
            />
            <PrimaryButton
              title="ضع الرقم في الخانة"
              onPress={tryPlace}
              disabled={selectedIdx == null}
            />
          </>
        ) : null}

        {showSolution ? (
          <PrimaryButton
            title="كرر المغامرة"
            onPress={() =>
              router.replace({ pathname: '/prep/phase2', params: { retry: '1' } })
            }
          />
        ) : null}

        {allFilled && !showSolution ? (
          problem.mcOptions && !mcDone ? (
            <View style={{ gap: 10 }}>
              <Text style={styles.mcTitle}>ناتج القسمة هو؟</Text>
              <View style={styles.mcRow}>
                {problem.mcOptions.map((opt) => (
                  <PrimaryButton
                    key={opt}
                    title={String(opt)}
                    variant="secondary"
                    onPress={() => {
                      if (opt === problem.mcAnswer) {
                        setMcDone(true);
                        setMessage('أحسنت! 200 + 80 + 0 = 280');
                        setTone('success');
                      } else {
                        setMessage('اجمع أجزاء الناتج: 200 + 80 + 0');
                        setTone('hint');
                      }
                    }}
                    style={{ minWidth: 80 }}
                  />
                ))}
              </View>
              {mcDone ? (
                <PrimaryButton
                  title="شاشة الإنجاز"
                  variant="success"
                  onPress={finishToComplete}
                />
              ) : null}
            </View>
          ) : (
            <PrimaryButton
              title="شاشة الإنجاز"
              variant="success"
              onPress={finishToComplete}
            />
          )
        ) : null}
      </ScrollView>
      </SafeScreen>
    </SpaceBackground>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingTop: 8, paddingBottom: 24, gap: 10 },
  title: {
    color: colors.cyan,
    fontWeight: '800',
    textAlign: 'center',
    fontSize: 16,
  },
  problem: {
    color: colors.white,
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-around' },
  col: { color: colors.gold, fontWeight: '700' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  cell: {
    width: '30%',
    minWidth: 100,
    backgroundColor: colors.slot,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 8,
    alignItems: 'center',
  },
  cellActive: { borderColor: colors.cyan, borderWidth: 2 },
  cellHi: { borderColor: colors.green, backgroundColor: colors.greenDim },
  cellFilled: { borderColor: colors.green },
  cellLabel: { color: colors.muted, fontSize: 10, textAlign: 'center' },
  cellValue: { color: colors.white, fontWeight: '900', fontSize: 16 },
  helpRow: { alignItems: 'center' },
  mcTitle: {
    color: colors.white,
    textAlign: 'center',
    fontWeight: '800',
    fontSize: 18,
  },
  mcRow: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
});
