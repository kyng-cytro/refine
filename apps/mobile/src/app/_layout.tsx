import PairConfirmDialog from "@/components/PairConfirmDialog"
import { usePairStore } from "@/store/pair-store"
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet"
import { useMaterial3Theme } from "@pchmn/expo-material3-theme"
import { router, ThemeProvider, useSegments } from "expo-router"
import * as SplashScreen from "expo-splash-screen"
import { useEffect, useMemo } from "react"
import { useColorScheme } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from "react-native-paper"

import AppTabs from "@/components/app-tabs"
import { getApiClient } from "@/services/api"
import {
  loadSessionTokenFromNative,
  syncActiveConfig,
} from "@/services/shared-prefs-bridge"
import { useHistoryStore } from "@/store/history-store"
import { useSettingsStore } from "@/store/settings-store"

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const colorScheme = useColorScheme()
  const { theme: m3Theme } = useMaterial3Theme({
    fallbackSourceColor: "#1B6EF3",
  })

  const theme = useMemo(
    () =>
      colorScheme === "dark"
        ? { ...MD3DarkTheme, roundness: 4, colors: { ...m3Theme.dark } }
        : { ...MD3LightTheme, roundness: 4, colors: { ...m3Theme.light } },
    [colorScheme, m3Theme],
  )

  const navTheme = useMemo(
    () => ({
      dark: colorScheme === "dark",
      fonts: {
        regular: { fontFamily: "System", fontWeight: "400" as const },
        medium: { fontFamily: "System", fontWeight: "500" as const },
        bold: { fontFamily: "System", fontWeight: "700" as const },
        heavy: { fontFamily: "System", fontWeight: "900" as const },
      },
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

  const segments = useSegments()
  const pairParams = usePairStore((s) => s.params)
  const serverUrl = useSettingsStore((s) => s.serverUrl)
  const sessionToken = useSettingsStore((s) => s.sessionToken)
  const setSessionToken = useSettingsStore((s) => s.setSessionToken)
  const setTones = useSettingsStore((s) => s.setTones)
  const setModels = useSettingsStore((s) => s.setModels)
  const modelId = useSettingsStore((s) => s.modelId)
  const toneSlug = useSettingsStore((s) => s.toneSlug)
  const setHistoryItems = useHistoryStore((s) => s.setItems)

  useEffect(() => {
    SplashScreen.hideAsync()
  }, [])

  useEffect(() => {
    const token = loadSessionTokenFromNative()
    if (token) setSessionToken(token)
  }, [])

  useEffect(() => {
    if (!serverUrl || !sessionToken) return
    const client = getApiClient()
    const onUnauth = (e: unknown) => {
      if (
        (e as any)?.status === 401 ||
        String((e as any)?.message).includes("401")
      ) {
        useSettingsStore.getState().clearServerConfig()
      }
    }
    client.auth.me().catch(onUnauth)
    client.tones.list().then(setTones).catch(onUnauth)
    client.history
      .list({ limit: 50 })
      .then((r) => setHistoryItems(r.data))
      .catch(onUnauth)
    client.providers
      .list()
      .then((r) => {
        const models = r.providers
          .flatMap((p) => p.models)
          .filter((m) => m.enabledByUser !== false)
        setModels(models)
      })
      .catch(onUnauth)
  }, [serverUrl, sessionToken])

  useEffect(() => {
    syncActiveConfig()
  }, [serverUrl, sessionToken, modelId, toneSlug])

  useEffect(() => {
    if (
      (segments as string[]).includes("pair") ||
      (segments as string[]).includes("setup")
    )
      return
    if (!serverUrl || !sessionToken) {
      router.replace("/setup")
    }
  }, [serverUrl, sessionToken, segments])

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={theme}>
        <BottomSheetModalProvider>
          <ThemeProvider value={navTheme}>
            <AppTabs />
            <PairConfirmDialog
              params={pairParams}
              onDismiss={() => usePairStore.getState().set(null)}
            />
          </ThemeProvider>
        </BottomSheetModalProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  )
}
