import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react"
import { cn } from "@/lib/utils"

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, className, id: idProp, ...props }, ref) => {
    const generatedId = useId()
    const id = idProp ?? generatedId
    return (
      <div className={className}>
        <label
          htmlFor={id}
          className="mb-1.5 block text-label-medium text-on-surface-variant"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={id}
          className={cn(
            "h-12 w-full rounded-m3-xs border bg-transparent px-4 text-body-large text-on-surface outline-none transition-colors",
            "placeholder:text-on-surface-variant/60",
            error
              ? "border-error focus:border-error"
              : "border-outline focus:border-primary focus:ring-1 focus:ring-primary",
          )}
          {...props}
        />
        {error && <p className="mt-1 text-body-small text-error">{error}</p>}
      </div>
    )
  },
)
TextField.displayName = "TextField"

export const TextArea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "w-full resize-none bg-transparent text-body-large text-on-surface outline-none",
      "placeholder:text-on-surface-variant/60",
      className,
    )}
    {...props}
  />
))
TextArea.displayName = "TextArea"

interface OutlinedTextAreaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
}

export const OutlinedTextArea = forwardRef<
  HTMLTextAreaElement,
  OutlinedTextAreaProps
>(({ label, error, className, id: idProp, ...props }, ref) => {
  const generatedId = useId()
  const id = idProp ?? generatedId
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="mb-1.5 block text-label-medium text-on-surface-variant"
      >
        {label}
      </label>
      <textarea
        ref={ref}
        id={id}
        className={cn(
          "min-h-24 w-full resize-y rounded-m3-xs border bg-transparent px-4 py-3 text-body-large text-on-surface outline-none transition-colors",
          "placeholder:text-on-surface-variant/60",
          error
            ? "border-error focus:border-error"
            : "border-outline focus:border-primary focus:ring-1 focus:ring-primary",
        )}
        {...props}
      />
      {error && <p className="mt-1 text-body-small text-error">{error}</p>}
    </div>
  )
})
OutlinedTextArea.displayName = "OutlinedTextArea"
