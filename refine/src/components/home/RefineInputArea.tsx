import { useRef, useState } from 'react';
import { StyleSheet, TextInput as RNTextInput, View } from 'react-native';
import { Button, Snackbar, Surface, TextInput } from 'react-native-paper';

import { ModelChip } from './ModelChip';
import { ToneChip } from './ToneChip';
import { useRefine } from '@/hooks/use-refine';

export const RefineInputArea = () => {
  const [isEmpty, setIsEmpty] = useState(true);
  const textRef = useRef('');
  const inputRef = useRef<RNTextInput>(null);
  const { refine, isLoading, error, clearError } = useRefine();

  const handleSend = async () => {
    const trimmed = textRef.current.trim();
    if (!trimmed || isLoading) return;
    const success = await refine(trimmed);
    if (success) {
      textRef.current = '';
      setIsEmpty(true);
      inputRef.current?.clear();
    }
  };

  return (
    <View style={styles.container}>
      <Surface style={styles.surface} elevation={2}>
        <TextInput
          ref={inputRef}
          mode="flat"
          multiline
          placeholder="Enter text to refine…"
          onChangeText={(t) => {
            textRef.current = t;
            setIsEmpty(t.trim().length === 0);
          }}
          style={styles.input}
          contentStyle={styles.inputContent}
          underlineStyle={{ display: 'none' }}
          maxLength={4000}
        />
        <View style={styles.toolbar}>
          <View style={styles.chipRow}>
            <ModelChip />
            <ToneChip />
          </View>
          <Button
            mode="contained"
            onPress={handleSend}
            loading={isLoading}
            disabled={isEmpty || isLoading}
            compact
            style={styles.sendButton}>
            Refine
          </Button>
        </View>
      </Surface>

      <Snackbar visible={!!error} onDismiss={clearError} duration={4000} style={styles.snackbar}>
        {error}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  surface: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  input: {
    backgroundColor: 'transparent',
    minHeight: 120,
    maxHeight: 200,
    fontSize: 15,
  },
  inputContent: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    paddingBottom: 12,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    flexShrink: 1,
  },
  sendButton: {
    borderRadius: 20,
    marginLeft: 8,
  },
  snackbar: {
    marginHorizontal: 0,
  },
});
