import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CabinDivision } from '@/src/components/CabinDivision';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { SpaceBackground } from '@/src/components/SpaceBackground';
import {
  LEVEL1_BANK,
  LEVEL2_BANK,
  type DivisionProblem,
} from '@/src/data/problems/division';
import {
  PREP_BANK,
  ROLE_LABELS,
  roleValue,
  type CardRole,
  type PrepPhase1Problem,
} from '@/src/data/problems/prep';
import { useGameStore } from '@/src/store/gameStore';
import { colors } from '@/src/theme/colors';

export default function BankScreen() {
  const { level } = useLocalSearchParams<{ level: string }>();
  const router = useRouter();
  const addXp = useGameStore((s) => s.addXp);
  const [index, setIndex] = useState(0);
  const [mode, setMode] = useState<'menu' | 'play'>('menu');

  const prepList = PREP_BANK;
  const divList: DivisionProblem[] =
    level === 'level2' ? LEVEL2_BANK : LEVEL1_BANK;

  if (mode === 'play' && (level === 'level1' || level === 'level2')) {
    const problem = divList[index % divList.length];
    return (
      <CabinDivision
        problem={problem}
        practiceMode
        onSuccess={async () => {
          await addXp(15, 'وسام التدريب');
          setMode('menu');
        }}
        onRetryWithNew={() => setIndex((i) => i + 1)}
      />
    );
  }

  if (mode === 'play' && level === 'prep') {
    return (
      <PrepBankRound
        problem={prepList[index % prepList.length]}
        onDone={async () => {
          await addXp(10, 'وسام التدريب');
          setMode('menu');
        }}
        onNext={() => setIndex((i) => i + 1)}
      />
    );
  }

  const title =
    level === 'prep'
      ? 'بنك المستوى التمهيدي'
      : level === 'level2'
        ? 'بنك القسمة على رقمين'
        : 'بنك القسمة على رقم واحد';

  return (
    <SpaceBackground>
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.sub}>
          تدريب حر — لا يخصم من النجوم. الأخطاء تساعدك بالتلميحات فقط.
        </Text>
        <PrimaryButton
          title="مسألة جديدة 🎲"
          onPress={() => {
            setIndex((i) => i + 1);
            setMode('play');
          }}
        />
        <PrimaryButton
          title="ابدأ المسألة الحالية"
          variant="success"
          onPress={() => setMode('play')}
        />
        <PrimaryButton
          title="رجوع للخريطة"
          variant="secondary"
          onPress={() => router.replace('/map')}
        />
      </View>
    </SpaceBackground>
  );
}

function PrepBankRound({
  problem,
  onDone,
  onNext,
}: {
  problem: PrepPhase1Problem;
  onDone: () => void;
  onNext: () => void;
}) {
  const roles = useMemo(() => {
    const r: CardRole[] = ['dividend', 'divisor', 'quotient', 'remainder'];
    return r.sort(() => Math.random() - 0.5);
  }, [problem]);
  const [left, setLeft] = useState(roles);
  const [slot, setSlot] = useState<CardRole | null>(null);

  const target = left[0];

  return (
    <SpaceBackground>
      <View style={styles.container}>
        <Text style={styles.title}>تدريب المفاهيم</Text>
        <Text style={styles.problem}>
          {problem.dividend} ÷ {problem.divisor}
        </Text>
        <Text style={styles.sub}>
          أين توضع بطاقة «{target ? ROLE_LABELS[target] : ''}»؟
        </Text>
        <View style={styles.row}>
          {roles.map((role) => (
            <PrimaryButton
              key={role}
              title={ROLE_LABELS[role]}
              variant={slot === role ? 'success' : 'secondary'}
              onPress={() => {
                if (role === target) {
                  const next = left.slice(1);
                  setLeft(next);
                  setSlot(null);
                  if (next.length === 0) onDone();
                } else {
                  setSlot(role);
                }
              }}
              style={{ minWidth: 140 }}
            />
          ))}
        </View>
        {target ? (
          <Text style={styles.hint}>
            القيمة: {roleValue(problem, target)}
          </Text>
        ) : null}
        <PrimaryButton title="مسألة أخرى" variant="secondary" onPress={onNext} />
        <PrimaryButton title="إنهاء" onPress={onDone} />
      </View>
    </SpaceBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    gap: 12,
  },
  title: {
    color: colors.white,
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  sub: { color: colors.muted, textAlign: 'center', lineHeight: 22 },
  problem: {
    color: colors.cyan,
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
  },
  row: { gap: 8, alignItems: 'center' },
  hint: { color: colors.gold, textAlign: 'center' },
});
