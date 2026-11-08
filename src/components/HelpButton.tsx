import { Pressable, StyleSheet, Text } from 'react-native';
import { HINT_MODE } from '@/src/config/env';
import { colors, radii } from '@/src/theme/colors';
import { fonts } from '@/src/theme/typography';

type Props = {
  unlocked: boolean;
  onPress: () => void;
  hidden?: boolean;
};

export function HelpButton({ unlocked, onPress, hidden }: Props) {
  if (HINT_MODE === 'auto') return null;
  if (hidden) return null;

  return (
    <Pressable
      onPress={onPress}
      disabled={!unlocked}
      style={[styles.btn, { opacity: unlocked ? 1 : 0.35 }]}
    >
      <Text style={styles.text}>طلب المساعدة</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    alignItems: 'center',
    backgroundColor: colors.warnSoft,
    borderColor: colors.copper,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radii.md,
  },
  text: {
    color: colors.copperDim,
    fontFamily: fonts.bodyBold,
    fontSize: 13,
  },
});
