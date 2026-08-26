import template from "./system.md" with { type: "text" }

const TONE_PLACEHOLDER = "{{TONE}}"

const REASONING_TAGS = "think|thinking|reasoning|analysis|antthinking"

const HARMONY_FINAL = /<\|channel\|>\s*final\s*<\|message\|>/gi
const HARMONY_TOKEN = /<\|[^|]*\|>/g
const CLOSED_REASONING = new RegExp(`<(${REASONING_TAGS})>[\\s\\S]*?</\\1>`, "gi")
const REASONING_CLOSE = new RegExp(`</(${REASONING_TAGS})>`, "gi")
const REASONING_TAG = new RegExp(`</?(${REASONING_TAGS})>`, "gi")
const META_LINE =
  /^\s*(user\s*safety|safety\s*check|moderation|refusal|policy\s*check|channel|assistant|analysis|reasoning|thoughts?|final\s*answer)\s*:\s*(.*)$/i
const FENCED = /^```[\w-]*\r?\n([\s\S]*?)\r?\n?```$/

const lastSegment = (text: string, pattern: RegExp) => {
  const matches = [...text.matchAll(pattern)]
  const last = matches.at(-1)
  if (!last) return text
  return text.slice(last.index + last[0].length)
}

/**
 * A leaked verdict is either a terse label/value pair ("user safety: safe") or
 * a preamble with the real answer underneath. A labelled line that carries a
 * full sentence and nothing after it is the rewrite itself, so it stays.
 */
const isMetaLine = (line: string, hasMoreLines: boolean) => {
  const match = META_LINE.exec(line)
  if (!match) return false
  return hasMoreLines || match[2]!.trim().split(/\s+/).length <= 2
}

const dropLeadingMetaLines = (text: string) => {
  const lines = text.split("\n")
  while (lines.length && isMetaLine(lines[0]!, lines.length > 1)) lines.shift()
  return lines.join("\n")
}

const unwrapFence = (text: string) => {
  const match = FENCED.exec(text)
  return match ? match[1]! : text
}

/**
 * Small models sometimes leak their reasoning or a moderation verdict such as
 * "user safety: safe" into the visible response. Strip those artefacts so the
 * caller only ever sees the rewritten text.
 */
export const cleanCompletion = (raw: string) => {
  let text = lastSegment(raw, HARMONY_FINAL)
  text = text.replace(CLOSED_REASONING, "")
  text = lastSegment(text, REASONING_CLOSE)
  text = text.replace(REASONING_TAG, "").replace(HARMONY_TOKEN, "")
  text = dropLeadingMetaLines(text.trim())
  return unwrapFence(text.trim()).trim()
}

export const buildSystemPrompt = (toneInstructions: string) =>
  template.replace(TONE_PLACEHOLDER, toneInstructions.trim())
