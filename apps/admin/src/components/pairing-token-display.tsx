import { useState } from "react"
import QRCode from "react-qr-code"
import type { Token } from "@/lib/api"
import { CopyButton } from "@/components/copy-button"
import { ChevronDown, ChevronRight, ExternalLink } from "lucide-react"

interface Props {
  token: Token
}

function serverUrlFromLink(link: string): string {
  try {
    return new URL(link).origin
  } catch {
    return ""
  }
}

function CopyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
      <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2">
        <code className="text-xs font-mono flex-1 break-all">{value}</code>
        <CopyButton text={value} />
      </div>
    </div>
  )
}

function ManualDisclosure({ token }: { token: Token }) {
  const [showManual, setShowManual] = useState(false)

  return (
    <>
      <button
        type="button"
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        onClick={() => setShowManual((v) => !v)}
      >
        {showManual ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        Or enter manually
      </button>

      {showManual && (
        <div className="space-y-3">
          <CopyRow label="Server URL" value={serverUrlFromLink(token.link)} />
          <CopyRow label="Token" value={token.token} />
        </div>
      )}
    </>
  )
}

export function PairingTokenDisplay({ token }: Props) {
  return (
    <div className="rounded-lg border space-y-4 p-4">
      <p className="text-xs text-muted-foreground">This token expires in 30 minutes.</p>

      {token.deviceType === "mobile" && (
        <>
          <div className="flex justify-center">
            <div className="rounded-lg bg-white p-3">
              <QRCode value={token.link} size={160} />
            </div>
          </div>
          <CopyRow label="Deep link" value={token.link} />
          <ManualDisclosure token={token} />
        </>
      )}

      {token.deviceType === "desktop" && (
        <>
          <a
            href={token.link}
            className="flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            Open in Refine
          </a>
          <p className="text-xs text-muted-foreground text-center">
            Open this link on the computer with the Refine desktop app installed.
          </p>
          <CopyRow label="Deep link" value={token.link} />
          <ManualDisclosure token={token} />
        </>
      )}

      {token.deviceType === "browser" && (
        <>
          <p className="text-xs text-muted-foreground">
            Enter these in the Refine browser extension to connect.
          </p>
          <CopyRow label="Server URL" value={serverUrlFromLink(token.link)} />
          <CopyRow label="Token" value={token.token} />
        </>
      )}
    </div>
  )
}
