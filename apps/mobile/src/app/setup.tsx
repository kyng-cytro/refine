import { useState } from "react"
import {
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import {
  Text,
  TextInput,
  Button,
  useTheme,
  HelperText,
} from "react-native-paper"
import { router } from "expo-router"

import { createClient } from "@refine/sdk"
import { useSettingsStore } from "@/store/settings-store"
import { syncActiveConfig } from "@/services/shared-prefs-bridge"

export default function SetupScreen() {
  const theme = useTheme()
  const { setServerConfig } = useSettingsStore()

  const [serverUrl, setServerUrl] = useState("")
  const [pairingToken, setPairingToken] = useState("")
  const [deviceName, setDeviceName] = useState("My Phone")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleConnect = async () => {
    const url = serverUrl.trim().replace(/\/$/, "")
    const token = pairingToken.trim()
    const name = deviceName.trim() || "My Phone"

    if (!url) {
      setError("Server URL is required")
      return
    }
    if (!token) {
      setError("Pairing token is required")
      return
    }

    setError("")
    setLoading(true)

    try {
      const client = createClient({ baseURL: url })
      const { sessionToken } = await client.auth.pair({
        pairingToken: token,
        deviceName: name,
      })

      setServerConfig(url, sessionToken)
      syncActiveConfig()

      // Load tones and pick defaults
      const tonesClient = createClient({ baseURL: url, sessionToken })
      const tones = await tonesClient.tones.list()
      const firstTone = tones[0]
      if (firstTone) {
        useSettingsStore.getState().setTone(firstTone.slug)
        useSettingsStore.getState().setTones(tones)
      }

      // Load providers and pick first available model as default
      const { providers } = await tonesClient.providers.list()
      const firstModel = providers.flatMap((p) => p.models)[0]
      if (firstModel) {
        useSettingsStore.getState().setModel(firstModel.id)
      }

      router.replace("/")
    } catch (e: any) {
      const msg = e?.data?.message ?? e?.message ?? "Connection failed"
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView
      style={[styles.root, { backgroundColor: theme.colors.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Text
            variant="headlineMedium"
            style={[styles.title, { fontFamily: "NotoSans_700Bold" }]}
          >
            Connect to server
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Enter your self-hosted Refine server URL and the pairing token
            provided by your server admin.
          </Text>

          <TextInput
            label="Server URL"
            value={serverUrl}
            onChangeText={setServerUrl}
            placeholder="https://refine.example.com"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            style={styles.input}
            mode="outlined"
          />

          <TextInput
            label="Pairing token"
            value={pairingToken}
            onChangeText={setPairingToken}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
            style={styles.input}
            mode="outlined"
          />

          <TextInput
            label="Device name"
            value={deviceName}
            onChangeText={setDeviceName}
            style={styles.input}
            mode="outlined"
          />

          {!!error && (
            <HelperText type="error" visible>
              {error}
            </HelperText>
          )}

          <Button
            mode="contained"
            onPress={handleConnect}
            loading={loading}
            disabled={loading}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Connect
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  scroll: { padding: 24, paddingTop: 48 },
  title: { marginBottom: 8 },
  subtitle: { marginBottom: 32, opacity: 0.6 },
  input: { marginBottom: 16 },
  button: { marginTop: 8 },
  buttonContent: { paddingVertical: 4 },
})
