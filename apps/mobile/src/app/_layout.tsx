import PairConfirmDialog from "@/components/PairConfirmDialog"
import { usePairStore } from "@/store/pair-store"
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet"
import { useMaterial3Theme } from "@pchmn/expo-material3-theme"
import { router, ThemeProvider, useSegments } from "expo-router"
import * as SplashScreen from "expo-splash-screen"
import { useEffect, useMemo, useState } from "react"
import { useColorScheme } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from "react-native-paper"

import AppTabs from "@/components/app-tabs"
import { refreshAll } from "@/services/refresh"
import {
  loadSessionToken,
  syncActiveConfig,
} from "@/services/shared-prefs-bridge"
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
  const modelId = useSettingsStore((s) => s.modelId)
  const toneSlug = useSettingsStore((s) => s.toneSlug)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    loadSessionToken()
      .then((token) => {
        if (token) setSessionToken(token)
      })
      .finally(() => {
        setInitialized(true)
        SplashScreen.hideAsync()
      })
  }, [])

  useEffect(() => {
    refreshAll()
  }, [serverUrl, sessionToken])

  useEffect(() => {
    if (!initialized) return
    syncActiveConfig()
  }, [initialized, serverUrl, sessionToken, modelId, toneSlug])

  useEffect(() => {
    if (!initialized) return
    if (
      (segments as string[]).includes("pair") ||
      (segments as string[]).includes("setup")
    )
      return
    if (!serverUrl || !sessionToken) {
      router.replace("/setup")
    }
  }, [initialized, serverUrl, sessionToken, segments])

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
