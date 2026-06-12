import { withHaptics } from "@/utils/haptics"
import * as Clipboard from "expo-clipboard"
import { useRef } from "react"
import { Pressable, StyleSheet, Text as RNText, View } from "react-native"
import { Swipeable } from "react-native-gesture-handler"
import { Card, IconButton, Text, useTheme } from "react-native-paper"
import { HistoryItem } from "@/types/history"

function relativeTime(ts: number): string {
  const m = Math.floor((Date.now() - ts) / 60000)
  if (m < 1) return "just now"
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

interface Props {
  item: HistoryItem
  onDelete: (id: string) => void
}

function DeleteAction({
  onDelete,
  onClose,
}: {
  onDelete: () => void
  onClose: () => void
}) {
  const theme = useTheme()
  return (
    <View
      style={[
        styles.deleteAction,
        { backgroundColor: theme.colors.errorContainer },
      ]}
    >
      <IconButton
        icon="delete-outline"
        iconColor={theme.colors.onErrorContainer}
        onPress={() => {
          onClose()
          onDelete()
        }}
      />
    </View>
  )
}

export function HistoryCard({ item, onDelete }: Props) {
  const swipeRef = useRef<Swipeable>(null)
  const theme = useTheme()

  return (
    <Swipeable
      ref={swipeRef}
      renderRightActions={() => (
        <DeleteAction
          onDelete={() => onDelete(item.id)}
          onClose={() => swipeRef.current?.close()}
        />
      )}
      rightThreshold={40}
      overshootRight={false}
      onSwipeableWillOpen={withHaptics(() => {})}
    >
      <Card
        style={[styles.card, { backgroundColor: theme.colors.surface }]}
        elevation={0}
      >
        <Pressable
          onPress={() => Clipboard.setStringAsync(item.refined)}
          onLongPress={() => Clipboard.setStringAsync(item.source)}
          android_ripple={{
            color: theme.colors.primary + "22",
            borderless: false,
          }}
          style={styles.pressable}
        >
          <RNText
            numberOfLines={3}
            style={[styles.refined, { color: theme.colors.onSurface }]}
          >
            {item.refined}
          </RNText>
          <View style={styles.footer}>
            <RNText
              numberOfLines={1}
              style={[styles.source, { color: theme.colors.onSurfaceVariant }]}
            >
              {item.source}
            </RNText>
            <Text
              variant="labelSmall"
              style={{ color: theme.colors.onSurfaceVariant, opacity: 0.6 }}
            >
              {relativeTime(item.createdAt)}
            </Text>
          </View>
        </Pressable>
      </Card>
    </Swipeable>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 8,
    marginHorizontal: 16,
  },
  pressable: {
    gap: 4,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  refined: {
    lineHeight: 22,
  },
  footer: {
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  source: {
    flex: 1,
    opacity: 0.6,
  },
  deleteAction: {
    width: 64,
    marginLeft: 0,
    marginRight: 16,
    marginBottom: 8,
    borderRadius: 12,
    alignItems: "center",
    alignSelf: "stretch",
    justifyContent: "center",
  },
})
