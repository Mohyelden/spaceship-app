import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { feedbackFor } from '@/src/hints/hintEngine';
import { useStepHints } from '@/src/hints/useStepHints';
import { PLACE_NAMES, type AreaProblem, type AreaSlot, type Col, type Row } from '@/src/data/problems/prep';
import { playSound } from '@/src/sound/sounds';
import type { StatKey } from '@/src/storage/progress';
import { colors, radii } from '@/src/theme/colors';
import { fonts } from '@/src/theme/typography';
import { Button } from '../ui/Button';
import { Feedback, type Tone } from '../ui/Feedback';
import { HelpButton } from '../ui/HelpButton';
import { Screen } from '../ui/Screen';
import { TopBar } from '../ui/TopBar';
import { CurvedLink } from './Bars';
import { DndProvider, Draggable, DropZone } from './DragDrop';

const key = (row: Row, col: Col) => `${row}-${col}`;

type Props = {
  problem: AreaProblem;
  stat: StatKey;
  title: string;
  subtitle?: string;
  /** ask "ناتج القسمة هو؟" (multiple choice) after the model is complete */
  withChoice: boolean;
  onBack: () => void;
  /** completed (and answered the multiple choice when asked) */
  onSuccess: () => void;
  /** solution was shown → a new problem must be solved */
  onRetry: () => void;
  successButton?: string;
};

/**
 * Preparatory level – phase 2: area model split into hundreds / tens / ones.
 * The child fills the glowing slot each time (quotient part → product → subtraction → carry).
 */
export function Phase2Game({ problem, stat, title, subtitle, withChoice, onBack, onSuccess, onRetry, successButton }: Props) {
  const { width } = useWindowDimensions();
  const wide = width >= 760;
  const { hints, mode, wrong, correct, help, helpOn } = useStepHints(stat);
  const [step, setStep] = useState(0);
  const [solved, setSolved] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [msg, setMsg] = useState<{ text: string; tone: Tone }>({
    text: 'اسحب الرقم المناسب إلى الخانة المضيئة ✨ (أو اضغط الرقم مباشرة)',
    tone: 'info',
  });
  const [choice, setChoice] = useState<{ wrong: number[]; done: boolean }>({ wrong: [], done: false });

  const slots = problem.slots;
  const finished = step >= slots.length;
  const active: AreaSlot | null = finished || solved ? null : slots[step];
  const filled = useMemo(() => {
    const m = new Map<string, number>();
    slots.forEach((s, i) => {
      if (i < step || solved) m.set(key(s.row, s.col), s.value);
    });
    m.set(key('partial', 0), problem.dividend);
    return m;
  }, [slots, step, solved, problem.dividend]);

  // Hint 2: narrow the choices to 3 numbers (the right one + 2 neighbours)
  const narrowed = useMemo(() => {
    if (!active || hints.shown < 2) return null;
    const others = problem.tiles
      .filter((t) => t !== active.value)
      .sort((a, b) => Math.abs(a - active.value) - Math.abs(b - active.value))
      .slice(0, 2);
    return new Set([active.value, ...others]);
  }, [active, hints.shown, problem.tiles]);

  function onDrop(tile: number, zone: string) {
    if (!active || solved) return;
    if (zone !== key(active.row, active.col)) {
      setMsg({ text: 'املأ الخانة المضيئة أولًا ✨', tone: 'info' });
      return;
    }
    if (tile === active.value) {
      correct();
      const next = step + 1;
      setStep(next);
      if (next >= slots.length) {
        setMsg({
          text: withChoice ? 'أحسنت! أكملت النموذج. أجب عن السؤال الأخير 👇' : 'رائع! أكملت نموذج المستطيل بنجاح 🎉',
          tone: 'success',
        });
      } else {
        setMsg({ text: praise(next), tone: 'success' });
      }
      return;
    }
    const h = wrong();
    if (h.solved) {
      setSolved(true);
      setMsg({ text: 'إليك الحل كاملًا 👀 ادرسه جيدًا، ثم كرر المغامرة بمسألة جديدة لتأكيد فهمك', tone: 'error' });
      return;
    }
    setMsg({ text: feedbackFor(h, mode), tone: h.shown > 0 ? 'hint' : 'error' });
  }

  const hint1 = active && hints.shown >= 1 ? active : null;
  const glowSlot = active && hints.shown >= 2 ? key(active.row, active.col) : null;
  const linkCells = hint1 ? linkedCells(hint1) : [];

  const board = (
    <View style={styles.boardCard}>
      <AreaBoard
        problem={problem}
        filled={filled}
        active={active}
        glowSlot={glowSlot}
        linkCells={linkCells}
        hintRow={hint1?.row ?? null}
        hintCol={hint1?.col ?? null}
        divisorGlow={hint1?.row === 'product'}
      />
    </View>
  );

  const palette =
    !finished && !solved ? (
      <View style={[styles.palette, wide && styles.paletteWide]}>
        <Text style={styles.paletteTitle}>لوحة الأرقام</Text>
        <View style={styles.tiles}>
          {problem.tiles.map((t) => {
            const dim = narrowed ? !narrowed.has(t) : false;
            const lit = narrowed ? narrowed.has(t) : false;
            return (
              <Draggable key={t} item={t} disabled={dim} style={styles.tileWrap}>
                {({ dragging: lifted }) => (
                  <View style={[styles.tile, lit && styles.tileLit, dim && styles.tileDim, lifted && styles.tileLifted]}>
                    <Text style={styles.tileText}>{t}</Text>
                  </View>
                )}
              </Draggable>
            );
          })}
        </View>
      </View>
    ) : null;

  return (
    <DndProvider<number> onDrop={onDrop} onDragChange={setDragging} autoTarget={active ? key(active.row, active.col) : null}>
      <Screen
        scroll
        scrollEnabled={!dragging}
        maxWidth={wide ? 980 : 560}
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

        {wide ? (
          <View style={styles.wideRow}>
            <View style={{ flex: 1.4 }}>{board}</View>
            <View style={{ flex: 1 }}>{palette}</View>
          </View>
        ) : (
          <>
            {board}
            {palette}
          </>
        )}

        <View style={{ marginTop: 12 }}>
          <Feedback message={msg.text} tone={msg.tone} />
        </View>

        {hint1 ? <RowHint slot={hint1} problem={problem} level={hints.shown} /> : null}

        {solved ? <Button title="كرر المغامرة بمسألة جديدة" icon="🔁" onPress={onRetry} style={{ marginTop: 14 }} /> : null}

        {finished && !solved && !withChoice ? (
          <Button title={successButton ?? 'تابع'} icon="🚀" variant="success" onPress={onSuccess} style={{ marginTop: 14 }} />
        ) : null}

        {finished && !solved && withChoice ? (
          <ChoiceQuestion
            problem={problem}
            state={choice}
            onPick={(v) => {
              if (choice.done) return;
              if (v === problem.mc.answer) {
                playSound('correct');
                setChoice({ ...choice, done: true });
                setMsg({ text: `أحسنت! ناتج القسمة هو ${problem.quotient} 🌟`, tone: 'success' });
              } else {
                playSound('hint');
                const w = [...choice.wrong, v];
                setChoice({ ...choice, wrong: w });
                setMsg({
                  text: w.length === 1 ? 'اجمع أجزاء ناتج القسمة الموجودة أعلى المستطيل 👇' : 'اختر من بين الرقمين المضيئين 👇',
                  tone: 'hint',
                });
              }
            }}
            onDone={onSuccess}
            successButton={successButton}
          />
        ) : null}
      </Screen>
    </DndProvider>
  );
}

function praise(i: number) {
  const list = ['أحسنت! ✅', 'رائع يا بطل! ⭐', 'ممتاز! استمر 🚀', 'إجابة صحيحة 👏'];
  return `${list[i % list.length]} انتقل للخانة المضيئة التالية`;
}

/** Cells to light for hint 1 of each row type */
function linkedCells(s: AreaSlot): string[] {
  if (s.row === 'partial') return [key('rest', (s.col - 1) as Col)];
  if (s.row === 'product') return [key('top', s.col)];
  if (s.row === 'rest') return [key('partial', s.col), key('product', s.col)];
  return [];
}

/* ---------------- Board ---------------- */

function AreaBoard({
  problem,
  filled,
  active,
  glowSlot,
  linkCells,
  hintRow,
  hintCol,
  divisorGlow,
}: {
  problem: AreaProblem;
  filled: Map<string, number>;
  active: AreaSlot | null;
  glowSlot: string | null;
  linkCells: string[];
  hintRow: Row | null;
  hintCol: Col | null;
  divisorGlow: boolean;
}) {
  const cols: Col[] = [0, 1, 2];
  const rows: Row[] = ['partial', 'product', 'rest'];
  return (
    <View style={styles.board}>
      <View style={styles.boardRow}>
        <View style={styles.divCol} />
        {cols.map((c) => (
          <View key={c} style={styles.colHead}>
            <Text style={[styles.placeName, hintRow === 'top' && hintCol === c && styles.placeNameHint]}>
              {hintRow === 'top' && hintCol === c ? `👇 ${PLACE_NAMES[c]}` : PLACE_NAMES[c]}
            </Text>
          </View>
        ))}
      </View>
      <View style={styles.boardRow}>
        <View style={styles.divCol} />
        {cols.map((c) => (
          <Cell key={c} id={key('top', c)} value={filled.get(key('top', c))} active={active} glowSlot={glowSlot} link={linkCells} top />
        ))}
      </View>
      <View style={styles.boardRow}>
        <View style={styles.divCol}>
          <View style={[styles.divisor, divisorGlow && styles.divisorGlow]}>
            <Text style={styles.divisorText}>{problem.divisor}</Text>
          </View>
        </View>
        <View style={styles.rect}>
          {rows.map((r, ri) => (
            <View key={r} style={[styles.rectRow, ri < 2 && styles.rectRowLine]}>
              {cols.map((c) => (
                <View key={c} style={[styles.rectCell, c < 2 && styles.rectCellLine]}>
                  {r === 'product' ? <Text style={styles.sign}>−</Text> : null}
                  <Cell
                    id={key(r, c)}
                    value={filled.get(key(r, c))}
                    active={active}
                    glowSlot={glowSlot}
                    link={linkCells}
                    fixed={r === 'partial' && c === 0}
                  />
                </View>
              ))}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function Cell({
  id,
  value,
  active,
  glowSlot,
  link,
  top,
  fixed,
}: {
  id: string;
  value?: number;
  active: AreaSlot | null;
  glowSlot: string | null;
  link: string[];
  top?: boolean;
  fixed?: boolean;
}) {
  const isActive = active && key(active.row, active.col) === id;
  const isLinked = link.includes(id);
  if (value !== undefined) {
    return (
      <View style={[styles.cell, top ? styles.cellTopFilled : styles.cellFilled, fixed && styles.cellFixed, isLinked && styles.cellLinked]}>
        <Text style={[styles.cellText, top && { color: colors.white }]} numberOfLines={1} adjustsFontSizeToFit>
          {value}
        </Text>
      </View>
    );
  }
  return (
    <DropZone id={id} disabled={!isActive} style={styles.cellZone}>
      {({ hovered }) => (
        <View
          style={[
            styles.cell,
            styles.cellEmpty,
            isActive && styles.cellActive,
            isActive && hovered && styles.cellHover,
            glowSlot === id && styles.cellGlow,
          ]}
        >
          <Text style={[styles.cellText, { color: isActive ? colors.grapeDeep : colors.paperLine }]}>{isActive ? '؟' : '…'}</Text>
        </View>
      )}
    </DropZone>
  );
}

/* ---------------- Hints under the board ---------------- */

function RowHint({ slot, problem, level }: { slot: AreaSlot; problem: AreaProblem; level: number }) {
  let title = '';
  let body: ReactNode = null;
  const col = slot.col;
  if (slot.row === 'top') {
    title = `هذه خانة ${PLACE_NAMES[col]}`;
    const example = col === 0 ? 'رقمًا بصفرين مثل 300' : col === 1 ? 'رقمًا بصفر واحد مثل 30' : 'رقمًا من خانة واحدة مثل 3';
    body = <Text style={styles.hintBody}>السهم 👇 يشير إلى خانة {PLACE_NAMES[col]}، وهي تحتاج {example}.</Text>;
  } else if (slot.row === 'partial') {
    title = 'انظر إلى الخانة المضيئة بالأصفر';
    body = <Text style={styles.hintBody}>الرقم المطلوب = نفس الرقم الباقي من الخانة السابقة (المضيء بالأصفر)</Text>;
  } else if (slot.row === 'product') {
    const part = problem.parts[col];
    title = 'اضرب';
    body = <CurvedLink from={String(problem.divisor)} to={String(part)} op="×" width={230} />;
  } else {
    const part = problem.slots.find((s) => s.row === 'partial' && s.col === col)?.value ?? problem.dividend;
    const prod = problem.slots.find((s) => s.row === 'product' && s.col === col)?.value ?? 0;
    title = 'اطرح';
    body = <CurvedLink from={String(part)} to={String(prod)} op="−" width={230} color={colors.coral} />;
  }
  return (
    <View style={styles.hintCard}>
      <Text style={styles.hintTitle}>💡 {title}</Text>
      <View style={{ alignItems: 'center' }}>{body}</View>
      {level >= 2 ? <Text style={styles.hintBody}>اختر الرقم المناسب لهذه الخانة من بين الأرقام المضيئة 🟩</Text> : null}
    </View>
  );
}

/* ---------------- Multiple choice: "ناتج القسمة هو" ---------------- */

function ChoiceQuestion({
  problem,
  state,
  onPick,
  onDone,
  successButton,
}: {
  problem: AreaProblem;
  state: { wrong: number[]; done: boolean };
  onPick: (v: number) => void;
  onDone: () => void;
  successButton?: string;
}) {
  // 1st mistake: show the addition of the quotient parts.
  // 2nd mistake: narrow the choice to 2 lit options (the answer + one other).
  const other = problem.mc.options.find((o) => o !== problem.mc.answer && o !== state.wrong[state.wrong.length - 1]);
  const litSet = state.wrong.length >= 2 ? new Set([problem.mc.answer, other ?? -1]) : null;
  const last = state.wrong[state.wrong.length - 1];
  return (
    <View style={styles.mcCard}>
      <Text style={styles.mcTitle}>ناتج القسمة هو:</Text>
      {state.wrong.length >= 1 && !state.done ? (
        <View style={styles.sumRow}>
          <Text style={styles.sumText}>{problem.parts.join('  +  ')}  =  ؟</Text>
        </View>
      ) : null}
      <View style={styles.mcRow}>
        {problem.mc.options.map((o) => {
          const isWrong = !state.done && o === last;
          const isRight = state.done && o === problem.mc.answer;
          const dimmed = !state.done && !!litSet && !litSet.has(o);
          const lit = !state.done && !!litSet && litSet.has(o) && !isWrong;
          return (
            <Pressable
              key={o}
              onPress={() => onPick(o)}
              disabled={state.done || dimmed}
              style={[styles.mcOpt, isWrong && styles.mcWrong, isRight && styles.mcRight, lit && styles.mcLit, dimmed && { opacity: 0.2 }]}
              accessibilityRole="button"
            >
              <Text style={[styles.mcText, (isRight || isWrong) && { color: colors.white }]}>{o}</Text>
            </Pressable>
          );
        })}
      </View>
      {state.done ? <Button title={successButton ?? 'تابع'} icon="🚀" variant="success" onPress={onDone} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  problem: { fontFamily: fonts.black, color: colors.white, fontSize: 30, lineHeight: 44, textAlign: 'center', marginBottom: 8 },
  wideRow: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  boardCard: { backgroundColor: colors.white, borderRadius: radii.xl, padding: 10, borderWidth: 3, borderColor: colors.paperLine },
  board: { gap: 4 },
  boardRow: { flexDirection: 'row', alignItems: 'stretch', gap: 4 },
  divCol: { width: 46, alignItems: 'center', justifyContent: 'flex-start' },
  colHead: { flex: 1, alignItems: 'center' },
  placeName: { fontFamily: fonts.black, fontSize: 14, color: colors.inkSoft },
  placeNameHint: { color: colors.white, backgroundColor: colors.sunDeep, borderRadius: 8, paddingHorizontal: 6, overflow: 'hidden' },
  divisor: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: colors.seaDeep,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  divisorGlow: { backgroundColor: colors.grape, transform: [{ scale: 1.1 }] },
  divisorText: { fontFamily: fonts.black, color: colors.white, fontSize: 22 },
  rect: { flex: 1, borderWidth: 3, borderColor: colors.seaDeep, borderRadius: 12, backgroundColor: colors.seaSoft, overflow: 'hidden' },
  rectRow: { flexDirection: 'row' },
  rectRowLine: { borderBottomWidth: 1.5, borderBottomColor: '#9CD8F5' },
  rectCell: { flex: 1, padding: 4, flexDirection: 'row', alignItems: 'center' },
  rectCellLine: { borderRightWidth: 1.5, borderRightColor: '#9CD8F5' },
  sign: { fontFamily: fonts.black, color: colors.coral, fontSize: 16, width: 10 },
  cellZone: { flex: 1 },
  cell: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  cellEmpty: { borderWidth: 2, borderStyle: 'dashed', borderColor: '#B7C6E8', backgroundColor: 'rgba(255,255,255,0.6)' },
  cellActive: { borderStyle: 'solid', borderColor: colors.grape, backgroundColor: colors.grapeSoft, borderWidth: 3 },
  cellHover: { backgroundColor: '#D9CCFF', transform: [{ scale: 1.05 }] },
  cellGlow: { borderColor: colors.mintDeep, backgroundColor: '#BBF7D0' },
  cellFilled: { backgroundColor: colors.white, borderWidth: 2, borderColor: '#C7E9FB' },
  cellTopFilled: { backgroundColor: colors.peach },
  cellFixed: { backgroundColor: colors.white, borderColor: colors.seaDeep },
  cellLinked: { backgroundColor: colors.sun, borderColor: colors.sunDeep, borderWidth: 3 },
  cellText: { fontFamily: fonts.black, fontSize: 19, color: colors.ink },
  palette: { marginTop: 12, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: radii.lg, padding: 10, borderWidth: 1, borderColor: colors.glassLine },
  paletteWide: { marginTop: 0 },
  paletteTitle: { fontFamily: fonts.black, color: colors.white, fontSize: 15, textAlign: 'center', marginBottom: 8 },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  tileWrap: {},
  tile: {
    width: 72,
    height: 50,
    borderRadius: radii.sm,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 4,
    borderBottomColor: colors.paperLine,
  },
  tileLit: { backgroundColor: '#BBF7D0', borderBottomColor: colors.mintDeep, borderWidth: 2, borderColor: colors.mint },
  tileDim: { opacity: 0.18 },
  tileLifted: { shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 10, shadowOffset: { width: 0, height: 6 } },
  tileText: { fontFamily: fonts.black, fontSize: 20, color: colors.ink },
  hintCard: { marginTop: 10, backgroundColor: colors.sunSoft, borderRadius: radii.lg, borderWidth: 2, borderColor: colors.sun, padding: 12, gap: 6 },
  hintTitle: { fontFamily: fonts.black, color: '#7A4B00', fontSize: 15, textAlign: 'center' },
  hintBody: { fontFamily: fonts.bold, color: '#7A4B00', fontSize: 14, lineHeight: 22, textAlign: 'center' },
  mcCard: { marginTop: 14, backgroundColor: colors.white, borderRadius: radii.xl, padding: 14, gap: 12 },
  mcTitle: { fontFamily: fonts.black, color: colors.ink, fontSize: 20, textAlign: 'center' },
  sumRow: { backgroundColor: colors.sunSoft, borderRadius: radii.md, padding: 8, borderWidth: 2, borderColor: colors.sun },
  sumText: { fontFamily: fonts.black, color: colors.ink, fontSize: 20, textAlign: 'center' },
  mcRow: { flexDirection: 'row', gap: 10, justifyContent: 'center' },
  mcOpt: {
    flex: 1,
    maxWidth: 120,
    height: 60,
    borderRadius: radii.md,
    backgroundColor: colors.paperSoft,
    borderWidth: 3,
    borderColor: colors.paperLine,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mcWrong: { backgroundColor: colors.coral, borderColor: colors.coral, opacity: 0.6 },
  mcRight: { backgroundColor: colors.mint, borderColor: colors.mintDeep },
  mcLit: { borderColor: colors.mint, backgroundColor: '#BBF7D0' },
  mcText: { fontFamily: fonts.black, fontSize: 24, color: colors.ink },
});
