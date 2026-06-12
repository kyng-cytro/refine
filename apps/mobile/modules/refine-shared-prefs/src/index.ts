import { NativeModule, requireNativeModule } from 'expo-modules-core';

interface RefineSharedPrefsModule extends NativeModule {
  set(key: string, value: string): void;
  get(key: string): string | null;
  setEncrypted(key: string, value: string): void;
  getEncrypted(key: string): string | null;
}

const module = requireNativeModule<RefineSharedPrefsModule>('RefineSharedPrefs');

export function set(key: string, value: string): void {
  module.set(key, value);
}

export function get(key: string): string | null {
  return module.get(key);
}

export function setEncrypted(key: string, value: string): void {
  module.setEncrypted(key, value);
}

export function getEncrypted(key: string): string | null {
  return module.getEncrypted(key);
}
