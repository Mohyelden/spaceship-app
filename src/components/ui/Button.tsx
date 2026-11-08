import { type ReactNode, useState } from 'react';

import { Animated, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, radii } from '@/src/theme/colors';
import { fonts } from '@/src/theme/typography';

type Variant = 'primary' | 'success' | 'secondary' | 'light' | 'danger';

type Props = {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  variant?: Variant;
  size?: 'lg' | 'md' | 'sm';
  icon?: string;
  style?: ViewStyle;
  right?: ReactNode;
  accessibilityLabel?: string;
};

const PALETTE: Record<Variant, { bg: string; edge: string; fg: string }> = {
  primary: { bg: colors.sun, edge: colors.sunDeep, fg: colors.ink },
  success: { bg: colors.mint, edge: colors.mintDeep, fg: colors.white },
  secondary: { bg: 'rgba(255,255,255,0.14)', edge: 'rgba(0,0,0,0.25)', fg: colors.white },
  light: { bg: colors.white, edge: colors.paperLine, fg: colors.ink },
  danger: { bg: colors.coral, edge: '#C2413E', fg: colors.white },
};

/** Chunky "game" button with a 3D bottom edge and press-down animation */
export function Button({
  title,
  onPress,
  disabled,
  variant = 'primary',
  size = 'lg',
  icon,
  style,
  right,
  accessibilityLabel,
}: Props) {
  const press = useState(() => new Animated.Value(0))[0];
  const p = PALETTE[variant];
  const h = size === 'lg' ? 58 : size === 'md' ? 50 : 42;
  const fs = size === 'lg' ? 19 : size === 'md' ? 17 : 15;

  const to = (v: number) =>
    Animated.timing(press, { toValue: v, duration: 90, useNativeDriver: true }).start();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => to(1)}
      onPressOut={() => to(0)}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: !!disabled }}
      style={[{ opacity: disabled ? 0.45 : 1 }, style]}
    >
      <View style={[styles.edge, { backgroundColor: p.edge, borderRadius: radii.lg, paddingBottom: 5 }]}>
        <Animated.View
          style={[
            styles.face,
            {
              minHeight: h,
              backgroundColor: p.bg,
              borderRadius: radii.lg,
              transform: [{ translateY: press.interpolate({ inputRange: [0, 1], outputRange: [0, 4] }) }],
            },
          ]}
        >
          <Text style={[styles.label, { color: p.fg, fontSize: fs }]} numberOfLines={2}>
            {icon ? `${title}  ${icon}` : title}
          </Text>
          {right}
        </Animated.View>
      </View>
    </Pressable>
  );
}

/** Small round icon button (back, mute, play...) */
export function IconButton({
  icon,
  onPress,
  label,
  disabled,
  size = 46,
  tone = 'glass',
}: {
  icon: string;
  onPress?: () => void;
  label: string;
  disabled?: boolean;
  size?: number;
  tone?: 'glass' | 'light';
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      style={({ pressed }) => [
        styles.icon,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: tone === 'light' ? colors.white : colors.glass,
          borderColor: tone === 'light' ? colors.paperLine : colors.glassLine,
          opacity: disabled ? 0.4 : 1,
          transform: [{ scale: pressed ? 0.92 : 1 }],
        },
      ]}
    >
      <Text style={{ fontSize: size * 0.42, color: tone === 'light' ? colors.ink : colors.white }}>{icon}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  edge: { width: '100%' },
  face: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: 18,
    paddingVertical: 8,
    gap: 8,
  },
  label: { fontFamily: fonts.black, textAlign: 'center' },
  icon: { alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
});
