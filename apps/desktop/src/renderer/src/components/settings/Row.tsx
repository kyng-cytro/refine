export function Row({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-4 p-4">
      <div className="min-w-0 flex-1">
        <p className="text-body-large text-on-surface">{title}</p>
        {description && (
          <p className="mt-0.5 text-body-small text-on-surface-variant">
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  )
}
