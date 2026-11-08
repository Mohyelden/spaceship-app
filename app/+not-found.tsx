import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/src/theme/colors';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'غير موجود' }} />
      <View style={styles.container}>
        <Text style={styles.title}>الشاشة غير موجودة</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>العودة للبداية</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.spaceDeep,
    padding: 20,
  },
  title: { color: colors.white, fontSize: 18, fontWeight: '800' },
  link: { marginTop: 16 },
  linkText: { color: colors.cyan, fontSize: 16 },
});
