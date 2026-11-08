import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  children: ReactNode;
  style?: ViewStyle;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  /** Extra bottom padding beyond safe area (for floating UI) */
  bottomExtra?: number;
};

export function SafeScreen({
  children,
  style,
  edges = ['top', 'bottom'],
  bottomExtra = 8,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.fill,
        {
          paddingTop: edges.includes('top') ? Math.max(insets.top, 8) : 0,
          paddingBottom: edges.includes('bottom')
            ? Math.max(insets.bottom, 8) + bottomExtra
            : 0,
          paddingLeft: edges.includes('left') ? insets.left : 0,
          paddingRight: edges.includes('right') ? insets.right : 0,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
