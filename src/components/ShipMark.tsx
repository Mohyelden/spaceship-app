import { StyleSheet, View } from 'react-native';
import { colors } from '@/src/theme/colors';

/** Geometric ship mark — drawn shapes, no emoji */
export function ShipMark({ size = 120 }: { size?: number }) {
  const s = size;
  return (
    <View style={{ width: s, height: s * 1.15, alignItems: 'center' }}>
      <View
        style={[
          styles.fin,
          {
            borderLeftWidth: s * 0.12,
            borderRightWidth: s * 0.12,
            borderBottomWidth: s * 0.22,
            marginBottom: -s * 0.06,
          },
        ]}
      />
      <View
        style={[
          styles.body,
          {
            width: s * 0.42,
            height: s * 0.62,
            borderRadius: s * 0.21,
          },
        ]}
      >
        <View style={[styles.window, { width: s * 0.16, height: s * 0.16, borderRadius: s * 0.08 }]} />
        <View style={[styles.stripe, { width: s * 0.28 }]} />
        <View style={[styles.stripe, { width: s * 0.22, opacity: 0.55 }]} />
      </View>
      <View style={styles.wingRow}>
        <View style={[styles.wing, { transform: [{ rotate: '-28deg' }], marginRight: s * 0.02 }]} />
        <View style={[styles.wing, { transform: [{ rotate: '28deg' }], marginLeft: s * 0.02 }]} />
      </View>
      <View style={styles.flameRow}>
        <View style={[styles.flame, { backgroundColor: colors.copperBright, height: s * 0.14 }]} />
        <View style={[styles.flame, { backgroundColor: colors.parchment, height: s * 0.1, width: 6 }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fin: {
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: colors.copper,
  },
  body: {
    backgroundColor: colors.parchment,
    borderWidth: 2,
    borderColor: colors.copperDim,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    zIndex: 2,
  },
  window: {
    backgroundColor: colors.inkSoft,
    borderWidth: 2,
    borderColor: colors.copper,
  },
  stripe: {
    height: 3,
    backgroundColor: colors.copper,
    borderRadius: 2,
  },
  wingRow: {
    position: 'absolute',
    bottom: '28%',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
  },
  wing: {
    width: 34,
    height: 10,
    backgroundColor: colors.copper,
    borderRadius: 4,
  },
  flameRow: {
    alignItems: 'center',
    marginTop: 2,
    gap: 2,
  },
  flame: {
    width: 10,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
});
