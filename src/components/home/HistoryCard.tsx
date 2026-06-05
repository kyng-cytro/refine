import * as Clipboard from 'expo-clipboard';
import { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { IconButton, Surface, Text, TouchableRipple, useTheme } from 'react-native-paper';

import { HistoryItem } from '@/types/history';

interface Props {
  item: HistoryItem;
  onDelete: (id: string) => void;
}

function DeleteAction({
  onDelete,
  onClose,
}: {
  onDelete: () => void;
  onClose: () => void;
}) {
  const theme = useTheme();
  return (
    <View style={[styles.deleteAction, { backgroundColor: theme.colors.errorContainer }]}>
      <IconButton
        icon="delete-outline"
        iconColor={theme.colors.onErrorContainer}
        onPress={() => {
          onClose();
          onDelete();
        }}
      />
    </View>
  );
}

export function HistoryCard({ item, onDelete }: Props) {
  const swipeRef = useRef<Swipeable>(null);

  const renderRightActions = () => (
    <DeleteAction
      onDelete={() => onDelete(item.id)}
      onClose={() => swipeRef.current?.close()}
    />
  );

  return (
    <Swipeable
      ref={swipeRef}
      renderRightActions={renderRightActions}
      rightThreshold={40}
      overshootRight={false}>
      <TouchableRipple
        onPress={() => Clipboard.setStringAsync(item.refined)}
        onLongPress={() => Clipboard.setStringAsync(item.source)}
        borderless={false}>
        <Surface style={styles.card} elevation={1}>
          <View style={styles.row}>
            <View style={styles.textBlock}>
              <Text variant="labelSmall" style={styles.label}>Original</Text>
              <Text variant="bodySmall" numberOfLines={3} style={styles.content}>
                {item.source}
              </Text>
            </View>
            <Text style={styles.arrow}>→</Text>
            <View style={styles.textBlock}>
              <Text variant="labelSmall" style={styles.label}>Refined</Text>
              <Text variant="bodySmall" numberOfLines={3} style={styles.content}>
                {item.refined}
              </Text>
            </View>
          </View>
        </Surface>
      </TouchableRipple>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
    marginHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  label: {
    opacity: 0.5,
    textTransform: 'uppercase',
    fontSize: 10,
  },
  content: {
    lineHeight: 18,
  },
  arrow: {
    alignSelf: 'center',
    fontSize: 18,
    opacity: 0.4,
    paddingHorizontal: 4,
  },
  deleteAction: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#B00020',
    width: 64,
    borderRadius: 16,
    marginBottom: 8,
    marginRight: 16,
    alignSelf: 'stretch',
  },
});
