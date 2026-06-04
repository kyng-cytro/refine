import { ModelConfig } from '@/types/settings';

export const MODELS: ModelConfig[] = [
  {
    id: 'gpt-4o',
    label: 'GPT-4o',
    provider: 'openai',
    apiUrl: 'https://api.openai.com/v1/chat/completions',
  },
  {
    id: 'gpt-4o-mini',
    label: 'GPT-4o mini',
    provider: 'openai',
    apiUrl: 'https://api.openai.com/v1/chat/completions',
  },
  {
    id: 'claude-3-5-sonnet-20241022',
    label: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    apiUrl: 'https://api.anthropic.com/v1/messages',
  },
  {
    id: 'claude-haiku-3-5',
    label: 'Claude Haiku 3.5',
    provider: 'anthropic',
    apiUrl: 'https://api.anthropic.com/v1/messages',
  },
  {
    id: 'gemini-1.5-pro',
    label: 'Gemini 1.5 Pro',
    provider: 'google',
    apiUrl: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
  },
  {
    id: 'gemini-1.5-flash',
    label: 'Gemini 1.5 Flash',
    provider: 'google',
    apiUrl: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
  },
];

export const MODEL_MAP = Object.fromEntries(MODELS.map((m) => [m.id, m])) as Record<
  string,
  ModelConfig
>;
