import { useState } from "react"
import { View, StyleSheet } from "react-native"
import { Button, Dialog, HelperText, Portal, Text, TextInput, useTheme } from "react-native-paper"
import { router } from "expo-router"
import { createClient } from "@refine/sdk"
import { useSettingsStore } from "@/store/settings-store"
import { syncActiveConfig } from "@/services/shared-prefs-bridge"

export interface PairParams {
  token: string
  url: string
  name: string
}

interface Props {
  params: PairParams | null
  onDismiss: () => void
}

export default function PairConfirmDialog({ params, onDismiss }: Props) {
  const theme = useTheme()
  const existingUrl = useSettingsStore((s) => s.serverUrl)
  const { setServerConfig } = useSettingsStore()

  const [deviceName, setDeviceName] = useState(params?.name ?? "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Reset local state when params change
  if (params && deviceName === "" && params.name) {
    setDeviceName(params.name)
  }

  const connect = async () => {
    if (!params) return
    const url = params.url.trim().replace(/\/$/, "")
    const name = deviceName.trim() || params.name || "My Phone"

    setError("")
    setLoading(true)
    try {
      const client = createClient({ baseURL: url })
      const { sessionToken } = await client.auth.pair({ pairingToken: params.token, deviceName: name })

      setServerConfig(url, sessionToken)
      syncActiveConfig()

      const authed = createClient({ baseURL: url, sessionToken })
      const [tones, { providers }] = await Promise.all([
        authed.tones.list(),
        authed.providers.list(),
      ])
      if (tones[0]) {
        useSettingsStore.getState().setTone(tones[0].slug)
        useSettingsStore.getState().setTones(tones)
      }
      const firstModel = providers.flatMap((p) => p.models)[0]
      if (firstModel) useSettingsStore.getState().setModel(firstModel.id)

      onDismiss()
      router.replace("/")
    } catch (e: any) {
      setError(e?.data?.message ?? e?.message ?? "Connection failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Portal>
      <Dialog visible={!!params} onDismiss={onDismiss} style={styles.dialog}>
        <Dialog.Title>Connect to server</Dialog.Title>
        <Dialog.Content style={styles.content}>
          <Text variant="bodySmall" style={[styles.url, { color: theme.colors.onSurfaceVariant }]}>
            {params?.url}
          </Text>

          {existingUrl && existingUrl !== params?.url && (
            <View style={[styles.warning, { backgroundColor: theme.colors.errorContainer }]}>
              <Text variant="bodySmall" style={{ color: theme.colors.onErrorContainer }}>
                This will replace your current connection to {existingUrl}
              </Text>
            </View>
          )}

          <TextInput
            label="Device name"
            value={deviceName}
            onChangeText={setDeviceName}
            mode="outlined"
            style={styles.input}
            autoCorrect={false}
          />

          {!!error && <HelperText type="error" visible>{error}</HelperText>}
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss} disabled={loading}>Cancel</Button>
          <Button mode="contained" onPress={connect} loading={loading} disabled={loading}>
            Connect
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  )
}

const styles = StyleSheet.create({
  dialog: { marginHorizontal: 24 },
  content: { gap: 12 },
  url: { opacity: 0.7 },
  warning: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  input: { marginTop: 4 },
})
