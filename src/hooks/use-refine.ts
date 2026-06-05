import { useState } from "react";

import { useHistoryStore } from "@/store/history-store";
import { useSettingsStore } from "@/store/settings-store";
import { refineText } from "@/services/ai";
import { syncHistoryToNative } from "@/services/shared-prefs-bridge";
import { HistoryItem } from "@/types/history";

interface UseRefineResult {
  refine: (text: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export const useRefine = (): UseRefineResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { apiKeys, defaultModel, tones, defaultToneSlug } = useSettingsStore();
  const addItem = useHistoryStore((s) => s.addItem);

  const refine = async (text: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    const tone = tones.find((t) => t.slug === defaultToneSlug);

    try {
      if (!tone) throw new Error("Configure a tone in Settings to get started");

      const refined = await refineText({
        text,
        modelId: defaultModel,
        toneInstructions: tone.instructions,
        apiKeys,
      });

      const item: HistoryItem = {
        id: Date.now().toString(),
        source: text,
        refined,
        timestamp: Date.now(),
      };

      addItem(item);
      // Read fresh state after addItem to avoid stale closure
      syncHistoryToNative(useHistoryStore.getState().items);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { refine, isLoading, error, clearError: () => setError(null) };
};
