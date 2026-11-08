import {
  Cairo_400Regular,
  Cairo_500Medium,
  Cairo_700Bold,
  Cairo_800ExtraBold,
} from '@expo-google-fonts/cairo';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { I18nManager, Platform, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useGameStore } from '@/src/store/gameStore';
import { colors } from '@/src/theme/colors';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync().catch(() => {});

// Layouts are written explicitly for Arabic (row-reverse / textAlign right) and the
// math boards must stay left-to-right, so we never let the OS mirror the UI.
try {
  I18nManager.allowRTL(false);
  I18nManager.forceRTL(false);
} catch {
  // not supported on web
}

// Web only: let every text pick its direction from its first letter (Arabic → RTL),
// exactly like Android/iOS do natively. Fixes mixed "عربي + 100 XP" ordering.
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = 'div[dir="auto"], div { unicode-bidi: plaintext; } input { unicode-bidi: plaintext; }';
  document.head.appendChild(style);
}

export default function RootLayout() {
  const hydrate = useGameStore((s) => s.hydrate);
  const hydrated = useGameStore((s) => s.hydrated);
  const [fontsLoaded, fontError] = useFonts({
    Cairo_400Regular,
    Cairo_500Medium,
    Cairo_700Bold,
    Cairo_800ExtraBold,
  });

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const ready = hydrated && (fontsLoaded || !!fontError);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return <View style={{ flex: 1, backgroundColor: colors.sky0 }} />;

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.sky0 }}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.sky0 },
            animation: 'fade',
            gestureEnabled: false,
          }}
        />
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
