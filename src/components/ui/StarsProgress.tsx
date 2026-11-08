import { useEffect, useState } from 'react';

import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors, radii } from '@/src/theme/colors';
import { fonts } from '@/src/theme/typography';

/** 3 stars + progress bar (each level = one third) */
export function StarsProgress({ stars, compact }: { stars: number; compact?: boolean }) {
  const fill = useState(() => new Animated.Value(0))[0];
  useEffect(() => {
    Animated.timing(fill, { toValue: stars / 3, duration: 900, useNativeDriver: false }).start();
  }, [stars, fill]);

  return (
    <View style={[styles.wrap, compact && { gap: 4 }]}>
      <View style={styles.stars}>
        {[0, 1, 2].map((i) => (
          <Text key={i} style={[styles.star, compact && { fontSize: 20 }, i >= stars && styles.starOff]}>
            ★
          </Text>
        ))}
      </View>
      <View style={styles.track} accessibilityLabel={`التقدم ${Math.round((stars / 3) * 100)}٪`}>
        <Animated.View
          style={[
            styles.fill,
            { width: fill.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) },
          ]}
        />
        <View style={[styles.tick, { left: '33.33%' }]} />
        <View style={[styles.tick, { left: '66.66%' }]} />
      </View>
      {!compact ? <Text style={styles.caption}>{Math.round((stars / 3) * 100)}٪ من إصلاح السفينة</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 6, width: '100%' },
  stars: { flexDirection: 'row', gap: 6 },
  star: { fontSize: 28, color: colors.sun, textShadowColor: 'rgba(255,200,61,0.6)', textShadowRadius: 8 },
  starOff: { color: 'rgba(255,255,255,0.22)', textShadowRadius: 0 },
  track: {
    width: '100%',
    height: 14,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.14)',
    overflow: 'hidden',

  },
  fill: { height: '100%', backgroundColor: colors.mint, borderRadius: radii.pill },
  tick: { position: 'absolute', top: 0, bottom: 0, width: 2, backgroundColor: 'rgba(15,11,46,0.45)' },
  caption: { fontFamily: fonts.bold, color: colors.onDarkSoft, fontSize: 13 },
});
