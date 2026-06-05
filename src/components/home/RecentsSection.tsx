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
        <Text variant="titleSmall" style={styles.header}>History</Text>
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
        <Text variant="titleSmall" style={styles.header}>History</Text>
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
    paddingTop: 32,
  },
  emptyText: {
    opacity: 0.4,
    marginTop: 4,
    paddingHorizontal: 16,
  },
});
