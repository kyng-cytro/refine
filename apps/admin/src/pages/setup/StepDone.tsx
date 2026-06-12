import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"

interface Props {
  onComplete: () => void
}

export default function StepDone({ onComplete }: Props) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <CheckCircle className="h-8 w-8 text-primary" />
          <div>
            <CardTitle>You're all set!</CardTitle>
            <CardDescription>
              Refine is configured and ready to use.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>AI providers configured</li>
          <li>Models enabled</li>
          <li>Device pairing token generated</li>
        </ul>
        <Button className="w-full" onClick={onComplete}>
          Go to Dashboard
        </Button>
      </CardContent>
    </Card>
  )
}
