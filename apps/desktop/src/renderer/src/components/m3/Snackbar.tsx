import { useEffect } from "react"
import { cn } from "@/lib/utils"

interface Props {
  visible: boolean
  onDismiss: () => void
  duration?: number
  className?: string
  children: React.ReactNode
}

export function Snackbar({
  visible,
  onDismiss,
  duration = 4000,
  className,
  children,
}: Props) {
  useEffect(() => {
    if (!visible) return
    const timer = setTimeout(onDismiss, duration)
    return () => clearTimeout(timer)
  }, [visible, duration, onDismiss])

  if (!visible) return null

  return (
    <div
      className={cn(
        "fixed bottom-4 left-1/2 z-50 w-max max-w-[calc(100vw-2rem)] -translate-x-1/2",
        "rounded-m3-xs bg-inverse-surface px-4 py-3.5 text-body-medium text-inverse-on-surface shadow-elevation-3",
        className,
      )}
      role="status"
    >
      {children}
    </div>
  )
}
