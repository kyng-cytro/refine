import { useState } from "react"
import { Chip, Menu } from "react-native-paper"

import { useSettingsStore } from "@/store/settings-store"
import { syncActiveConfig } from "@/services/shared-prefs-bridge"

export const ModelChip = () => {
  const [visible, setVisible] = useState(false)
  const { models, modelId, setModel } = useSettingsStore()

  const current = models.find((m) => m.id === modelId)

  const handleSelect = (modelId: string) => {
    setModel(modelId)
    setVisible(false)
    syncActiveConfig()
  }

  return (
    <Menu
      visible={visible}
      onDismiss={() => setVisible(false)}
      anchor={
        <Chip
          mode="outlined"
          onPress={() => setVisible(true)}
          icon="brain"
          compact
        >
          {current?.label ?? "Model"}
        </Chip>
      }
    >
      {models.length === 0 ? (
        <Menu.Item title="No models available" disabled />
      ) : (
        models.map((m) => (
          <Menu.Item
            key={m.id}
            title={m.label}
            onPress={() => handleSelect(m.id)}
            trailingIcon={m.id === modelId ? "check" : undefined}
          />
        ))
      )}
    </Menu>
  )
}
