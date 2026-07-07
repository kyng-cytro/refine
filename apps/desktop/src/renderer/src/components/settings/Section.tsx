import type { ReactNode } from "react"

interface Props {
  title: string
  children: ReactNode
}

export function Section({ title, children }: Props) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-label-medium uppercase tracking-wide text-primary">
        {title}
      </h2>
      {children}
    </section>
  )
}
