import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { CollectionEntry } from '../../src/features/recipe-collection/model/storage';
import { colors } from '../../src/shared/theme/colors';

export default function CollectionDetail() {
  const { data } = useLocalSearchParams<{ data?: string }>();
  const item = useMemo<CollectionEntry | null>(() => {
    if (!data) return null;
    try {
      return JSON.parse(String(data)) as CollectionEntry;
    } catch {
      return null;
    }
  }, [data]);

  if (!item) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.emptyWrap}>
          <Text style={s.emptyText}>기록을 불러오지 못했어요.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.screen}>
        <ScrollView contentContainerStyle={s.container} showsVerticalScrollIndicator={false}>
          <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/collection'))}>
            <Text style={s.back}>← 내 컬렉션</Text>
          </Pressable>

          <Text style={s.title}>{item.title}</Text>
          <Text style={s.subtitle}>완성한 요리 기록을 다시 볼 수 있어요.</Text>

          <View style={s.heroCard}>
            <View style={s.heroVisual}>
              {item.photoUri || item.fallbackImageUrl ? (
                <Image source={{ uri: item.photoUri || item.fallbackImageUrl || undefined }} style={s.heroImage} />
              ) : (
                <MaterialCommunityIcons name="silverware-fork-knife" size={34} color={colors.muted} />
              )}
            </View>
            <Text style={s.metaLabel}>완성 날짜</Text>
            <Text style={s.metaValue}>{formatDate(item.completedAt)}</Text>
            <Text style={s.metaSub}>{item.photoUri ? '인증사진이 함께 저장된 기록이에요.' : '사진 없이 저장된 완성 기록이에요.'}</Text>
            {!!item.note && (
              <View style={s.noteBox}>
                <Text style={s.noteLabel}>한 줄 메모</Text>
                <Text style={s.noteValue}>{item.note}</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  screen: { flex: 1 },
  container: { padding: 24, paddingBottom: 40 },
  back: { color: colors.muted, marginBottom: 24, fontSize: 14 },
  title: { fontSize: 22, fontWeight: '800', color: colors.ink, lineHeight: 32, marginBottom: 8 },
  subtitle: { fontSize: 14, lineHeight: 22, color: colors.muted, marginBottom: 24 },
  heroCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    padding: 20,
  },
  heroVisual: {
    height: 280,
    borderRadius: 18,
    backgroundColor: colors.surfaceTint,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 18,
  },
  heroImage: { width: '100%', height: '100%' },
  metaLabel: { fontSize: 12, fontWeight: '800', letterSpacing: 1.1, color: colors.muted, marginBottom: 6 },
  metaValue: { fontSize: 20, fontWeight: '800', color: colors.ink, marginBottom: 8 },
  metaSub: { fontSize: 13, color: colors.muted, lineHeight: 20 },
  noteBox: {
    marginTop: 18,
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.surfaceTint,
    borderWidth: 1,
    borderColor: colors.line,
  },
  noteLabel: { fontSize: 12, fontWeight: '800', letterSpacing: 1, color: colors.muted, marginBottom: 8 },
  noteValue: { fontSize: 14, color: colors.ink, lineHeight: 22 },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  emptyText: { fontSize: 14, color: colors.muted },
});
