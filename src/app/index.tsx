import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from 'react-native-paper';

import { RefineInputArea } from '@/components/home/RefineInputArea';
import { RecentsSection } from '@/components/home/RecentsSection';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>
          Refine
        </Text>
      </View>
      <RefineInputArea />
      <View style={styles.recents}>
        <RecentsSection />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  title: {
    fontFamily: 'NotoSans_700Bold',
  },
  recents: {
    flex: 1,
  },
});
