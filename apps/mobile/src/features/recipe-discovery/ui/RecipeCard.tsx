import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Recommendation } from '../../../entities/recipe/api/recipeApi';
import { colors } from '../../../shared/theme/colors';

function getCardIcon(theme?: string) {
  if (theme === '저칼로리') return { name: 'food-apple-outline' as const, color: '#0F6E56', bg: '#E1F5EE' };
  if (theme === '파티') return { name: 'silverware-fork-knife' as const, color: '#8A4B11', bg: '#FFF1DC' };
  if (theme === '캠핑') return { name: 'campfire' as const, color: '#8A4B11', bg: '#FFF1DC' };
  return { name: 'pot-steam-outline' as const, color: colors.ink, bg: '#F5F4F8' };
}

export function RecipeCard({ item, onPress, theme }: { item: Recommendation; onPress: () => void; theme?: string }) {
  const icon = getCardIcon(theme);
  const missingLabel = item.missing.length
    ? item.missing.length === 1
      ? `${item.missing[0]}만 추가하면 가능`
      : `부족한 재료 ${item.missing.length}개`
    : '지금 있는 재료로 바로 가능';

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={[styles.iconWrap, { backgroundColor: icon.bg }]}>
        {item.recipe.thumbnail_url ? (
          <Image source={{ uri: item.recipe.thumbnail_url }} style={styles.image} />
        ) : (
          <MaterialCommunityIcons name={icon.name} size={22} color={icon.color} />
        )}
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{item.recipe.title}</Text>
        <Text style={styles.meta}>{missingLabel}</Text>
        <Text style={styles.detail}>
          {item.recipe.cooking_time}분 · {item.recipe.difficulty} · {item.recipe.servings}인분
        </Text>
      </View>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    marginBottom: 10,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  content: { flex: 1, justifyContent: 'center' },
  title: { fontSize: 16, fontWeight: '800', color: colors.ink, lineHeight: 22, marginBottom: 4 },
  meta: { fontSize: 13, color: colors.ink, marginBottom: 6, fontWeight: '600' },
  detail: { fontSize: 12, color: colors.muted },
});
