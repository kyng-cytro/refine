import {
  NotoSans_400Regular,
  NotoSans_500Medium,
  NotoSans_700Bold,
  useFonts,
} from "@expo-google-fonts/noto-sans"
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet"
import { useMaterial3Theme } from "@pchmn/expo-material3-theme"
import * as Linking from "expo-linking"
import { router, ThemeProvider } from "expo-router"
import * as SplashScreen from "expo-splash-screen"
import { useEffect, useMemo, useState } from "react"
import { useColorScheme } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import {
  MD3DarkTheme,
  MD3LightTheme,
  PaperProvider,
  configureFonts,
} from "react-native-paper"
import PairConfirmDialog, { type PairParams } from "@/components/PairConfirmDialog"

import AppTabs from "@/components/app-tabs"
import {
  loadSessionTokenFromNative,
  syncActiveConfig,
} from "@/services/shared-prefs-bridge"
import { getApiClient } from "@/services/api"
import { useHistoryStore } from "@/store/history-store"
import { useSettingsStore } from "@/store/settings-store"

SplashScreen.preventAutoHideAsync()

const fontConfig = { fontFamily: "NotoSans_400Regular" }
const navFonts = {
  regular: { fontFamily: "NotoSans_400Regular", fontWeight: "400" as const },
  medium: { fontFamily: "NotoSans_500Medium", fontWeight: "500" as const },
  bold: { fontFamily: "NotoSans_700Bold", fontWeight: "700" as const },
  heavy: { fontFamily: "NotoSans_700Bold", fontWeight: "700" as const },
}

function parsePairUrl(url: string | null): PairParams | null {
  if (!url) return null
  try {
    const parsed = Linking.parse(url)
    if (parsed.scheme !== "refine" || parsed.path !== "pair") return null
    const { token, url: serverUrl, name } = parsed.queryParams ?? {}
    if (!token || !serverUrl) return null
    return {
      token: String(token),
      url: decodeURIComponent(String(serverUrl)),
      name: name ? decodeURIComponent(String(name)) : "My Phone",
    }
  } catch {
    return null
  }
}

export default function RootLayout() {
  const colorScheme = useColorScheme()
  const { theme: m3Theme } = useMaterial3Theme({
    fallbackSourceColor: "#1B6EF3",
  })
  const [pairParams, setPairParams] = useState<PairParams | null>(null)

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
  )

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
  )

  const serverUrl = useSettingsStore((s) => s.serverUrl)
  const sessionToken = useSettingsStore((s) => s.sessionToken)
  const setSessionToken = useSettingsStore((s) => s.setSessionToken)
  const setTones = useSettingsStore((s) => s.setTones)
  const setModels = useSettingsStore((s) => s.setModels)
  const modelId = useSettingsStore((s) => s.modelId)
  const toneSlug = useSettingsStore((s) => s.toneSlug)
  const setHistoryItems = useHistoryStore((s) => s.setItems)

  const [fontsLoaded] = useFonts({
    NotoSans_400Regular,
    NotoSans_500Medium,
    NotoSans_700Bold,
  })

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync()
  }, [fontsLoaded])

  useEffect(() => {
    const token = loadSessionTokenFromNative()
    if (token) setSessionToken(token)
  }, [])

  useEffect(() => {
    Linking.getInitialURL().then((url) => {
      const params = parsePairUrl(url)
      if (params) setPairParams(params)
    })
    const sub = Linking.addEventListener("url", ({ url }) => {
      const params = parsePairUrl(url)
      if (params) setPairParams(params)
    })
    return () => sub.remove()
  }, [])

  useEffect(() => {
    if (!serverUrl || !sessionToken) return
    const client = getApiClient()
    client.tones
      .list()
      .then(setTones)
      .catch(() => {})
    client.history
      .list({ limit: 50 })
      .then((r) => setHistoryItems(r.data))
      .catch(() => {})
    client.providers
      .list()
      .then((r) => {
        const models = r.providers
          .flatMap((p) => p.models)
          .filter((m) => m.enabledByUser !== false)
        setModels(models)
      })
      .catch(() => {})
  }, [serverUrl, sessionToken])

  useEffect(() => {
    syncActiveConfig()
  }, [serverUrl, sessionToken, modelId, toneSlug])

  useEffect(() => {
    if (!fontsLoaded) return
    if (!serverUrl || !sessionToken) {
      router.replace("/setup")
    }
  }, [fontsLoaded, serverUrl, sessionToken])

  if (!fontsLoaded) return null

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={theme}>
        <BottomSheetModalProvider>
          <ThemeProvider value={navTheme}>
            <AppTabs />
            <PairConfirmDialog
              params={pairParams}
              onDismiss={() => setPairParams(null)}
            />
          </ThemeProvider>
        </BottomSheetModalProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  )
}
