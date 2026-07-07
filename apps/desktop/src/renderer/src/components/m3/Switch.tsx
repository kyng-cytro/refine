import { cn } from "@/lib/utils"

interface Props {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
}

/** M3 switch. */
export function Switch({ checked, onCheckedChange, disabled }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative h-8 w-13 shrink-0 rounded-full border-2 transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        "disabled:pointer-events-none disabled:opacity-40",
        checked
          ? "border-primary bg-primary"
          : "border-outline bg-surface-container-highest",
      )}
    >
      <span
        className={cn(
          "absolute top-1/2 -translate-y-1/2 rounded-full transition-all",
          checked
            ? "left-5.5 h-6 w-6 bg-on-primary"
            : "left-1 h-4 w-4 bg-outline",
        )}
      />
    </button>
  )
}
