import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, useTheme } from 'react-native-paper';

import { ProvidersSection } from '@/components/settings/ProvidersSection';
import { TonesSection } from '@/components/settings/TonesSection';

export default function SettingsScreen() {
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <Text variant="headlineSmall" style={styles.title}>
        Settings
      </Text>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ProvidersSection />
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
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    fontFamily: 'NotoSans_700Bold',
  },
  scroll: {
    paddingBottom: 40,
  },
});
