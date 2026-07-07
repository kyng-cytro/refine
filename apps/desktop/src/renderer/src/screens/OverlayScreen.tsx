import { useEffect, useState } from "react"
import { Check, X } from "lucide-react"
import { Spinner } from "@/components/m3/Spinner"
import { ipc } from "@/lib/ipc"
import type { OverlayState } from "../../../shared/types"

export default function OverlayScreen() {
  const [overlay, setOverlay] = useState<OverlayState>({ state: "refining" })

  useEffect(() => ipc.onOverlayState(setOverlay), [])

  useEffect(() => {
    const prev = document.body.style.background
    document.body.style.background = "transparent"
    return () => {
      document.body.style.background = prev
    }
  }, [])

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-transparent p-1">
      <div className="flex h-full w-full items-center gap-3 rounded-full bg-surface-container-high px-4 shadow-elevation-3">
        {overlay.state === "refining" && <Spinner size={20} />}
        {overlay.state === "success" && (
          <Check className="h-5 w-5 shrink-0 text-primary" />
        )}
        {overlay.state === "error" && (
          <X className="h-5 w-5 shrink-0 text-error" />
        )}
        <span className="truncate text-body-medium text-on-surface">
          {overlay.message ?? "Refining…"}
        </span>
      </div>
    </div>
  )
}
