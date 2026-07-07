import type { ReactNode } from "react"
import { DropdownMenu } from "radix-ui"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export const Menu = DropdownMenu.Root
export const MenuTrigger = DropdownMenu.Trigger

interface ContentProps {
  children: ReactNode
  align?: "start" | "center" | "end"
  className?: string
}

export function MenuContent({ children, align = "start", className }: ContentProps) {
  return (
    <DropdownMenu.Portal>
      <DropdownMenu.Content
        align={align}
        sideOffset={4}
        className={cn(
          "z-50 max-h-80 min-w-40 overflow-y-auto rounded-m3-xs bg-surface-container py-2 shadow-elevation-2",
          className,
        )}
      >
        {children}
      </DropdownMenu.Content>
    </DropdownMenu.Portal>
  )
}

interface ItemProps {
  children: ReactNode
  icon?: ReactNode
  selected?: boolean
  disabled?: boolean
  onSelect?: () => void
}

export function MenuItem({ children, icon, selected, disabled, onSelect }: ItemProps) {
  return (
    <DropdownMenu.Item
      disabled={disabled}
      onSelect={onSelect}
      className={cn(
        "flex h-12 cursor-default items-center gap-3 px-3 text-body-large text-on-surface outline-none",
        "data-[highlighted]:bg-on-surface/8 data-[disabled]:opacity-40",
      )}
    >
      {icon && (
        <span className="shrink-0 text-on-surface-variant [&>svg]:h-5 [&>svg]:w-5">
          {icon}
        </span>
      )}
      <span className="flex-1 truncate">{children}</span>
      {selected && <Check className="h-4 w-4 shrink-0 text-primary" />}
    </DropdownMenu.Item>
  )
}
