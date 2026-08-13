import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { listCollectionEntries, type CollectionEntry } from '../src/features/recipe-collection/model/storage';
import { colors } from '../src/shared/theme/colors';

export default function Collection() {
  const [items, setItems] = useState<CollectionEntry[]>([]);
  const [selectedItem, setSelectedItem] = useState<CollectionEntry | null>(null);

  useEffect(() => {
    listCollectionEntries().then(setItems).catch(() => setItems([]));
  }, []);

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.container} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}>
          <Text style={s.back}>← 뒤로가기</Text>
        </Pressable>

        <Text style={s.title}>완성한 요리를 모아보세요.</Text>
        <Text style={s.subtitle}>직접 만든 요리를 사진과 함께 기록할 수 있어요.</Text>

        {!items.length ? (
          <View style={s.empty}>
            <Text style={s.emptyTitle}>아직 저장한 요리가 없어요.</Text>
            <Text style={s.emptyText}>첫 번째 완성 요리를 남겨보세요.</Text>
          </View>
        ) : (
          <View style={s.list}>
            {items.map(item => (
              <Pressable
                key={item.id}
                style={s.card}
                onPress={() => setSelectedItem(item)}
              >
                <View style={s.visual}>
                  {item.photoUri || item.fallbackImageUrl ? (
                    <Image source={{ uri: item.photoUri || item.fallbackImageUrl || undefined }} style={s.image} />
                  ) : (
                    <MaterialCommunityIcons name="silverware-fork-knife" size={22} color={colors.muted} />
                  )}
                </View>
                <View style={s.body}>
                  <Text style={s.cardTitle}>{item.title}</Text>
                  <Text style={s.cardDate}>{formatDate(item.completedAt)}</Text>
                  {!!item.note && <Text style={s.cardNote} numberOfLines={1}>{item.note}</Text>}
                </View>
                <MaterialCommunityIcons name="chevron-right" size={18} color={colors.muted} />
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal visible={!!selectedItem} transparent animationType="fade" onRequestClose={() => setSelectedItem(null)}>
        <Pressable style={s.modalBackdrop} onPress={() => setSelectedItem(null)}>
          <Pressable style={s.modalCard} onPress={event => event.stopPropagation()}>
            {selectedItem ? (
              <>
                <View style={s.modalHandle} />
                <View style={s.modalVisual}>
                  {selectedItem.photoUri || selectedItem.fallbackImageUrl ? (
                    <Image source={{ uri: selectedItem.photoUri || selectedItem.fallbackImageUrl || undefined }} style={s.modalImage} />
                  ) : (
                    <MaterialCommunityIcons name="silverware-fork-knife" size={34} color={colors.muted} />
                  )}
                </View>
                <Text style={s.modalTitle}>{selectedItem.title}</Text>
                <Text style={s.modalDate}>{formatDate(selectedItem.completedAt)}</Text>
                <Text style={s.modalSub}>
                  {selectedItem.photoUri ? '인증사진이 함께 저장된 기록이에요.' : '사진 없이 저장된 완성 기록이에요.'}
                </Text>
                {!!selectedItem.note && (
                  <View style={s.noteBox}>
                    <Text style={s.noteLabel}>오늘의 한 줄 기록</Text>
                    <Text style={s.noteValue}>{selectedItem.note}</Text>
                  </View>
                )}
                <Pressable style={s.modalCloseButton} onPress={() => setSelectedItem(null)}>
                  <Text style={s.modalCloseText}>닫기</Text>
                </Pressable>
              </>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
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
  container: { padding: 24, paddingBottom: 40 },
  back: { color: colors.muted, marginBottom: 24, fontSize: 14 },
  title: { fontSize: 22, fontWeight: '800', color: colors.ink, lineHeight: 32, marginBottom: 8 },
  subtitle: { fontSize: 14, lineHeight: 22, color: colors.muted, marginBottom: 24 },
  empty: {
    padding: 24,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: colors.ink, marginBottom: 6 },
  emptyText: { fontSize: 13, color: colors.muted, lineHeight: 20 },
  list: { gap: 12 },
  card: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  visual: {
    width: 84,
    height: 84,
    borderRadius: 14,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceTint,
  },
  image: { width: '100%', height: '100%' },
  body: { flex: 1, justifyContent: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '800', color: colors.ink, marginBottom: 6 },
  cardDate: { fontSize: 13, color: colors.muted },
  cardNote: { fontSize: 12, color: colors.muted, marginTop: 4 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 11, 26, 0.22)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 28,
  },
  modalHandle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 999,
    backgroundColor: colors.line,
    marginBottom: 16,
  },
  modalVisual: {
    height: 240,
    borderRadius: 20,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceTint,
    marginBottom: 16,
  },
  modalImage: { width: '100%', height: '100%' },
  modalTitle: { fontSize: 22, fontWeight: '800', color: colors.ink, marginBottom: 6 },
  modalDate: { fontSize: 14, fontWeight: '700', color: colors.muted, marginBottom: 8 },
  modalSub: { fontSize: 13, lineHeight: 20, color: colors.muted, marginBottom: 14 },
  noteBox: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.surfaceTint,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 16,
  },
  noteLabel: { fontSize: 12, fontWeight: '800', letterSpacing: 1, color: colors.muted, marginBottom: 8 },
  noteValue: { fontSize: 14, lineHeight: 22, color: colors.ink },
  modalCloseButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: colors.ink,
    paddingVertical: 16,
  },
  modalCloseText: { color: colors.surface, fontSize: 15, fontWeight: '800' },
});
