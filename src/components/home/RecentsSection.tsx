import { FlatList, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { HistoryCard } from './HistoryCard';
import { useHistoryStore } from '@/store/history-store';
import { syncHistoryToNative } from '@/services/shared-prefs-bridge';

export const RecentsSection = () => {
  const { items, deleteItem } = useHistoryStore();

  const handleDelete = (id: string) => {
    deleteItem(id);
    // Read fresh state after mutation to avoid stale closure
    syncHistoryToNative(useHistoryStore.getState().items);
  };

  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <Text variant="bodyMedium" style={styles.emptyText}>No refinements yet</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <HistoryCard item={item} onDelete={handleDelete} />}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <Text variant="titleSmall" style={styles.header}>Recents</Text>
      }
    />
  );
};

const styles = StyleSheet.create({
  list: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    opacity: 0.6,
    textTransform: 'uppercase',
    fontSize: 11,
    letterSpacing: 0.8,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 48,
  },
  emptyText: {
    opacity: 0.4,
  },
});
