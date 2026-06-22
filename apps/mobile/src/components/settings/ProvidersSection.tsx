import { useEffect, useState } from "react"
import { View } from "react-native"
import { List, useTheme } from "react-native-paper"

import { getApiClient } from "@/services/api"
import ProviderIcon from "@/components/ProviderIcon"
import type { Provider } from "@refine/schemas"

const PROVIDER_LABELS: Record<string, string> = {
  openrouter: "OpenRouter",
  openai: "OpenAI",
  anthropic: "Anthropic",
  google: "Google",
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
            <View {...props} style={[props.style, { justifyContent: "center", alignItems: "center" }]}>
              {p.icon && (
                <ProviderIcon
                  svg={p.icon}
                  size={22}
                  color={theme.colors.primary}
                />
              )}
            </View>
          )}
        />
      ))}
    </List.Section>
  )
}
