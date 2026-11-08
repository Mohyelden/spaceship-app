import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { StarField } from '@/src/components/StarField';
import { colors } from '@/src/theme/colors';

export function SpaceBackground({
  children,
  warm = false,
}: {
  children: ReactNode;
  warm?: boolean;
}) {
  return (
    <LinearGradient
      colors={
        warm
          ? [colors.night, '#182033', '#2A1F18']
          : ['#070B14', colors.night, '#121A2E']
      }
      locations={[0, 0.45, 1]}
      style={styles.fill}
    >
      <StarField count={48} />
      <View style={styles.vignette} pointerEvents="none" />
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  vignette: {
    ...StyleSheet.absoluteFill,
    borderWidth: 0,
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOpacity: 0.4,
  },
});
