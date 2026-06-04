import { BottomSheetModal, BottomSheetView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { forwardRef, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text, HelperText } from 'react-native-paper';

import { useSettingsStore } from '@/store/settings-store';
import { syncActiveConfig } from '@/services/shared-prefs-bridge';
import { Tone } from '@/types/settings';

interface Props {
  editingTone?: Tone | null;
  onDismiss: () => void;
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export const ToneBottomSheet = forwardRef<BottomSheetModal, Props>(
  ({ editingTone, onDismiss }, ref) => {
    const [name, setName] = useState('');
    const [instructions, setInstructions] = useState('');

    const { addOrUpdateTone, deleteTone, setDefaultTone, defaultToneSlug, apiKeys, defaultModel, tones } =
      useSettingsStore();

    useEffect(() => {
      if (editingTone) {
        setName(editingTone.name);
        setInstructions(editingTone.instructions);
      } else {
        setName('');
        setInstructions('');
      }
    }, [editingTone]);

    const handleSave = () => {
      if (!name.trim() || !instructions.trim()) return;
      const slug = toSlug(name);
      const tone: Tone = {
        id: editingTone?.id ?? `tone-${Date.now()}`,
        name: name.trim(),
        slug,
        instructions: instructions.trim(),
      };
      addOrUpdateTone(tone);
      syncActiveConfig({ apiKeys, defaultModel, tones: [...tones.filter(t => t.id !== tone.id), tone], defaultToneSlug });
      onDismiss();
    };

    const handleDelete = () => {
      if (!editingTone) return;
      deleteTone(editingTone.id);
      if (defaultToneSlug === editingTone.slug) setDefaultTone('refined');
      onDismiss();
    };

    const isDefault = editingTone?.id === 'default-refined';

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={['60%', '85%']}
        enablePanDownToClose
        onDismiss={onDismiss}>
        <BottomSheetView style={styles.container}>
          <Text variant="titleMedium" style={styles.title}>
            {editingTone ? 'Edit Tone' : 'New Tone'}
          </Text>

          <BottomSheetTextInput
            placeholder="Name"
            value={name}
            onChangeText={setName}
            style={styles.input}
            editable={!isDefault}
          />

          <BottomSheetTextInput
            placeholder="Instructions"
            value={instructions}
            onChangeText={setInstructions}
            style={[styles.input, styles.multilineInput]}
            multiline
            editable={!isDefault}
          />
          <HelperText type="info" style={styles.helper}>
            Describes the style of refinement. Injected into the AI prompt.
          </HelperText>

          <View style={styles.actions}>
            {editingTone && !isDefault && (
              <Button mode="text" textColor="#B00020" onPress={handleDelete}>
                Delete
              </Button>
            )}
            <View style={styles.rightActions}>
              <Button mode="text" onPress={onDismiss}>
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleSave}
                disabled={!name.trim() || !instructions.trim() || isDefault}>
                Save
              </Button>
            </View>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

ToneBottomSheet.displayName = 'ToneBottomSheet';

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 12,
  },
  title: {
    fontFamily: 'NotoSans_700Bold',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: 'NotoSans_400Regular',
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  helper: {
    marginTop: -8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  rightActions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 'auto',
  },
});
