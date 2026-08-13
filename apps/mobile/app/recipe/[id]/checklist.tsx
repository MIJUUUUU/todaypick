import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { Recipe } from '../../../src/entities/recipe/model/types';
import { PrimaryButton } from '../../../src/shared/ui/PrimaryButton';
import { colors } from '../../../src/shared/theme/colors';

export default function Checklist() {
  const { data } = useLocalSearchParams<{ data: string }>();
  const recipe: Recipe = JSON.parse(String(data));
  const [checked, setChecked] = useState<string[]>([]);
  const requiredIngredients = recipe.ingredients.filter(item => item.required);
  const requiredNames = requiredIngredients.map(item => item.name);
  const checkedRequiredCount = requiredNames.filter(name => checked.includes(name)).length;
  const canStartCooking = requiredNames.length === 0 || requiredNames.every(name => checked.includes(name));

  const toggle = (name: string) =>
    setChecked(value => (value.includes(name) ? value.filter(item => item !== name) : [...value, name]));

  const progress = recipe.ingredients.length ? (checked.length / recipe.ingredients.length) * 100 : 0;

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.screen}>
        <ScrollView contentContainerStyle={s.container} showsVerticalScrollIndicator={false}>
          <Pressable onPress={() => router.back()}>
            <Text style={s.back}>← 레시피 상세</Text>
          </Pressable>

          <Text style={s.title}>재료를 준비했는지 확인해주세요.</Text>
          <Text style={s.subtitle}>핵심 재료를 먼저 체크하면 조리를 시작할 수 있어요.</Text>

          <View style={s.progress}>
            <Text style={s.progressLabel}>준비 완료 {checked.length}/{recipe.ingredients.length}</Text>
            <View style={s.track}>
              <View style={[s.fill, { width: `${progress}%` }]} />
            </View>
            {!!requiredNames.length && (
              <Text style={s.progressHint}>핵심 재료 {checkedRequiredCount}/{requiredNames.length}</Text>
            )}
          </View>

          {recipe.ingredients.map(item => (
            <Pressable style={s.item} key={item.name} onPress={() => toggle(item.name)}>
              <View style={[s.checkbox, checked.includes(item.name) && s.checkboxChecked]}>
                {checked.includes(item.name) && <Text style={s.checkboxMark}>✓</Text>}
              </View>
              <View style={s.itemInfo}>
                <View style={s.itemTitleRow}>
                  <Text style={s.itemName}>{item.name}</Text>
                  {item.required && (
                    <View style={s.requiredBadge}>
                      <Text style={s.requiredBadgeText}>핵심</Text>
                    </View>
                  )}
                </View>
              </View>
              <Text style={s.muted}>{item.amount}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={s.footer}>
          <Text style={s.footerHint}>
            {canStartCooking
              ? '핵심 재료 준비가 끝났어요. 바로 조리를 시작할 수 있어요.'
              : '핵심 재료를 모두 체크해야 다음 단계로 갈 수 있어요.'}
          </Text>
          <PrimaryButton
            title="조리 시작 →"
            onPress={() =>
              router.push({
                pathname: '/recipe/[id]/cooking',
                params: { id: recipe.id, data: JSON.stringify(recipe) },
              })
            }
            disabled={!canStartCooking}
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
  title: { fontSize: 22, fontWeight: '800', lineHeight: 32, marginBottom: 10, color: colors.ink },
  subtitle: { fontSize: 14, lineHeight: 22, color: colors.muted, marginBottom: 24 },
  progress: {
    padding: 22,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 18,
  },
  progressLabel: { fontSize: 17, fontWeight: '800', color: colors.ink },
  track: { height: 6, borderRadius: 999, backgroundColor: '#F1EDF9', marginTop: 12, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 999, backgroundColor: colors.ink },
  progressHint: { marginTop: 10, color: colors.muted, fontSize: 13, lineHeight: 18 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    minHeight: 72,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#7B7596',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  checkboxChecked: {
    borderColor: colors.ink,
    backgroundColor: colors.surface,
  },
  checkboxMark: {
    fontSize: 17,
    lineHeight: 17,
    color: colors.ink,
    fontWeight: '800',
  },
  itemInfo: { flex: 1 },
  itemTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  itemName: { color: colors.ink, fontSize: 15 },
  requiredBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: colors.surfaceTint,
    borderWidth: 1,
    borderColor: colors.line,
  },
  requiredBadgeText: { color: colors.muted, fontSize: 11, fontWeight: '700' },
  muted: { color: colors.muted, fontSize: 14 },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.background,
  },
  footerHint: {
    marginTop: 4,
    marginBottom: 12,
    color: colors.muted,
    lineHeight: 20,
  },
});
