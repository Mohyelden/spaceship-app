import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';

import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Planet } from '@/src/components/ui/Art';
import { Button, IconButton } from '@/src/components/ui/Button';
import { Feedback } from '@/src/components/ui/Feedback';
import { Screen } from '@/src/components/ui/Screen';
import { StarsProgress } from '@/src/components/ui/StarsProgress';
import { useRequireLogin } from '@/src/components/useGuard';
import type { LevelId } from '@/src/storage/progress';
import { isUnlocked, starsOf, useGameStore, useStudent } from '@/src/store/gameStore';
import { colors, radii } from '@/src/theme/colors';
import { fonts } from '@/src/theme/typography';

const LEVELS: { id: LevelId; name: string; skill: string; color: string; ring?: boolean }[] = [
  { id: 'prep', name: 'المستوى التمهيدي', skill: 'نموذج مساحة المستطيل', color: '#FB923C' },
  { id: 'level1', name: 'المستوى الأول', skill: 'القسمة المطوّلة على رقم واحد', color: '#38BDF8' },
  { id: 'level2', name: 'المستوى الثاني', skill: 'القسمة المطوّلة على رقمين', color: '#A78BFA', ring: true },
];

/** 1.4 Level map: 3 locks, first open; next opens only after the stars of the current one */
export default function MapScreen() {
  const ok = useRequireLogin();
  const router = useRouter();
  const student = useStudent();
  const logout = useGameStore((s) => s.logout);
  const [msg, setMsg] = useState<string | null>(null);

  if (!ok || !student) return null;
  const stars = starsOf(student);
  const current = LEVELS.find((l) => !student.completed[l.id]) ?? null;

  const openLevel = (id: LevelId) => {
    if (!isUnlocked(student, id)) {
      setMsg('🔒 هذا القفل مغلق. أكمل المستوى السابق واحصل على نجمته لفتحه!');
      return;
    }
    router.replace(`/${id}/video`);
  };

  return (
    <Screen
      scroll
      header={
        <View style={styles.header}>
          <IconButton
            icon="🚪"
            label="خروج"
            onPress={() => {
              logout();
              router.replace('/login');
            }}
          />
          <View style={styles.chip}>
            <Text style={styles.chipText}>👨‍🚀 القائد {student.code}</Text>
          </View>
          <View style={[styles.chip, styles.xp]}>
            <Text style={[styles.chipText, { color: colors.ink }]}>⚡ {student.xp} XP</Text>
          </View>
        </View>
      }
      footer={
        <View style={{ gap: 10 }}>
          {current ? (
            <Button
              title="اضغط لمشاهدة فيديو المستوى"
              icon="🎬"
              onPress={() => router.replace(`/${current.id}/video`)}
            />
          ) : (
            <Button title="شاهد انطلاق سفينتك" icon="🚀" variant="success" onPress={() => router.replace('/finale')} />
          )}
        </View>
      }
    >
      <Text style={styles.title}>خريطة إصلاح المحركات</Text>
      <View style={styles.progressCard}>
        <StarsProgress stars={stars} />
      </View>

      {msg ? (
        <View style={{ marginBottom: 8 }}>
          <Feedback message={msg} tone="hint" />
        </View>
      ) : null}

      <View style={styles.path}>
        {LEVELS.map((lvl, i) => {
          const open = isUnlocked(student, lvl.id);
          const done = student.completed[lvl.id];
          const isCurrent = current?.id === lvl.id;
          return (
            <View key={lvl.id}>
              {i > 0 ? (
                <View style={styles.connector}>
                  {[0, 1, 2].map((d) => (
                    <View key={d} style={[styles.dash, open && { backgroundColor: colors.sun }]} />
                  ))}
                </View>
              ) : null}
              <LevelNode
                index={i}
                name={lvl.name}
                skill={lvl.skill}
                color={lvl.color}
                ring={lvl.ring}
                open={open}
                done={done}
                current={isCurrent}
                onPress={() => openLevel(lvl.id)}
                onBank={open ? () => router.replace(`/bank/${lvl.id}`) : undefined}
              />
            </View>
          );
        })}
      </View>
    </Screen>
  );
}

function LevelNode({
  index,
  name,
  skill,
  color,
  ring,
  open,
  done,
  current,
  onPress,
  onBank,
}: {
  index: number;
  name: string;
  skill: string;
  color: string;
  ring?: boolean;
  open: boolean;
  done: boolean;
  current: boolean;
  onPress: () => void;
  onBank?: () => void;
}) {
  const pulse = useState(() => new Animated.Value(0))[0];
  useEffect(() => {
    if (!current) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [current, pulse]);

  const badge = done ? '★' : open ? '🔓' : '🔒';

  return (
    <View style={[styles.nodeRow, index % 2 === 1 && styles.nodeRowAlt]}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${name}، ${open ? 'مفتوح' : 'مغلق'}`}
        style={({ pressed }) => [styles.node, !open && styles.nodeLocked, current && styles.nodeCurrent, pressed && { transform: [{ scale: 0.97 }] }]}
      >
        <Animated.View
          style={{ transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.07] }) }] }}
        >
          <View style={{ opacity: open ? 1 : 0.45 }}>
            <Planet size={86} color={open ? color : colors.locked} ring={ring} />
          </View>
          <View style={[styles.badge, done ? styles.badgeDone : open ? styles.badgeOpen : styles.badgeLocked]}>
            <Text style={[styles.badgeText, done && { color: colors.ink }]}>{badge}</Text>
          </View>
        </Animated.View>
        <View style={styles.nodeText}>
          <Text style={styles.nodeName}>{name}</Text>
          <Text style={styles.nodeSkill}>{skill}</Text>
          <Text style={[styles.nodeState, { color: done ? colors.sun : open ? colors.mint : colors.onDarkSoft }]}>
            {done ? 'تم إصلاح المحرك ★' : open ? (current ? 'اضغط لتبدأ ▶' : 'مفتوح') : 'مغلق'}
          </Text>
        </View>
      </Pressable>
      {onBank ? (
        <Pressable onPress={onBank} style={styles.bank} accessibilityRole="button" accessibilityLabel={`بنك مسائل ${name}`}>
          <Text style={styles.bankIcon}>🏦</Text>
          <Text style={styles.bankText}>بنك المسائل</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, marginBottom: 6 },
  chip: {
    flexShrink: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassLine,
  },
  xp: { backgroundColor: colors.sun, borderColor: colors.sun },
  chipText: { fontFamily: fonts.bold, color: colors.white, fontSize: 14 },
  title: { fontFamily: fonts.black, color: colors.white, fontSize: 24, lineHeight: 38, textAlign: 'center', marginTop: 4 },
  progressCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radii.lg,
    padding: 14,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: colors.glassLine,
  },
  path: { gap: 0, paddingBottom: 8 },
  connector: { alignItems: 'center', gap: 5, paddingVertical: 6 },
  dash: { width: 6, height: 10, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.25)' },
  nodeRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8 },
  nodeRowAlt: { flexDirection: 'row' },
  node: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: radii.xl,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 2,
    borderColor: colors.glassLine,
  },
  nodeLocked: { backgroundColor: 'rgba(255,255,255,0.04)' },
  nodeCurrent: { borderColor: colors.sun, backgroundColor: 'rgba(255,200,61,0.12)' },
  nodeText: { flex: 1, alignItems: 'flex-end' },
  nodeName: { fontFamily: fonts.black, color: colors.white, fontSize: 18, lineHeight: 28, textAlign: 'right' },
  nodeSkill: { fontFamily: fonts.regular, color: colors.onDarkSoft, fontSize: 13, lineHeight: 20, textAlign: 'right' },
  nodeState: { fontFamily: fonts.black, fontSize: 13, marginTop: 2 },
  badge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.sky1,
  },
  badgeDone: { backgroundColor: colors.sun },
  badgeOpen: { backgroundColor: colors.mint },
  badgeLocked: { backgroundColor: colors.locked },
  badgeText: { fontSize: 15, color: colors.white },
  bank: {
    width: 74,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: radii.lg,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassLine,
  },
  bankIcon: { fontSize: 24 },
  bankText: { fontFamily: fonts.bold, color: colors.white, fontSize: 11, textAlign: 'center' },
});
