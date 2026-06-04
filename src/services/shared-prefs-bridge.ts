import { Platform } from 'react-native';

import { MODEL_MAP } from '@/constants/models';
import { ApiKeys, NativeConfig } from '@/types/settings';
import { HistoryItem } from '@/types/history';
import { buildSystemPrompt } from './ai';
import { useSettingsStore } from '@/store/settings-store';

const isAndroid = Platform.OS === 'android';

const getModule = () => {
  if (!isAndroid) return null;
  try {
    return require('refine-shared-prefs') as typeof import('refine-shared-prefs');
  } catch {
    return null;
  }
};

export const syncActiveConfig = (): void => {
  const mod = getModule();
  if (!mod) return;

  const { apiKeys, defaultModel, tones, defaultToneSlug } = useSettingsStore.getState();
  const modelConfig = MODEL_MAP[defaultModel];
  const tone = tones.find((t) => t.slug === defaultToneSlug);
  const apiKey = modelConfig ? apiKeys[modelConfig.provider] : '';

  // Store all keys encrypted so all three can be rehydrated on app start
  try { mod.setEncrypted('apiKeys', JSON.stringify(apiKeys)); } catch {}

  const config: NativeConfig = !modelConfig || !apiKey
    ? { configured: false, reason: 'no_api_key' }
    : !tone
    ? { configured: false, reason: 'no_tone' }
    : {
        configured: true,
        url: modelConfig.apiUrl,
        key: apiKey,
        model: defaultModel,
        provider: modelConfig.provider,
        systemPrompt: buildSystemPrompt(tone.instructions),
      };

  try {
    mod.setEncrypted('activeConfig', JSON.stringify(config));
  } catch (e) {
    console.warn('[bridge] syncActiveConfig failed:', e);
  }
};

export const syncHistoryToNative = (items: HistoryItem[]): void => {
  const mod = getModule();
  if (!mod) return;
  try { mod.set('history', JSON.stringify(items)); } catch {}
};

export const loadHistoryFromNative = (): HistoryItem[] => {
  const mod = getModule();
  if (!mod) return [];
  try {
    const raw = mod.get('history');
    return raw ? (JSON.parse(raw) as HistoryItem[]) : [];
  } catch {
    return [];
  }
};

export const rehydrateApiKeysFromNative = (): Partial<ApiKeys> => {
  const mod = getModule();
  if (!mod) return {};
  try {
    const raw = mod.getEncrypted('apiKeys');
    return raw ? (JSON.parse(raw) as ApiKeys) : {};
  } catch {
    return {};
  }
};
