import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/src/theme/colors';

type Props = {
  onSelect: (n: number) => void;
  highlighted?: number[];
  dimmed?: number[];
  max?: number;
};

export function NumberPad({
  onSelect,
  highlighted = [],
  dimmed = [],
  max = 9,
}: Props) {
  const nums = Array.from({ length: max + 1 }, (_, i) => i);

  return (
    <View style={styles.grid}>
      {nums.map((n) => {
        const isHi = highlighted.includes(n);
        const isDim = dimmed.includes(n) && !isHi;
        return (
          <Pressable
            key={n}
            onPress={() => onSelect(n)}
            style={[
              styles.cell,
              isHi && styles.hi,
              isDim && styles.dim,
            ]}
          >
            <Text style={styles.text}>{n}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  cell: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hi: {
    borderColor: colors.green,
    backgroundColor: colors.greenDim,
    borderWidth: 2,
  },
  dim: { opacity: 0.25 },
  text: { color: colors.white, fontSize: 20, fontWeight: '800' },
});
