import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from 'react-native-paper';

import { ApiKeySection } from '@/components/settings/ApiKeySection';
import { ModelsSection } from '@/components/settings/ModelsSection';
import { TonesSection } from '@/components/settings/TonesSection';

export default function SettingsScreen() {
  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <Text variant="headlineSmall" style={styles.title}>
        Settings
      </Text>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ApiKeySection />
        <ModelsSection />
        <TonesSection />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  title: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    fontFamily: 'NotoSans_700Bold',
  },
  scroll: {
    paddingBottom: 40,
  },
});
