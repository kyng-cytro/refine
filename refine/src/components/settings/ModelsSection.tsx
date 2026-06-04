import { List, Switch } from 'react-native-paper';

import { MODELS } from '@/constants/models';
import { useSettingsStore } from '@/store/settings-store';
import { ModelId } from '@/types/settings';

export function ModelsSection() {
  const { enabledModels, setEnabledModel, apiKeys } = useSettingsStore();

  return (
    <List.Section>
      <List.Subheader>Models</List.Subheader>
      {MODELS.map((model) => {
        const hasKey = !!apiKeys[model.provider];
        const enabled = enabledModels[model.id as ModelId];
        return (
          <List.Item
            key={model.id}
            title={model.label}
            description={!hasKey ? `No ${model.provider} API key` : undefined}
            right={() => (
              <Switch
                value={enabled && hasKey}
                onValueChange={(v) => setEnabledModel(model.id as ModelId, v)}
                disabled={!hasKey}
              />
            )}
          />
        );
      })}
    </List.Section>
  );
}
