import { StyleSheet, Text, View } from 'react-native';
import { colors, radii } from '@/src/theme/colors';
import { fonts } from '@/src/theme/typography';

type Props = {
  message: string | null;
  tone?: 'info' | 'error' | 'success' | 'hint';
};

export function FeedbackBanner({ message, tone = 'info' }: Props) {
  if (!message) return null;

  const bg =
    tone === 'error'
      ? colors.dangerSoft
      : tone === 'success'
        ? colors.successSoft
        : tone === 'hint'
          ? colors.warnSoft
          : colors.parchment;

  const fg =
    tone === 'error'
      ? colors.danger
      : tone === 'success'
        ? colors.success
        : tone === 'hint'
          ? colors.copperDim
          : colors.ink;

  return (
    <View style={[styles.box, { backgroundColor: bg, borderColor: fg }]}>
      <Text style={[styles.text, { color: fg }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 1.5,
    borderRadius: radii.md,
    padding: 12,
    marginVertical: 6,
  },
  text: {
    fontFamily: fonts.bodyBold,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 22,
  },
});
