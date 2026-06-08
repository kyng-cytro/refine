import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, useTheme } from 'react-native-paper';

import { RefineInputArea } from '@/components/home/RefineInputArea';
import { RecentsSection } from '@/components/home/RecentsSection';

export default function HomeScreen() {
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>
          Refine
        </Text>
      </View>
      <View style={styles.inputWrapper}>
        <RefineInputArea />
      </View>
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
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  title: {
    fontFamily: 'NotoSans_700Bold',
  },
  inputWrapper: {
    marginTop: 20,
    marginBottom: 8,
  },
  recents: {
    flex: 1,
  },
});
