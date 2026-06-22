import { useEffect, useState } from "react"
import { View, StyleSheet } from "react-native"
import {
  Button,
  Dialog,
  HelperText,
  Portal,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper"
import { router } from "expo-router"
import { useSettingsStore } from "@/store/settings-store"
import { pairAndBootstrap } from "@/services/pairing"

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

  const [deviceName, setDeviceName] = useState(params?.name ?? "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (params?.name) setDeviceName(params.name)
  }, [params])

  const connect = async () => {
    if (!params) return
    setError("")
    setLoading(true)
    try {
      const res = await pairAndBootstrap({
        serverUrl: params.url,
        pairingToken: params.token,
        deviceName,
      })
      if (!res.ok) {
        setError(res.error ?? "Connection failed")
        return
      }
      onDismiss()
      router.replace("/")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Portal>
      <Dialog visible={!!params} onDismiss={onDismiss} style={styles.dialog}>
        <Dialog.Title>Connect to server</Dialog.Title>
        <Dialog.Content style={styles.content}>
          <Text
            variant="bodySmall"
            style={[styles.url, { color: theme.colors.onSurfaceVariant }]}
          >
            {params?.url}
          </Text>

          {existingUrl && existingUrl !== params?.url && (
            <View
              style={[
                styles.warning,
                { backgroundColor: theme.colors.errorContainer },
              ]}
            >
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.onErrorContainer }}
              >
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
            {...({ autoCorrect: false } as any)}
          />

          {!!error && (
            <HelperText type="error" visible>
              {error}
            </HelperText>
          )}
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss} disabled={loading}>
            Cancel
          </Button>
          <Button onPress={connect} loading={loading} disabled={loading}>
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
