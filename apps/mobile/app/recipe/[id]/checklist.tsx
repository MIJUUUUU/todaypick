import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import type { Recipe } from '../../../src/entities/recipe/model/types';
import { PrimaryButton } from '../../../src/shared/ui/PrimaryButton';
import { colors } from '../../../src/shared/theme/colors';

export default function Checklist() {
  const { data } = useLocalSearchParams<{ data: string }>();
  const recipe: Recipe = JSON.parse(String(data));
  const [checked, setChecked] = useState<string[]>([]);

  const toggle = (name: string) =>
    setChecked(value => (value.includes(name) ? value.filter(item => item !== name) : [...value, name]));

  const progress = recipe.ingredients.length ? (checked.length / recipe.ingredients.length) * 100 : 0;

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.container}>
        <Pressable onPress={() => router.back()}>
          <Text style={s.back}>← 레시피 상세</Text>
        </Pressable>

        <View style={s.badge}>
          <Text style={s.badgeText}>재료 준비 확인</Text>
        </View>

        <Text style={s.title}>재료를 준비했는지 확인해주세요.</Text>
        <Text style={s.subtitle}>준비가 끝난 재료를 체크하면 바로 조리를 시작할 수 있어요.</Text>

        <View style={s.progress}>
          <Text style={s.progressLabel}>준비 완료 {checked.length}/{recipe.ingredients.length}</Text>
          <View style={s.track}>
            <View style={[s.fill, { width: `${progress}%` }]} />
          </View>
        </View>

        {recipe.ingredients.map(item => (
          <Pressable style={s.item} key={item.name} onPress={() => toggle(item.name)}>
            <Text style={s.box}>{checked.includes(item.name) ? '☑' : '☐'}</Text>
            <Text style={s.itemName}>{item.name}</Text>
            <Text style={s.muted}>{item.amount}</Text>
          </Pressable>
        ))}

        <PrimaryButton
          title="조리 시작 →"
          onPress={() =>
            router.push({
              pathname: '/recipe/[id]/cooking',
              params: { id: recipe.id, data: JSON.stringify(recipe) },
            })
          }
        />
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { padding: 24 },
  back: { color: colors.muted, marginBottom: 24, fontSize: 14 },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
    marginBottom: 14,
  },
  badgeText: { fontSize: 12, color: colors.primary, fontWeight: '800' },
  title: { fontSize: 32, fontWeight: '800', lineHeight: 42, marginBottom: 10, color: colors.ink },
  subtitle: { fontSize: 14, lineHeight: 22, color: colors.muted, marginBottom: 24 },
  progress: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 14,
  },
  progressLabel: { fontSize: 14, fontWeight: '700', color: colors.ink },
  track: { height: 7, borderRadius: 9, backgroundColor: '#F0ECE7', marginTop: 12, overflow: 'hidden' },
  fill: { height: 7, borderRadius: 9, backgroundColor: colors.primary },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  box: { fontSize: 23 },
  itemName: { flex: 1, color: colors.ink, fontSize: 15 },
  muted: { color: colors.muted, fontSize: 14 },
});
