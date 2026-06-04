import { useState } from 'react';
import { Chip, Menu } from 'react-native-paper';

import { MODELS } from '@/constants/models';
import { useSettingsStore } from '@/store/settings-store';
import { syncActiveConfig } from '@/services/shared-prefs-bridge';

export function ModelChip() {
  const [visible, setVisible] = useState(false);
  const { enabledModels, defaultModel, setDefaultModel, apiKeys, tones, defaultToneSlug } =
    useSettingsStore();

  const availableModels = MODELS.filter(
    (m) => enabledModels[m.id] && apiKeys[m.provider]
  );

  const current = MODELS.find((m) => m.id === defaultModel);

  const handleSelect = (modelId: typeof defaultModel) => {
    setDefaultModel(modelId);
    setVisible(false);
    syncActiveConfig({
      apiKeys,
      defaultModel: modelId,
      tones,
      defaultToneSlug,
    });
  };

  return (
    <Menu
      visible={visible}
      onDismiss={() => setVisible(false)}
      anchor={
        <Chip
          mode="outlined"
          onPress={() => setVisible(true)}
          icon="cpu-64-bit"
          compact>
          {current?.label ?? 'Model'}
        </Chip>
      }>
      {availableModels.length === 0 ? (
        <Menu.Item title="No models enabled" disabled />
      ) : (
        availableModels.map((m) => (
          <Menu.Item
            key={m.id}
            title={m.label}
            onPress={() => handleSelect(m.id)}
            trailingIcon={m.id === defaultModel ? 'check' : undefined}
          />
        ))
      )}
    </Menu>
  );
}
