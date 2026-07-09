import { useState } from "react"
import { StyleSheet, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { ActivityIndicator, IconButton, Text, useTheme } from "react-native-paper"

import { RefineInputArea } from "@/components/home/RefineInputArea"
import { RecentsSection } from "@/components/home/RecentsSection"
import { refreshAll } from "@/services/refresh"

export default function HomeScreen() {
  const theme = useTheme()
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = async () => {
    if (refreshing) return
    setRefreshing(true)
    await refreshAll()
    setRefreshing(false)
  }

  return (
    <SafeAreaView
      style={[styles.root, { backgroundColor: theme.colors.background }]}
      edges={["top"]}
    >
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>
          Refine
        </Text>
        {refreshing ? (
          <ActivityIndicator style={styles.refresh} />
        ) : (
          <IconButton
            icon="refresh"
            size={22}
            onPress={onRefresh}
            style={styles.refresh}
          />
        )}
      </View>
      <View style={styles.inputWrapper}>
        <RefineInputArea />
      </View>
      <View style={styles.recents}>
        <RecentsSection />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 16,
    paddingRight: 4,
    paddingTop: 8,
    paddingBottom: 4,
  },
  title: {
  },
  refresh: {
    margin: 0,
  },
  inputWrapper: {
    marginTop: 20,
    marginBottom: 8,
  },
  recents: {
    flex: 1,
  },
})
