import { useState } from 'react';
import { useRouter } from 'expo-router';

import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { RocketLogo } from '@/src/components/ui/Art';
import { Button } from '@/src/components/ui/Button';
import { Screen } from '@/src/components/ui/Screen';
import { playSound } from '@/src/sound/sounds';
import { useGameStore } from '@/src/store/gameStore';
import { colors, radii } from '@/src/theme/colors';
import { fonts } from '@/src/theme/typography';

/** 1.2 Login: student code field + "دخول 🚀" */
export default function Login() {
  const router = useRouter();
  const login = useGameStore((s) => s.login);
  const lastCode = useGameStore((s) => s.save.lastCode);
  const [code, setCode] = useState(lastCode ?? '');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [focused, setFocused] = useState(false);
  const shake = useState(() => new Animated.Value(0))[0];

  async function submit() {
    if (busy) return;
    const clean = code.trim();
    if (clean.length < 2) {
      setError('اكتب كود الطالب أولًا ✍️');
      Animated.sequence(
        [10, -10, 6, -6, 0].map((v) => Animated.timing(shake, { toValue: v, duration: 50, useNativeDriver: true }))
      ).start();
      return;
    }
    setBusy(true);
    playSound('correct');
    await login(clean);
    router.replace('/intro-video');
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen scroll center>
        <View style={styles.wrap}>
          {/* long-press the logo (teacher only) to open the teacher panel */}
          <Pressable
            onLongPress={() => router.push('/teacher')}
            delayLongPress={1200}
            accessibilityLabel="شعار سفينة الفضاء"
          >
            <RocketLogo size={110} />
          </Pressable>
          <Text style={styles.title}>أهلًا بك يا بطل الفضاء!</Text>
          <Text style={styles.sub}>اكتب الكود الخاص بك لتبدأ المهمة</Text>

          <Animated.View style={[styles.card, { transform: [{ translateX: shake }] }]}>
            <Text style={styles.label}>كود الطالب</Text>
            <TextInput
              value={code}
              onChangeText={(t) => {
                setCode(t);
                if (error) setError('');
              }}
              placeholder="أدخل كود الطالب"
              placeholderTextColor={colors.inkMuted}
              style={[styles.input, focused && styles.inputFocus, !!error && styles.inputError]}
              textAlign="center"
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={16}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onSubmitEditing={submit}
              returnKeyType="go"
              accessibilityLabel="كود الطالب"
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button title="دخول" icon="🚀" onPress={submit} disabled={busy} />
          </Animated.View>
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 10, paddingVertical: 24 },
  title: { fontFamily: fonts.black, fontSize: 26, lineHeight: 40, color: colors.white, textAlign: 'center', marginTop: 6 },
  sub: { fontFamily: fonts.regular, fontSize: 16, color: colors.onDarkSoft, textAlign: 'center', marginBottom: 10 },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    padding: 20,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  label: { fontFamily: fonts.black, fontSize: 16, color: colors.ink, textAlign: 'right' },
  input: {
    backgroundColor: colors.paperSoft,
    borderWidth: 3,
    borderColor: colors.paperLine,
    borderRadius: radii.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    color: colors.ink,
    fontFamily: fonts.black,
    fontSize: 22,
    letterSpacing: 2,
    textAlign: 'center',
  },
  inputFocus: { borderColor: colors.grape },
  inputError: { borderColor: colors.coral },
  error: { fontFamily: fonts.bold, color: colors.coral, textAlign: 'center', fontSize: 14 },
});
