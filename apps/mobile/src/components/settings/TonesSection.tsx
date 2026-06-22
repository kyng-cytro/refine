import { useRef, useState } from "react"
import { StyleSheet } from "react-native"
import { Button, List } from "react-native-paper"

import { ToneItem } from "./ToneItem"
import { ToneBottomSheet, ToneBottomSheetHandle } from "./ToneBottomSheet"
import { useSettingsStore } from "@/store/settings-store"
import { syncActiveConfig } from "@/services/shared-prefs-bridge"
import { getApiClient } from "@/services/api"
import type { Tone } from "@refine/schemas"

const refreshTones = async () => {
  const client = getApiClient()
  const tones = await client.tones.list()
  useSettingsStore.getState().setTones(tones)
  return tones
}

export const TonesSection = () => {
  const bottomSheetRef = useRef<ToneBottomSheetHandle>(null)
  const [editingTone, setEditingTone] = useState<Tone | null>(null)

  const { tones, toneSlug, setTone } = useSettingsStore()

  const openSheet = (tone?: Tone) => {
    if (tone?.isGlobal) return
    setEditingTone(tone ?? null)
    bottomSheetRef.current?.present()
  }

  const handleDelete = async (id: string) => {
    const tone = tones.find((t) => t.id === id)
    if (tone && toneSlug === tone.slug) {
      const fallback = tones.find((t) => t.id !== id)
      if (fallback) setTone(fallback.slug)
    }
    try {
      await getApiClient().tones.delete(id)
      await refreshTones()
      syncActiveConfig()
    } catch {}
  }

  const handleSetDefault = (slug: string) => {
    setTone(slug)
    syncActiveConfig()
  }

  return (
    <>
      <List.Section>
        <List.Subheader>Tones</List.Subheader>
        {tones.map((tone) => (
          <ToneItem
            key={tone.id}
            tone={tone}
            isDefault={tone.slug === toneSlug}
            onPress={openSheet}
            onDelete={handleDelete}
            onSetDefault={handleSetDefault}
          />
        ))}
        <Button
          mode="text"
          icon="plus"
          onPress={() => openSheet()}
          style={styles.addButton}
        >
          Add Tone
        </Button>
      </List.Section>

      <ToneBottomSheet
        ref={bottomSheetRef}
        editingTone={editingTone}
        onSaved={async () => {
          await refreshTones()
        }}
        onDismiss={() => setEditingTone(null)}
      />
    </>
  )
}

const styles = StyleSheet.create({
  addButton: {
    alignSelf: "flex-start",
    marginLeft: 8,
  },
})
