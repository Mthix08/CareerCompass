import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, getDocs } from "firebase/firestore";

import { db } from "../screens/firebaseConfig";

const CONTENT_CACHE_PREFIX = "@careercompass:content:";

// Firestore timestamps (live or restored from the cache) -> a sortable number
const sortValue = (value) => {
  if (value && typeof value === "object") {
    if (typeof value.seconds === "number") return value.seconds;
    if (typeof value.toMillis === "function") return value.toMillis() / 1000;
  }
  return value;
};

const sortItems = (items, sortBy, descending) => {
  if (!sortBy) return items;
  return [...items].sort((a, b) => {
    const first = sortValue(a[sortBy]);
    const second = sortValue(b[sortBy]);
    if (first === second) return 0;
    return (first > second ? 1 : -1) * (descending ? -1 : 1);
  });
};

/**
 * Reads a whole collection from Firestore and keeps a copy in AsyncStorage.
 * If Firestore can't be reached (offline), the saved copy is returned instead.
 *
 * Usage: const faqs = await loadCollection("faqs", { sortBy: "order" });
 */
export async function loadCollection(name, { sortBy, descending = false } = {}) {
  const cacheKey = `${CONTENT_CACHE_PREFIX}${name}`;
  try {
    const snapshot = await getDocs(collection(db, name));
    const items = snapshot.docs.map((document) => ({
      id: document.id,
      ...document.data(),
    }));
    AsyncStorage.setItem(cacheKey, JSON.stringify(items)).catch(() => {});
    return sortItems(items, sortBy, descending);
  } catch (error) {
    console.warn(`Unable to load "${name}" from Firestore. Using saved copy.`, error);
    try {
      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached) return sortItems(JSON.parse(cached), sortBy, descending);
    } catch (_cacheError) {
      // nothing saved yet
    }
    return [];
  }
}