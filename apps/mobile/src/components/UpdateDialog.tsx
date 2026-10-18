import { useState } from "react"
import { updatePrompt } from "@refine/versions"
import { router } from "expo-router"
import { Button, Dialog, Portal, Text } from "react-native-paper"
import {
  dismissUpdate,
  getVersionInfo,
  installUpdate,
} from "@/services/versions"
import { useSettingsStore } from "@/store/settings-store"
import { useVersionStore } from "@/store/version-store"

export default function UpdateDialog() {
  const connected = useSettingsStore((s) => !!s.serverUrl && !!s.sessionToken)
  const clearServerConfig = useSettingsStore((s) => s.clearServerConfig)
  const info = getVersionInfo(useVersionStore())
  const [updating, setUpdating] = useState(false)

  const prompt = connected ? updatePrompt("mobile", info) : null
  if (!prompt) return null

  const update = async () => {
    setUpdating(true)
    try {
      await installUpdate(prompt.target)
    } finally {
      setUpdating(false)
    }
  }

  const disconnect = () => {
    clearServerConfig()
    useVersionStore.getState().setServer(null)
    router.replace("/setup")
  }

  const dismiss = () => dismissUpdate(prompt.target)
  const serverBlocked = prompt.blocking && prompt.target === "server"

  return (
    <Portal>
      <Dialog visible dismissable={!prompt.blocking} onDismiss={dismiss}>
        <Dialog.Title>{prompt.title}</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">{prompt.description}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          {prompt.blocking ? (
            <Button onPress={disconnect}>Disconnect</Button>
          ) : (
            <Button onPress={dismiss}>Dismiss</Button>
          )}
          {!serverBlocked && (
            <Button onPress={update} loading={updating} disabled={updating}>
              Update
            </Button>
          )}
        </Dialog.Actions>
      </Dialog>
    </Portal>
  )
}
