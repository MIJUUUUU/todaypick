import AsyncStorage from '@react-native-async-storage/async-storage';

export type CollectionEntry = {
  id: string;
  recipeId: string;
  title: string;
  photoUri?: string | null;
  fallbackImageUrl?: string | null;
  completedAt: string;
  note?: string | null;
};

const COLLECTION_KEY = 'todaypick.recipeCollection';
const WISHLIST_KEY = 'todaypick.recipeWishlist';

export async function listCollectionEntries() {
  const raw = await AsyncStorage.getItem(COLLECTION_KEY);
  if (!raw) return [] as CollectionEntry[];
  try {
    return JSON.parse(raw) as CollectionEntry[];
  } catch {
    return [] as CollectionEntry[];
  }
}

export async function upsertCollectionEntry(entry: CollectionEntry) {
  const current = await listCollectionEntries();
  const existingIndex = current.findIndex(item => item.id === entry.id);
  const next =
    existingIndex >= 0
      ? current.map(item => (item.id === entry.id ? entry : item))
      : [entry, ...current];
  await AsyncStorage.setItem(COLLECTION_KEY, JSON.stringify(next));
  return next;
}

export async function listWishlistRecipeIds() {
  const raw = await AsyncStorage.getItem(WISHLIST_KEY);
  if (!raw) return [] as string[];
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [] as string[];
  }
}

export async function toggleWishlistRecipe(recipeId: string) {
  const current = await listWishlistRecipeIds();
  const exists = current.includes(recipeId);
  const next = exists ? current.filter(id => id !== recipeId) : [recipeId, ...current];
  await AsyncStorage.setItem(WISHLIST_KEY, JSON.stringify(next));
  return { saved: !exists, items: next };
}
