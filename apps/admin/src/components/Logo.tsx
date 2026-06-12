interface Props {
  className?: string
}

export default function Logo({ className }: Props) {
  return (
    <div className={`flex h-7 w-7 items-center justify-center rounded-md bg-primary ${className ?? ""}`}>
      <span className="text-xs font-bold text-primary-foreground">R</span>
    </div>
  )
}
