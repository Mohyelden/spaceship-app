import { useEffect, useState } from 'react';

import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors, radii } from '@/src/theme/colors';
import { fonts } from '@/src/theme/typography';
import { Robot } from './Art';

export type Tone = 'info' | 'error' | 'success' | 'hint';

const TONES: Record<Tone, { bg: string; border: string; fg: string; mood: 'happy' | 'think' | 'oops' }> = {
  info: { bg: colors.white, border: colors.paperLine, fg: colors.ink, mood: 'happy' },
  error: { bg: colors.coralSoft, border: colors.coral, fg: '#8F1D1B', mood: 'oops' },
  success: { bg: colors.mintSoft, border: colors.mint, fg: colors.mintDeep, mood: 'happy' },
  hint: { bg: colors.sunSoft, border: colors.sun, fg: '#7A4B00', mood: 'think' },
};

/** Robot co-pilot speech bubble – every instruction/feedback goes through it */
export function Feedback({ message, tone = 'info' }: { message: string; tone?: Tone }) {
  const t = TONES[tone];
  const shake = useState(() => new Animated.Value(0))[0];
  const pop = useState(() => new Animated.Value(1))[0];

  useEffect(() => {
    if (tone === 'error') {
      Animated.sequence(
        [8, -8, 6, -6, 0].map((v) =>
          Animated.timing(shake, { toValue: v, duration: 55, useNativeDriver: true })
        )
      ).start();
    } else {
      pop.setValue(0.94);
      Animated.spring(pop, { toValue: 1, friction: 5, useNativeDriver: true }).start();
    }
  }, [message, tone, shake, pop]);

  return (
    <Animated.View
      style={[styles.row, { transform: [{ translateX: shake }, { scale: pop }] }]}
      accessibilityLiveRegion="polite"
    >
      <View style={styles.avatar}>
        <Robot size={44} mood={t.mood} />
      </View>
      <View style={[styles.bubble, { backgroundColor: t.bg, borderColor: t.border }]}>
        <Text style={[styles.text, { color: t.fg }]}>{message}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8 },
  avatar: { width: 48, alignItems: 'center' },
  bubble: {
    flex: 1,
    borderWidth: 2,
    borderRadius: radii.md,
    paddingVertical: 8,
    paddingHorizontal: 12,
    minHeight: 48,
    justifyContent: 'center',
  },
  text: { fontFamily: fonts.bold, fontSize: 15, lineHeight: 24, textAlign: 'right', writingDirection: 'rtl' },
});
