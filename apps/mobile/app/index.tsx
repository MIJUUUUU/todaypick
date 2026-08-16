import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { recipeApi, type HomeRecipeCard } from '../src/entities/recipe/api/recipeApi';
import type { Recipe } from '../src/entities/recipe/model/types';
import { colors } from '../src/shared/theme/colors';

type HomeRecipeSignal = {
  id: string;
  title: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  searchVolume: number;
  pantryFit: number;
  commonIngredientRate: number;
};

const fallbackSignals: HomeRecipeSignal[] = [
  { id: 'kimchi-pork-stirfry', title: '김치돼지고기볶음', icon: 'chef-hat', searchVolume: 96, pantryFit: 84, commonIngredientRate: 78 },
  { id: 'gamja-egg-stirfry', title: '감자계란볶음', icon: 'rice', searchVolume: 92, pantryFit: 88, commonIngredientRate: 91 },
  { id: 'kimchi-jeon', title: '김치전', icon: 'pot-steam-outline', searchVolume: 87, pantryFit: 82, commonIngredientRate: 76 },
  { id: 'tofu-ramen-hotpot', title: '두부라면 전골', icon: 'food', searchVolume: 81, pantryFit: 85, commonIngredientRate: 80 },
  { id: 'bacon-garlic-pasta', title: '베이컨 마늘 파스타', icon: 'silverware-fork-knife', searchVolume: 76, pantryFit: 72, commonIngredientRate: 69 },
  { id: 'tofu-cabbage-salad-bowl', title: '두부 샐러드볼', icon: 'food-apple-outline', searchVolume: 73, pantryFit: 70, commonIngredientRate: 74 },
];

function getHomeScore(signal: HomeRecipeSignal) {
  return signal.searchVolume * 0.55 + signal.pantryFit * 0.3 + signal.commonIngredientRate * 0.15;
}

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [homeCards, setHomeCards] = useState<HomeRecipeCard[]>([]);
  const [loadingHome, setLoadingHome] = useState(true);
  const splashOpacity = useRef(new Animated.Value(1)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  const sortedSignals = useMemo(() => [...fallbackSignals].sort((a, b) => getHomeScore(b) - getHomeScore(a)), []);

  useEffect(() => {
    recipeApi.home(6)
      .then(setHomeCards)
      .catch(() => setHomeCards([]))
      .finally(() => setLoadingHome(false));
  }, []);

  const featuredRecipes = homeCards.slice(0, 3);
  const popularRecipes = homeCards.slice(0, 4);

  useEffect(() => {
    const holdTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(splashOpacity, { toValue: 0, duration: 320, useNativeDriver: true }),
        Animated.timing(contentOpacity, { toValue: 1, duration: 380, useNativeDriver: true }),
      ]).start(({ finished }) => {
        if (finished) setShowSplash(false);
      });
    }, 2500);

    return () => clearTimeout(holdTimer);
  }, [contentOpacity, splashOpacity]);

  const openRecipePreview = async (signal: HomeRecipeSignal) => {
    if (openingId) return;
    setOpeningId(signal.id);
    try {
      const recipe = await recipeApi.detail(signal.id);
      void recipeApi.trackClick({ recipe_id: recipe.id, source: 'home' }).catch(() => undefined);
      router.push({
        pathname: '/recipe/[id]',
        params: {
          id: recipe.id,
          data: JSON.stringify({
            ...recipe,
            reason: '최근 많이 찾았고 집에 자주 있는 재료로 바로 연결되기 쉬운 레시피예요.',
          } satisfies Recipe),
          source: 'home',
        },
      });
    } finally {
      setOpeningId(null);
    }
  };

  const openHomeCard = (card: HomeRecipeCard) => {
    void recipeApi.trackClick({ recipe_id: card.recipe.id, source: 'home' }).catch(() => undefined);
    router.push({
      pathname: '/recipe/[id]',
      params: {
        id: card.recipe.id,
        data: JSON.stringify(card.recipe),
        source: 'home',
      },
    });
  };

  return (
    <SafeAreaView style={s.safe}>
      {showSplash && (
        <Animated.View style={[s.splash, { opacity: splashOpacity }]}>
          <Image source={require('../assets/logo-transparent.png')} style={s.splashLogo} />
        </Animated.View>
      )}
      <Animated.View style={[s.screen, { opacity: contentOpacity }]}>
        <ScrollView contentContainerStyle={s.container} showsVerticalScrollIndicator={false}>
          <View style={s.header}>
            <Image source={require('../assets/logo-transparent.png')} style={s.logo} />
            <Pressable style={s.profileButton} onPress={() => router.push('/collection')}>
              <MaterialCommunityIcons name="account-outline" size={18} color={colors.muted} />
            </Pressable>
          </View>

          <Text style={s.greeting}>미주님, 저녁 메뉴 정하셨어요?</Text>
          <Text style={s.title}>오늘 뭐 해먹지?</Text>
          <Text style={s.subtitle}>지금 있는 재료와 오늘의 상황을 알려주면 바로 만들 수 있는 요리를 골라드려요.</Text>

          <View style={s.featuredHeader}>
            <Text style={s.featuredHeaderTitle}>오늘 이런 메뉴 어때요?</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.featuredRow}>
            {loadingHome && !featuredRecipes.length && (
              <View style={s.featuredLoading}>
                <ActivityIndicator color={colors.primary} />
              </View>
            )}
            {!loadingHome && !featuredRecipes.length && sortedSignals.slice(0, 3).map(recipe => {
              const isOpening = openingId === recipe.id;
              return (
                <Pressable key={recipe.id} style={s.featuredCard} onPress={() => openRecipePreview(recipe)}>
                  <View style={s.featuredVisual}>
                    {isOpening ? (
                      <ActivityIndicator color={colors.primary} />
                    ) : (
                      <MaterialCommunityIcons name={recipe.icon} size={22} color={colors.primary} />
                    )}
                  </View>
                  <Text style={s.featuredTitle}>{recipe.title}</Text>
                  <Text style={s.featuredMeta}>{getFeaturedCopy(recipe.id)}</Text>
                </Pressable>
              );
            })}
            {!!featuredRecipes.length && featuredRecipes.map(card => (
              <Pressable key={card.recipe.id} style={s.featuredCard} onPress={() => openHomeCard(card)}>
                <View style={s.featuredVisual}>
                  {card.recipe.thumbnail_url ? (
                    <Image source={{ uri: card.recipe.thumbnail_url }} style={s.featuredImage} />
                  ) : (
                    <MaterialCommunityIcons
                      name={getRecipeIcon(card.recipe.themes)}
                      size={22}
                      color={colors.primary}
                    />
                  )}
                </View>
                <Text style={s.featuredTitle}>{card.recipe.title}</Text>
                <Text style={s.featuredMeta}>{getFeaturedCopy(card.recipe.id)}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <View style={s.actionCards}>
            <Entry
              title="재료로 찾기"
              text="냉장고 속 재료로 추천받기"
              hint="감자, 계란, 김치처럼 지금 있는 재료로 바로 시작"
              icon="fridge-outline"
              path="/ingredients"
              variant="ingredient"
            />
            <Entry
              title="테마로 찾기"
              text="상황에 맞는 요리 고르기"
              hint="#자취요리  #저칼로리  #파티"
              icon="silverware-fork-knife"
              path="/themes"
              variant="theme"
            />
          </View>

          <Text style={s.sectionTitle}>이번 주 인기 레시피</Text>
          <View style={s.popularList}>
            {!!popularRecipes.length && popularRecipes.map((card, index) => (
              <Pressable
                key={card.recipe.id}
                style={[s.popularItem, index < popularRecipes.length - 1 && s.popularDivider]}
                onPress={() => openHomeCard(card)}
              >
                <View style={s.popularThumb}>
                  {card.recipe.thumbnail_url ? (
                    <Image source={{ uri: card.recipe.thumbnail_url }} style={s.popularThumbImage} />
                  ) : (
                    <MaterialCommunityIcons name={getRecipeIcon(card.recipe.themes)} size={18} color={colors.muted} />
                  )}
                </View>
                <View style={s.popularBody}>
                  <Text style={s.popularTitle}>{card.recipe.title}</Text>
                  <Text style={s.popularSub}>{card.recipe.cooking_time}분 · {card.recipe.difficulty}</Text>
                </View>
              </Pressable>
            ))}
            {!popularRecipes.length && sortedSignals.slice(0, 4).map((recipe, index) => (
              <Pressable
                key={recipe.id}
                style={[s.popularItem, index < 3 && s.popularDivider]}
                onPress={() => openRecipePreview(recipe)}
              >
                <View style={s.popularThumb}>
                  <MaterialCommunityIcons name={recipe.icon} size={18} color={colors.muted} />
                </View>
                <View style={s.popularBody}>
                  <Text style={s.popularTitle}>{recipe.title}</Text>
                  <Text style={s.popularSub}>{getFeaturedCopy(recipe.id)}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

function getRecipeIcon(themes: string[]) {
  if (themes.includes('저칼로리')) return 'food-apple-outline' as const;
  if (themes.includes('파티')) return 'silverware-fork-knife' as const;
  if (themes.includes('캠핑')) return 'pot-steam-outline' as const;
  return 'chef-hat' as const;
}

function getFeaturedCopy(recipeId: string) {
  const labels: Record<string, string> = {
    'gamja-egg-stirfry': '빠르게 만들기 좋아요',
    'kimchi-pork-stirfry': '든든한 한 끼 메뉴',
    'kimchi-jeon': '자주 고르는 메뉴',
    'tofu-ramen-hotpot': '냉장고 재료 활용',
    'bacon-garlic-pasta': '가볍게 분위기 내기',
    'tofu-cabbage-salad-bowl': '가볍게 먹기 좋아요',
  };
  return labels[recipeId] ?? '오늘의 추천 메뉴';
}

function Entry({
  title,
  text,
  hint,
  icon,
  path,
  variant,
}: {
  title: string;
  text: string;
  hint: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  path: '/ingredients' | '/themes';
  variant: 'ingredient' | 'theme';
}) {
  const isIngredient = variant === 'ingredient';
  return (
    <Pressable style={[s.card, isIngredient ? s.cardIngredient : s.cardTheme]} onPress={() => router.push(path)}>
      <View style={s.cardRow}>
        <View style={[s.cardIconWrap, isIngredient ? s.cardIconIngredient : s.cardIconTheme]}>
          <MaterialCommunityIcons name={icon} size={20} color={isIngredient ? colors.ink : colors.primary} />
        </View>
        <View style={s.cardBody}>
          <Text style={s.cardTitle}>{title}</Text>
          <Text style={s.cardText}>{text}</Text>
        </View>
        <MaterialCommunityIcons name="arrow-right" size={18} color={isIngredient ? colors.ink : colors.primary} />
      </View>
      {isIngredient ? (
        <View style={s.cardInputMock}>
          <MaterialCommunityIcons name="magnify" size={14} color={colors.muted} />
          <Text style={s.cardInputText}>재료를 입력하고 바로 추천받기</Text>
        </View>
      ) : (
        <Text style={s.cardHint}>{hint}</Text>
      )}
    </Pressable>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  splash: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  splashLogo: { width: 220, height: 52, resizeMode: 'contain' },
  screen: { flex: 1 },
  container: { padding: 20, paddingBottom: 36 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 },
  logo: { width: 122, height: 30, resizeMode: 'contain' },
  profileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surfaceTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greeting: { fontSize: 13, color: colors.muted, marginBottom: 14 },
  title: { fontSize: 22, fontWeight: '800', color: colors.ink, lineHeight: 32, marginBottom: 10 },
  subtitle: { fontSize: 14, lineHeight: 22, color: colors.muted, marginBottom: 18 },
  featuredHeader: { marginBottom: 12 },
  featuredHeaderTitle: { fontSize: 17, fontWeight: '800', color: colors.ink, marginBottom: 4 },
  featuredHeaderText: { fontSize: 13, lineHeight: 20, color: colors.muted },
  featuredRow: { gap: 12, paddingBottom: 4, marginBottom: 18 },
  featuredCard: {
    width: 144,
    borderRadius: 14,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.line,
  },
  featuredLoading: {
    width: 144,
    height: 122,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: '#FFFFFF',
  },
  featuredVisual: {
    height: 60,
    borderRadius: 10,
    backgroundColor: '#F7F7FB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    overflow: 'hidden',
  },
  featuredImage: { width: '100%', height: '100%' },
  featuredTitle: { fontSize: 14, fontWeight: '700', color: colors.ink, marginBottom: 4 },
  featuredMeta: { fontSize: 12, color: colors.muted, lineHeight: 18 },
  actionCards: { gap: 10, marginBottom: 20 },
  card: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.line,
  },
  cardIngredient: { backgroundColor: '#FFFFFF' },
  cardTheme: { backgroundColor: colors.surfaceTint },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIconIngredient: { backgroundColor: '#F5F5F7' },
  cardIconTheme: { backgroundColor: colors.primarySoft },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.ink, marginBottom: 2 },
  cardText: { fontSize: 13, color: colors.muted },
  cardHint: { fontSize: 11, color: colors.primary, marginTop: 10, marginLeft: 52 },
  cardInputMock: {
    marginTop: 12,
    marginLeft: 52,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: '#FAFAFB',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardInputText: { fontSize: 12, color: colors.muted },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.ink, marginBottom: 10 },
  popularList: { marginBottom: 8 },
  popularItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 },
  popularDivider: { borderBottomWidth: 1, borderBottomColor: colors.line },
  popularThumb: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.surfaceTint,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  popularThumbImage: { width: '100%', height: '100%' },
  popularBody: { flex: 1 },
  popularTitle: { fontSize: 13, color: colors.ink, marginBottom: 3, fontWeight: '600' },
  popularSub: { fontSize: 11, color: colors.muted },
});
