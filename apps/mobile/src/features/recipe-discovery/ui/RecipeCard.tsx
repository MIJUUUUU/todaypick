import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Recommendation } from '../../../entities/recipe/api/recipeApi';
import { colors } from '../../../shared/theme/colors';

function getCardIcon(theme?: string) {
  if (theme === '저칼로리') return { name: 'food-apple-outline' as const, color: '#0F6E56', bg: '#E1F5EE' };
  return { name: 'chef-hat' as const, color: colors.primary, bg: colors.primarySoft };
}

export function RecipeCard({ item, onPress, theme }: { item: Recommendation; onPress: () => void; theme?: string }) {
  const icon = getCardIcon(theme);
  return <Pressable style={styles.card} onPress={onPress}><View style={[styles.iconWrap,{backgroundColor:icon.bg}]}><MaterialCommunityIcons name={icon.name} size={24} color={icon.color} /></View><View style={{ flex: 1 }}><View style={styles.topRow}><Text style={styles.title}>{item.recipe.title}</Text><Text style={[styles.matchBadge,item.missing.length?styles.matchWarm:styles.matchGood]}>{item.match_rate >= 1 ? '일치 100%' : `일치 ${Math.round(item.match_rate*100)}%`}</Text></View><Text style={styles.meta}>{item.missing.length ? item.missing.slice(0,2).join(', ') + (item.missing.length > 2 ? ' 외 재료 추가' : ' 추가 필요') : '지금 있는 재료 그대로 사용'}</Text><Text style={styles.time}><MaterialCommunityIcons name="clock-outline" size={12} color={colors.muted} /> {item.recipe.cooking_time}분</Text></View></Pressable>;
}
const styles = StyleSheet.create({ card: { flexDirection: 'row', gap: 12, padding: 12, marginBottom: 10, borderRadius: 14, backgroundColor: colors.surfaceTint, borderWidth: 1, borderColor: colors.line }, iconWrap: { width: 64, height: 64, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }, topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 }, title: { flex: 1, fontSize: 14, fontWeight: '700', color: colors.ink }, matchBadge: { fontSize: 11, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, overflow: 'hidden' }, matchGood: { backgroundColor: '#E1F5EE', color: '#085041' }, matchWarm: { backgroundColor: '#FAEEDA', color: '#633806' }, meta: { fontSize: 12, color: colors.muted, marginBottom: 6 }, time: { fontSize: 11, color: colors.muted } });
