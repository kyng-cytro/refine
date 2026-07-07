interface Props {
  svg: string
  size?: number
  className?: string
}

export function ProviderIcon({ svg, size = 20, className }: Props) {
  return (
    <span
      className={className}
      style={{ width: size, height: size, display: "inline-block" }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
