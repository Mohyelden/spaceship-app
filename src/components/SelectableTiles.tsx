import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/src/theme/colors';

type Props = {
  tiles: number[];
  selected: number | null;
  onSelect: (value: number, index: number) => void;
  usedIndexes: Set<number>;
  highlightedValues?: number[];
  hideFarValues?: boolean;
};

export function SelectableTiles({
  tiles,
  selected,
  onSelect,
  usedIndexes,
  highlightedValues = [],
  hideFarValues = false,
}: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>لوحة الأرقام — اختر ثم ضع في الخانة</Text>
      <View style={styles.grid}>
        {tiles.map((value, index) => {
          if (usedIndexes.has(index)) return null;
          const isHi = highlightedValues.includes(value);
          if (hideFarValues && highlightedValues.length && !isHi) {
            return null;
          }
          const isSelected = selected === index;
          return (
            <Pressable
              key={`${value}-${index}`}
              onPress={() => onSelect(value, index)}
              style={[
                styles.tile,
                isHi && styles.hi,
                isSelected && styles.selected,
              ]}
            >
              <Text style={styles.text}>{value}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  label: {
    color: colors.muted,
    textAlign: 'center',
    fontSize: 13,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  tile: {
    minWidth: 64,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
  },
  hi: {
    borderColor: colors.green,
    borderWidth: 2,
    backgroundColor: colors.greenDim,
  },
  selected: {
    borderColor: colors.cyan,
    borderWidth: 2,
  },
  text: { color: colors.white, fontWeight: '800', fontSize: 16 },
});
