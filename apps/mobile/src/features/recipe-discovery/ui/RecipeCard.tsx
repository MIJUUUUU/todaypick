import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Recommendation } from '../../../entities/recipe/api/recipeApi';
import { colors } from '../../../shared/theme/colors';

export function RecipeCard({ item, onPress }: { item: Recommendation; onPress: () => void }) {
  return <Pressable style={styles.card} onPress={onPress}><Text style={styles.emoji}>{item.recipe.emoji}</Text><View style={{ flex: 1 }}><Text style={styles.title}>{item.recipe.title}</Text><Text style={styles.meta}>{item.recipe.cooking_time}분 · {item.recipe.difficulty} · 매칭 {item.match_rate}%</Text><Text style={styles.badge}>{item.missing.length ? `부족한 재료 ${item.missing.join(', ')}` : '지금 바로 만들 수 있어요'}</Text></View><Text style={styles.arrow}>›</Text></Pressable>;
}
const styles = StyleSheet.create({ card: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, marginBottom: 12, borderRadius: 20, backgroundColor: colors.surfaceTint, borderWidth: 1, borderColor: colors.line, shadowColor: colors.glow, shadowOpacity: 0.1, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } }, emoji: { fontSize: 36, padding: 12, borderRadius: 14, backgroundColor: colors.primarySoft }, title: { fontSize: 16, fontWeight: '800', color: colors.ink }, meta: { marginTop: 5, fontSize: 12, color: colors.muted }, badge: { marginTop: 7, fontSize: 11, color: colors.success }, arrow: { color: colors.primary, fontSize: 22 } });
