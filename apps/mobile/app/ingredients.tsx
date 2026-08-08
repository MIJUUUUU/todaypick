import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRecipeDiscovery } from '../src/features/recipe-discovery/model/useRecipeDiscovery';
import { ingredientCatalog } from '../src/shared/config/ingredientCatalog';
import { PrimaryButton } from '../src/shared/ui/PrimaryButton';
import { colors } from '../src/shared/theme/colors';

export default function Ingredients() {
  const d = useRecipeDiscovery();
  const selectedScrollRef = useRef<ScrollView>(null);
  const [query, setQuery] = useState('');
  const [duplicateMessage, setDuplicateMessage] = useState('');
  const [highlightedIngredient, setHighlightedIngredient] = useState('');
  const normalizedQuery = query.trim().toLowerCase();
  const canSubmit = d.ingredients.length > 0;
  const suggestedItems = useMemo(
    () => ingredientCatalog.filter(item => !d.ingredients.includes(item)).slice(0, 8),
    [d.ingredients],
  );
  const searchResults = useMemo(
    () => normalizedQuery
      ? ingredientCatalog.filter(item => item.toLowerCase().includes(normalizedQuery)).slice(0, 8)
      : [],
    [normalizedQuery],
  );
  const canAddCustom = normalizedQuery.length > 0 && !ingredientCatalog.includes(query.trim()) && !d.ingredients.includes(query.trim());

  useEffect(() => {
    if (!duplicateMessage) return;
    const timer = setTimeout(() => setDuplicateMessage(''), 1400);
    return () => clearTimeout(timer);
  }, [duplicateMessage]);

  useEffect(() => {
    if (!highlightedIngredient) return;
    const timer = setTimeout(() => setHighlightedIngredient(''), 1200);
    return () => clearTimeout(timer);
  }, [highlightedIngredient]);

  useEffect(() => {
    if (d.ingredients.length <= 8) return;
    const timer = setTimeout(() => {
      selectedScrollRef.current?.flashScrollIndicators();
    }, 150);
    return () => clearTimeout(timer);
  }, [d.ingredients.length]);

  const showDuplicateFeedback = (name: string) => {
    setDuplicateMessage(`"${name}"은 이미 선택한 재료예요.`);
    setHighlightedIngredient(name);
  };

  const addIngredient = (name: string) => {
    if (d.ingredients.includes(name)) {
      showDuplicateFeedback(name);
      return;
    }
    d.addIngredient(name);
    setQuery('');
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.screen}>
        <ScrollView style={s.topSection} contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
          <View style={s.headerRow}>
            <Pressable style={s.iconButton} onPress={() => router.back()}>
              <MaterialCommunityIcons name="arrow-left" size={16} color={colors.muted} />
            </Pressable>
            <Text style={s.headerTitle}>재료로 찾기</Text>
          </View>
          <Text style={s.eyebrow}>STEP 1 · INGREDIENTS</Text>
          <Text style={s.title}>어떤 재료가 있으신가요?</Text>
          <Text style={s.subtitle}>가지고 있는 재료를 추가하면 딱 맞는 레시피를 찾아드려요.</Text>

          <View style={[s.searchBox, (normalizedQuery.length > 0 || canAddCustom) && s.searchBoxActive]}>
            <MaterialCommunityIcons name="magnify" size={18} color={colors.muted} style={s.searchIcon} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={() => query.trim() ? addIngredient(query.trim()) : undefined}
              placeholder="재료명을 입력하고 추가하세요"
              placeholderTextColor={colors.muted}
              style={s.input}
              returnKeyType="done"
            />
          </View>
          {!!duplicateMessage && <Text style={s.duplicateMessage}>{duplicateMessage}</Text>}

        {(!!searchResults.length || canAddCustom) && (
          <View style={s.autoComplete}>
            {!!searchResults.length && (
              <View style={s.searchList}>
                {searchResults.map((item, index) => (
                  <Pressable
                    key={item}
                    style={[s.searchItem, index === searchResults.length - 1 && !canAddCustom && s.searchItemLast]}
                    onPress={() => addIngredient(item)}
                  >
                    <Text style={s.searchItemText}>{item}</Text>
                    <Text style={d.ingredients.includes(item) ? s.searchItemSelected : s.searchItemAction}>
                      {d.ingredients.includes(item) ? '선택됨' : '추가'}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}

            {canAddCustom && (
              <Pressable
                style={[
                  s.searchItem,
                  s.customSearchItem,
                  !searchResults.length && s.searchItemLast,
                ]}
                onPress={() => addIngredient(query.trim())}
              >
                <Text style={s.customSearchText}>"{query.trim()}" 직접 추가</Text>
                <Text style={s.searchItemAction}>추가</Text>
              </Pressable>
            )}
          </View>
        )}

          <View style={s.panel}>
          <Text style={s.panelTitle}>자주 찾는 재료</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.suggestedRow}>
              {suggestedItems.map(item => (
                <Pressable key={item} style={s.chip} onPress={() => addIngredient(item)}>
                  <Text style={s.chipText}>{item}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </ScrollView>

        <View style={s.selectedSection}>
          <Text style={s.panelTitle}>선택한 재료 {!!d.ingredients.length && `(${d.ingredients.length})`}</Text>
          {!!d.ingredients.length ? (
            <ScrollView
              ref={selectedScrollRef}
              style={s.selectedScrollable}
              contentContainerStyle={s.selectedContent}
              showsVerticalScrollIndicator
              indicatorStyle="black"
              alwaysBounceVertical={false}
            >
              <View style={s.row}>
                {d.ingredients.map(item => (
                  <Pressable key={item} style={[s.chip, s.active, highlightedIngredient === item && s.activeHighlighted]} onPress={() => d.removeIngredient(item)}>
                    <Text style={s.activeText}>{item} ×</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          ) : (
            <View style={s.selectedEmpty}>
              <Text style={s.emptyText}>아직 선택한 재료가 없어요.</Text>
            </View>
          )}
        </View>

        <View style={s.footer}>
          <Text style={s.helper}>
            {canSubmit ? '선택한 태그를 기준으로 추천을 보여드려요.' : '최소 한 개의 재료를 선택해야 다음 단계로 갈 수 있어요.'}
          </Text>
          <PrimaryButton
            title={`${d.ingredients.length || 0}개 재료로 레시피 찾기 →`}
            onPress={() => router.push({ pathname: '/results', params: { ingredients: d.ingredients.join(',') } })}
            disabled={!canSubmit}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  screen: { flex: 1 },
  topSection: { flexGrow: 0, flexShrink: 0 },
  container: { padding: 24, paddingBottom: 24 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surfaceTint,
  },
  headerTitle: { fontSize: 15, fontWeight: '600', color: colors.ink },
  eyebrow: { fontSize: 11, letterSpacing: 1.5, color: colors.primary, fontWeight: '800', marginBottom: 12 },
  title: { fontSize: 28, fontWeight: '800', color: colors.ink, lineHeight: 38, marginBottom: 8 },
  subtitle: { fontSize: 14, lineHeight: 22, color: colors.muted, marginBottom: 20 },
  searchBox: {
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    borderRadius: 18,
    paddingLeft: 40,
    paddingRight: 16,
    paddingVertical: 6,
    marginBottom: 10,
  },
  searchIcon: { position: 'absolute', left: 14, top: 16 },
  searchBoxActive: {
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
  },
  input: { fontSize: 16, color: colors.ink, paddingVertical: 10 },
  duplicateMessage: { color: colors.primary, fontSize: 12, fontWeight: '700', marginBottom: 10 },
  autoComplete: {
    marginBottom: 18,
  },
  panel: { marginTop: 4, marginBottom: 18 },
  panelTitle: { fontSize: 14, fontWeight: '800', color: colors.ink, marginBottom: 12 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  searchList: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: colors.surfaceTint,
  },
  searchItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  searchItemLast: {
    borderBottomWidth: 0,
  },
  searchItemText: { color: colors.ink, fontWeight: '700' },
  searchItemAction: { color: colors.primary, fontWeight: '800', fontSize: 12 },
  searchItemSelected: { color: colors.muted, fontWeight: '800', fontSize: 12 },
  customSearchItem: {
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 18,
    marginTop: 8,
  },
  customSearchText: { color: colors.primary, fontWeight: '800' },
  suggestedRow: { gap: 8, paddingRight: 24 },
  chip: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, borderRadius: 22, paddingHorizontal: 14, paddingVertical: 12 },
  chipText: { color: colors.ink, fontWeight: '600' },
  customChip: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  customChipText: { color: colors.primary, fontWeight: '800' },
  active: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  activeHighlighted: { shadowColor: colors.primary, shadowOpacity: 0.22, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, transform: [{ scale: 1.03 }] },
  activeText: { color: colors.primary, fontWeight: '800' },
  selectedSection: {
    flex: 1,
    minHeight: 0,
    paddingHorizontal: 24,
    paddingTop: 0,
    paddingBottom: 12,
  },
  selectedScrollable: {
    flex: 1,
    minHeight: 0,
  },
  selectedContent: { paddingBottom: 8, paddingRight: 4 },
  selectedEmpty: { paddingBottom: 4 },
  emptyText: { color: colors.muted, lineHeight: 22 },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  helper: { marginTop: 4, color: colors.muted, lineHeight: 20 },
});
