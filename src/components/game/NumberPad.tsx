import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii } from '@/src/theme/colors';
import { fonts } from '@/src/theme/typography';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

/** Big kid-friendly number pad: 2 rows of digits + delete + check */
export function NumberPad({
  value,
  onChange,
  onSubmit,
  disabled,
  maxLength = 4,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  maxLength?: number;
}) {
  const press = (k: string) => {
    if (disabled) return;
    if (value.length >= maxLength) return;
    onChange(value === '0' ? k : value + k);
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.grid}>
        {KEYS.map((k) => (
          <Pressable
            key={k}
            onPress={() => press(k)}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={k}
            style={({ pressed }) => [styles.key, pressed && styles.keyPressed, disabled && styles.dim]}
          >
            <Text style={styles.keyText}>{k}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.actions}>
        <Pressable
          onPress={() => !disabled && onChange(value.slice(0, -1))}
          disabled={disabled || !value}
          accessibilityRole="button"
          accessibilityLabel="مسح"
          style={({ pressed }) => [styles.action, styles.del, pressed && styles.keyPressed, (!value || disabled) && styles.dim]}
        >
          <Text style={[styles.actionText, { color: colors.ink }]}>⌫ مسح</Text>
        </Pressable>
        <Pressable
          onPress={() => !disabled && value && onSubmit()}
          disabled={disabled || !value}
          accessibilityRole="button"
          accessibilityLabel="تحقق"
          style={({ pressed }) => [styles.action, styles.ok, pressed && styles.keyPressed, (!value || disabled) && styles.dim]}
        >
          <Text style={[styles.actionText, { color: colors.white }]}>✓ تحقق</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' },
  key: {
    width: '18.4%',
    height: 50,
    borderRadius: radii.md,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 4,
    borderBottomColor: colors.paperLine,
  },
  keyPressed: { transform: [{ translateY: 2 }], borderBottomWidth: 2 },
  keyText: { fontFamily: fonts.black, fontSize: 24, color: colors.ink, lineHeight: 34 },
  actions: { flexDirection: 'row', gap: 8 },
  action: {
    flex: 1,
    height: 50,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 4,
  },
  del: { backgroundColor: colors.sunSoft, borderBottomColor: colors.sun },
  ok: { backgroundColor: colors.mint, borderBottomColor: colors.mintDeep },
  actionText: { fontFamily: fonts.black, fontSize: 18 },
  dim: { opacity: 0.45 },
});
