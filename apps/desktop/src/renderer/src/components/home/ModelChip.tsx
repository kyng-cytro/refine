import { Brain } from "lucide-react"
import { Chip } from "@/components/m3/Chip"
import { Menu, MenuContent, MenuItem, MenuTrigger } from "@/components/m3/Menu"
import { ProviderIcon } from "@/components/ProviderIcon"
import { useSettingsStore } from "@/store/settings-store"

export function ModelChip() {
  const { models, modelId, update } = useSettingsStore()
  const current = models.find((m) => m.id === modelId)

  return (
    <Menu>
      <MenuTrigger asChild>
        <Chip
          dropdown
          icon={
            current?.icon ? (
              <ProviderIcon svg={current.icon} size={16} className="text-primary" />
            ) : (
              <Brain />
            )
          }
        >
          {current?.label ?? "Model"}
        </Chip>
      </MenuTrigger>
      <MenuContent>
        {models.length === 0 ? (
          <MenuItem disabled>No models available</MenuItem>
        ) : (
          models.map((m) => (
            <MenuItem
              key={m.id}
              selected={m.id === modelId}
              icon={
                m.icon ? <ProviderIcon svg={m.icon} size={20} /> : undefined
              }
              onSelect={() => update({ modelId: m.id })}
            >
              {m.label}
            </MenuItem>
          ))
        )}
      </MenuContent>
    </Menu>
  )
}
