import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { recipeApi } from '../src/entities/recipe/api/recipeApi';
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

const recipeSignals: HomeRecipeSignal[] = [
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
  const splashOpacity = useRef(new Animated.Value(1)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  const sortedSignals = useMemo(
    () => [...recipeSignals].sort((a, b) => getHomeScore(b) - getHomeScore(a)),
    []
  );
  const featuredRecipes = sortedSignals.slice(0, 3);
  const popularRecipes = sortedSignals.slice(0, 4);

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
            <Pressable style={s.profileButton}>
              <MaterialCommunityIcons name="account-outline" size={18} color={colors.muted} />
            </Pressable>
          </View>

          <Text style={s.greeting}>미주님, 저녁 메뉴 정하셨어요?</Text>
          <Text style={s.eyebrow}>TODAYPICK · RECIPE ASSISTANT</Text>
          <Text style={s.title}>오늘 뭐 해먹지?</Text>
          <Text style={s.subtitle}>지금 있는 재료와 오늘의 상황을 알려주면 바로 만들 수 있는 요리를 골라드려요.</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.featuredRow}>
            {featuredRecipes.map(recipe => {
              const isOpening = openingId === recipe.id;
              return (
                <Pressable key={recipe.id} style={s.featuredCard} onPress={() => openRecipePreview(recipe)}>
                  <View style={s.featuredVisual}>
                    {isOpening ? (
                      <ActivityIndicator color={colors.primary} />
                    ) : (
                      <MaterialCommunityIcons name={recipe.icon} size={24} color={colors.primary} />
                    )}
                  </View>
                  <Text style={s.featuredTitle}>{recipe.title}</Text>
                  <Text style={s.featuredMeta}>인기 검색 · 재료 보유율 상위</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={s.actionCards}>
            <Entry
              title="재료로 찾기"
              text="냉장고 속 재료로 추천받기"
              hint="냉장고 재료 기반 추천"
              icon="fridge-outline"
              path="/ingredients"
            />
            <Entry
              title="테마로 찾기"
              text="상황에 맞는 요리 고르기"
              hint="#자취요리  #저칼로리  #파티"
              icon="silverware-fork-knife"
              path="/themes"
            />
          </View>

          <Text style={s.sectionTitle}>이번 주 인기 레시피</Text>
          <View style={s.popularList}>
            {popularRecipes.map((recipe, index) => (
              <Pressable
                key={recipe.id}
                style={[s.popularItem, index < popularRecipes.length - 1 && s.popularDivider]}
                onPress={() => openRecipePreview(recipe)}
              >
                <View style={s.popularIcon}>
                  <MaterialCommunityIcons name="trending-up" size={16} color={colors.primary} />
                </View>
                <Text style={s.popularTitle}>{recipe.title}</Text>
                <Text style={s.popularMeta}>TOP {index + 1}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

function Entry({
  title,
  text,
  hint,
  icon,
  path,
}: {
  title: string;
  text: string;
  hint: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  path: '/ingredients' | '/themes';
}) {
  return (
    <Pressable style={s.card} onPress={() => router.push(path)}>
      <View style={s.cardRow}>
        <View style={s.cardIconWrap}>
          <MaterialCommunityIcons name={icon} size={20} color={colors.primary} />
        </View>
        <View style={s.cardBody}>
          <Text style={s.cardTitle}>{title}</Text>
          <Text style={s.cardText}>{text}</Text>
        </View>
        <MaterialCommunityIcons name="arrow-right" size={18} color={colors.primary} />
      </View>
      <Text style={s.cardHint}>{hint}</Text>
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
  eyebrow: { fontSize: 11, letterSpacing: 1.5, color: colors.primary, fontWeight: '800', marginBottom: 6 },
  title: { fontSize: 32, fontWeight: '800', color: colors.ink, marginBottom: 10 },
  subtitle: { fontSize: 14, lineHeight: 22, color: colors.muted, marginBottom: 18 },
  featuredRow: { gap: 10, paddingBottom: 4, marginBottom: 18 },
  featuredCard: {
    width: 144,
    borderRadius: 14,
    padding: 10,
    backgroundColor: colors.surfaceTint,
    borderWidth: 1,
    borderColor: colors.line,
  },
  featuredVisual: {
    height: 66,
    borderRadius: 10,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  featuredTitle: { fontSize: 14, fontWeight: '700', color: colors.ink, marginBottom: 4 },
  featuredMeta: { fontSize: 11, color: colors.muted, lineHeight: 16 },
  actionCards: { gap: 10, marginBottom: 20 },
  card: {
    backgroundColor: colors.surfaceTint,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.line,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.ink, marginBottom: 2 },
  cardText: { fontSize: 13, color: colors.muted },
  cardHint: { fontSize: 11, color: colors.primary, marginTop: 10, marginLeft: 52 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.ink, marginBottom: 10 },
  popularList: { marginBottom: 8 },
  popularItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 },
  popularDivider: { borderBottomWidth: 1, borderBottomColor: colors.line },
  popularIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  popularTitle: { flex: 1, fontSize: 13, color: colors.ink },
  popularMeta: { fontSize: 12, color: colors.muted },
});
