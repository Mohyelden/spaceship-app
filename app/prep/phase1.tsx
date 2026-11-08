import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FeedbackBanner } from '@/src/components/FeedbackBanner';
import { HelpButton } from '@/src/components/HelpButton';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { SafeScreen } from '@/src/components/SafeScreen';
import { SpaceBackground } from '@/src/components/SpaceBackground';
import { HINT_MODE } from '@/src/config/env';
import {
  PREP_PHASE1_MAIN,
  PREP_PHASE1_RETRY,
  ROLE_LABELS,
  roleValue,
  type CardRole,
  type PrepPhase1Problem,
} from '@/src/data/problems/prep';
import {
  createHintState,
  onCorrect,
  onWrong,
  requestHelp,
} from '@/src/hints/hintEngine';
import { colors } from '@/src/theme/colors';

const SLOTS: { role: CardRole; place: string }[] = [
  { role: 'divisor', place: 'يسار المستطيل (خارج)' },
  { role: 'dividend', place: 'داخل المستطيل' },
  { role: 'quotient', place: 'أعلى المستطيل' },
  { role: 'remainder', place: 'أسفل المستطيل' },
];

const HINT1: Record<CardRole, string> = {
  divisor: '⬅️ السهم يشير لليسار خارج المستطيل',
  dividend: '➡️ مستطيل يدخل إليه سهم (المقسوم للداخل)',
  quotient: '⬆️ السهم يشير لأعلى المستطيل',
  remainder: '⬇️ السهم يشير لأسفل المستطيل',
};

export default function PrepPhase1Screen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ retry?: string }>();
  const problem: PrepPhase1Problem =
    params.retry === '1' ? PREP_PHASE1_RETRY : PREP_PHASE1_MAIN;

  const deck = useMemo(() => {
    const roles: CardRole[] = ['dividend', 'divisor', 'quotient', 'remainder'];
    return roles
      .map((role) => ({ role, value: roleValue(problem, role) }))
      .sort(() => Math.random() - 0.5);
  }, [problem]);

  const [placements, setPlacements] = useState<Partial<Record<CardRole, CardRole>>>(
    {}
  );
  const [selected, setSelected] = useState<CardRole | null>(null);
  const [hint, setHint] = useState(createHintState());
  const [message, setMessage] = useState<string | null>(
    'اسحب البطاقة وضعها في مكانها المناسب'
  );
  const [tone, setTone] = useState<'info' | 'error' | 'success' | 'hint'>('info');
  const [failedRole, setFailedRole] = useState<CardRole | null>(null);
  const [showSolution, setShowSolution] = useState(false);

  const usedRoles = new Set(Object.values(placements));
  const allDone = SLOTS.every((s) => placements[s.role] === s.role);

  function placeOnSlot(slotRole: CardRole) {
    if (!selected || showSolution) return;

    if (selected === slotRole) {
      setPlacements((p) => ({ ...p, [slotRole]: selected }));
      setSelected(null);
      setFailedRole(null);
      setHint(onCorrect(hint));
      setMessage('أحسنت!');
      setTone('success');
      return;
    }

    const next = onWrong(hint);
    setHint(next);
    setFailedRole(selected);

    if (next.consecutiveErrors === 1) {
      setMessage('حاول مرة أخرى ❌');
      setTone('error');
    } else if (HINT_MODE === 'auto' || next.tier >= 1) {
      setMessage(HINT1[selected]);
      setTone('hint');
    } else if (next.helpUnlocked) {
      setMessage('يمكنك الآن طلب المساعدة 💡');
      setTone('hint');
    }

    if (next.tier >= 2) {
      setMessage(
        `أضئنا بطاقة (${ROLE_LABELS[selected]}) وموضعها الصحيح بالأخضر`
      );
      setTone('hint');
    }

    if (next.showSolution) {
      setShowSolution(true);
      setPlacements({
        dividend: 'dividend',
        divisor: 'divisor',
        quotient: 'quotient',
        remainder: 'remainder',
      });
      setMessage('إليك الحل الكامل. كرر المغامرة بمسألة جديدة.');
      setTone('error');
    }

    setSelected(null);
  }

  return (
    <SpaceBackground>
      <SafeScreen>
      <View style={styles.container}>
        <Text style={styles.title}>المرحلة الأولى</Text>
        <Text style={styles.problem}>
          {problem.dividend} ÷ {problem.divisor}
        </Text>

        <View style={styles.board}>
          <Slot
            label="ناتج القسمة"
            role="quotient"
            filled={placements.quotient}
            problem={problem}
            highlight={hint.tier >= 2 && failedRole === 'quotient'}
            onPress={() => placeOnSlot('quotient')}
          />
          <View style={styles.midRow}>
            <Slot
              label="المقسوم عليه"
              role="divisor"
              filled={placements.divisor}
              problem={problem}
              highlight={hint.tier >= 2 && failedRole === 'divisor'}
              onPress={() => placeOnSlot('divisor')}
              narrow
            />
            <Slot
              label="المقسوم (داخل)"
              role="dividend"
              filled={placements.dividend}
              problem={problem}
              highlight={hint.tier >= 2 && failedRole === 'dividend'}
              onPress={() => placeOnSlot('dividend')}
              big
            />
          </View>
          <Slot
            label="الباقي"
            role="remainder"
            filled={placements.remainder}
            problem={problem}
            highlight={hint.tier >= 2 && failedRole === 'remainder'}
            onPress={() => placeOnSlot('remainder')}
          />
        </View>

        <View style={styles.helpRow}>
          <HelpButton
            unlocked={hint.helpUnlocked}
            onPress={() => {
              if (!failedRole && !selected) return;
              const role = failedRole || selected!;
              const next = requestHelp(hint);
              setHint(next);
              setMessage(HINT1[role]);
              setTone('hint');
            }}
          />
        </View>

        <FeedbackBanner message={message} tone={tone} />
        {hint.tier >= 1 && failedRole ? (
          <FeedbackBanner message={HINT1[failedRole]} tone="hint" />
        ) : null}

        <Text style={styles.deckLabel}>البطاقات</Text>
        <View style={styles.deck}>
          {deck.map((card) => {
            if (usedRoles.has(card.role)) return null;
            const hi = hint.tier >= 2 && failedRole === card.role;
            return (
              <Pressable
                key={card.role}
                onPress={() => setSelected(card.role)}
                style={[
                  styles.card,
                  selected === card.role && styles.cardSelected,
                  hi && styles.cardHi,
                ]}
              >
                <Text style={styles.cardRole}>{ROLE_LABELS[card.role]}</Text>
                <Text style={styles.cardValue}>{card.value}</Text>
              </Pressable>
            );
          })}
        </View>

        {allDone && !showSolution ? (
          <PrimaryButton
            title="انتقل للمرحلة الثانية"
            variant="success"
            onPress={() => router.replace('/prep/phase2')}
          />
        ) : null}

        {showSolution ? (
          <PrimaryButton
            title="كرر المغامرة"
            onPress={() =>
              router.replace({ pathname: '/prep/phase1', params: { retry: '1' } })
            }
          />
        ) : null}
      </View>
      </SafeScreen>
    </SpaceBackground>
  );
}

function Slot({
  label,
  role,
  filled,
  problem,
  onPress,
  highlight,
  big,
  narrow,
}: {
  label: string;
  role: CardRole;
  filled?: CardRole;
  problem: PrepPhase1Problem;
  onPress: () => void;
  highlight?: boolean;
  big?: boolean;
  narrow?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.slot,
        big && styles.slotBig,
        narrow && styles.slotNarrow,
        highlight && styles.slotHi,
        filled && styles.slotFilled,
      ]}
    >
      <Text style={styles.slotLabel}>{label}</Text>
      <Text style={styles.slotValue}>
        {filled ? roleValue(problem, role) : '—'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 8, gap: 10 },
  title: {
    color: colors.cyan,
    fontWeight: '800',
    textAlign: 'center',
    fontSize: 18,
  },
  problem: {
    color: colors.white,
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
  },
  board: { gap: 8, alignItems: 'center' },
  midRow: { flexDirection: 'row', gap: 8, alignItems: 'stretch' },
  slot: {
    minWidth: 140,
    backgroundColor: colors.slot,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 10,
    alignItems: 'center',
  },
  slotBig: { flex: 1, minHeight: 90 },
  slotNarrow: { width: 100 },
  slotHi: { borderColor: colors.green, borderWidth: 2 },
  slotFilled: { backgroundColor: colors.greenDim, borderColor: colors.green },
  slotLabel: { color: colors.muted, fontSize: 12 },
  slotValue: { color: colors.white, fontSize: 22, fontWeight: '800' },
  helpRow: { alignItems: 'center' },
  deckLabel: { color: colors.muted, textAlign: 'center' },
  deck: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 10,
    minWidth: 90,
    alignItems: 'center',
  },
  cardSelected: { borderColor: colors.cyan, borderWidth: 2 },
  cardHi: { borderColor: colors.green, backgroundColor: colors.greenDim },
  cardRole: { color: colors.gold, fontSize: 12, fontWeight: '700' },
  cardValue: { color: colors.white, fontSize: 18, fontWeight: '900' },
});
