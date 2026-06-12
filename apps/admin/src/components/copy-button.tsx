import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, Copy } from "lucide-react"

interface CopyButtonProps {
  text: string
  className?: string
  iconSize?: string
}

export function CopyButton({ text, className = "shrink-0 h-7 w-7", iconSize = "h-3.5 w-3.5" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <Button variant="ghost" size="icon" className={className} onClick={copy}>
      {copied
        ? <Check className={`${iconSize} text-primary`} />
        : <Copy className={iconSize} />
      }
    </Button>
  )
}
