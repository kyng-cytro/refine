import { useState } from 'react';

import { useHistoryStore } from '@/store/history-store';
import { useSettingsStore } from '@/store/settings-store';
import { refineText } from '@/services/ai';
import { syncActiveConfig, syncHistoryToNative } from '@/services/shared-prefs-bridge';
import { HistoryItem } from '@/types/history';

interface UseRefineResult {
  refine: (text: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useRefine(): UseRefineResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { apiKeys, defaultModel, tones, defaultToneSlug, enabledModels } = useSettingsStore();
  const { addItem, items } = useHistoryStore();

  const refine = async (text: string) => {
    setIsLoading(true);
    setError(null);

    const tone = tones.find((t) => t.slug === defaultToneSlug);

    try {
      if (!tone) throw new Error('Add an API key in Settings to get started');

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
      const updatedItems = [item, ...items].slice(0, 50);
      syncHistoryToNative(updatedItems);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return { refine, isLoading, error, clearError: () => setError(null) };
}
