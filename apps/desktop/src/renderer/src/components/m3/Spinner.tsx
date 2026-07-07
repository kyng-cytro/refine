import { cn } from "@/lib/utils"

interface Props {
  size?: number
  className?: string
}

export function Spinner({ size = 20, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      className={cn("text-primary", className)}
      style={{ animation: "m3-spinner-rotate 1.4s linear infinite" }}
      role="progressbar"
    >
      <circle
        cx="22"
        cy="22"
        r="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="4.5"
        strokeLinecap="round"
        style={{ animation: "m3-spinner-dash 1.4s ease-in-out infinite" }}
      />
    </svg>
  )
}
