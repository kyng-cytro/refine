import { useEffect, useState } from "react"
import { List, useTheme } from "react-native-paper"

import { getApiClient } from "@/services/api"
import type { Provider } from "@refine/schemas"

const PROVIDER_ICONS: Record<string, string> = {
  google: "google",
  anthropic: "head-lightbulb-outline",
  openai: "robot-outline",
}

const PROVIDER_LABELS: Record<string, string> = {
  google: "Google",
  anthropic: "Anthropic",
  openai: "OpenAI",
}

export function ProvidersSection() {
  const [providers, setProviders] = useState<Provider[]>([])
  const theme = useTheme()

  useEffect(() => {
    getApiClient()
      .providers.list()
      .then((res) => setProviders(res.providers))
      .catch(() => {})
  }, [])

  if (providers.length === 0) return null

  return (
    <List.Section>
      <List.Subheader>Available models</List.Subheader>
      {providers.map((p) => (
        <List.Item
          key={p.provider}
          title={PROVIDER_LABELS[p.provider] ?? p.provider}
          description={
            p.models.length === 0
              ? "No models available"
              : p.models.map((m) => m.label).join(", ")
          }
          left={(props) => (
            <List.Icon
              {...props}
              icon={PROVIDER_ICONS[p.provider] ?? "cube-outline"}
              color={theme.colors.primary}
            />
          )}
        />
      ))}
    </List.Section>
  )
}
