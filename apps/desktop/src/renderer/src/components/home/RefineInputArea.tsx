import { useRef, useState } from "react"
import { Send } from "lucide-react"
import { IconButton } from "@/components/m3/IconButton"
import { Snackbar } from "@/components/m3/Snackbar"
import { Spinner } from "@/components/m3/Spinner"
import { Surface } from "@/components/m3/Surface"
import { TextArea } from "@/components/m3/TextField"
import { useRefine } from "@/hooks/use-refine"
import { ModelChip } from "./ModelChip"
import { ToneChip } from "./ToneChip"

export function RefineInputArea() {
  const [text, setText] = useState("")
  const { refine, isLoading, error, clearError } = useRefine()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const send = async () => {
    const trimmed = text.trim()
    if (!trimmed || isLoading) return
    if (await refine(trimmed)) setText("")
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="px-4">
      <Surface level={2} shadow className="overflow-hidden rounded-m3-lg">
        <TextArea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 4000))}
          onKeyDown={onKeyDown}
          placeholder="Enter text to refine…"
          rows={5}
          maxLength={4000}
          className="px-4 pt-4"
        />
        <div className="flex items-center justify-between gap-2 px-3 pb-3 pt-2">
          <div className="flex min-w-0 gap-2">
            <ModelChip />
            <ToneChip />
          </div>
          {isLoading ? (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary">
              <Spinner size={20} className="text-on-primary" />
            </div>
          ) : (
            <IconButton
              variant="contained"
              onClick={send}
              disabled={!text.trim()}
              aria-label="Refine"
            >
              <Send className="h-5 w-5" />
            </IconButton>
          )}
        </div>
      </Surface>

      <Snackbar visible={!!error} onDismiss={clearError}>
        {error}
      </Snackbar>
    </div>
  )
}
