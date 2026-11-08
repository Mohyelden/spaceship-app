import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { SafeScreen } from '@/src/components/SafeScreen';
import { ShipMark } from '@/src/components/ShipMark';
import { useRequireSplash } from '@/src/components/SplashGate';
import { useGameStore } from '@/src/store/gameStore';
import { colors, radii } from '@/src/theme/colors';
import { fonts, type } from '@/src/theme/typography';

export default function LoginScreen() {
  useRequireSplash();
  const router = useRouter();
  const login = useGameStore((s) => s.login);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [focused, setFocused] = useState(false);
  const floatY = useSharedValue(0);

  useEffect(() => {
    floatY.value = withRepeat(withTiming(-8, { duration: 1700 }), -1, true);
  }, [floatY]);

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));

  async function submit() {
    if (!code.trim()) {
      setError('أدخل كود الطالب للمتابعة');
      return;
    }
    await login(code);
    router.replace('/intro-video');
  }

  return (
    <View style={styles.root}>
      <ImageBackground
        source={require('../assets/images/galaxy-pixel.png')}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
      <View style={styles.dim} />
      <SafeScreen>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.container}>
            <Animated.View entering={FadeInDown.duration(500)} style={styles.hero}>
              <Animated.View style={floatStyle}>
                <ShipMark size={84} />
              </Animated.View>
              <Text style={styles.kicker}>حسب وثيقة التصميم</Text>
              <Text style={styles.title}>تسجيل الدخول</Text>
              <Text style={styles.sub}>أدخل كود الطالب للانطلاق إلى المهمة</Text>
            </Animated.View>

            <Animated.View
              entering={FadeInDown.delay(150).duration(500)}
              style={styles.panel}
            >
              <Text style={styles.label}>كود الطالب</Text>
              <TextInput
                value={code}
                onChangeText={(t) => {
                  setCode(t);
                  if (error) setError('');
                }}
                placeholder="مثال: ST-1024"
                placeholderTextColor={colors.steel}
                style={[styles.input, focused && styles.inputFocus]}
                textAlign="center"
                autoCapitalize="characters"
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onSubmitEditing={submit}
                returnKeyType="go"
              />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <PrimaryButton title="دخول 🚀" onPress={submit} />
              <Text style={styles.foot}>بعد الدخول: فيديو القصة ثم خريطة الكواكب</Text>
            </Animated.View>
          </View>
        </KeyboardAvoidingView>
      </SafeScreen>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#070B18' },
  dim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(6,10,20,0.35)',
  },
  flex: { flex: 1 },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 18,
    gap: 22,
  },
  hero: { alignItems: 'center', gap: 6 },
  kicker: { ...type.caption, color: colors.copperBright, marginTop: 8 },
  title: { ...type.title, color: colors.parchment },
  sub: { ...type.subtitle, color: '#E8EEFF', maxWidth: 300 },
  panel: {
    backgroundColor: colors.parchment,
    borderRadius: radii.xl,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.parchmentDeep,
  },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.copperDim,
    textAlign: 'center',
  },
  input: {
    backgroundColor: colors.chalk,
    borderWidth: 2,
    borderColor: colors.parchmentDeep,
    borderRadius: radii.md,
    paddingVertical: 14,
    paddingHorizontal: 14,
    color: colors.ink,
    fontFamily: fonts.bodyExtra,
    fontSize: 18,
  },
  inputFocus: { borderColor: colors.copper },
  error: {
    fontFamily: fonts.body,
    color: colors.danger,
    textAlign: 'center',
    fontSize: 13,
  },
  foot: {
    fontFamily: fonts.body,
    color: colors.steel,
    textAlign: 'center',
    fontSize: 12,
  },
});
