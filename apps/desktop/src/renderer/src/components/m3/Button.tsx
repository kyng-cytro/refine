import { forwardRef, type ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

type Variant = "filled" | "tonal" | "outlined" | "text"

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

const styles: Record<Variant, string> = {
  filled: "bg-primary text-on-primary hover:shadow-elevation-1",
  tonal: "bg-secondary-container text-on-secondary-container hover:shadow-elevation-1",
  outlined: "border border-outline text-primary hover:bg-primary/8",
  text: "text-primary hover:bg-primary/8 px-3",
}

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ variant = "filled", className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-full px-6 text-label-large transition-all",
        "disabled:pointer-events-none disabled:opacity-40",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        styles[variant],
        className,
      )}
      {...props}
    />
  ),
)
Button.displayName = "Button"
