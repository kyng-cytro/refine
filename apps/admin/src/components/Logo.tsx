interface Props {
  className?: string
  size?: number
}

export default function Logo({ className, size = 28 }: Props) {
  const radius = Math.round(size * 0.25)
  return (
    <div
      className={`shrink-0 flex items-center justify-center bg-slate-900 ${className ?? ""}`}
      style={{ width: size, height: size, borderRadius: radius }}
    >
      <img
        src="/admin/favicon.png"
        alt="Refine"
        style={{
          width: size * 0.72,
          height: size * 0.72,
          objectFit: "contain",
        }}
      />
    </div>
  )
}
