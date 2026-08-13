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
  const previewSteps = recipe.preparation_steps?.slice(0, 2) ?? [];

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.screen}>
        <ScrollView contentContainerStyle={s.container} showsVerticalScrollIndicator={false}>
          <Pressable onPress={() => router.back()}>
            <Text style={s.back}>{backLabel}</Text>
          </Pressable>
          <View style={s.hero}>
            <Text style={s.heroEmoji}>{recipe.emoji}</Text>
          </View>
          <Text style={s.title}>{recipe.title}</Text>
          <Text style={s.meta}>
            조리 {recipe.cooking_time}분 · {recipe.servings}인분 · {recipe.difficulty}
          </Text>
          <View style={s.reason}>
            <Text style={s.reasonText}>{recipe.reason || '지금 있는 재료로 바로 시작할 수 있어요.'}</Text>
          </View>

          <Text style={s.section}>필요한 재료</Text>
          {recipe.ingredients.map(item => (
            <View style={s.row} key={item.name}>
              <Text style={s.rowText}>{item.name}</Text>
              <Text style={s.muted}>{item.amount}</Text>
            </View>
          ))}

          <Text style={s.section}>준비 과정 미리보기</Text>
          {previewSteps.map((step, index) => (
            <Text style={s.step} key={index}>
              {index + 1}. {step}
            </Text>
          ))}
          {!!recipe.preparation_steps?.length && recipe.preparation_steps.length > previewSteps.length && (
            <Text style={s.sectionHint}>나머지 준비 과정은 재료 확인 후 이어서 볼 수 있어요.</Text>
          )}
        </ScrollView>

        <View style={s.footer}>
          <PrimaryButton
            title="이 레시피 준비하기 →"
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
  container: { padding: 24, paddingBottom: 148 },
  back: { color: colors.muted, marginBottom: 24, fontSize: 14 },
  hero: {
    height: 146,
    borderRadius: 24,
    backgroundColor: colors.surfaceTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: colors.line,
  },
  heroEmoji: { fontSize: 64 },
  title: { fontSize: 22, fontWeight: '800', lineHeight: 32, color: colors.ink },
  meta: { color: colors.muted, marginTop: 6, marginBottom: 18 },
  reason: { paddingHorizontal: 16, paddingVertical: 15, borderRadius: 18, backgroundColor: colors.surfaceTint, marginBottom: 28, borderWidth: 1, borderColor: colors.line },
  reasonText: { color: colors.ink, lineHeight: 22 },
  section: { fontSize: 17, fontWeight: '800', marginTop: 18, marginBottom: 12, color: colors.ink },
  row: { paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: colors.line, flexDirection: 'row', justifyContent: 'space-between', gap: 16 },
  rowText: { color: colors.ink },
  muted: { color: colors.muted },
  step: { color: colors.ink, lineHeight: 24, marginBottom: 8 },
  sectionHint: { marginTop: 10, color: colors.muted, lineHeight: 21 },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.background,
  },
});
