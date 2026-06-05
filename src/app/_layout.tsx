import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import {
  NotoSans_400Regular,
  NotoSans_500Medium,
  NotoSans_700Bold,
  useFonts,
} from '@expo-google-fonts/noto-sans';
import { ThemeProvider } from 'expo-router';
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

const lightTheme = {
  ...MD3LightTheme,
  fonts: configureFonts({ config: fontConfig }),
  roundness: 4,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#1B6EF3',
    onPrimary: '#FFFFFF',
    primaryContainer: '#D7E3FF',
    onPrimaryContainer: '#001B3E',
    secondary: '#575E71',
    onSecondary: '#FFFFFF',
    secondaryContainer: '#DBE2F9',
    onSecondaryContainer: '#111B2C',
    surface: '#F7F9FF',
    onSurface: '#1A1B21',
    surfaceVariant: '#E1E2EC',
    onSurfaceVariant: '#44464F',
    background: '#F7F9FF',
    outline: '#74767F',
  },
};

const darkTheme = {
  ...MD3DarkTheme,
  fonts: configureFonts({ config: fontConfig }),
  roundness: 4,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#ADC6FF',
    onPrimary: '#002E6A',
    primaryContainer: '#004494',
    onPrimaryContainer: '#D7E3FF',
    secondary: '#BFC6DC',
    onSecondary: '#293041',
    secondaryContainer: '#3F4759',
    onSecondaryContainer: '#DBE2F9',
    surface: '#121318',
    onSurface: '#E3E2E9',
    surfaceVariant: '#44464F',
    onSurfaceVariant: '#C5C6D0',
    background: '#121318',
    outline: '#8E909A',
  },
};

const navLightTheme: ReactNavigation.Theme = {
  dark: false,
  colors: {
    primary: '#1B6EF3',
    background: '#F7F9FF',
    card: '#F7F9FF',
    text: '#1A1B21',
    border: '#E1E2EC',
    notification: '#1B6EF3',
  },
  fonts: { regular: { fontFamily: 'NotoSans_400Regular', fontWeight: '400' }, medium: { fontFamily: 'NotoSans_500Medium', fontWeight: '500' }, bold: { fontFamily: 'NotoSans_700Bold', fontWeight: '700' }, heavy: { fontFamily: 'NotoSans_700Bold', fontWeight: '700' } },
};

const navDarkTheme: ReactNavigation.Theme = {
  dark: true,
  colors: {
    primary: '#ADC6FF',
    background: '#121318',
    card: '#121318',
    text: '#E3E2E9',
    border: '#2A2B33',
    notification: '#ADC6FF',
  },
  fonts: { regular: { fontFamily: 'NotoSans_400Regular', fontWeight: '400' }, medium: { fontFamily: 'NotoSans_500Medium', fontWeight: '500' }, bold: { fontFamily: 'NotoSans_700Bold', fontWeight: '700' }, heavy: { fontFamily: 'NotoSans_700Bold', fontWeight: '700' } },
};

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
          <ThemeProvider value={colorScheme === 'dark' ? navDarkTheme : navLightTheme}>
            <AppTabs />
          </ThemeProvider>
        </BottomSheetModalProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
