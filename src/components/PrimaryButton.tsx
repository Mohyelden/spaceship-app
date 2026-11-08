import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { colors, radii } from '@/src/theme/colors';
import { type } from '@/src/theme/typography';

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  style?: ViewStyle;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PrimaryButton({
  title,
  onPress,
  disabled,
  variant = 'primary',
  style,
}: Props) {
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const bg =
    variant === 'success'
      ? colors.success
      : variant === 'danger'
        ? colors.danger
        : variant === 'secondary'
          ? colors.inkSoft
          : variant === 'ghost'
            ? 'transparent'
            : colors.copper;

  const textColor =
    variant === 'ghost' || variant === 'secondary'
      ? colors.parchment
      : variant === 'success' || variant === 'danger'
        ? colors.chalk
        : colors.ink;

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => {
        scale.value = withSpring(0.97, { damping: 15 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1);
      }}
      style={[
        styles.btn,
        {
          backgroundColor: bg,
          opacity: disabled ? 0.4 : 1,
          borderColor:
            variant === 'ghost' ? colors.copper : colors.copperDim,
        },
        anim,
        style,
      ]}
    >
      <Text style={[styles.text, { color: textColor }]}>{title}</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 15,
    paddingHorizontal: 22,
    borderRadius: radii.md,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  text: {
    ...type.button,
  },
});
