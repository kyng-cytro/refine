import { useState } from "react"
import { FlatList, RefreshControl, ScrollView, StyleSheet } from "react-native"
import { Text, useTheme } from "react-native-paper"

import { HistoryCard } from "./HistoryCard"
import { useHistoryStore } from "@/store/history-store"
import { getApiClient } from "@/services/api"
import * as Haptics from "expo-haptics"
import { withHaptics } from "@/utils/haptics"

export const RecentsSection = () => {
  const { items, setItems, removeItem } = useHistoryStore()
  const [refreshing, setRefreshing] = useState(false)
  const theme = useTheme()

  const loadHistory = async () => {
    try {
      const client = getApiClient()
      const result = await client.history.list({ limit: 50 })
      setItems(result.data)
    } catch {
      // Keep existing items on error
    }
  }

  const handleRefresh = withHaptics(async () => {
    setRefreshing(true)
    await loadHistory()
    setRefreshing(false)
  }, Haptics.ImpactFeedbackStyle.Medium)

  const handleDelete = async (id: string) => {
    removeItem(id)
    try {
      await getApiClient().history.delete(id)
    } catch {
      // Silently fail — item is already removed from local state
    }
  }

  const refreshControl = (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={handleRefresh}
      colors={[theme.colors.primary]}
      tintColor={theme.colors.primary}
    />
  )

  if (items.length === 0) {
    return (
      <ScrollView
        contentContainerStyle={styles.empty}
        refreshControl={refreshControl}
        showsVerticalScrollIndicator={false}
      >
        <Text variant="titleSmall" style={styles.header}>
          History
        </Text>
        <Text variant="bodyMedium" style={styles.emptyText}>
          No refinements yet
        </Text>
      </ScrollView>
    )
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <HistoryCard item={item} onDelete={handleDelete} />
      )}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      refreshControl={refreshControl}
      ListHeaderComponent={
        <Text variant="titleSmall" style={styles.header}>
          History
        </Text>
      }
    />
  )
}

const styles = StyleSheet.create({
  list: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    opacity: 0.6,
    textTransform: "uppercase",
    fontSize: 11,
    letterSpacing: 0.8,
  },
  empty: {
    paddingTop: 32,
  },
  emptyText: {
    opacity: 0.4,
    marginTop: 4,
    paddingHorizontal: 16,
  },
})
