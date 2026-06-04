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
import {
  loadHistoryFromNative,
  rehydrateApiKeysFromNative,
  syncActiveConfig,
} from '@/services/shared-prefs-bridge';

SplashScreen.preventAutoHideAsync();

const fontConfig = {
  fontFamily: 'NotoSans_400Regular',
};

const lightTheme = {
  ...MD3LightTheme,
  fonts: configureFonts({ config: fontConfig }),
  roundness: 4,
};

const darkTheme = {
  ...MD3DarkTheme,
  fonts: configureFonts({ config: fontConfig }),
  roundness: 4,
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const setItems = useHistoryStore((s) => s.setItems);
  const rehydrateApiKeys = useSettingsStore((s) => s.rehydrateApiKeys);
  const settings = useSettingsStore();

  const [fontsLoaded] = useFonts({
    NotoSans_400Regular,
    NotoSans_500Medium,
    NotoSans_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  useEffect(() => {
    // Rehydrate API keys from EncryptedSharedPreferences (never stored in MMKV)
    const keys = rehydrateApiKeysFromNative();
    if (Object.keys(keys).length > 0) rehydrateApiKeys(keys);

    // Load history from SharedPreferences (canonical store)
    const history = loadHistoryFromNative();
    if (history.length > 0) setItems(history);
  }, []);

  // Keep native config in sync whenever settings change
  useEffect(() => {
    syncActiveConfig({
      apiKeys: settings.apiKeys,
      defaultModel: settings.defaultModel,
      tones: settings.tones,
      defaultToneSlug: settings.defaultToneSlug,
    });
  }, [settings.apiKeys, settings.defaultModel, settings.tones, settings.defaultToneSlug]);

  if (!fontsLoaded) return null;

  const paperTheme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const navTheme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={paperTheme}>
        <BottomSheetModalProvider>
          <ThemeProvider value={navTheme}>
            <AppTabs />
          </ThemeProvider>
        </BottomSheetModalProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
