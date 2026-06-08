import {
  NotoSans_400Regular,
  NotoSans_500Medium,
  NotoSans_700Bold,
  useFonts,
} from "@expo-google-fonts/noto-sans";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useMaterial3Theme } from "@pchmn/expo-material3-theme";
import { ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useMemo } from "react";
import { useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  MD3DarkTheme,
  MD3LightTheme,
  PaperProvider,
  configureFonts,
} from "react-native-paper";

import AppTabs from "@/components/app-tabs";
import {
  loadHistoryFromNative,
  rehydrateApiKeysFromNative,
  syncActiveConfig,
} from "@/services/shared-prefs-bridge";
import { useHistoryStore } from "@/store/history-store";
import { useSettingsStore } from "@/store/settings-store";

SplashScreen.preventAutoHideAsync();

const fontConfig = { fontFamily: "NotoSans_400Regular" };
const navFonts = {
  regular: { fontFamily: "NotoSans_400Regular", fontWeight: "400" as const },
  medium: { fontFamily: "NotoSans_500Medium", fontWeight: "500" as const },
  bold: { fontFamily: "NotoSans_700Bold", fontWeight: "700" as const },
  heavy: { fontFamily: "NotoSans_700Bold", fontWeight: "700" as const },
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { theme: m3Theme } = useMaterial3Theme({
    fallbackSourceColor: "#1B6EF3",
  });

  const theme = useMemo(
    () =>
      colorScheme === "dark"
        ? {
            ...MD3DarkTheme,
            fonts: configureFonts({ config: fontConfig }),
            roundness: 4,
            colors: { ...m3Theme.dark },
          }
        : {
            ...MD3LightTheme,
            fonts: configureFonts({ config: fontConfig }),
            roundness: 4,
            colors: { ...m3Theme.light },
          },
    [colorScheme, m3Theme],
  );

  const navTheme = useMemo(
    () => ({
      dark: colorScheme === "dark",
      fonts: navFonts,
      colors: {
        primary: theme.colors.primary,
        background: theme.colors.background,
        card: theme.colors.surface,
        text: theme.colors.onSurface,
        border: theme.colors.outline,
        notification: theme.colors.error,
      },
    }),
    [colorScheme, theme],
  );

  const setItems = useHistoryStore((s) => s.setItems);
  const rehydrateApiKeys = useSettingsStore((s) => s.rehydrateApiKeys);
  const apiKeys = useSettingsStore((s) => s.apiKeys);
  const defaultModel = useSettingsStore((s) => s.defaultModel);
  const tones = useSettingsStore((s) => s.tones);
  const defaultToneSlug = useSettingsStore((s) => s.defaultToneSlug);

  const [fontsLoaded] = useFonts({
    NotoSans_400Regular,
    NotoSans_500Medium,
    NotoSans_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  useEffect(() => {
    const keys = rehydrateApiKeysFromNative();
    if (Object.keys(keys).length > 0) rehydrateApiKeys(keys);
    const history = loadHistoryFromNative();
    if (history.length > 0) setItems(history);
  }, []);

  useEffect(() => {
    syncActiveConfig();
  }, [apiKeys, defaultModel, tones, defaultToneSlug]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={theme}>
        <BottomSheetModalProvider>
          <ThemeProvider value={navTheme}>
            <AppTabs />
          </ThemeProvider>
        </BottomSheetModalProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
