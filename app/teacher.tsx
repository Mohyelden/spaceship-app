import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/src/components/ui/Button';
import { Screen } from '@/src/components/ui/Screen';
import { TopBar } from '@/src/components/ui/TopBar';
import type { HintMode } from '@/src/config/env';
import type { StatKey, StudentProgress } from '@/src/storage/progress';
import { starsOf, useGameStore } from '@/src/store/gameStore';
import { colors, radii } from '@/src/theme/colors';
import { fonts } from '@/src/theme/typography';

const STAT_NAMES: Record<StatKey, string> = { prep: 'التمهيدي', level1: 'الأول', level2: 'الثاني', bank: 'البنك' };

/** Hidden teacher panel (long-press the logo on the login screen) */
export default function Teacher() {
  const router = useRouter();
  const save = useGameStore((s) => s.save);
  const setHintMode = useGameStore((s) => s.setHintMode);
  const resetStudent = useGameStore((s) => s.resetStudent);
  const deleteStudent = useGameStore((s) => s.deleteStudent);
  const [confirm, setConfirm] = useState<{ code: string; action: 'reset' | 'delete' } | null>(null);
  const students = Object.values(save.students).sort((a, b) => b.lastLoginAt - a.lastLoginAt);

  const exportData = () => {
    const rows = [
      'code,group,stars,xp,logins,level,correct,errors,hintsShown,helpPresses,solutionsShown',
      ...students.flatMap((s) =>
        (Object.keys(s.stats) as StatKey[]).map((k) =>
          [s.code, save.hintMode, starsOf(s), s.xp, s.logins, k, s.stats[k].correct, s.stats[k].errors, s.stats[k].hintsShown, s.stats[k].helpPresses, s.stats[k].solutionsShown].join(',')
        )
      ),
    ].join('\n');
    Share.share({ message: rows, title: 'نتائج سفينة الفضاء' }).catch(() => {});
  };

  return (
    <Screen scroll header={<TopBar title="لوحة المعلم" subtitle="إعدادات البحث ونتائج التلاميذ" onBack={() => (router.canGoBack() ? router.back() : router.replace('/login'))} />}>
      <View style={styles.card}>
        <Text style={styles.h}>نسخة الدعم (مجموعة البحث)</Text>
        <View style={styles.modes}>
          {(['auto', 'on_demand'] as HintMode[]).map((m) => (
            <Pressable
              key={m}
              onPress={() => setHintMode(m)}
              style={[styles.mode, save.hintMode === m && styles.modeOn]}
              accessibilityRole="radio"
              accessibilityState={{ checked: save.hintMode === m }}
            >
              <Text style={[styles.modeTitle, save.hintMode === m && { color: colors.white }]}>
                {m === 'auto' ? 'التلميحات التلقائية' : 'التلميحات عند الطلب 💡'}
              </Text>
              <Text style={[styles.modeDesc, save.hintMode === m && { color: colors.white }]}>
                {m === 'auto' ? 'تظهر التلميحات وحدها بعد الخطأ الثاني المتتالي' : 'زر المساعدة يُفعَّل بعد الخطأ الثاني المتتالي'}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.h}>التلاميذ ({students.length})</Text>
          {students.length ? <Button title="تصدير CSV" icon="📤" size="sm" variant="light" onPress={exportData} /> : null}
        </View>
        {students.length === 0 ? <Text style={styles.empty}>لا يوجد تلاميذ بعد.</Text> : null}
        {students.map((s) => (
          <StudentRow
            key={s.code}
            s={s}
            confirming={confirm?.code === s.code ? confirm.action : null}
            onAsk={(action) => setConfirm({ code: s.code, action })}
            onCancel={() => setConfirm(null)}
            onConfirm={async () => {
              if (confirm?.action === 'reset') await resetStudent(s.code);
              else await deleteStudent(s.code);
              setConfirm(null);
            }}
          />
        ))}
      </View>
    </Screen>
  );
}

function StudentRow({
  s,
  confirming,
  onAsk,
  onCancel,
  onConfirm,
}: {
  s: StudentProgress;
  confirming: 'reset' | 'delete' | null;
  onAsk: (a: 'reset' | 'delete') => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <View style={styles.student}>
      <View style={styles.rowBetween}>
        <Text style={styles.code}>{s.code}</Text>
        <Text style={styles.meta}>
          {'★'.repeat(starsOf(s)) || '—'} · {s.xp} XP · {s.logins} دخول
        </Text>
      </View>
      <View style={styles.table}>
        {(Object.keys(s.stats) as StatKey[]).map((k) => (
          <Text key={k} style={styles.tableRow}>
            {STAT_NAMES[k]}: ✅ {s.stats[k].correct} · ❌ {s.stats[k].errors} · 💡 {s.stats[k].hintsShown} · 👆 {s.stats[k].helpPresses} · 📖 {s.stats[k].solutionsShown}
          </Text>
        ))}
      </View>
      {confirming ? (
        <View style={styles.actions}>
          <Text style={styles.warn}>{confirming === 'reset' ? 'تصفير تقدم هذا التلميذ؟' : 'حذف هذا التلميذ نهائيًا؟'}</Text>
          <Button title="نعم" size="sm" variant="danger" onPress={onConfirm} />
          <Button title="إلغاء" size="sm" variant="light" onPress={onCancel} />
        </View>
      ) : (
        <View style={styles.actions}>
          <Button title="تصفير التقدم" size="sm" variant="light" onPress={() => onAsk('reset')} />
          <Button title="حذف" size="sm" variant="danger" onPress={() => onAsk('delete')} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.white, borderRadius: radii.lg, padding: 14, gap: 10, marginBottom: 12 },
  h: { fontFamily: fonts.black, fontSize: 17, color: colors.ink, textAlign: 'right' },
  modes: { gap: 8 },
  mode: { borderWidth: 2, borderColor: colors.paperLine, borderRadius: radii.md, padding: 12 },
  modeOn: { backgroundColor: colors.grape, borderColor: colors.grapeDeep },
  modeTitle: { fontFamily: fonts.black, fontSize: 16, color: colors.ink, textAlign: 'right' },
  modeDesc: { fontFamily: fonts.regular, fontSize: 13, color: colors.inkSoft, textAlign: 'right' },
  rowBetween: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  empty: { fontFamily: fonts.regular, color: colors.inkSoft, textAlign: 'center' },
  student: { borderTopWidth: 1, borderTopColor: colors.paperLine, paddingTop: 10, gap: 6 },
  code: { fontFamily: fonts.black, fontSize: 18, color: colors.ink },
  meta: { fontFamily: fonts.bold, fontSize: 13, color: colors.inkSoft },
  table: { backgroundColor: colors.paperSoft, borderRadius: radii.sm, padding: 8, gap: 2 },
  tableRow: { fontFamily: fonts.regular, fontSize: 12, color: colors.ink, textAlign: 'right' },
  actions: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  warn: { fontFamily: fonts.bold, color: colors.coral, fontSize: 13 },
});
