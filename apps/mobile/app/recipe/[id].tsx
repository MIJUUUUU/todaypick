import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { Recipe } from '../../src/entities/recipe/model/types';
import { PrimaryButton } from '../../src/shared/ui/PrimaryButton';
import { colors } from '../../src/shared/theme/colors';

export default function RecipeDetail() {
  const { data, source } = useLocalSearchParams<{ data?: string; source?: string }>();
  const recipe = useMemo<Recipe>(() => JSON.parse(String(data)), [data]);
  const backLabel = source === 'home' ? '← 홈' : '← 추천 결과';

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.screen}>
        <ScrollView contentContainerStyle={s.container} showsVerticalScrollIndicator={false}>
          <Pressable onPress={() => router.back()}>
            <Text style={s.back}>{backLabel}</Text>
          </Pressable>
          <View style={s.previewBadge}>
            <Text style={s.previewBadgeText}>레시피 미리보기</Text>
          </View>
          <View style={s.hero}>
            <Text style={s.heroEmoji}>{recipe.emoji}</Text>
          </View>
          <Text style={s.title}>{recipe.title}</Text>
          <Text style={s.meta}>
            {recipe.cooking_time}분 · {recipe.difficulty} · {recipe.servings}인분
          </Text>
          <View style={s.reason}>
            <Text style={s.reasonText}>💡 {recipe.reason || '가지고 있는 재료와 잘 어울리는 레시피예요.'}</Text>
          </View>

          <Text style={s.section}>재료</Text>
          {recipe.ingredients.map(item => (
            <View style={s.row} key={item.name}>
              <Text style={s.rowText}>{item.name}</Text>
              <Text style={s.muted}>{item.amount}</Text>
            </View>
          ))}

          <Text style={s.section}>준비 과정</Text>
          {recipe.preparation_steps?.map((step, index) => (
            <Text style={s.step} key={index}>
              {index + 1}. {step}
            </Text>
          ))}

          <Text style={s.warning}>⚠️ 고기와 계란은 속까지 충분히 익혀주세요. 조리 시간은 화력에 따라 달라질 수 있어요.</Text>
        </ScrollView>

        <View style={s.footer}>
          <PrimaryButton
            title="재료 확인하기 →"
            onPress={() =>
              router.push({
                pathname: '/recipe/[id]/checklist',
                params: { id: recipe.id, data: JSON.stringify(recipe) },
              })
            }
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  screen: { flex: 1 },
  container: { padding: 24, paddingBottom: 24 },
  back: { color: colors.muted, marginBottom: 24, fontSize: 14 },
  previewBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
    marginBottom: 14,
  },
  previewBadgeText: { fontSize: 12, color: colors.primary, fontWeight: '800' },
  hero: {
    height: 180,
    borderRadius: 24,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
    borderWidth: 1,
    borderColor: colors.line,
  },
  heroEmoji: { fontSize: 72 },
  title: { fontSize: 32, fontWeight: '800', color: colors.ink },
  meta: { color: colors.muted, marginTop: 8, marginBottom: 20 },
  reason: { padding: 15, borderRadius: 14, backgroundColor: colors.surfaceTint, marginBottom: 24, borderWidth: 1, borderColor: colors.line },
  reasonText: { color: colors.ink, lineHeight: 22 },
  section: { fontSize: 17, fontWeight: '800', marginTop: 18, marginBottom: 12, color: colors.ink },
  row: { paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: colors.line, flexDirection: 'row', justifyContent: 'space-between', gap: 16 },
  rowText: { color: colors.ink },
  muted: { color: colors.muted },
  step: { color: colors.ink, lineHeight: 24, marginBottom: 8 },
  warning: { marginTop: 22, padding: 14, borderRadius: 14, backgroundColor: '#FFF8E8', color: '#8D6E2C', lineHeight: 20, marginBottom: 18 },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.background,
  },
});
