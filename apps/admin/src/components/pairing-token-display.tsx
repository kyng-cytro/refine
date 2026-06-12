import { useState } from "react"
import QRCode from "react-qr-code"
import type { Token } from "@/lib/api"
import { CopyButton } from "@/components/copy-button"
import { ChevronDown, ChevronRight } from "lucide-react"

interface Props {
  token: Token
}

export function PairingTokenDisplay({ token }: Props) {
  const [showManual, setShowManual] = useState(false)

  return (
    <div className="rounded-lg border space-y-4 p-4">
      <p className="text-xs text-muted-foreground">This token expires in 30 minutes.</p>

      <div className="flex justify-center">
        <div className="rounded-lg bg-white p-3">
          <QRCode value={token.link} size={160} />
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-xs text-muted-foreground font-medium">Deep link</p>
        <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2">
          <code className="text-xs font-mono flex-1 break-all">{token.link}</code>
          <CopyButton text={token.link} />
        </div>
      </div>

      <button
        type="button"
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        onClick={() => setShowManual((v) => !v)}
      >
        {showManual ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        Or enter manually
      </button>

      {showManual && (
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground font-medium">Token</p>
          <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2">
            <code className="text-xs font-mono flex-1 break-all">{token.token}</code>
            <CopyButton text={token.token} />
          </div>
        </div>
      )}
    </div>
  )
}
