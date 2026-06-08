import * as Clipboard from 'expo-clipboard';
import { withHaptics } from '@/utils/haptics';
import { useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Card, IconButton, Text, useTheme } from 'react-native-paper';

import { HistoryItem } from '@/types/history';

function relativeTime(ts: number): string {
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

interface Props {
  item: HistoryItem;
  onDelete: (id: string) => void;
}

function DeleteAction({ onDelete, onClose }: { onDelete: () => void; onClose: () => void }) {
  const theme = useTheme();
  return (
    <View style={[styles.deleteAction, { backgroundColor: theme.colors.errorContainer }]}>
      <IconButton
        icon="delete-outline"
        iconColor={theme.colors.onErrorContainer}
        onPress={() => { onClose(); onDelete(); }}
      />
    </View>
  );
}

export function HistoryCard({ item, onDelete }: Props) {
  const swipeRef = useRef<Swipeable>(null);
  const theme = useTheme();

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
      onSwipeableWillOpen={withHaptics(() => {})}>
      <Card
        style={[styles.card, { backgroundColor: theme.colors.surface }]}
        elevation={1}>
        <Pressable
          onPress={() => Clipboard.setStringAsync(item.refined)}
          onLongPress={() => Clipboard.setStringAsync(item.source)}
          android_ripple={{ color: theme.colors.primary + '22', borderless: false }}
          style={styles.pressable}>
          <Text
            variant="bodyMedium"
            numberOfLines={3}
            style={[styles.refined, { color: theme.colors.onSurface }]}>
            {item.refined}
          </Text>
          <View style={styles.footer}>
            <Text
              variant="bodySmall"
              numberOfLines={1}
              style={[styles.source, { color: theme.colors.onSurfaceVariant }]}>
              {item.source}
            </Text>
            <Text
              variant="labelSmall"
              style={{ color: theme.colors.onSurfaceVariant, opacity: 0.6 }}>
              {relativeTime(item.timestamp)}
            </Text>
          </View>
        </Pressable>
      </Card>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
    marginHorizontal: 16,
  },
  pressable: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  refined: {
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  source: {
    flex: 1,
    opacity: 0.6,
  },
  deleteAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 64,
    borderRadius: 12,
    marginBottom: 8,
    marginRight: 16,
    marginLeft: 0,
    alignSelf: 'stretch',
  },
});
