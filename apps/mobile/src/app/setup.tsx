import { CameraView, useCameraPermissions } from "expo-camera"
import { router } from "expo-router"
import { useState } from "react"
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native"
import {
  Button,
  HelperText,
  IconButton,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper"
import { SafeAreaView } from "react-native-safe-area-context"

import { syncActiveConfig } from "@/services/shared-prefs-bridge"
import { useSettingsStore } from "@/store/settings-store"
import { createClient } from "@refine/sdk"

interface PairValues {
  serverUrl: string
  pairingToken: string
  deviceName: string
}

function parsePairQR(data: string): PairValues | null {
  try {
    const url = new URL(data)
    const token = url.searchParams.get("token")
    const name = decodeURIComponent(url.searchParams.get("name") ?? "My Phone")
    if (!token) return null
    const serverUrl = url.protocol === "refine:"
      ? decodeURIComponent(url.searchParams.get("url") ?? "")
      : url.origin
    if (!serverUrl) return null
    return { serverUrl, pairingToken: token, deviceName: name }
  } catch {
    return null
  }
}

function usePair() {
  const { setServerConfig } = useSettingsStore()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const connect = async ({
    serverUrl,
    pairingToken,
    deviceName,
  }: PairValues) => {
    const url = serverUrl.trim().replace(/\/$/, "")
    const token = pairingToken.trim()
    const name = deviceName.trim() || "My Phone"

    if (!url) {
      setError("Server URL is required")
      return false
    }
    if (!token) {
      setError("Pairing token is required")
      return false
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

      router.replace("/")
      return true
    } catch (e: any) {
      setError(e?.data?.message ?? e?.message ?? "Connection failed")
      return false
    } finally {
      setLoading(false)
    }
  }

  return { connect, error, setError, loading }
}

export default function SetupScreen() {
  const theme = useTheme()
  const [serverUrl, setServerUrl] = useState("")
  const [pairingToken, setPairingToken] = useState("")
  const [deviceName, setDeviceName] = useState("My Phone")
  const [scanning, setScanning] = useState(false)
  const [scanned, setScanned] = useState(false)
  const { connect, error, loading } = usePair()
  const [permission, requestPermission] = useCameraPermissions()

  const handleConnect = () => connect({ serverUrl, pairingToken, deviceName })

  const openScanner = async () => {
    if (!permission?.granted) {
      const result = await requestPermission()
      if (!result.granted) return
    }
    setScanned(false)
    setScanning(true)
  }

  const onBarcodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return
    setScanned(true)
    setScanning(false)
    const values = parsePairQR(data)
    if (values) await connect(values)
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
          <Text variant="headlineMedium" style={styles.title}>
            Connect to server
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Enter your self-hosted Refine server details, or scan the QR code
            from your admin panel.
          </Text>

          <Button
            mode="outlined"
            icon="qrcode-scan"
            onPress={openScanner}
            style={styles.scanButton}
          >
            Scan QR Code
          </Button>

          <TextInput
            label="Server URL"
            value={serverUrl}
            onChangeText={setServerUrl}
            placeholder="https://refine.example.com"
            {...({
              autoCapitalize: "none",
              autoCorrect: false,
              keyboardType: "url",
            } as any)}
            style={styles.input}
            mode="outlined"
          />

          <TextInput
            label="Pairing token"
            value={pairingToken}
            onChangeText={setPairingToken}
            {...({
              autoCapitalize: "none",
              autoCorrect: false,
              secureTextEntry: true,
            } as any)}
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

      <Modal
        visible={scanning}
        animationType="slide"
        onRequestClose={() => setScanning(false)}
      >
        <View style={[styles.camera, { backgroundColor: "#000" }]}>
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            onBarcodeScanned={onBarcodeScanned}
          />
          <SafeAreaView style={styles.cameraOverlay} pointerEvents="box-none">
            <IconButton
              icon="close"
              iconColor="#fff"
              size={28}
              style={styles.closeBtn}
              onPress={() => setScanning(false)}
            />
            <View style={styles.scanFrame} />
            <Text style={styles.scanHint}>
              Point at the QR code from your admin panel
            </Text>
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  scroll: { padding: 24, paddingTop: 48 },
  title: { marginBottom: 8 },
  subtitle: { marginBottom: 24, opacity: 0.6 },
  scanButton: { marginBottom: 24 },
  input: { marginBottom: 16 },
  button: { marginTop: 8 },
  buttonContent: { paddingVertical: 4 },
  camera: { flex: 1 },
  cameraOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 48,
  },
  closeBtn: { alignSelf: "flex-end", margin: 8 },
  scanFrame: {
    width: 220,
    height: 220,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.8)",
  },
  scanHint: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 32,
  },
})
