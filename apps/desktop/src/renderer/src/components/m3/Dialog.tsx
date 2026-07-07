import type { ReactNode } from "react"
import { Dialog as RadixDialog } from "radix-ui"
import { cn } from "@/lib/utils"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children?: ReactNode
  /** Action row, laid out right-aligned per M3. */
  actions?: ReactNode
  className?: string
}

/** M3 basic dialog. */
export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  actions,
  className,
}: Props) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-50 bg-scrim/40" />
        <RadixDialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-[min(90vw,420px)] -translate-x-1/2 -translate-y-1/2",
            "rounded-m3-xl bg-surface-container-high p-6 shadow-elevation-3",
            "focus:outline-none",
            className,
          )}
        >
          <RadixDialog.Title className="text-headline-small text-on-surface">
            {title}
          </RadixDialog.Title>
          {description && (
            <RadixDialog.Description className="mt-2 text-body-medium text-on-surface-variant">
              {description}
            </RadixDialog.Description>
          )}
          {children && <div className="mt-4">{children}</div>}
          {actions && (
            <div className="mt-6 flex justify-end gap-2">{actions}</div>
          )}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}
