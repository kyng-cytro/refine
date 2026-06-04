import { StyleSheet } from 'react-native';
import { List, TextInput } from 'react-native-paper';

import { useSettingsStore } from '@/store/settings-store';
import { syncActiveConfig } from '@/services/shared-prefs-bridge';
import { ApiKeys } from '@/types/settings';

const PROVIDERS: { key: keyof ApiKeys; label: string; placeholder: string }[] = [
  { key: 'openai', label: 'OpenAI', placeholder: 'sk-...' },
  { key: 'anthropic', label: 'Anthropic', placeholder: 'sk-ant-...' },
  { key: 'google', label: 'Google AI', placeholder: 'AIza...' },
];

export const ApiKeySection = () => {
  const { apiKeys, setApiKey } = useSettingsStore();

  const handleBlur = (provider: keyof ApiKeys, value: string) => {
    if (value === apiKeys[provider]) return; // skip if unchanged
    setApiKey(provider, value);
    syncActiveConfig();
  };

  return (
    <List.Section>
      <List.Subheader>API Keys</List.Subheader>
      {PROVIDERS.map(({ key, label, placeholder }) => (
        <TextInput
          key={key}
          label={label}
          mode="outlined"
          secureTextEntry
          defaultValue={apiKeys[key]}
          placeholder={placeholder}
          onEndEditing={(e) => handleBlur(key, e.nativeEvent.text)}
          style={styles.input}
          outlineStyle={styles.outline}
          autoCapitalize="none"
          autoCorrect={false}
        />
      ))}
    </List.Section>
  );
};

const styles = StyleSheet.create({
  input: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  outline: {
    borderRadius: 12,
  },
});
