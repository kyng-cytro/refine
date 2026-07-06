import type { DeviceType } from "@refine/schemas"
import { Globe, Monitor, Smartphone, type LucideIcon } from "lucide-react"

export type { DeviceType }

export const DEVICE_TYPES: {
  value: DeviceType
  label: string
  placeholder: string
  icon: LucideIcon
}[] = [
  { value: "mobile", label: "Mobile", placeholder: "My Phone", icon: Smartphone },
  { value: "desktop", label: "Desktop", placeholder: "My Desktop", icon: Monitor },
  { value: "browser", label: "Browser", placeholder: "My Browser", icon: Globe },
]

export const deviceTypeIcon = (type: DeviceType): LucideIcon =>
  DEVICE_TYPES.find((t) => t.value === type)?.icon ?? Smartphone
