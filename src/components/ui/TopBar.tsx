import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/src/theme/colors';
import { fonts } from '@/src/theme/typography';
import { IconButton } from './Button';

/** RTL top bar: back on the right, title in the middle, extra action on the left */
export function TopBar({
  title,
  subtitle,
  onBack,
  backIcon = '→',
  backLabel = 'رجوع',
  left,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  backIcon?: string;
  backLabel?: string;
  left?: ReactNode;
}) {
  return (
    <View style={styles.bar}>
      <View style={styles.side}>
        {onBack ? <IconButton icon={backIcon} label={backLabel} onPress={onBack} size={44} /> : null}
      </View>
      <View style={styles.mid}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.sub} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={[styles.side, styles.sideLeft]}>{left}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row-reverse', alignItems: 'center', minHeight: 52, gap: 8, marginBottom: 6 },
  side: { minWidth: 48, alignItems: 'flex-end' },
  sideLeft: { alignItems: 'flex-start' },
  mid: { flex: 1, alignItems: 'center' },
  title: { fontFamily: fonts.black, color: colors.white, fontSize: 19, lineHeight: 30 },
  sub: { fontFamily: fonts.regular, color: colors.onDarkSoft, fontSize: 13, lineHeight: 20 },
});
