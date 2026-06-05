import { BottomSheetModal, BottomSheetView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, HelperText, Text, useTheme } from 'react-native-paper';

import { useSettingsStore } from '@/store/settings-store';
import { syncActiveConfig } from '@/services/shared-prefs-bridge';
import { Tone } from '@/types/settings';

interface Props {
  editingTone?: Tone | null;
  onDismiss: () => void;
}

export interface ToneBottomSheetHandle {
  present: () => void;
}

const toSlug = (name: string) =>
  name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const ToneBottomSheet = forwardRef<ToneBottomSheetHandle, Props>(
  ({ editingTone, onDismiss }, forwardedRef) => {
    const sheetRef = useRef<BottomSheetModal>(null);
    const [name, setName] = useState('');
    const [instructions, setInstructions] = useState('');
    const theme = useTheme();

    useImperativeHandle(forwardedRef, () => ({
      present: () => sheetRef.current?.present(),
    }));

    const close = () => sheetRef.current?.dismiss();

    const { addOrUpdateTone, deleteTone, setDefaultTone, defaultToneSlug } = useSettingsStore();

    useEffect(() => {
      setName(editingTone?.name ?? '');
      setInstructions(editingTone?.instructions ?? '');
    }, [editingTone]);

    const isProtected = editingTone?.id === 'default-refined';

    const handleSave = () => {
      const trimmedName = name.trim();
      const trimmedInstructions = instructions.trim();
      if (!trimmedName || !trimmedInstructions) return;
      addOrUpdateTone({
        id: editingTone?.id ?? `tone-${Date.now()}`,
        name: trimmedName,
        slug: toSlug(trimmedName),
        instructions: trimmedInstructions,
      });
      syncActiveConfig();
      close();
    };

    const handleDelete = () => {
      if (!editingTone) return;
      if (defaultToneSlug === editingTone.slug) setDefaultTone('refined');
      deleteTone(editingTone.id);
      syncActiveConfig();
      close();
    };

    const inputStyle = [
      styles.input,
      {
        borderColor: theme.colors.outline,
        backgroundColor: theme.colors.surfaceVariant,
        color: theme.colors.onSurface,
        fontFamily: 'NotoSans_400Regular',
      },
    ];

    return (
      <BottomSheetModal
        ref={sheetRef}
        snapPoints={['60%', '85%']}
        enablePanDownToClose
        onDismiss={onDismiss}
        backgroundStyle={{ backgroundColor: theme.colors.surface }}
        handleIndicatorStyle={{ backgroundColor: theme.colors.onSurfaceVariant }}>
        <BottomSheetView style={styles.container}>
          <Text variant="titleMedium" style={styles.title}>
            {editingTone ? 'Edit Tone' : 'New Tone'}
          </Text>

          <BottomSheetTextInput
            placeholder="Name"
            placeholderTextColor={theme.colors.onSurfaceVariant}
            value={name}
            onChangeText={setName}
            style={inputStyle}
            editable={!isProtected}
          />

          <BottomSheetTextInput
            placeholder="Instructions"
            placeholderTextColor={theme.colors.onSurfaceVariant}
            value={instructions}
            onChangeText={setInstructions}
            style={[inputStyle, styles.multilineInput]}
            multiline
            editable={!isProtected}
          />
          <HelperText type="info" style={styles.helper}>
            Describes the style of refinement. Injected into the AI prompt.
          </HelperText>

          <View style={styles.actions}>
            {editingTone && !isProtected && (
              <Button mode="text" textColor={theme.colors.error} onPress={handleDelete}>
                Delete
              </Button>
            )}
            <View style={styles.rightActions}>
              <Button mode="text" onPress={close}>Cancel</Button>
              <Button
                mode="contained"
                onPress={handleSave}
                disabled={!name.trim() || !instructions.trim() || isProtected}>
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
  container: { padding: 20, gap: 12 },
  title: { fontFamily: 'NotoSans_700Bold', marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  multilineInput: { minHeight: 100, textAlignVertical: 'top' },
  helper: { marginTop: -8 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  rightActions: { flexDirection: 'row', gap: 8, marginLeft: 'auto' },
});
