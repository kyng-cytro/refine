export function ToggleSwitch({ active }: { active: boolean }) {
  return (
    <div className={`relative h-5 w-9 rounded-full transition-colors ${active ? "bg-primary" : "bg-input"}`}>
      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${active ? "translate-x-4" : "translate-x-0.5"}`} />
    </div>
  )
}
