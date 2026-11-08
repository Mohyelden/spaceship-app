import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { FeedbackBanner } from '@/src/components/FeedbackBanner';
import { HelpButton } from '@/src/components/HelpButton';
import { NumberPad } from '@/src/components/NumberPad';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { SafeScreen } from '@/src/components/SafeScreen';
import { SpaceBackground } from '@/src/components/SpaceBackground';
import {
  STEP_LABELS,
  type CabinStep,
  type DivisionProblem,
} from '@/src/data/problems/division';
import { HINT_MODE } from '@/src/config/env';
import {
  createHintState,
  onCorrect,
  onWrong,
  requestHelp,
  type HintState,
} from '@/src/hints/hintEngine';
import { colors } from '@/src/theme/colors';

type SubPhase =
  | 'chooseStart'
  | 'enterDigit'
  | 'enterProduct'
  | 'enterRemainder'
  | 'enterBringDown';

type Props = {
  problem: DivisionProblem;
  practiceMode?: boolean;
  onSuccess: () => void;
  onRetryWithNew: () => void;
};

function litCount(cycleIndex: number, step: CabinStep): number {
  const base = cycleIndex * 4;
  const extra =
    step === 'divide' ? 1 : step === 'multiply' ? 2 : step === 'subtract' ? 3 : 4;
  return Math.min(4, base > 0 ? 4 : extra);
}

export function CabinDivision({
  problem,
  practiceMode,
  onSuccess,
  onRetryWithNew,
}: Props) {
  const [cycleIndex, setCycleIndex] = useState(0);
  const [sub, setSub] = useState<SubPhase>(
    cycleIndex === 0 ? 'chooseStart' : 'enterDigit'
  );
  const [hint, setHint] = useState<HintState>(createHintState());
  const [message, setMessage] = useState<string | null>(null);
  const [tone, setTone] = useState<'info' | 'error' | 'success' | 'hint'>('info');
  const [showSolution, setShowSolution] = useState(false);
  const [doneScreens, setDoneScreens] = useState(0);

  const cycle = problem.cycles[cycleIndex];
  const isLastCycle = cycleIndex >= problem.cycles.length - 1;

  const currentStep: CabinStep =
    sub === 'chooseStart' || sub === 'enterDigit'
      ? 'divide'
      : sub === 'enterProduct'
        ? 'multiply'
        : sub === 'enterRemainder'
          ? 'subtract'
          : 'bringDown';

  const expected = useMemo(() => {
    if (!cycle) return null;
    if (sub === 'chooseStart') return problem.startDigits === 1
      ? Number(String(problem.dividend)[0])
      : Number(String(problem.dividend).slice(0, problem.startDigits));
    if (sub === 'enterDigit') return cycle.digit;
    if (sub === 'enterProduct') return cycle.product;
    if (sub === 'enterRemainder') return cycle.remainder;
    if (sub === 'enterBringDown') return cycle.bringDownDigit;
    return null;
  }, [cycle, sub, problem]);

  const prompt = useMemo(() => {
    if (!cycle) return '';
    if (sub === 'chooseStart') {
      return problem.startDigits > 1
        ? 'من أين نبدأ؟ اختر الرقم/الرقمين للبدء من اليسار'
        : 'من أين نبدأ القسمة؟ اختر الرقم الأول من اليسار';
    }
    if (sub === 'enterDigit') {
      return `كم مرة يدخل ${cycle.divisor} في ${cycle.working} بدون تجاوز؟`;
    }
    if (sub === 'enterProduct') {
      return `اضرب: ${cycle.digit} × ${cycle.divisor} = ؟`;
    }
    if (sub === 'enterRemainder') {
      return `اطرح: ${cycle.working} − ${cycle.product} = ؟`;
    }
    if (sub === 'enterBringDown') {
      return `أنزل الرقم التالي بجوار الباقي (${cycle.remainder})`;
    }
    return '';
  }, [cycle, sub, problem]);

  const hintText = useMemo(() => {
    if (!cycle || hint.tier === 0) return null;
    if (sub === 'chooseStart') {
      if (hint.tier === 1) return '⬅️ اقرأ المقسوم من اليسار إلى اليمين';
      return 'ركّز على الأرقام من اليسار بالترتيب الملون';
    }
    if (sub === 'enterDigit') {
      if (hint.tier === 1)
        return `مسطرة بطول ${cycle.working} — كم مجموعة من ${cycle.divisor}؟`;
      return `لوّن مجموعات بحجم ${cycle.divisor} داخل ${cycle.working}`;
    }
    if (sub === 'enterProduct') {
      if (hint.tier === 1)
        return `سهم يربط ${cycle.digit} × ${cycle.divisor}`;
      return `${cycle.digit} أسهم طول كل منها ${cycle.divisor}`;
    }
    if (sub === 'enterRemainder') {
      if (hint.tier === 1)
        return `مسطرتان: ${cycle.working} و ${cycle.product} مع علامة −`;
      return `لوّن المشترك واترك الفرق (${cycle.working - cycle.product})`;
    }
    if (sub === 'enterBringDown') {
      if (hint.tier === 1)
        return `سهم ينزل الرقم ${cycle.bringDownDigit} بجوار ${cycle.remainder}`;
      return `أضئ الرقم ومكانه الجديد أسفل`;
    }
    return null;
  }, [cycle, hint.tier, sub]);

  const highlightedPad = useMemo(() => {
    if (hint.tier < 2 || expected == null) return [];
    const e = Number(expected);
    if (e <= 9) {
      const opts = new Set<number>([e]);
      while (opts.size < 3) opts.add(Math.floor(Math.random() * 10));
      return Array.from(opts);
    }
    return [];
  }, [hint.tier, expected]);

  function advanceAfterCorrect() {
    setHint(onCorrect(hint));
    setMessage('أحسنت!');
    setTone('success');

    if (sub === 'chooseStart') {
      setSub('enterDigit');
      return;
    }
    if (sub === 'enterDigit') {
      setDoneScreens((d) => Math.max(d, 1));
      setSub('enterProduct');
      return;
    }
    if (sub === 'enterProduct') {
      setDoneScreens((d) => Math.max(d, 2));
      setSub('enterRemainder');
      return;
    }
    if (sub === 'enterRemainder') {
      setDoneScreens((d) => Math.max(d, 3));
      if (cycle.bringDownDigit == null) {
        setDoneScreens(4);
        setMessage('تم تصفير المسألة! المحرك يعمل 🌟');
        setTone('success');
        setTimeout(onSuccess, 700);
        return;
      }
      setSub('enterBringDown');
      return;
    }
    if (sub === 'enterBringDown') {
      setDoneScreens((d) => Math.max(d, 4));
      if (isLastCycle) {
        setTimeout(onSuccess, 500);
        return;
      }
      setCycleIndex((i) => i + 1);
      setSub('enterDigit');
      setHint(createHintState());
    }
  }

  function handleAnswer(n: number) {
    if (showSolution || expected == null) return;

    if (n === Number(expected)) {
      advanceAfterCorrect();
      return;
    }

    const next = onWrong(hint);
    setHint(next);

    if (next.consecutiveErrors === 1) {
      setMessage('حاول مرة أخرى ❌');
      setTone('error');
      return;
    }

    if (HINT_MODE === 'auto' && next.tier >= 1) {
      setMessage(hintText || 'تلميح بصري');
      setTone('hint');
    } else if (HINT_MODE === 'on_demand' && next.helpUnlocked && next.tier === 0) {
      setMessage('يمكنك الآن طلب المساعدة 💡');
      setTone('hint');
    }

    if (next.tier >= 2) {
      setMessage(hintText || 'ضيّقنا الخيارات — اختر من الأرقام المضيئة');
      setTone('hint');
    }

    if (next.showSolution) {
      setShowSolution(true);
      setMessage(
        practiceMode
          ? `الإجابة: ${expected}. درّب نفسك بمسألة جديدة.`
          : `الإجابة: ${expected}. كرر المغامرة بمسألة جديدة لتثبيت الفهم.`
      );
      setTone('error');
    }
  }

  function onHelp() {
    const next = requestHelp(hint);
    setHint(next);
    setMessage(hintText || 'تلميح');
    setTone('hint');
    if (next.showSolution) {
      setShowSolution(true);
      setMessage(`الإجابة: ${expected}`);
    }
  }

  const screensLit = litCount(cycleIndex, currentStep);

  return (
    <SpaceBackground>
      <SafeScreen>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>كابينة القيادة</Text>
        <Text style={styles.problem}>
          {problem.dividend} ÷ {problem.divisor}
        </Text>

        <View style={styles.screensRow}>
          {(['divide', 'multiply', 'subtract', 'bringDown'] as CabinStep[]).map(
            (s, i) => {
              const on = i < screensLit || (showSolution && i < 4);
              const active = STEP_LABELS[currentStep] === STEP_LABELS[s] && !showSolution;
              const allGreen = doneScreens >= 4 && isLastCycle;
              return (
                <View
                  key={s}
                  style={[
                    styles.screen,
                    on && styles.screenOn,
                    active && styles.screenActive,
                    allGreen && styles.screenGreen,
                  ]}
                >
                  <Text style={styles.screenLabel}>{STEP_LABELS[s]}</Text>
                </View>
              );
            }
          )}
        </View>

        <View style={styles.workBox}>
          <Text style={styles.stepBadge}>{STEP_LABELS[currentStep]}</Text>
          <Text style={styles.prompt}>{prompt}</Text>
          {cycle ? (
            <Text style={styles.meta}>
              الدورة {cycleIndex + 1}/{problem.cycles.length} · العمل على{' '}
              {cycle.working}
            </Text>
          ) : null}
        </View>

        <View style={styles.helpRow}>
          <HelpButton unlocked={hint.helpUnlocked} onPress={onHelp} />
        </View>

        <FeedbackBanner message={message} tone={tone} />
        {hint.tier > 0 && hintText ? (
          <FeedbackBanner message={hintText} tone="hint" />
        ) : null}

        {!showSolution ? (
          expected != null && Number(expected) > 9 ? (
            <BigNumberEntry
              expected={Number(expected)}
              onSubmit={handleAnswer}
              highlighted={hint.tier >= 2}
            />
          ) : (
            <NumberPad
              onSelect={handleAnswer}
              highlighted={highlightedPad}
              dimmed={
                hint.tier >= 2
                  ? Array.from({ length: 10 }, (_, i) => i).filter(
                      (i) => !highlightedPad.includes(i)
                    )
                  : []
              }
            />
          )
        ) : (
          <PrimaryButton
            title="كرر المغامرة"
            variant="success"
            onPress={onRetryWithNew}
          />
        )}
      </ScrollView>
      </SafeScreen>
    </SpaceBackground>
  );
}

function BigNumberEntry({
  expected,
  onSubmit,
  highlighted,
}: {
  expected: number;
  onSubmit: (n: number) => void;
  highlighted: boolean;
}) {
  const [value, setValue] = useState('');
  const choices = useMemo(() => {
    const set = new Set<number>([expected]);
    while (set.size < 4) {
      const jitter = expected + (Math.floor(Math.random() * 21) - 10);
      if (jitter > 0) set.add(jitter);
    }
    return Array.from(set).sort((a, b) => a - b);
  }, [expected]);

  return (
    <View style={{ gap: 10 }}>
      <View style={styles.choiceRow}>
        {choices.map((c) => (
          <PrimaryButton
            key={c}
            title={String(c)}
            variant={highlighted && c === expected ? 'success' : 'secondary'}
            onPress={() => onSubmit(c)}
            style={{ minWidth: 72 }}
          />
        ))}
      </View>
      <Text style={{ color: colors.muted, textAlign: 'center' }}>
        أو اكتب الناتج ثم أكّد
      </Text>
      <View style={styles.choiceRow}>
        <PrimaryButton
          title={value || '…'}
          variant="secondary"
          onPress={() => {}}
          style={{ flex: 1 }}
        />
      </View>
      <NumberPad
        onSelect={(d) => setValue((v) => (v + String(d)).slice(0, 4))}
      />
      <PrimaryButton
        title="تأكيد"
        onPress={() => {
          const n = Number(value);
          if (!Number.isNaN(n)) onSubmit(n);
          setValue('');
        }}
      />
      <PrimaryButton
        title="مسح"
        variant="secondary"
        onPress={() => setValue('')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 12,
  },
  title: {
    color: colors.cyan,
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  problem: {
    color: colors.white,
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
  },
  screensRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  screen: {
    flex: 1,
    backgroundColor: colors.screenOff,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    opacity: 0.55,
  },
  screenOn: { opacity: 1, borderColor: colors.screenPartial },
  screenActive: {
    opacity: 1,
    borderColor: colors.cyan,
    borderWidth: 2,
  },
  screenGreen: {
    backgroundColor: colors.greenDim,
    borderColor: colors.green,
    opacity: 1,
  },
  screenLabel: { color: colors.white, fontWeight: '800', fontSize: 13 },
  workBox: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 6,
  },
  stepBadge: {
    color: colors.gold,
    fontWeight: '800',
    textAlign: 'center',
  },
  prompt: {
    color: colors.softWhite,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '600',
  },
  meta: { color: colors.muted, textAlign: 'center', fontSize: 12 },
  helpRow: { alignItems: 'center' },
  choiceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
});
