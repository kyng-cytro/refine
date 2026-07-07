import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode
  dropdown?: boolean
  selected?: boolean
}

/** M3 assist chip, used as the model/tone selector trigger. */
export const Chip = forwardRef<HTMLButtonElement, Props>(
  ({ icon, dropdown, selected, className, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex h-8 min-w-0 items-center gap-2 rounded-m3-sm border border-outline-variant px-3 text-label-large transition-colors",
        "hover:bg-on-surface/8 focus-visible:outline-2 focus-visible:outline-primary",
        "disabled:pointer-events-none disabled:opacity-40",
        selected && "border-transparent bg-secondary-container text-on-secondary-container",
        className,
      )}
      {...props}
    >
      {icon && <span className="shrink-0 [&>svg]:h-4 [&>svg]:w-4">{icon}</span>}
      <span className="truncate">{children}</span>
      {dropdown && <ChevronDown className="h-4 w-4 shrink-0 opacity-70" />}
    </button>
  ),
)
Chip.displayName = "Chip"
