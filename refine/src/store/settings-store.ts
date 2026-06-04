import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { MODELS } from '@/constants/models';
import { ApiKeys, ModelId, Tone } from '@/types/settings';
import { mmkvStorage } from './storage';

const DEFAULT_TONE: Tone = {
  id: 'default-refined',
  name: 'Refined',
  slug: 'refined',
  instructions: 'Make the text clearer, more concise, and more professional while preserving the original meaning.',
};

interface SettingsState {
  // API keys: held in memory only, persisted to EncryptedSharedPreferences via bridge
  apiKeys: ApiKeys;
  enabledModels: Record<ModelId, boolean>;
  tones: Tone[];
  defaultToneSlug: string;
  defaultModel: ModelId;

  setApiKey: (provider: keyof ApiKeys, key: string) => void;
  setEnabledModel: (modelId: ModelId, enabled: boolean) => void;
  addOrUpdateTone: (tone: Tone) => void;
  deleteTone: (id: string) => void;
  setDefaultTone: (slug: string) => void;
  setDefaultModel: (modelId: ModelId) => void;
  // Rehydrate API keys from EncryptedSharedPreferences on app load
  rehydrateApiKeys: (keys: Partial<ApiKeys>) => void;
}

const initialEnabledModels = Object.fromEntries(
  MODELS.map((m) => [m.id, false])
) as Record<ModelId, boolean>;

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      apiKeys: { openai: '', anthropic: '', google: '' },
      enabledModels: initialEnabledModels,
      tones: [DEFAULT_TONE],
      defaultToneSlug: 'refined',
      defaultModel: 'gpt-4o-mini',

      setApiKey: (provider, key) =>
        set((s) => ({ apiKeys: { ...s.apiKeys, [provider]: key } })),

      setEnabledModel: (modelId, enabled) =>
        set((s) => ({ enabledModels: { ...s.enabledModels, [modelId]: enabled } })),

      addOrUpdateTone: (tone) =>
        set((s) => {
          const idx = s.tones.findIndex((t) => t.id === tone.id);
          if (idx >= 0) {
            const tones = [...s.tones];
            tones[idx] = tone;
            return { tones };
          }
          return { tones: [...s.tones, tone] };
        }),

      deleteTone: (id) =>
        set((s) => ({ tones: s.tones.filter((t) => t.id !== id) })),

      setDefaultTone: (slug) => set({ defaultToneSlug: slug }),

      setDefaultModel: (modelId) => set({ defaultModel: modelId }),

      rehydrateApiKeys: (keys) =>
        set((s) => ({ apiKeys: { ...s.apiKeys, ...keys } })),
    }),
    {
      name: 'refine-settings',
      storage: createJSONStorage(() => mmkvStorage),
      // API keys are NOT persisted to MMKV — only to EncryptedSharedPreferences
      partialize: (s) => ({
        enabledModels: s.enabledModels,
        tones: s.tones,
        defaultToneSlug: s.defaultToneSlug,
        defaultModel: s.defaultModel,
      }),
    }
  )
);
