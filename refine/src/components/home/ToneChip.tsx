import { useState } from 'react';
import { Chip, Menu } from 'react-native-paper';

import { useSettingsStore } from '@/store/settings-store';
import { syncActiveConfig } from '@/services/shared-prefs-bridge';

export function ToneChip() {
  const [visible, setVisible] = useState(false);
  const { tones, defaultToneSlug, setDefaultTone, apiKeys, defaultModel } = useSettingsStore();

  const current = tones.find((t) => t.slug === defaultToneSlug);

  const handleSelect = (slug: string) => {
    setDefaultTone(slug);
    setVisible(false);
    syncActiveConfig({
      apiKeys,
      defaultModel,
      tones,
      defaultToneSlug: slug,
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
          icon="tune"
          compact>
          {current?.name ?? 'Tone'}
        </Chip>
      }>
      {tones.map((t) => (
        <Menu.Item
          key={t.id}
          title={t.name}
          onPress={() => handleSelect(t.slug)}
          trailingIcon={t.slug === defaultToneSlug ? 'check' : undefined}
        />
      ))}
    </Menu>
  );
}
