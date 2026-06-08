import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Divider, IconButton, Switch, Text, useTheme } from 'react-native-paper';

import { MODELS } from '@/constants/models';
import { useSettingsStore } from '@/store/settings-store';
import { syncActiveConfig } from '@/services/shared-prefs-bridge';
import { ModelId, ModelProvider } from '@/types/settings';

const PROVIDER_META: Record<ModelProvider, { label: string; placeholder: string }> = {
  google: { label: 'Google', placeholder: 'AIza...' },
  anthropic: { label: 'Anthropic', placeholder: 'sk-ant-...' },
  openai: { label: 'OpenAI', placeholder: 'sk-...' },
};

interface Props {
  provider: ModelProvider;
}

export interface ProviderBottomSheetHandle {
  present: () => void;
}

export const ProviderBottomSheet = forwardRef<ProviderBottomSheetHandle, Props>(({ provider }, forwardedRef) => {
  const sheetRef = useRef<BottomSheetModal>(null);
  useImperativeHandle(forwardedRef, () => ({ present: () => sheetRef.current?.present() }));
  const { apiKeys, setApiKey, enabledModels, setEnabledModel } = useSettingsStore();
  const [showKey, setShowKey] = useState(false);
  const theme = useTheme();
  const meta = PROVIDER_META[provider];
  const renderBackdrop = useCallback(
    (props: any) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} pressBehavior="close" />,
    []
  );
  const models = MODELS.filter((m) => m.provider === provider);
  const hasKey = !!apiKeys[provider];

  const handleKeyBlur = (value: string) => {
    const trimmed = value.trim();
    if (trimmed === apiKeys[provider]) return;
    setApiKey(provider, trimmed);
    syncActiveConfig();
  };

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={['55%', '85%']}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: theme.colors.surface }}
      handleIndicatorStyle={{ backgroundColor: theme.colors.onSurfaceVariant }}>
      <BottomSheetScrollView contentContainerStyle={styles.container}>
        <Text variant="titleLarge" style={styles.title}>
          {meta.label}
        </Text>

        <Text variant="labelLarge" style={[styles.sectionLabel, { color: theme.colors.primary }]}>
          API Key
        </Text>
        <View style={[styles.keyRow, { borderColor: theme.colors.outline, backgroundColor: theme.colors.surfaceVariant }]}>
          <BottomSheetTextInput
            placeholder={meta.placeholder}
            defaultValue={apiKeys[provider]}
            onEndEditing={(e) => handleKeyBlur(e.nativeEvent.text)}
            secureTextEntry={!showKey}
            autoCapitalize="none"
            autoCorrect={false}
            style={[styles.keyInput, { color: theme.colors.onSurface }]}
            placeholderTextColor={theme.colors.onSurfaceVariant}
          />
          <IconButton
            icon={showKey ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            iconColor={theme.colors.onSurfaceVariant}
            onPress={() => setShowKey((v) => !v)}
          />
        </View>

        <Divider style={styles.divider} />

        <Text variant="labelLarge" style={[styles.sectionLabel, { color: theme.colors.primary }]}>
          Models
        </Text>
        {!hasKey && (
          <Text variant="bodySmall" style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
            Add an API key to enable models
          </Text>
        )}
        {models.map((model) => (
          <View key={model.id} style={styles.modelRow}>
            <View style={styles.modelInfo}>
              <Text variant="bodyLarge">{model.label}</Text>
            </View>
            <Switch
              value={!!enabledModels[model.id as ModelId] && hasKey}
              onValueChange={(v) => {
                setEnabledModel(model.id as ModelId, v);
                syncActiveConfig();
              }}
              disabled={!hasKey}
            />
          </View>
        ))}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

ProviderBottomSheet.displayName = 'ProviderBottomSheet';

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 8, gap: 16 },
  title: { fontFamily: 'NotoSans_700Bold', marginBottom: 4 },
  sectionLabel: { fontFamily: 'NotoSans_500Medium', marginBottom: 4 },
  keyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  keyInput: {
    flex: 1,
    height: 48,
    fontSize: 14,
    fontFamily: 'NotoSans_400Regular',
  },
  divider: { marginVertical: 4 },
  hint: { marginTop: -8, paddingHorizontal: 4 },
  modelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  modelInfo: { flex: 1 },
});
