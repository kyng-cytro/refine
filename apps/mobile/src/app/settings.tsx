import { useEffect } from "react"
import { ScrollView, StyleSheet } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Text, List, Button, Switch, useTheme } from "react-native-paper"
import { router } from "expo-router"

import { ProvidersSection } from "@/components/settings/ProvidersSection"
import { TonesSection } from "@/components/settings/TonesSection"
import { useSettingsStore } from "@/store/settings-store"

export default function SettingsScreen() {
  const theme = useTheme()
  const {
    serverUrl,
    sessionToken,
    clearServerConfig,
    saveHistory,
    privateHistory,
    setSaveHistory,
    setPrivateHistory,
  } = useSettingsStore()

  useEffect(() => {
    if (!serverUrl || !sessionToken) router.replace("/setup")
  }, [serverUrl, sessionToken])

  const handleDisconnect = () => {
    clearServerConfig()
    router.replace("/setup")
  }

  return (
    <SafeAreaView
      style={[styles.root, { backgroundColor: theme.colors.background }]}
      edges={["top"]}
    >
      <Text variant="headlineSmall" style={styles.title}>
        Settings
      </Text>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <List.Section>
          <List.Subheader>Server</List.Subheader>
          <List.Item
            title={serverUrl || "Not connected"}
            description="Connected server"
            left={(props) => <List.Icon {...props} icon="server-network" />}
          />
          <Button
            mode="outlined"
            icon="link-off"
            onPress={handleDisconnect}
            style={styles.disconnectButton}
            textColor={theme.colors.error}
          >
            Disconnect
          </Button>
        </List.Section>

        <List.Section>
          <List.Subheader>History</List.Subheader>
          <List.Item
            title="Save history"
            description="Store refinements on the server and sync across devices."
            left={(props) => <List.Icon {...props} icon="history" />}
            right={() => (
              <Switch value={saveHistory} onValueChange={setSaveHistory} />
            )}
          />
          <List.Item
            title="Private"
            description="Hide saved refinements from the admin dashboard."
            left={(props) => <List.Icon {...props} icon="eye-off" />}
            right={() => (
              <Switch
                value={privateHistory && saveHistory}
                disabled={!saveHistory}
                onValueChange={setPrivateHistory}
              />
            )}
          />
        </List.Section>

        <ProvidersSection />
        <TonesSection />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  title: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  scroll: {
    paddingBottom: 40,
  },
  disconnectButton: {
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 8,
  },
})
