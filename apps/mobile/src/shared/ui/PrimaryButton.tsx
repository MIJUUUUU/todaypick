import { Pressable, StyleSheet, Text } from 'react-native';
export function PrimaryButton({ title, onPress }: { title: string; onPress: () => void }) { return <Pressable style={styles.button} onPress={onPress}><Text style={styles.text}>{title}</Text></Pressable>; }
const styles = StyleSheet.create({ button: { padding: 16, borderRadius: 14, alignItems: 'center', backgroundColor: '#F26D3D', marginTop: 24 }, text: { color: '#FFF', fontWeight: '800' } });
