import { Platform } from 'react-native';

import { MODEL_MAP } from '@/constants/models';
import { ApiKeys, ModelId, NativeConfig, Tone } from '@/types/settings';
import { HistoryItem } from '@/types/history';
import { buildSystemPrompt } from './ai';

// Only functional on Android — no-op on other platforms
const isAndroid = Platform.OS === 'android';

function getModule() {
  if (!isAndroid) return null;
  try {
    return require('refine-shared-prefs') as typeof import('refine-shared-prefs');
  } catch {
    return null;
  }
}

export function syncActiveConfig(params: {
  apiKeys: ApiKeys;
  defaultModel: ModelId;
  tones: Tone[];
  defaultToneSlug: string;
}): void {
  const mod = getModule();
  if (!mod) return;

  const { apiKeys, defaultModel, tones, defaultToneSlug } = params;
  const modelConfig = MODEL_MAP[defaultModel];
  const tone = tones.find((t) => t.slug === defaultToneSlug);
  const apiKey = modelConfig ? apiKeys[modelConfig.provider] : '';

  let config: NativeConfig;

  if (!modelConfig || !apiKey) {
    config = { configured: false, reason: 'no_api_key' };
  } else if (!tone) {
    config = { configured: false, reason: 'no_tone' };
  } else {
    config = {
      configured: true,
      url: modelConfig.apiUrl,
      key: apiKey,
      model: defaultModel,
      provider: modelConfig.provider,
      systemPrompt: buildSystemPrompt(tone.instructions),
    };
  }

  try {
    mod.setEncrypted('activeConfig', JSON.stringify(config));
  } catch (e) {
    console.warn('[bridge] syncActiveConfig failed:', e);
  }
}

export function syncHistoryToNative(items: HistoryItem[]): void {
  const mod = getModule();
  if (!mod) return;
  try {
    mod.set('history', JSON.stringify(items));
  } catch (e) {
    console.warn('[bridge] syncHistoryToNative failed:', e);
  }
}

export function loadHistoryFromNative(): HistoryItem[] {
  const mod = getModule();
  if (!mod) return [];
  try {
    const raw = mod.get('history');
    if (!raw) return [];
    return JSON.parse(raw) as HistoryItem[];
  } catch {
    return [];
  }
}

export function rehydrateApiKeysFromNative(): Partial<ApiKeys> {
  const mod = getModule();
  if (!mod) return {};
  try {
    const raw = mod.getEncrypted('activeConfig');
    if (!raw) return {};
    const config = JSON.parse(raw) as NativeConfig;
    if (!config.configured) return {};
    // We stored the full config — extract the key for the provider
    const { key, provider } = config as { key: string; provider: string };
    return { [provider]: key } as Partial<ApiKeys>;
  } catch {
    return {};
  }
}
