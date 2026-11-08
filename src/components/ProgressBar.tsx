import { StyleSheet, Text, View } from 'react-native';
import { colors, radii } from '@/src/theme/colors';
import { fonts } from '@/src/theme/typography';

export function ProgressBar({
  fraction,
  stars,
}: {
  fraction: number;
  stars: number;
}) {
  const pct = Math.max(0, Math.min(1, fraction));
  return (
    <View style={styles.wrap}>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct * 100}%` }]} />
      </View>
      <Text style={styles.label}>
        {Array.from({ length: 3 }, (_, i) => (i < stars ? '★' : '☆')).join(' ')}
        {'  ·  '}
        {Math.round(pct * 100)}٪
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', gap: 8 },
  track: {
    height: 10,
    borderRadius: radii.sm,
    backgroundColor: colors.inkSoft,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.horizon,
  },
  fill: {
    height: '100%',
    backgroundColor: colors.copper,
    borderRadius: radii.sm,
  },
  label: {
    fontFamily: fonts.bodyBold,
    color: colors.parchment,
    textAlign: 'center',
    fontSize: 14,
  },
});
