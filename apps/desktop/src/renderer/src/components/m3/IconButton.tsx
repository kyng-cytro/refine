import { forwardRef, type ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

type Variant = "standard" | "contained" | "tonal"

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

const styles: Record<Variant, string> = {
  standard: "text-on-surface-variant hover:bg-on-surface/8",
  contained: "bg-primary text-on-primary hover:shadow-elevation-1",
  tonal: "bg-secondary-container text-on-secondary-container",
}

export const IconButton = forwardRef<HTMLButtonElement, Props>(
  ({ variant = "standard", className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all",
        "disabled:pointer-events-none disabled:opacity-40",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        styles[variant],
        className,
      )}
      {...props}
    />
  ),
)
IconButton.displayName = "IconButton"
