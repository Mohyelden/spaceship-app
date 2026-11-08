import { ReactNode, useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MAX_WIDTH } from '@/src/theme/colors';
import { SpaceBackground } from './SpaceBackground';

type Props = {
  children: ReactNode;
  /** content scrolls when the phone is too short */
  scroll?: boolean;
  scrollEnabled?: boolean;
  maxWidth?: number;
  style?: ViewStyle;
  header?: ReactNode;
  footer?: ReactNode;
  center?: boolean;
  /** when this value changes the scroll view scrolls to the bottom */
  autoScrollKey?: string;
};

/**
 * Every screen uses this: space background + safe areas + a centered column
 * with a max width (phones fill the width, tablets/desktop stay readable).
 */
export function Screen({
  children,
  scroll,
  scrollEnabled = true,
  maxWidth = MAX_WIDTH,
  style,
  header,
  footer,
  center,
  autoScrollKey,
}: Props) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<any>(null); // ScrollView instance (scrollToEnd)
  useEffect(() => {
    if (autoScrollKey === undefined) return;
    const t = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 120);
    return () => clearTimeout(t);
  }, [autoScrollKey]);
  const column: ViewStyle = { width: '100%', maxWidth, alignSelf: 'center' };

  return (
    <SpaceBackground>
      <View
        style={[
          styles.fill,
          { paddingTop: Math.max(insets.top, 10), paddingBottom: Math.max(insets.bottom, 10) },
        ]}
      >
        {header ? <View style={[column, styles.pad]}>{header}</View> : null}
        {scroll ? (
          <ScrollView
            ref={scrollRef}
            style={styles.fill}
            scrollEnabled={scrollEnabled}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[
              styles.scrollContent,
              center && styles.center,
            ]}
            showsVerticalScrollIndicator={false}
          >
            <View style={[column, styles.pad, style]}>{children}</View>
          </ScrollView>
        ) : (
          <View style={[styles.fill, column, styles.pad, center && styles.center, style]}>{children}</View>
        )}
        {footer ? <View style={[column, styles.pad, styles.footer]}>{footer}</View> : null}
      </View>
    </SpaceBackground>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  pad: { paddingHorizontal: 16 },
  scrollContent: { flexGrow: 1, paddingBottom: 12 },
  center: { justifyContent: 'center' },
  footer: { paddingTop: 8 },
});
