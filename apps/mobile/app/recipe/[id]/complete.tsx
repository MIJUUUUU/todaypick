import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Animated, Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { Recipe } from '../../../src/entities/recipe/model/types';
import { listWishlistRecipeIds, toggleWishlistRecipe, upsertCollectionEntry } from '../../../src/features/recipe-collection/model/storage';
import { PrimaryButton } from '../../../src/shared/ui/PrimaryButton';
import { colors } from '../../../src/shared/theme/colors';

const CELEBRATION_STARS = [
  { left: '10%', size: 16, delay: 0, lift: 238, drift: -48, rotate: '-18deg', color: '#8B78D6', duration: 1380, fall: 112 },
  { left: '20%', size: 12, delay: 120, lift: 276, drift: -22, rotate: '12deg', color: '#F0B429', duration: 1540, fall: 136 },
  { left: '32%', size: 18, delay: 70, lift: 312, drift: -6, rotate: '-10deg', color: '#59B59A', duration: 1320, fall: 124 },
  { left: '46%', size: 14, delay: 160, lift: 294, drift: 18, rotate: '16deg', color: '#F28C6F', duration: 1620, fall: 148 },
  { left: '58%', size: 16, delay: 40, lift: 264, drift: 34, rotate: '-12deg', color: '#5E8BFF', duration: 1460, fall: 132 },
  { left: '70%', size: 12, delay: 190, lift: 244, drift: 26, rotate: '8deg', color: '#FF6B8A', duration: 1280, fall: 120 },
  { left: '82%', size: 15, delay: 90, lift: 256, drift: 44, rotate: '-16deg', color: '#8B78D6', duration: 1680, fall: 154 },
  { left: '90%', size: 11, delay: 140, lift: 224, drift: 20, rotate: '14deg', color: '#F0B429', duration: 1240, fall: 110 },
] as const;

export default function Complete() {
  const { data } = useLocalSearchParams<{ data: string }>();
  const recipe = useMemo<Recipe>(() => JSON.parse(String(data)), [data]);
  const collectionEntryId = useRef(`${recipe.id}-${Date.now()}`).current;
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [savedPhotoUri, setSavedPhotoUri] = useState<string | null>(null);
  const [savedNote, setSavedNote] = useState('');
  const [wishlisted, setWishlisted] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastAccent, setToastAccent] = useState<'collection' | 'photo'>('collection');
  const [savingRecord, setSavingRecord] = useState(false);
  const starScale = useRef(new Animated.Value(1)).current;
  const starRotate = useRef(new Animated.Value(0)).current;
  const toastTranslateX = useRef(new Animated.Value(220)).current;
  const recordedRef = useRef(false);
  const celebrationProgress = useRef(CELEBRATION_STARS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    if (!toastVisible) return;
    Animated.sequence([
      Animated.parallel([
        Animated.timing(toastTranslateX, { toValue: 0, duration: 260, useNativeDriver: true }),
        Animated.timing(starScale, { toValue: 1, duration: 0, useNativeDriver: true }),
      ]),
      Animated.delay(2400),
      Animated.timing(toastTranslateX, { toValue: 220, duration: 240, useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (finished) setToastVisible(false);
    });
    const timer = setTimeout(() => setToastVisible(false), 3000);
    return () => clearTimeout(timer);
  }, [toastVisible, toastTranslateX, starScale]);

  useEffect(() => {
    listWishlistRecipeIds()
      .then(ids => setWishlisted(ids.includes(recipe.id)))
      .catch(() => setWishlisted(false));
  }, [recipe.id]);

  useEffect(() => {
    Animated.stagger(
      110,
      celebrationProgress.map((value, index) =>
        Animated.sequence([
          Animated.timing(value, {
            toValue: 1,
            duration: CELEBRATION_STARS[index].duration,
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ),
    ).start();
  }, [celebrationProgress]);

  useEffect(() => {
    if (recordedRef.current) return;
    recordedRef.current = true;
    void upsertCollectionEntry({
      id: collectionEntryId,
      recipeId: recipe.id,
      title: recipe.title,
      photoUri: null,
      fallbackImageUrl: recipe.image_url ?? recipe.thumbnail_url ?? null,
      completedAt: new Date().toISOString(),
      note: note.trim() || null,
    }).then(() => {
      setToastAccent('collection');
      setToastMessage('컬렉션에 기록되었어요.');
      setToastVisible(true);
    });
  }, [collectionEntryId, note, recipe.id, recipe.image_url, recipe.thumbnail_url, recipe.title]);

  const pickPhoto = () => {
    Alert.alert('인증사진 남기기', '어떤 방식으로 사진을 추가할까요?', [
      { text: '취소', style: 'cancel' },
      { text: '카메라', onPress: () => void openCamera() },
      { text: '앨범', onPress: () => void openLibrary() },
    ]);
  };

  const openCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('권한 필요', '카메라 권한을 허용해야 인증사진을 남길 수 있어요.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
      mediaTypes: ['images'],
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const openLibrary = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('권한 필요', '사진 접근 권한을 허용해야 인증사진을 남길 수 있어요.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.7,
      mediaTypes: ['images'],
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const saveRecordDetails = async () => {
    if (savingRecord) return;
    setSavingRecord(true);
    await upsertCollectionEntry({
      id: collectionEntryId,
      recipeId: recipe.id,
      title: recipe.title,
      photoUri,
      fallbackImageUrl: recipe.image_url ?? recipe.thumbnail_url ?? null,
      completedAt: new Date().toISOString(),
      note: note.trim() || null,
    });
    setSavedPhotoUri(photoUri);
    setSavedNote(note);
    setToastAccent(photoUri ? 'photo' : 'collection');
    setToastMessage(photoUri ? '사진과 메모가 저장되었어요.' : '메모가 저장되었어요.');
    setToastVisible(true);
    setSavingRecord(false);
  };

  const toggleWishlist = async () => {
    const result = await toggleWishlistRecipe(recipe.id);
    setWishlisted(result.saved);
    Animated.sequence([
      Animated.parallel([
        Animated.timing(starScale, { toValue: 1.24, duration: 140, useNativeDriver: true }),
        Animated.timing(starRotate, { toValue: 1, duration: 140, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.spring(starScale, { toValue: 1, friction: 4, tension: 120, useNativeDriver: true }),
        Animated.timing(starRotate, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]),
    ]).start();
  };

  const hasUnsavedChanges = photoUri !== savedPhotoUri || note !== savedNote;

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.screen}>
        {toastVisible ? (
          <Animated.View style={[s.toast, { transform: [{ translateX: toastTranslateX }] }]}>
            <View style={[s.toastIconWrap, toastAccent === 'photo' ? s.toastIconPhoto : s.toastIconCollection]}>
              <MaterialCommunityIcons
                name={toastAccent === 'photo' ? 'camera-outline' : 'check'}
                size={14}
                color={toastAccent === 'photo' ? '#7C5C16' : '#0F6E56'}
              />
            </View>
            <Text style={s.toastText}>{toastMessage}</Text>
          </Animated.View>
        ) : null}
        <ScrollView contentContainerStyle={s.container} showsVerticalScrollIndicator={false}>
          <View style={s.headerRow}>
            <Pressable onPress={() => router.replace('/')}>
              <Text style={s.back}>← 홈으로</Text>
            </Pressable>
            <Animated.View
              style={{
                transform: [
                  { scale: starScale },
                  {
                    rotate: starRotate.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: ['0deg', '-14deg', '10deg'],
                    }),
                  },
                ],
              }}
            >
              <Pressable style={s.saveButton} onPress={() => void toggleWishlist()}>
                <MaterialCommunityIcons
                  name={wishlisted ? 'star' : 'star-outline'}
                  size={20}
                  color={wishlisted ? '#F0B429' : colors.ink}
                />
              </Pressable>
            </Animated.View>
          </View>

          <Text style={s.title}>완성되었어요!</Text>
          <Text style={s.subtitle}>오늘 만든 요리를 사진과 함께 남겨보세요.</Text>

          <View style={s.heroCard}>
            <View style={s.heroVisual}>
              {photoUri || recipe.image_url || recipe.thumbnail_url ? (
                <Image source={{ uri: photoUri || recipe.image_url || recipe.thumbnail_url || undefined }} style={s.heroImage} />
              ) : (
                <Text style={s.heroEmoji}>{recipe.emoji}</Text>
              )}
            </View>
            <Text style={s.recipeTitle}>{recipe.title}</Text>
            <Text style={s.recipeMeta}>완성한 요리 기록은 자동으로 컬렉션에 남아요.</Text>
          </View>

          <View style={s.photoCard}>
            <View style={s.photoHeader}>
              <Text style={s.photoTitle}>인증사진 남기기</Text>
              {photoUri ? <Text style={s.photoState}>사진 추가됨</Text> : null}
            </View>
            <Text style={s.photoText}>사진을 남기면 나중에 컬렉션에서 더 생생하게 다시 볼 수 있어요.</Text>
            <Pressable style={s.attachButton} onPress={pickPhoto}>
              <MaterialCommunityIcons name="camera-outline" size={18} color={colors.ink} />
              <Text style={s.attachText}>{photoUri ? '사진 다시 선택' : '사진 첨부하기'}</Text>
            </Pressable>
          </View>

          <View style={s.noteCard}>
            <Text style={s.noteTitle}>오늘의 한 줄 기록</Text>
            <Text style={s.noteText}>오늘 먹은 느낌이나 다음에 바꾸고 싶은 점을 짧게 남겨보세요.</Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="예: 국물보다 볶음면처럼 먹으니 더 맛있었어요."
              placeholderTextColor={colors.muted}
              style={s.noteInput}
              maxLength={80}
            />
            <Text style={s.noteCaption}>{note.length}/80</Text>
            <Pressable
              style={[s.noteSaveButton, !hasUnsavedChanges && s.noteSaveButtonDisabled]}
              onPress={() => void saveRecordDetails()}
              disabled={!hasUnsavedChanges || savingRecord}
            >
              <Text style={[s.noteSaveText, !hasUnsavedChanges && s.noteSaveTextDisabled]}>
                {savingRecord ? '저장 중...' : '기록 저장하기'}
              </Text>
            </Pressable>
          </View>
        </ScrollView>

        <View style={s.footer}>
          <PrimaryButton title="내 컬렉션 보기" onPress={() => router.push('/collection')} />
        </View>

        <View pointerEvents="none" style={s.celebrationLayer}>
          {CELEBRATION_STARS.map((item, index) => {
            const progress = celebrationProgress[index];
            const translateY = progress.interpolate({
              inputRange: [0, 0.24, 0.62, 1],
              outputRange: [72, -item.lift, -item.lift * 0.18, item.fall],
            });
            const translateX = progress.interpolate({
              inputRange: [0, 0.45, 1],
              outputRange: [0, item.drift, item.drift * 0.5],
            });
            const opacity = progress.interpolate({
              inputRange: [0, 0.06, 0.88, 1],
              outputRange: [0, 1, 1, 0],
            });
            const scale = progress.interpolate({
              inputRange: [0, 0.16, 0.5, 1],
              outputRange: [0.32, 1, 1.08, 0.8],
            });

            return (
              <Animated.View
                key={`${item.left}-${index}`}
                style={[
                  s.celebrationStar,
                  {
                    left: item.left,
                    opacity,
                    transform: [{ translateX }, { translateY }, { scale }, { rotate: item.rotate }],
                  },
                ]}
              >
                <MaterialCommunityIcons name="star-four-points" size={item.size} color={item.color} />
              </Animated.View>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  screen: { flex: 1 },
  container: { padding: 24, paddingBottom: 32 },
  celebrationLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 40,
    elevation: 40,
  },
  celebrationStar: {
    position: 'absolute',
    bottom: 28,
    zIndex: 60,
    elevation: 60,
  },
  toast: {
    position: 'absolute',
    top: 18,
    right: 24,
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: '#FFFCF6',
    shadowColor: '#120E1F',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  toastIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastIconPhoto: { backgroundColor: '#FFF1D6' },
  toastIconCollection: { backgroundColor: '#E7F6F0' },
  toastText: { color: colors.ink, fontSize: 13, fontWeight: '700' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  back: { color: colors.muted, fontSize: 14 },
  saveButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 22, fontWeight: '800', lineHeight: 32, marginBottom: 8, color: colors.ink },
  subtitle: { fontSize: 14, lineHeight: 22, color: colors.muted, marginBottom: 24 },
  heroCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    padding: 20,
    marginBottom: 16,
  },
  heroVisual: {
    height: 180,
    borderRadius: 18,
    backgroundColor: colors.surfaceTint,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 16,
  },
  heroImage: { width: '100%', height: '100%' },
  heroEmoji: { fontSize: 72 },
  recipeTitle: { fontSize: 18, fontWeight: '800', color: colors.ink, marginBottom: 6 },
  recipeMeta: { fontSize: 13, lineHeight: 20, color: colors.muted },
  photoCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    padding: 20,
  },
  photoHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8 },
  photoTitle: { fontSize: 16, fontWeight: '800', color: colors.ink },
  photoState: { fontSize: 12, fontWeight: '700', color: colors.primary },
  photoText: { fontSize: 13, lineHeight: 20, color: colors.muted, marginBottom: 14 },
  attachButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surfaceTint,
    paddingVertical: 14,
  },
  attachText: { fontSize: 14, fontWeight: '700', color: colors.ink },
  noteCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    padding: 20,
    marginTop: 16,
  },
  noteTitle: { fontSize: 16, fontWeight: '800', color: colors.ink, marginBottom: 8 },
  noteText: { fontSize: 13, lineHeight: 20, color: colors.muted, marginBottom: 14 },
  noteInput: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    backgroundColor: colors.surfaceTint,
    color: colors.ink,
    fontSize: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  noteCaption: {
    marginTop: 8,
    fontSize: 12,
    color: colors.muted,
    textAlign: 'right',
  },
  noteSaveButton: {
    marginTop: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: colors.ink,
    paddingVertical: 14,
  },
  noteSaveButtonDisabled: {
    backgroundColor: '#E7E3EF',
  },
  noteSaveText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: '800',
  },
  noteSaveTextDisabled: {
    color: colors.muted,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.background,
  },
});
