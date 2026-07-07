import type { HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

type Level = 0 | 1 | 2 | 3

interface Props extends HTMLAttributes<HTMLDivElement> {
  level?: Level
  shadow?: boolean
}

const levels: Record<Level, string> = {
  0: "bg-surface",
  1: "bg-surface-container-low",
  2: "bg-surface-container",
  3: "bg-surface-container-high",
}

export function Surface({ level = 2, shadow, className, ...props }: Props) {
  return (
    <div
      className={cn(
        "rounded-m3-lg",
        levels[level],
        shadow && "shadow-elevation-1",
        className,
      )}
      {...props}
    />
  )
}
