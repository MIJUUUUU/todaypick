import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { Recipe } from '../../../src/entities/recipe/model/types';
import { PrimaryButton } from '../../../src/shared/ui/PrimaryButton';
import { colors } from '../../../src/shared/theme/colors';

export default function Cooking() {
  const { data } = useLocalSearchParams<{ data: string }>();
  const recipe: Recipe = JSON.parse(String(data));
  const [step, setStep] = useState(0);
  const last = step === recipe.cooking_steps.length - 1;

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.screen}>
        <ScrollView contentContainerStyle={s.container} showsVerticalScrollIndicator={false}>
          <Pressable onPress={() => router.back()}>
            <Text style={s.back}>← 체크리스트</Text>
          </Pressable>

          <View style={s.badge}>
            <Text style={s.badgeText}>조리 시작</Text>
          </View>

          <Text style={s.title}>한 단계씩 따라 해보세요.</Text>
          <Text style={s.subtitle}>현재 단계에 집중하면서 천천히 진행하면 돼요.</Text>

          <View style={s.card}>
            <Text style={s.count}>
              {step + 1} / {recipe.cooking_steps.length} 단계
            </Text>
            <Text style={s.emoji}>🍳</Text>
            <Text style={s.instruction}>{recipe.cooking_steps[step]}</Text>
            <Text style={s.muted}>지금 보고 있는 단계만 따라하면 다음으로 넘어갈 수 있어요.</Text>
          </View>

          <View style={s.actions}>
            <Pressable style={s.secondary} onPress={() => setStep(value => Math.max(value - 1, 0))}>
              <Text style={s.secondaryText}>← 이전</Text>
            </Pressable>
            <Pressable style={s.secondary} onPress={() => router.back()}>
              <Text style={s.secondaryText}>⏱ 타이머</Text>
            </Pressable>
          </View>
        </ScrollView>

        <View style={s.footer}>
          <PrimaryButton
            title={last ? '조리 완료' : '다음 단계 →'}
            onPress={() => (last ? router.replace('/') : setStep(value => value + 1))}
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
  card: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 28,
    alignItems: 'center',
  },
  count: { fontSize: 12, color: colors.primary, fontWeight: '800' },
  emoji: { fontSize: 70, marginVertical: 22 },
  instruction: { fontSize: 23, fontWeight: '800', textAlign: 'center', lineHeight: 34, marginBottom: 14, color: colors.ink },
  muted: { color: colors.muted, fontSize: 12, textAlign: 'center', lineHeight: 18 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 18 },
  secondary: {
    flex: 1,
    alignItems: 'center',
    padding: 15,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  secondaryText: { color: colors.ink, fontWeight: '600' },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.background,
  },
});
