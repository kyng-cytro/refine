import { Sparkles } from "lucide-react"
import { Chip } from "@/components/m3/Chip"
import { Menu, MenuContent, MenuItem, MenuTrigger } from "@/components/m3/Menu"
import { useSettingsStore } from "@/store/settings-store"

export function ToneChip() {
  const { tones, toneSlug, update } = useSettingsStore()
  const current = tones.find((t) => t.slug === toneSlug)

  return (
    <Menu>
      <MenuTrigger asChild>
        <Chip dropdown icon={<Sparkles />}>
          {current?.name ?? "Tone"}
        </Chip>
      </MenuTrigger>
      <MenuContent>
        {tones.length === 0 ? (
          <MenuItem disabled>No tones available</MenuItem>
        ) : (
          tones.map((t) => (
            <MenuItem
              key={t.id}
              selected={t.slug === toneSlug}
              onSelect={() => update({ toneSlug: t.slug })}
            >
              {t.name}
            </MenuItem>
          ))
        )}
      </MenuContent>
    </Menu>
  )
}
