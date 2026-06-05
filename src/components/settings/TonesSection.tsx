import { useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Button, List } from 'react-native-paper';

import { ToneItem } from './ToneItem';
import { ToneBottomSheet, ToneBottomSheetHandle } from './ToneBottomSheet';
import { useSettingsStore } from '@/store/settings-store';
import { syncActiveConfig } from '@/services/shared-prefs-bridge';
import { Tone } from '@/types/settings';

export const TonesSection = () => {
  const bottomSheetRef = useRef<ToneBottomSheetHandle>(null);
  const [editingTone, setEditingTone] = useState<Tone | null>(null);

  const { tones, defaultToneSlug, deleteTone, setDefaultTone } = useSettingsStore();

  const openSheet = (tone?: Tone) => {
    setEditingTone(tone ?? null);
    bottomSheetRef.current?.present();
  };

  const handleDelete = (id: string) => {
    const tone = tones.find((t) => t.id === id);
    if (tone && defaultToneSlug === tone.slug) setDefaultTone('refined');
    deleteTone(id);
    syncActiveConfig();
  };

  const handleSetDefault = (slug: string) => {
    setDefaultTone(slug);
    syncActiveConfig();
  };

  return (
    <>
      <List.Section>
        <List.Subheader>Tones</List.Subheader>
        {tones.map((tone) => (
          <ToneItem
            key={tone.id}
            tone={tone}
            isDefault={tone.slug === defaultToneSlug}
            onPress={openSheet}
            onDelete={handleDelete}
            onSetDefault={handleSetDefault}
          />
        ))}
        <Button mode="text" icon="plus" onPress={() => openSheet()} style={styles.addButton}>
          Add Tone
        </Button>
      </List.Section>

      <ToneBottomSheet
        ref={bottomSheetRef}
        editingTone={editingTone}
        onDismiss={() => setEditingTone(null)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  addButton: {
    alignSelf: 'flex-start',
    marginLeft: 8,
  },
});
