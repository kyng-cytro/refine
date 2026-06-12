import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

interface Props {
  onComplete: () => void
}

export default function StepDone({ onComplete }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <CheckCircle className="h-8 w-8 text-primary shrink-0 mt-0.5" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">You're all set!</h1>
          <p className="text-muted-foreground mt-1.5">
            Refine is configured and ready to use.
          </p>
        </div>
      </div>

      <ul className="space-y-2">
        {["AI providers and models configured", "Device pairing token generated"].map((item) => (
          <li key={item} className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
            {item}
          </li>
        ))}
      </ul>

      <Button className="w-full" onClick={onComplete}>
        Go to Dashboard
      </Button>
    </div>
  )
}
