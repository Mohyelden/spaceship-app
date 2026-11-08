import { useEffect, useState, type ReactNode } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { feedbackFor } from '@/src/hints/hintEngine';
import { useStepHints } from '@/src/hints/useStepHints';
import { SCREENS, STEP_INFO, type CabinStep, type DivisionProblem } from '@/src/data/problems/division';
import { playSound } from '@/src/sound/sounds';
import type { StatKey } from '@/src/storage/progress';
import { colors, groupColors, radii } from '@/src/theme/colors';
import { fonts } from '@/src/theme/typography';
import { Confetti } from '../Celebration';
import { Button } from '../ui/Button';
import { Feedback, type Tone } from '../ui/Feedback';
import { HelpButton } from '../ui/HelpButton';
import { Screen } from '../ui/Screen';
import { TopBar } from '../ui/TopBar';
import { Bars, CurvedLink } from './Bars';
import { NumberPad } from './NumberPad';

type Pos = { c: number; s: CabinStep };

function stepsFor(p: DivisionProblem, c: number): CabinStep[] {
  const list: CabinStep[] = c === 0 ? ['start', 'divide', 'multiply', 'subtract'] : ['divide', 'multiply', 'subtract'];
  if (p.cycles[c].bringIdx !== null) list.push('bringDown');
  return list;
}

function expected(p: DivisionProblem, { c, s }: Pos): number {
  const cy = p.cycles[c];
  switch (s) {
    case 'start':
      return p.cycles[0].working;
    case 'divide':
      return cy.digit;
    case 'multiply':
      return cy.product;
    case 'subtract':
      return cy.remainder;
    default:
      return cy.bringDigit ?? 0;
  }
}

const ORDER: Record<CabinStep, number> = { start: 0, divide: 1, multiply: 2, subtract: 3, bringDown: 4 };
/** has step `s` of cycle `c` already been answered at position `pos`? */
const passed = (pos: Pos | null, c: number, s: CabinStep) =>
  pos === null || pos.c > c || (pos.c === c && ORDER[pos.s] > ORDER[s]);

type Props = {
  problem: DivisionProblem;
  stat: StatKey;
  title: string;
  subtitle?: string;
  twoDigit?: boolean;
  onBack: () => void;
  onSuccess: () => void;
  onRetry: () => void;
  successButton?: string;
  retryButton?: string;
};

/**
 * Levels 1 & 2: the ship cabin with 4 computer screens (اقسم، اضرب، اطرح، نزّل).
 * Screens light up step by step and turn bright green only when the problem reaches 0.
 */
export function CabinGame({
  problem,
  stat,
  title,
  subtitle,
  twoDigit,
  onBack,
  onSuccess,
  onRetry,
  successButton = 'استلم نجمتك ⭐',
  retryButton = 'كرر المغامرة بمسألة جديدة',
}: Props) {
  const { width } = useWindowDimensions();
  const wide = width >= 820;
  const { hints, mode, wrong, correct, help, helpOn } = useStepHints(stat);
  const [pos, setPos] = useState<Pos | null>({ c: 0, s: 'start' });
  const [input, setInput] = useState('');
  const [solved, setSolved] = useState(false);
  const [msg, setMsg] = useState<{ text: string; tone: Tone }>({
    text: twoDigit
      ? 'المقسوم عليه مكوّن من رقمين! من أين نبدأ القسمة؟'
      : 'مرحبًا بك في الكابينة! لنبدأ بشاشة «اقسم»',
    tone: 'info',
  });

  const finished = pos === null && !solved;
  const p = problem;

  function advance(from: Pos) {
    const list = stepsFor(p, from.c);
    const i = list.indexOf(from.s);
    if (i < list.length - 1) return { c: from.c, s: list[i + 1] } as Pos;
    if (from.c + 1 < p.cycles.length) return { c: from.c + 1, s: 'divide' } as Pos;
    return null;
  }

  function submit() {
    if (!pos || solved) return;
    const val = Number(input);
    const exp = expected(p, pos);
    if (val === exp) {
      correct();
      const next = advance(pos);
      setInput('');
      setPos(next);
      setMsg({ text: successText(p, pos), tone: 'success' });
      if (next === null) playSound('win');
      return;
    }
    const h = wrong();
    setInput('');
    if (h.solved) {
      setSolved(true);
      setPos(null);
      setMsg({ text: 'لا بأس يا بطل! هذا هو الحل كاملًا 👀 شاهده جيدًا ثم كرر المغامرة بمسألة جديدة', tone: 'error' });
      return;
    }
    setMsg({ text: feedbackFor(h, mode), tone: h.shown > 0 ? 'hint' : 'error' });
  }

  const level = pos ? hints.shown : 0;
  const screenIdx = pos ? (pos.s === 'start' ? 0 : SCREENS.indexOf(pos.s as never)) : -1;

  const board = (
    <View style={styles.boardCard}>
      <LongDivision problem={p} pos={pos} solved={solved} hintLevel={level} twoDigit={twoDigit} input={input} />
    </View>
  );

  const question = pos ? (
    <View style={styles.qCard}>
      <Text style={styles.qText}>{questionText(p, pos, twoDigit)}</Text>
      <View style={styles.answerBox}>
        <Text style={[styles.answerText, !input && { color: colors.inkMuted }]}>{input || '؟'}</Text>
      </View>
    </View>
  ) : null;

  const hintPanel =
    pos && level > 0 ? <HintPanel problem={p} pos={pos} level={level} width={Math.min(width, wide ? 520 : 560) - 64} /> : null;

  const pad = pos ? <NumberPad value={input} onChange={setInput} onSubmit={submit} maxLength={4} /> : null;

  return (
    <Screen
      scroll
      autoScrollKey={wide ? undefined : `${pos?.c}-${pos?.s}-${level}-${solved}`}
      maxWidth={wide ? 1000 : 560}
      footer={
        !wide && pos ? (
          <View style={{ gap: 8 }}>
            {question}
            {pad}
          </View>
        ) : undefined
      }
      header={
        <TopBar
          title={title}
          subtitle={subtitle}
          onBack={onBack}
          left={mode === 'on_demand' ? <HelpButton enabled={helpOn} onPress={() => setMsg({ text: feedbackFor(help(), mode), tone: 'hint' })} /> : null}
        />
      }
    >
      {finished ? <Confetti /> : null}
      <Monitors active={screenIdx} pos={pos} problem={p} allGreen={finished} />

      {wide ? (
        <View style={styles.wideRow}>
          <View style={{ flex: 1, gap: 12 }}>
            {board}
            {hintPanel}
          </View>
          <View style={{ width: 420, gap: 12 }}>
            <Feedback message={msg.text} tone={msg.tone} />
            {question}
            {pad}
          </View>
        </View>
      ) : (
        <View style={{ gap: 12 }}>
          {board}
          <Feedback message={msg.text} tone={msg.tone} />
          {hintPanel}
        </View>
      )}

      {finished ? (
        <View style={{ marginTop: 14, gap: 10 }}>
          <Text style={styles.fixed}>🛠️ تم تصفير المسألة وإصلاح المحرك!</Text>
          <Button title={successButton} variant="success" onPress={onSuccess} />
        </View>
      ) : null}
      {solved ? <Button title={retryButton} icon="🔁" onPress={onRetry} style={{ marginTop: 14 }} /> : null}
    </Screen>
  );
}

/* ---------------- texts ---------------- */

function questionText(p: DivisionProblem, pos: Pos, twoDigit?: boolean) {
  const cy = p.cycles[pos.c];
  switch (pos.s) {
    case 'start':
      return twoDigit
        ? `من أين نبدأ القسمة؟ اكتب الرقم أو الرقمين الأولين من ${p.dividend} اللذين نقسمهما على ${p.divisor}`
        : `من أين نبدأ القسمة؟ اكتب الرقم الذي نبدأ به من ${p.dividend}`;
    case 'divide':
      return `اقسم: كم مرة يدخل ${p.divisor} في ${cy.working} دون أن يتجاوزه؟`;
    case 'multiply':
      return `اضرب: ${cy.digit} × ${p.divisor} = ؟`;
    case 'subtract':
      return `اطرح: ${cy.working} − ${cy.product} = ؟`;
    default:
      return `نزّل: ما الرقم الذي ننزله بجوار الباقي ${cy.remainder}؟`;
  }
}

function successText(p: DivisionProblem, pos: Pos) {
  const cy = p.cycles[pos.c];
  switch (pos.s) {
    case 'start':
      return 'أحسنت! الآن نبدأ القسمة ➗';
    case 'divide':
      return `أحسنت! كتبنا ${cy.digit} في ناتج القسمة. انتقل لشاشة «اضرب» ✖️`;
    case 'multiply':
      return `ممتاز! ${cy.digit} × ${p.divisor} = ${cy.product}. انتقل لشاشة «اطرح» ➖`;
    case 'subtract':
      return cy.bringIdx === null
        ? `رائع! الباقي ${cy.remainder}، تم تصفير المسألة 🎉`
        : `رائع! الباقي ${cy.remainder}. انتقل لشاشة «نزّل» ⬇️`;
    default:
      return `أحسنت! تكوّن العدد الجديد ${cy.nextWorking}. نعود لشاشة «اقسم» ➗`;
  }
}

/* ---------------- 4 cabin screens ---------------- */

function Monitors({ active, pos, problem, allGreen }: { active: number; pos: Pos | null; problem: DivisionProblem; allGreen: boolean }) {
  return (
    <View style={styles.monitors}>
      {SCREENS.map((s, i) => {
        const done = !allGreen && pos !== null && pos.s !== 'start' && i < active;
        const isActive = i === active;
        const na = s === 'bringDown' && pos !== null && problem.cycles[pos.c].bringIdx === null;
        return (
          <View
            key={s}
            style={[
              styles.monitor,
              done && styles.monitorDone,
              isActive && styles.monitorActive,
              allGreen && styles.monitorGreen,
              na && { opacity: 0.4 },
            ]}
          >
            <View style={[styles.monitorScreen, (done || isActive || allGreen) && styles.monitorScreenOn, allGreen && { backgroundColor: '#86EFAC' }]}>
              <Text style={styles.monitorIcon}>{STEP_INFO[s].icon}</Text>
            </View>
            <Text style={[styles.monitorLabel, (isActive || allGreen) && { color: colors.white }]}>
              {i + 1}. {STEP_INFO[s].label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

/* ---------------- Long division board ---------------- */

type CellStyle = 'normal' | 'active' | 'q' | 'glow' | 'used' | 'link' | 'arrow';

function LongDivision({
  problem: p,
  pos,
  solved,
  hintLevel,
  twoDigit,
  input,
}: {
  problem: DivisionProblem;
  pos: Pos | null;
  solved: boolean;
  hintLevel: number;
  twoDigit?: boolean;
  input: string;
}) {
  const { width } = useWindowDimensions();
  const n = p.digits.length;
  const cw = Math.max(34, Math.min(50, Math.floor((Math.min(width, 520) - 150) / n)));
  const [sweep, setSweep] = useState(0);

  const startHint = pos?.s === 'start' ? hintLevel : 0;
  useEffect(() => {
    if (startHint < 2) return;
    const id = setInterval(() => setSweep((v) => (v + 1) % (n + 2)), 550);
    return () => clearInterval(id);
  }, [startHint, n]);

  type R = { cells: (string | null)[]; styles: CellStyle[]; sign?: string; line?: boolean };
  const blank = (): R => ({ cells: Array(n).fill(null), styles: Array(n).fill('normal') });
  const put = (r: R, num: number | string, endIdx: number, st: CellStyle = 'normal') => {
    const s = String(num);
    for (let i = 0; i < s.length; i++) {
      const col = endIdx - (s.length - 1 - i);
      if (col >= 0) {
        r.cells[col] = s[i];
        r.styles[col] = st;
      }
    }
  };
  const activeBox = (r: R, endIdx: number, len: number) => {
    const typed = input.slice(-len);
    for (let i = 0; i < len; i++) {
      const col = endIdx - (len - 1 - i);
      if (col >= 0) {
        const ch = typed.length ? typed[typed.length - (len - i)] : undefined;
        r.cells[col] = ch ?? (i === len - 1 ? '؟' : '');
        r.styles[col] = hintLevel >= 2 ? 'glow' : 'active';
      }
    }
  };

  const q = blank();
  const dividend = blank();
  p.digits.forEach((d, i) => (dividend.cells[i] = String(d)));
  const work: R[] = [];

  // start-step hints
  if (pos?.s === 'start' && startHint >= 2) {
    // light the digits one after the other from the left; with a 2-digit divisor the
    // first two digits light up together (same color) because we take them together
    const k = twoDigit ? String(p.cycles[0].working).length : 1;
    p.digits.forEach((_, i) => {
      const group = i < k ? 0 : i - k + 1;
      if (sweep > group) dividend.styles[i] = `sweep${group}` as CellStyle;
    });
  }

  p.cycles.forEach((cy, k) => {
    if (pos && pos.c < k && !solved) return;
    // quotient digit
    if (solved || passed(pos, k, 'divide')) put(q, cy.digit, cy.endIdx, 'q');
    else if (pos && pos.c === k && pos.s === 'divide') activeBox(q, cy.endIdx, 1);

    const prod = blank();
    prod.sign = '−';
    if (solved || passed(pos, k, 'multiply')) put(prod, cy.product, cy.endIdx);
    else if (pos && pos.c === k && pos.s === 'multiply') activeBox(prod, cy.endIdx, String(cy.product).length);
    else return;

    prod.line = true;
    const rem = blank();
    if (solved || passed(pos, k, 'subtract')) {
      put(rem, cy.remainder, cy.endIdx);
      if (cy.bringIdx !== null) {
        if (solved || passed(pos, k, 'bringDown')) put(rem, cy.bringDigit!, cy.bringIdx, 'used');
        else if (pos && pos.c === k && pos.s === 'bringDown') {
          if (hintLevel >= 1) {
            rem.cells[cy.bringIdx] = hintLevel >= 2 ? '؟' : '⇣';
            rem.styles[cy.bringIdx] = hintLevel >= 2 ? 'glow' : 'arrow';
            // dashed path from the digit down to its new place
            prod.cells[cy.bringIdx] = '┊';
            prod.styles[cy.bringIdx] = 'arrow';
            work.forEach((w) => {
              if (w.cells[cy.bringIdx!] === null) {
                w.cells[cy.bringIdx!] = '┊';
                w.styles[cy.bringIdx!] = 'arrow';
              }
            });
            dividend.styles[cy.bringIdx] = hintLevel >= 2 ? 'glow' : 'link';
            if (hintLevel >= 2) for (let i = 0; i < cy.bringIdx; i++) dividend.styles[i] = 'used';
          } else {
            rem.cells[cy.bringIdx] = '؟';
            rem.styles[cy.bringIdx] = 'active';
          }
        }
      }
    } else if (pos && pos.c === k && pos.s === 'subtract') {
      activeBox(rem, cy.endIdx, String(cy.remainder).length);
    }
    work.push(prod);
    if (rem.cells.some((c) => c !== null)) work.push(rem);
  });

  // multiply hint 1: light the quotient digit + the divisor
  const linkDivisor = !!pos && pos.s === 'multiply' && hintLevel >= 1;
  if (linkDivisor && pos) {
    const cyc = p.cycles[pos.c];
    q.styles[cyc.endIdx] = 'link';
  }
  // divide/subtract: light the working number
  if (pos && (pos.s === 'divide' || pos.s === 'subtract') && hintLevel >= 1) {
    const cyc = p.cycles[pos.c];
    const target = pos.c === 0 ? dividend : work[(pos.c - 1) * 2 + 1];
    const len = String(cyc.working).length;
    if (target) for (let i = 0; i < len; i++) if (target.styles[cyc.endIdx - i] !== undefined && target.cells[cyc.endIdx - i] !== null) target.styles[cyc.endIdx - i] = 'link';
  }

  const startArrow = pos?.s === 'start' && startHint >= 1;
  const arrowSpan = twoDigit ? String(p.cycles[0].working).length : n;

  const renderRow = (r: R, key: string, opts: { divisor?: boolean; bracket?: boolean } = {}) => (
    <View key={key} style={styles.ldRow}>
      <View style={[styles.ldLeft, { width: 70 }]}>
        {opts.divisor ? (
          <View style={[styles.ldDivisor, linkDivisor && styles.ldDivisorLink]}>
            <Text style={styles.ldDivisorText}>{p.divisor}</Text>
          </View>
        ) : r.sign ? (
          <Text style={styles.ldSign}>{r.sign}</Text>
        ) : null}
      </View>
      <View style={[styles.ldCells, opts.bracket && styles.ldBracket, r.line && styles.ldLine]}>
        {r.cells.map((ch, i) => (
          <View key={i} style={[styles.ldCell, { width: cw }, cellStyle(r.styles[i])]}>
            <Text style={[styles.ldText, textStyle(r.styles[i])]}>{ch ?? ''}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.ld}>
      {startArrow ? (
        <View style={styles.ldRow}>
          <View style={{ width: 70 }} />
          <View style={[styles.readArrow, { width: cw * arrowSpan }]}>
            <View style={styles.readArrowLine} />
            <Text style={styles.readArrowHead}>▶</Text>
          </View>
        </View>
      ) : null}
      {renderRow(q, 'q')}
      {renderRow(dividend, 'd', { divisor: true, bracket: true })}
      {work.map((r, i) => renderRow(r, `w${i}`))}
    </View>
  );
}

function cellStyle(s: CellStyle | string) {
  if (s.startsWith('sweep')) {
    const g = Number(s.slice(5));
    return { backgroundColor: groupColors[g % groupColors.length], borderRadius: 8 };
  }
  switch (s) {
    case 'active':
      return { backgroundColor: colors.grapeSoft, borderWidth: 3, borderColor: colors.grape, borderRadius: 8 };
    case 'glow':
      return { backgroundColor: '#BBF7D0', borderWidth: 3, borderColor: colors.mintDeep, borderRadius: 8 };
    case 'link':
      return { backgroundColor: colors.sun, borderRadius: 8 };
    case 'used':
      return { backgroundColor: colors.seaSoft, borderRadius: 8 };
    default:
      return null;
  }
}

function textStyle(s: CellStyle | string) {
  if (s === 'q') return { color: colors.peach };
  if (s === 'arrow') return { color: colors.grape };
  if (s.startsWith('sweep')) return { color: colors.white };
  return null;
}

/* ---------------- Hint visuals (rulers, arrows) ---------------- */

function HintPanel({ problem: p, pos, level, width }: { problem: DivisionProblem; pos: Pos; level: number; width: number }) {
  const cy = p.cycles[pos.c];
  const d = p.divisor;
  let title = '';
  let body: ReactNode = null;

  switch (pos.s) {
    case 'start':
      title = level >= 2 ? 'تابع الألوان على أرقام المقسوم من اليسار' : 'اقرأ المقسوم من اليسار إلى اليمين ▶';
      body = (
        <Text style={styles.hintText}>
          {p.divisor >= 10
            ? `المقسوم عليه (${d}) مكوّن من رقمين، لذلك نأخذ رقمين معًا من اليسار.`
            : 'نبدأ دائمًا بأول رقم من جهة اليسار.'}
        </Text>
      );
      break;
    case 'divide': {
      const W = cy.working;
      if (level === 1) {
        title = `مسطرة طولها ${W} مقسّمة إلى أجزاء كل منها ${d}`;
        body = <Bars width={width} bars={[{ outline: W, tickEvery: d, arrow: true, label: String(W) }]} />;
      } else {
        title = `لوّنّا كل ${d} بلون: كم جزءًا ملوّنًا؟`;
        const segs = Array.from({ length: cy.digit }, (_, i) => ({
          len: d,
          color: cy.digit === 1 ? colors.mint : groupColors[i % groupColors.length],
        }));
        body = <Bars width={width} bars={[{ outline: W, segs, tickEvery: d, arrow: true, label: String(W) }]} />;
      }
      break;
    }
    case 'multiply':
      if (level === 1) {
        title = `اضرب ناتج القسمة (${cy.digit}) في المقسوم عليه (${d})`;
        body = <CurvedLink from={String(cy.digit)} to={String(d)} op="×" width={Math.min(width, 260)} />;
      } else {
        title = cy.digit === 1 ? `سهم واحد طوله ${d}` : `${cy.digit} أسهم متجاورة طول كل منها ${d} (جمع متكرر +)`;
        body = (
          <Bars
            width={width}
            bars={[
              {
                separate: true,
                segs: Array.from({ length: cy.digit }, (_, i) => ({ len: d, color: groupColors[i % groupColors.length], label: String(d) })),
              },
            ]}
          />
        );
      }
      break;
    case 'subtract':
      if (level === 1) {
        title = `سهمان: ${cy.working} و ${cy.product}`;
        body = (
          <Bars
            width={width}
            signs="−"
            bars={[
              { outline: cy.working, arrow: true, label: String(cy.working), segs: [{ len: cy.working, color: colors.seaSoft }] },
              { outline: cy.product, arrow: true, label: String(cy.product), segs: [{ len: cy.product, color: colors.seaSoft }] },
            ]}
          />
        );
      } else {
        title = 'الجزء المشترك ملوّن بالأخضر، والباقي بلون آخر';
        body = (
          <Bars
            width={width}
            signs="−"
            bars={[
              {
                label: String(cy.working),
                arrow: true,
                segs: [
                  { len: cy.product, color: colors.mint },
                  ...(cy.remainder > 0 ? [{ len: cy.remainder, color: colors.peach, label: 'الباقي' }] : []),
                ],
              },
              { label: String(cy.product), arrow: true, segs: [{ len: cy.product, color: colors.mint }] },
            ]}
          />
        );
      }
      break;
    default:
      title = level >= 2 ? 'الرقم المضيء بالأخضر ينزل إلى الخانة الخضراء' : 'السهم المتقطع ⇣ يوضح الرقم الذي ينزل';
      body = <Text style={styles.hintText}>ننزل الرقم التالي من المقسوم ونضعه بجوار الباقي ({cy.remainder}).</Text>;
  }

  return (
    <View style={styles.hintCard}>
      <Text style={styles.hintTitle}>💡 {title}</Text>
      <View style={{ alignItems: 'center' }}>{body}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  monitors: { flexDirection: 'row-reverse', gap: 6, marginBottom: 12 },
  monitor: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    padding: 6,
    borderRadius: radii.md,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  monitorDone: { borderColor: colors.sea, backgroundColor: 'rgba(56,189,248,0.15)' },
  monitorActive: { borderColor: colors.sun, backgroundColor: 'rgba(255,200,61,0.18)' },
  monitorGreen: { borderColor: colors.mint, backgroundColor: 'rgba(34,197,94,0.3)' },
  monitorScreen: {
    width: '100%',
    height: 34,
    borderRadius: 8,
    backgroundColor: '#1A1640',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#2D2763',
  },
  monitorScreenOn: { backgroundColor: '#E0F4FE', borderColor: '#9CD8F5' },
  monitorIcon: { fontSize: 18 },
  monitorLabel: { fontFamily: fonts.black, fontSize: 13, color: colors.onDarkSoft },
  wideRow: { flexDirection: 'row', gap: 16, alignItems: 'flex-start' },
  boardCard: { backgroundColor: colors.white, borderRadius: radii.xl, padding: 12, borderWidth: 3, borderColor: colors.paperLine, alignItems: 'center' },
  ld: { paddingVertical: 4 },
  ldRow: { flexDirection: 'row', alignItems: 'center' },
  ldLeft: { alignItems: 'flex-end', paddingRight: 6 },
  ldCells: { flexDirection: 'row' },
  ldBracket: { borderLeftWidth: 4, borderTopWidth: 4, borderColor: colors.ink, borderTopLeftRadius: 10, paddingLeft: 4 },
  ldLine: { borderBottomWidth: 3, borderBottomColor: colors.ink },
  ldCell: { height: 42, alignItems: 'center', justifyContent: 'center', marginVertical: 1 },
  ldText: { fontFamily: fonts.black, fontSize: 26, color: colors.ink, lineHeight: 36 },
  ldDivisor: { minWidth: 46, height: 42, borderRadius: 10, backgroundColor: colors.seaDeep, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  ldDivisorLink: { backgroundColor: colors.sunDeep },
  ldDivisorText: { fontFamily: fonts.black, fontSize: 24, color: colors.white },
  ldSign: { fontFamily: fonts.black, fontSize: 26, color: colors.coral },
  readArrow: { flexDirection: 'row', alignItems: 'center', marginLeft: 8, height: 22 },
  readArrowLine: { flex: 1, height: 5, backgroundColor: colors.grape, borderRadius: 3 },
  readArrowHead: { color: colors.grape, fontSize: 18, marginLeft: -4 },
  qCard: { backgroundColor: colors.white, borderRadius: radii.lg, padding: 10, gap: 10, alignItems: 'center', flexDirection: 'row-reverse' },
  qText: { flex: 1, fontFamily: fonts.black, fontSize: 16, lineHeight: 26, color: colors.ink, textAlign: 'right', writingDirection: 'rtl' },
  answerBox: {
    minWidth: 86,
    height: 54,
    borderRadius: radii.md,
    borderWidth: 3,
    borderColor: colors.grape,
    backgroundColor: colors.grapeSoft,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  answerText: { fontFamily: fonts.black, fontSize: 30, color: colors.ink, lineHeight: 42 },
  hintCard: { backgroundColor: colors.sunSoft, borderRadius: radii.lg, borderWidth: 2, borderColor: colors.sun, padding: 12, gap: 8 },
  hintTitle: { fontFamily: fonts.black, color: '#7A4B00', fontSize: 15, lineHeight: 24, textAlign: 'center' },
  hintText: { fontFamily: fonts.bold, color: '#7A4B00', fontSize: 14, lineHeight: 22, textAlign: 'center' },
  fixed: { fontFamily: fonts.black, color: colors.mint, fontSize: 20, textAlign: 'center' },
});
