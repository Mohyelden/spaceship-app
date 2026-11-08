import { useEffect, useState } from 'react';

import { Animated, Pressable, StyleSheet, Text } from 'react-native';
import { colors, radii } from '@/src/theme/colors';
import { fonts } from '@/src/theme/typography';

/**
 * "طلب المساعدة 💡" — on-demand group only.
 * Dim & disabled until the 2nd consecutive error on the current step; then it pulses.
 */
export function HelpButton({ enabled, onPress }: { enabled: boolean; onPress: () => void }) {
  const pulse = useState(() => new Animated.Value(0))[0];

  useEffect(() => {
    if (!enabled) {
      pulse.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 550, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 550, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [enabled, pulse]);

  return (
    <Animated.View
      style={{ transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) }] }}
    >
      <Pressable
        onPress={onPress}
        disabled={!enabled}
        accessibilityRole="button"
        accessibilityLabel="طلب المساعدة"
        accessibilityState={{ disabled: !enabled }}
        style={[styles.btn, enabled ? styles.on : styles.off]}
      >
        <Text style={[styles.bulb, !enabled && { opacity: 0.45 }]}>💡</Text>
        <Text style={[styles.label, { color: enabled ? colors.ink : colors.onDarkSoft }]}>مساعدة</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    height: 44,
    borderRadius: radii.pill,
    borderWidth: 2,
  },
  on: { backgroundColor: colors.sun, borderColor: '#FFF1B8' },
  off: { backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.15)' },
  bulb: { fontSize: 20 },
  label: { fontFamily: fonts.black, fontSize: 14 },
});
