import { useRouter } from 'expo-router';
import { Text } from 'react-native';
import { Button } from '@/src/components/ui/Button';
import { Screen } from '@/src/components/ui/Screen';
import { colors } from '@/src/theme/colors';
import { fonts } from '@/src/theme/typography';

export default function NotFound() {
  const router = useRouter();
  return (
    <Screen center>
      <Text style={{ fontFamily: fonts.black, color: colors.white, fontSize: 22, textAlign: 'center', marginBottom: 16 }}>
        يبدو أننا ضللنا الطريق في الفضاء 🛸
      </Text>
      <Button title="العودة للبداية" icon="🏠" onPress={() => router.replace('/')} />
    </Screen>
  );
}
