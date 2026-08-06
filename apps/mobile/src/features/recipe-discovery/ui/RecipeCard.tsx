import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Recommendation } from '../../../entities/recipe/api/recipeApi';

export function RecipeCard({ item, onPress }: { item: Recommendation; onPress: () => void }) {
  return <Pressable style={styles.card} onPress={onPress}><Text style={styles.emoji}>{item.recipe.emoji}</Text><View style={{ flex: 1 }}><Text style={styles.title}>{item.recipe.title}</Text><Text style={styles.meta}>{item.recipe.cooking_time}분 · {item.recipe.difficulty} · 매칭 {item.match_rate}%</Text><Text style={styles.badge}>{item.missing.length ? `부족한 재료 ${item.missing.join(', ')}` : '지금 바로 만들 수 있어요'}</Text></View><Text>›</Text></Pressable>;
}
const styles = StyleSheet.create({ card: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, marginBottom: 12, borderRadius: 18, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#ECE6E1' }, emoji: { fontSize: 36, padding: 12, borderRadius: 14, backgroundColor: '#FFF0E7' }, title: { fontSize: 16, fontWeight: '800', color: '#24202A' }, meta: { marginTop: 5, fontSize: 12, color: '#817983' }, badge: { marginTop: 7, fontSize: 11, color: '#2D8A4D' } });
