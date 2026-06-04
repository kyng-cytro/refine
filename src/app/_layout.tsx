import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import {
  NotoSans_400Regular,
  NotoSans_500Medium,
  NotoSans_700Bold,
  useFonts,
} from '@expo-google-fonts/noto-sans';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MD3DarkTheme, MD3LightTheme, PaperProvider, configureFonts } from 'react-native-paper';

import AppTabs from '@/components/app-tabs';
import { useHistoryStore } from '@/store/history-store';
import { useSettingsStore } from '@/store/settings-store';
import { loadHistoryFromNative, rehydrateApiKeysFromNative, syncActiveConfig } from '@/services/shared-prefs-bridge';

SplashScreen.preventAutoHideAsync();

const fontConfig = { fontFamily: 'NotoSans_400Regular' };

const lightTheme = { ...MD3LightTheme, fonts: configureFonts({ config: fontConfig }), roundness: 4 };
const darkTheme = { ...MD3DarkTheme, fonts: configureFonts({ config: fontConfig }), roundness: 4 };

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const setItems = useHistoryStore((s) => s.setItems);
  const rehydrateApiKeys = useSettingsStore((s) => s.rehydrateApiKeys);

  // Selective subscriptions — only re-render when these specific values change
  const apiKeys = useSettingsStore((s) => s.apiKeys);
  const defaultModel = useSettingsStore((s) => s.defaultModel);
  const tones = useSettingsStore((s) => s.tones);
  const defaultToneSlug = useSettingsStore((s) => s.defaultToneSlug);

  const [fontsLoaded] = useFonts({ NotoSans_400Regular, NotoSans_500Medium, NotoSans_700Bold });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  useEffect(() => {
    const keys = rehydrateApiKeysFromNative();
    if (Object.keys(keys).length > 0) rehydrateApiKeys(keys);
    const history = loadHistoryFromNative();
    if (history.length > 0) setItems(history);
  }, []);

  // syncActiveConfig reads from store.getState() internally — no args needed
  useEffect(() => {
    syncActiveConfig();
  }, [apiKeys, defaultModel, tones, defaultToneSlug]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={colorScheme === 'dark' ? darkTheme : lightTheme}>
        <BottomSheetModalProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <AppTabs />
          </ThemeProvider>
        </BottomSheetModalProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
