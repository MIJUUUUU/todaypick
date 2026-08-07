import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../theme/colors';

export function PrimaryButton({
  title,
  onPress,
  disabled = false,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      style={[styles.button, disabled && styles.disabledButton]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.text, disabled && styles.disabledText]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { padding: 16, borderRadius: 16, alignItems: 'center', backgroundColor: colors.ink, marginTop: 24 },
  disabledButton: { backgroundColor: '#D8D1EA' },
  text: { color: colors.surface, fontWeight: '800' },
  disabledText: { color: '#8F86A8' },
});
