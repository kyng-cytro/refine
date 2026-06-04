@AGENTS.md

# Refine — Architecture Notes

## Stack
- Expo 56, React Native 0.85, TypeScript
- React Native Paper (Material You / MD3)
- Zustand + MMKV (settings persistence), Vercel AI SDK (`ai` + provider packages)
- Noto Sans font via `@expo-google-fonts/noto-sans`
- Android only — no iOS/web targets

## Running the app
```
cd refine
expo prebuild --platform android   # generates android/ directory
bun run android                    # builds and launches on emulator/device
```
Run prebuild again after any changes to `app.json`, `plugins/`, or `modules/`.

## Key architecture decisions

### ProcessTextActivity
Pure Kotlin activity — no React Native runtime. Registered via `plugins/withProcessTextActivity.ts` (Expo config plugin). Reads `EncryptedSharedPreferences("RefineSecurePrefs")` for the `activeConfig` blob and plain `SharedPreferences("RefineAppPrefs")` for history. Makes raw HTTP calls to AI provider REST APIs using `HttpURLConnection`.

### SharedPreferences bridge
`src/services/shared-prefs-bridge.ts` wraps the local Expo module `modules/refine-shared-prefs/` which exposes `set/get` (plain prefs) and `setEncrypted/getEncrypted` (EncryptedSharedPreferences via Android Keystore). Called whenever settings or history change so the Kotlin activity always has current data.

### API keys
Stored **only** in `EncryptedSharedPreferences` (AES-256-GCM, Android Keystore). Never written to MMKV or any plaintext storage. Zustand holds them in-memory only; on app load `rehydrateApiKeysFromNative()` reads them back from encrypted prefs.

### System prompt hardening
`buildSystemPrompt(toneInstructions)` in `src/services/ai.ts` wraps user-defined tone instructions between `[TONE]...[/TONE]` markers inside a hardcoded preamble and postamble. The `Tone.instructions` field is the injected section only — never the full system prompt. The full prompt is never exposed or editable by users.

### History
SharedPreferences `"history"` is canonical. Zustand holds it in-memory (no MMKV persist). On app open/foreground, `loadHistoryFromNative()` loads from SharedPreferences. Both the RN app and ProcessTextActivity write directly to SharedPreferences.

## File map
```
src/
  app/
    _layout.tsx       Root layout: GestureHandlerRootView > PaperProvider > BottomSheetModalProvider
    index.tsx         Home tab: RefineInputArea + RecentsSection
    settings.tsx      Settings tab: ApiKeySection + ModelsSection + TonesSection
  components/
    app-tabs.tsx      2-tab NativeTabs (Home / Settings)
    home/             RefineInputArea, ModelChip, ToneChip, RecentsSection, HistoryCard
    settings/         ApiKeySection, ModelsSection, TonesSection, ToneItem, ToneBottomSheet
  constants/
    models.ts         Model registry with id, label, provider, apiUrl
  services/
    ai.ts             buildSystemPrompt + refineText (Vercel AI SDK, generateText only)
    shared-prefs-bridge.ts  syncActiveConfig, syncHistoryToNative, loadHistoryFromNative
  store/
    settings-store.ts Zustand + MMKV persist (excludes apiKeys)
    history-store.ts  Zustand, no persist
    storage.ts        MMKV instance + Zustand storage adapter
  types/
    settings.ts       Tone, ModelId, ApiKeys, NativeConfig
    history.ts        HistoryItem
modules/
  ProcessTextActivity.kt        Kotlin template (copied by config plugin during prebuild)
  refine-shared-prefs/          Local Expo module: SharedPreferences bridge
plugins/
  withProcessTextActivity.ts    Config plugin: injects manifest entry + copies Kotlin file
```
