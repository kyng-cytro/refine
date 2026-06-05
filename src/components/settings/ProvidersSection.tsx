import { useRef, useState } from 'react';
import { List, useTheme } from 'react-native-paper';

import { ProviderBottomSheet, ProviderBottomSheetHandle } from './ProviderBottomSheet';
import { MODELS } from '@/constants/models';
import { useSettingsStore } from '@/store/settings-store';
import { ModelProvider } from '@/types/settings';

const PROVIDERS: { key: ModelProvider; label: string; icon: string }[] = [
  { key: 'google', label: 'Google', icon: 'google' },
  { key: 'anthropic', label: 'Anthropic', icon: 'head-lightbulb-outline' },
  { key: 'openai', label: 'OpenAI', icon: 'robot-outline' },
];

export function ProvidersSection() {
  const bottomSheetRef = useRef<ProviderBottomSheetHandle>(null);
  const [activeProvider, setActiveProvider] = useState<ModelProvider>('google');
  const { apiKeys, enabledModels } = useSettingsStore();
  const theme = useTheme();

  const openSheet = (provider: ModelProvider) => {
    setActiveProvider(provider);
    bottomSheetRef.current?.present();
  };

  const getDescription = (provider: ModelProvider) => {
    if (!apiKeys[provider]) return 'Tap to add API key';
    const providerModels = MODELS.filter((m) => m.provider === provider);
    const active = providerModels.filter((m) => enabledModels[m.id]);
    if (active.length === 0) return 'Key set · No models active';
    return `${active.length} model${active.length > 1 ? 's' : ''} active`;
  };

  return (
    <>
      <List.Section>
        <List.Subheader>Models</List.Subheader>
        {PROVIDERS.map(({ key, label, icon }) => (
          <List.Item
            key={key}
            title={label}
            description={getDescription(key)}
            left={(props) => (
              <List.Icon
                {...props}
                icon={icon}
                color={apiKeys[key] ? theme.colors.primary : theme.colors.onSurfaceVariant}
              />
            )}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => openSheet(key)}
          />
        ))}
      </List.Section>

      <ProviderBottomSheet ref={bottomSheetRef} provider={activeProvider} />
    </>
  );
}
