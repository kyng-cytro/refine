import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetTextInput,
  BottomSheetView,
} from "@gorhom/bottom-sheet"
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react"
import { StyleSheet, View } from "react-native"
import { Button, HelperText, Text, useTheme } from "react-native-paper"

import { getApiClient } from "@/services/api"
import { syncActiveConfig } from "@/services/shared-prefs-bridge"
import type { Tone } from "@refine/schemas"

interface Props {
  editingTone?: Tone | null
  onDismiss: () => void
  onSaved: () => Promise<void>
}

export interface ToneBottomSheetHandle {
  present: () => void
}

const toSlug = (name: string) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")

export const ToneBottomSheet = forwardRef<ToneBottomSheetHandle, Props>(
  ({ editingTone, onDismiss, onSaved }, forwardedRef) => {
    const sheetRef = useRef<BottomSheetModal>(null)
    const [name, setName] = useState("")
    const [instructions, setInstructions] = useState("")
    const [saving, setSaving] = useState(false)
    const theme = useTheme()

    useImperativeHandle(forwardedRef, () => ({
      present: () => sheetRef.current?.present(),
    }))

    const close = () => sheetRef.current?.dismiss()
    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          pressBehavior="close"
        />
      ),
      [],
    )

    useEffect(() => {
      setName(editingTone?.name ?? "")
      setInstructions(editingTone?.instructions ?? "")
    }, [editingTone])

    const handleSave = async () => {
      const trimmedName = name.trim()
      const trimmedInstructions = instructions.trim()
      if (!trimmedName || !trimmedInstructions) return

      setSaving(true)
      try {
        const client = getApiClient()
        const slug = toSlug(trimmedName)
        if (editingTone) {
          await client.tones.update(editingTone.id, {
            name: trimmedName,
            slug,
            instructions: trimmedInstructions,
          })
        } else {
          await client.tones.create({
            name: trimmedName,
            slug,
            instructions: trimmedInstructions,
          })
        }
        await onSaved()
        syncActiveConfig()
        close()
      } catch (e: any) {
        // Error handled silently — could add a snackbar here
      } finally {
        setSaving(false)
      }
    }

    const inputStyle = [
      styles.input,
      {
        borderColor: theme.colors.outline,
        backgroundColor: theme.colors.surfaceVariant,
        color: theme.colors.onSurface,
      },
    ]

    return (
      <BottomSheetModal
        ref={sheetRef}
        snapPoints={["60%", "85%"]}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        onDismiss={onDismiss}
        backgroundStyle={{ backgroundColor: theme.colors.surface }}
        handleIndicatorStyle={{
          backgroundColor: theme.colors.onSurfaceVariant,
        }}
      >
        <BottomSheetView style={styles.container}>
          <Text variant="titleMedium" style={styles.title}>
            {editingTone ? "Edit Tone" : "New Tone"}
          </Text>

          <BottomSheetTextInput
            placeholder="Name"
            placeholderTextColor={theme.colors.onSurfaceVariant}
            value={name}
            onChangeText={setName}
            style={inputStyle}
          />

          <BottomSheetTextInput
            placeholder="Instructions"
            placeholderTextColor={theme.colors.onSurfaceVariant}
            value={instructions}
            onChangeText={setInstructions}
            style={[inputStyle, styles.multilineInput]}
            multiline
          />
          <HelperText type="info" style={styles.helper}>
            Describes the style of refinement. Injected into the AI prompt.
          </HelperText>

          <View style={styles.actions}>
            <View style={styles.rightActions}>
              <Button mode="text" onPress={close} disabled={saving}>
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleSave}
                disabled={!name.trim() || !instructions.trim() || saving}
                loading={saving}
              >
                Save
              </Button>
            </View>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    )
  },
)

ToneBottomSheet.displayName = "ToneBottomSheet"

const styles = StyleSheet.create({
  container: { padding: 20, gap: 12 },
  title: { marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  multilineInput: { minHeight: 100, textAlignVertical: "top" },
  helper: { marginTop: -8 },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 8,
  },
  rightActions: { flexDirection: "row", gap: 8 },
})
