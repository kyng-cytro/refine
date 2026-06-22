import { useState } from "react"
import Logo from "@/components/Logo"
import StepDone from "@/pages/setup/StepDone"
import StepProviders from "@/pages/setup/StepProviders"
import StepToken from "@/pages/setup/StepToken"
import StepWelcome from "@/pages/setup/StepWelcome"

const STEPS = ["Welcome", "Providers", "Link Device", "Done"]

interface Props {
  onComplete: () => void
}

export default function SetupWizard({ onComplete }: Props) {
  const [step, setStep] = useState(0)
  const next = () => setStep((s) => s + 1)

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:flex w-72 shrink-0 flex-col border-r bg-sidebar px-8 py-10">
        <div className="flex items-center gap-2 mb-10">
          <Logo />
          <span className="text-sm font-semibold">Refine</span>
        </div>

        <nav className="space-y-1">
          {STEPS.map((label, i) => (
            <div
              key={label}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${
                i === step
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : i < step
                    ? "text-sidebar-foreground/50"
                    : "text-sidebar-foreground/30"
              }`}
            >
              <div
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs ${
                  i < step
                    ? "bg-primary text-primary-foreground"
                    : i === step
                      ? "border-2 border-primary text-primary"
                      : "border border-sidebar-border text-sidebar-foreground/30"
                }`}
              >
                {i < step ? "✓" : i + 1}
              </div>
              {label}
            </div>
          ))}
        </nav>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-10">
        <div className="flex items-center gap-1.5 mb-8 lg:hidden">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? "w-6 bg-primary" : i < step ? "w-3 bg-primary/40" : "w-3 bg-muted"
              }`}
            />
          ))}
        </div>

        <div className="w-full max-w-md">
          {step === 0 && <StepWelcome onNext={next} />}
          {step === 1 && <StepProviders onNext={next} />}
          {step === 2 && <StepToken onNext={next} />}
          {step === 3 && <StepDone onComplete={onComplete} />}
        </div>
      </div>
    </div>
  )
}
