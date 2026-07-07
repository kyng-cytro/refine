import { DEVICE_TYPES, type DeviceType } from "@/lib/device-type"

interface Props {
  value: DeviceType
  onChange: (value: DeviceType) => void
}

export function DeviceTypeSelector({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {DEVICE_TYPES.map(({ value: type, label, icon: Icon }) => (
        <button
          key={type}
          type="button"
          onClick={() => onChange(type)}
          className={`flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
            value === type
              ? "border-primary bg-primary/10 text-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <Icon className="h-4 w-4" />
          {label}
        </button>
      ))}
    </div>
  )
}
