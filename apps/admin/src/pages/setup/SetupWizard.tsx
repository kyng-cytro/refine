import { useState } from "react"
import StepDone from "@/pages/setup/StepDone"
import StepModels from "@/pages/setup/StepModels"
import StepProviders from "@/pages/setup/StepProviders"
import StepToken from "@/pages/setup/StepToken"
import StepWelcome from "@/pages/setup/StepWelcome"

const STEPS = ["Welcome", "Providers", "Models", "Link Device", "Done"]

interface Props {
  onComplete: () => void
}

export default function SetupWizard({ onComplete }: Props) {
  const [step, setStep] = useState(0)
  const next = () => setStep((s) => s + 1)

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg">
        {/* Step indicator */}
        <div className="mb-8 flex items-center gap-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${
                  i < step
                    ? "bg-primary text-primary-foreground"
                    : i === step
                      ? "border-primary text-primary border-2"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`h-px w-6 ${i < step ? "bg-primary" : "bg-border"}`}
                />
              )}
            </div>
          ))}
        </div>

        {step === 0 && <StepWelcome onNext={next} />}
        {step === 1 && <StepProviders onNext={next} />}
        {step === 2 && <StepModels onNext={next} />}
        {step === 3 && <StepToken onNext={next} />}
        {step === 4 && <StepDone onComplete={onComplete} />}
      </div>
    </div>
  )
}
