import { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { IconButton, List, RadioButton } from 'react-native-paper';

import { Tone } from '@/types/settings';

interface Props {
  tone: Tone;
  isDefault: boolean;
  onPress: (tone: Tone) => void;
  onDelete: (id: string) => void;
  onSetDefault: (slug: string) => void;
}

export function ToneItem({ tone, isDefault, onPress, onDelete, onSetDefault }: Props) {
  const swipeRef = useRef<Swipeable>(null);
  const isProtected = tone.id === 'default-refined';

  const renderRightActions = () => (
    <View style={styles.deleteAction}>
      <IconButton
        icon="delete"
        iconColor="#fff"
        onPress={() => {
          swipeRef.current?.close();
          onDelete(tone.id);
        }}
      />
    </View>
  );

  const content = (
    <List.Item
      title={tone.name}
      description={isDefault ? 'Default' : undefined}
      left={() => (
        <View style={styles.radio}>
          <RadioButton
            value={tone.slug}
            status={isDefault ? 'checked' : 'unchecked'}
            onPress={() => onSetDefault(tone.slug)}
          />
        </View>
      )}
      onPress={() => onPress(tone)}
    />
  );

  if (isProtected) return content;

  return (
    <Swipeable
      ref={swipeRef}
      renderRightActions={renderRightActions}
      rightThreshold={40}
      overshootRight={false}>
      {content}
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  radio: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 8,
  },
  deleteAction: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#B00020',
    width: 64,
    marginVertical: 2,
    borderRadius: 12,
  },
});
