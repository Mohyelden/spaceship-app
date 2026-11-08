import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Polygon, Rect } from 'react-native-svg';
import { feedbackFor } from '@/src/hints/hintEngine';
import { useStepHints } from '@/src/hints/useStepHints';
import {
  ROLE_LABELS,
  ROLE_ORDER,
  roleValue,
  type CardRole,
  type Phase1Problem,
} from '@/src/data/problems/prep';
import type { StatKey } from '@/src/storage/progress';
import { colors, radii } from '@/src/theme/colors';
import { fonts } from '@/src/theme/typography';
import { Button } from '../ui/Button';
import { Feedback, type Tone } from '../ui/Feedback';
import { HelpButton } from '../ui/HelpButton';
import { Screen } from '../ui/Screen';
import { TopBar } from '../ui/TopBar';
import { DndProvider, Draggable, DropZone } from './DragDrop';

type Props = {
  problem: Phase1Problem;
  stat: StatKey;
  title: string;
  subtitle?: string;
  onBack: () => void;
  /** finished correctly */
  onSuccess: () => void;
  /** solution was shown after hints → repeat with a new problem */
  onRetry: () => void;
  successText?: string;
  successButton?: string;
  retryButton?: string;
};

/**
 * Preparatory level – phase 1: drag the NAME cards (المقسوم، المقسوم عليه،
 * ناتج القسمة، الباقي) next to their numbers around the rectangle.
 */
export function Phase1Game({
  problem,
  stat,
  title,
  subtitle,
  onBack,
  onSuccess,
  onRetry,
  successText = 'أحسنت! أتقنت المفاهيم 🎉',
  successButton = 'انتقل للمرحلة الثانية',
  retryButton = 'كرر المغامرة لتتخطى هذه المرحلة',
}: Props) {
  const { hints, mode, wrong, correct, help, helpOn } = useStepHints(stat);
  const [deck] = useState(() => [...ROLE_ORDER].sort(() => Math.random() - 0.5));
  const [placed, setPlaced] = useState<Partial<Record<CardRole, boolean>>>({});
  const [failedRole, setFailedRole] = useState<CardRole | null>(null);
  const [msg, setMsg] = useState<{ text: string; tone: Tone }>({
    text: 'اسحب البطاقة وضعها في مكانها المناسب حول المستطيل 👇',
    tone: 'info',
  });
  const [solved, setSolved] = useState(false);
  const [dragging, setDragging] = useState(false);

  const done = ROLE_ORDER.every((r) => placed[r]);

  function onDrop(card: CardRole, zone: string) {
    if (solved || done) return;
    const target = zone as CardRole;
    if (placed[target]) {
      setMsg({ text: 'هذا المكان ممتلئ، اختر مكانًا فارغًا 🙂', tone: 'info' });
      return;
    }
    if (card === target) {
      correct();
      setFailedRole(null);
      const next = { ...placed, [card]: true };
      setPlaced(next);
      const finished = ROLE_ORDER.every((r) => next[r]);
      setMsg(
        finished
          ? { text: successText, tone: 'success' }
          : { text: `رائع! «${ROLE_LABELS[card]}» في مكانه الصحيح ✅`, tone: 'success' }
      );
      return;
    }
    setFailedRole(card);
    const h = wrong();
    if (h.solved) {
      setSolved(true);
      setPlaced({ dividend: true, divisor: true, quotient: true, remainder: true });
    }
    setMsg({ text: feedbackFor(h, mode), tone: h.solved ? 'error' : h.shown > 0 ? 'hint' : 'error' });
  }

  const showHint1 = hints.shown >= 1 && failedRole && !solved;
  const glow = hints.shown >= 2 && !solved ? failedRole : null;

  return (
    <DndProvider<CardRole> onDrop={onDrop} onDragChange={setDragging}>
      <Screen
        scroll
        scrollEnabled={!dragging}
        header={
          <TopBar
            title={title}
            subtitle={subtitle}
            onBack={onBack}
            left={mode === 'on_demand' ? <HelpButton enabled={helpOn} onPress={() => setMsg({ text: feedbackFor(help(), mode), tone: 'hint' })} /> : null}
          />
        }
      >
        <Text style={styles.problem}>
          {problem.dividend} ÷ {problem.divisor}
        </Text>

        <View style={styles.boardCard}>
          <Board problem={problem} placed={placed} glow={glow} />
        </View>

        {!done && !solved ? (
          <View style={styles.tray}>
            {deck.map((role) =>
              placed[role] ? null : (
                <Draggable key={role} item={role} style={styles.cardWrap}>
                  {({ selected, dragging: lifted }) => (
                    <View
                      style={[
                        styles.card,
                        selected && styles.cardSelected,
                        glow === role && styles.cardGlow,
                        lifted && styles.cardLifted,
                      ]}
                    >
                      <Text style={[styles.cardText, glow === role && { color: colors.white }]}>{ROLE_LABELS[role]}</Text>
                    </View>
                  )}
                </Draggable>
              )
            )}
          </View>
        ) : null}

        {!done && !solved ? <Text style={styles.trayHint}>اسحب البطاقة، أو اضغطها ثم اضغط مكانها</Text> : null}

        <View style={styles.feedback}>
          <Feedback message={msg.text} tone={msg.tone} />
        </View>

        {/* hint 1 lives at the bottom of the screen, not next to the rectangle (document rule) */}
        {showHint1 && failedRole ? (
          <View style={styles.hintCard}>
            <Text style={styles.hintTitle}>تلميح: أين توضع بطاقة «{ROLE_LABELS[failedRole]}»؟</Text>
            <ArrowHint role={failedRole} />
          </View>
        ) : null}

        {done && !solved ? <Button title={successButton} icon="🚀" variant="success" onPress={onSuccess} /> : null}
        {solved ? <Button title={retryButton} icon="🔁" onPress={onRetry} /> : null}
      </Screen>
    </DndProvider>
  );
}

/* ---------------- Board ---------------- */

function NumberPill({ value, glow }: { value: number; glow?: boolean }) {
  return (
    <View style={[styles.pill, glow && styles.pillGlow]}>
      <Text style={[styles.pillText, glow && { color: colors.white }]}>{value}</Text>
    </View>
  );
}

function Slot({ role, filled }: { role: CardRole; filled?: boolean }) {
  return (
    <DropZone id={role} disabled={filled} style={styles.slotWrap}>
      {({ hovered, armed }) => (
        <View
          style={[
            styles.slot,
            filled && styles.slotFilled,
            !filled && armed && styles.slotArmed,
            !filled && hovered && styles.slotHover,
          ]}
        >
          <Text style={[styles.slotText, filled && { color: colors.white }]} numberOfLines={1} adjustsFontSizeToFit>
            {filled ? ROLE_LABELS[role] : 'ضع هنا'}
          </Text>
        </View>
      )}
    </DropZone>
  );
}

function Board({
  problem,
  placed,
  glow,
}: {
  problem: Phase1Problem;
  placed: Partial<Record<CardRole, boolean>>;
  glow: CardRole | null;
}) {
  return (
    <View style={styles.board}>
      {/* quotient: above the rectangle */}
      <View style={styles.rowTop}>
        <View style={styles.leftCol} />
        <View style={styles.topRight}>
          <View style={styles.stack}>
            <NumberPill value={roleValue(problem, 'quotient')} glow={glow === 'quotient'} />
            <Slot role="quotient" filled={placed.quotient} />
          </View>
        </View>
      </View>

      <View style={styles.rowMid}>
        {/* divisor: outside, left */}
        <View style={[styles.leftCol, styles.stack]}>
          <NumberPill value={roleValue(problem, 'divisor')} glow={glow === 'divisor'} />
          <Slot role="divisor" filled={placed.divisor} />
        </View>
        {/* the rectangle */}
        <View style={styles.rect}>
          <View style={[styles.stack, { alignSelf: 'flex-start' }]}>
            <NumberPill value={roleValue(problem, 'dividend')} glow={glow === 'dividend'} />
            <Slot role="dividend" filled={placed.dividend} />
          </View>
          <View style={{ alignSelf: 'flex-end' }}>
            <NumberPill value={roleValue(problem, 'remainder')} glow={glow === 'remainder'} />
          </View>
        </View>
      </View>

      {/* remainder name: below the rectangle */}
      <View style={styles.rowBottom}>
        <View style={styles.leftCol} />
        <View style={styles.bottomRight}>
          <Slot role="remainder" filled={placed.remainder} />
        </View>
      </View>
    </View>
  );
}

/* ---------------- Hint 1: little rectangle + guiding arrow (bottom of screen) ---------------- */

function ArrowHint({ role }: { role: CardRole }) {
  const W = 200;
  const H = 120;
  const rect = { x: 60, y: 30, w: 100, h: 60 };
  const c = colors.sunDeep;
  let arrow: string;
  switch (role) {
    case 'divisor': // arrow pointing left, outside, top-left
      arrow = `${rect.x - 4},${rect.y + 4} ${rect.x - 30},${rect.y + 4} ${rect.x - 30},${rect.y - 6} ${rect.x - 50},${rect.y + 12} ${rect.x - 30},${rect.y + 30} ${rect.x - 30},${rect.y + 20} ${rect.x - 4},${rect.y + 20}`;
      break;
    case 'dividend': // arrow entering the rectangle
      arrow = `${rect.x - 50},${rect.y + 22} ${rect.x + 10},${rect.y + 22} ${rect.x + 10},${rect.y + 12} ${rect.x + 34},${rect.y + 30} ${rect.x + 10},${rect.y + 48} ${rect.x + 10},${rect.y + 38} ${rect.x - 50},${rect.y + 38}`;
      break;
    case 'quotient': // arrow up above the rectangle
      arrow = `${rect.x + 62},${rect.y - 2} ${rect.x + 62},${rect.y - 16} ${rect.x + 54},${rect.y - 16} ${rect.x + 70},${rect.y - 30} ${rect.x + 86},${rect.y - 16} ${rect.x + 78},${rect.y - 16} ${rect.x + 78},${rect.y - 2}`;
      break;
    default: // remainder: arrow down below the rectangle
      arrow = `${rect.x + 62},${rect.y + rect.h + 2} ${rect.x + 62},${rect.y + rect.h + 14} ${rect.x + 54},${rect.y + rect.h + 14} ${rect.x + 70},${rect.y + rect.h + 28} ${rect.x + 86},${rect.y + rect.h + 14} ${rect.x + 78},${rect.y + rect.h + 14} ${rect.x + 78},${rect.y + rect.h + 2}`;
  }
  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={W} height={H}>
        <Rect x={rect.x} y={rect.y} width={rect.w} height={rect.h} rx={8} fill={colors.seaSoft} stroke={colors.seaDeep} strokeWidth={3} />
        <Polygon points={arrow} fill={c} stroke={colors.ink} strokeWidth={1.5} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  problem: { fontFamily: fonts.black, color: colors.white, fontSize: 30, lineHeight: 44, textAlign: 'center', marginBottom: 8 },
  boardCard: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    padding: 12,
    borderWidth: 3,
    borderColor: colors.paperLine,
  },
  board: { gap: 6 },
  rowTop: { flexDirection: 'row' },
  rowMid: { flexDirection: 'row', gap: 8 },
  rowBottom: { flexDirection: 'row' },
  leftCol: { width: 98 },
  topRight: { flex: 1, alignItems: 'flex-end' },
  bottomRight: { flex: 1, alignItems: 'flex-end' },
  stack: { alignItems: 'center', gap: 4 },
  rect: {
    flex: 1,
    minHeight: 150,
    borderRadius: radii.md,
    borderWidth: 4,
    borderColor: colors.seaDeep,
    backgroundColor: colors.seaSoft,
    padding: 10,
    justifyContent: 'space-between',
  },
  pill: {
    minWidth: 64,
    paddingHorizontal: 10,
    height: 42,
    borderRadius: radii.sm,
    backgroundColor: colors.seaDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillGlow: { backgroundColor: colors.mint, shadowColor: colors.mint, shadowOpacity: 0.9, shadowRadius: 10 },
  pillText: { fontFamily: fonts.black, color: colors.white, fontSize: 22, lineHeight: 32 },
  slotWrap: {},
  slot: {
    width: 98,
    height: 38,
    borderRadius: radii.sm,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.sunDeep,
    backgroundColor: colors.sunSoft,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  slotArmed: { borderColor: colors.grape, backgroundColor: colors.grapeSoft },
  slotHover: { borderStyle: 'solid', borderColor: colors.grapeDeep, backgroundColor: '#D9CCFF', transform: [{ scale: 1.06 }] },
  slotFilled: { borderStyle: 'solid', borderColor: colors.mintDeep, backgroundColor: colors.mint },
  slotText: { fontFamily: fonts.bold, fontSize: 13, color: colors.inkSoft },
  feedback: { marginTop: 12 },
  hintCard: {
    marginTop: 10,
    backgroundColor: colors.sunSoft,
    borderRadius: radii.lg,
    borderWidth: 2,
    borderColor: colors.sun,
    padding: 10,
  },
  hintTitle: { fontFamily: fonts.black, color: '#7A4B00', fontSize: 14, textAlign: 'center' },
  tray: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginTop: 14,
    zIndex: 10,
  },
  cardWrap: {},
  card: {
    minWidth: 128,
    height: 54,
    paddingHorizontal: 14,
    borderRadius: radii.md,
    backgroundColor: colors.grape,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 5,
    borderBottomColor: colors.grapeDeep,
  },
  cardSelected: { borderWidth: 3, borderColor: colors.sun, borderBottomColor: colors.sun },
  cardGlow: { backgroundColor: colors.mint, borderBottomColor: colors.mintDeep },
  cardLifted: { shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 8 } },
  cardText: { fontFamily: fonts.black, color: colors.white, fontSize: 17 },
  trayHint: { fontFamily: fonts.regular, color: colors.onDarkSoft, fontSize: 13, textAlign: 'center', marginTop: 8, marginBottom: 8 },
});
