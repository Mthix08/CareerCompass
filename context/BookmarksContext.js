import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useProfile } from "./ProfileContext";
import { db } from "../screens/firebaseConfig";

const BookmarksContext = createContext(null);
const UNIVERSITY_BOOKMARKS_KEY = "@careercompass:bookmarkedIds:";
const COURSE_BOOKMARKS_KEY = "@careercompass:bookmarkedCourseIds:";
const FUNDING_BOOKMARKS_KEY = "@careercompass:bookmarkedFundingIds:";
const FUNDING_BOOKMARK_DATA_KEY = "@careercompass:bookmarkedFundingData:";

export function BookmarksProvider({ children }) {
  const { isGuest, firebaseUser } = useProfile();
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  const [bookmarkedCourseIds, setBookmarkedCourseIds] = useState([]);
  const [bookmarkedFundingIds, setBookmarkedFundingIds] = useState([]);
  const [bookmarkedFunding, setBookmarkedFunding] = useState([]);
  const [loadedScope, setLoadedScope] = useState(null);
  const [cloudReadyUid, setCloudReadyUid] = useState(null);
  const userId = firebaseUser?.uid ?? null;
  const storageScope = userId ?? "guest";

  // Load this account's local cache before merging in its cloud copy.
  useEffect(() => {
    let isActive = true;
    setLoadedScope(null);
    setCloudReadyUid(null);

    (async () => {
      try {
        try {
          const [storedUniversityIds, storedCourseIds, storedFundingIds, storedFundingData] = await Promise.all([
            AsyncStorage.getItem(`${UNIVERSITY_BOOKMARKS_KEY}${storageScope}`),
            AsyncStorage.getItem(`${COURSE_BOOKMARKS_KEY}${storageScope}`),
            AsyncStorage.getItem(`${FUNDING_BOOKMARKS_KEY}${storageScope}`),
            AsyncStorage.getItem(`${FUNDING_BOOKMARK_DATA_KEY}${storageScope}`),
          ]);
          if (!isActive) return;
          setBookmarkedIds(storedUniversityIds ? JSON.parse(storedUniversityIds) : []);
          setBookmarkedCourseIds(storedCourseIds ? JSON.parse(storedCourseIds) : []);
          setBookmarkedFundingIds(storedFundingIds ? JSON.parse(storedFundingIds) : []);
          setBookmarkedFunding(storedFundingData ? JSON.parse(storedFundingData) : []);
        } catch (error) {
          if (isActive) {
            setBookmarkedIds([]);
            setBookmarkedCourseIds([]);
            setBookmarkedFundingIds([]);
            setBookmarkedFunding([]);
          }
        }

        if (userId) {
          try {
            const userSnapshot = await getDoc(doc(db, "users", userId));
            const userData = userSnapshot.data() || {};
            if (isActive && Array.isArray(userData.bookmarkedUniversityIds)) {
              setBookmarkedIds(userData.bookmarkedUniversityIds);
            }
            if (isActive && Array.isArray(userData.bookmarkedCourseIds)) {
              setBookmarkedCourseIds(userData.bookmarkedCourseIds);
            }
            if (isActive && Array.isArray(userData.bookmarkedFundingIds)) {
              setBookmarkedFundingIds(userData.bookmarkedFundingIds);
            }
          } catch (error) {
            console.warn("Unable to load bookmarks from Firestore.", error);
          } finally {
            if (isActive) setCloudReadyUid(userId);
          }
        }
      } finally {
        if (isActive) setLoadedScope(storageScope);
      }
    })();
    return () => {
      isActive = false;
    };
  }, [storageScope, userId]);

  useEffect(() => {
    if (loadedScope !== storageScope) return;
    AsyncStorage.setItem(
      `${UNIVERSITY_BOOKMARKS_KEY}${storageScope}`,
      JSON.stringify(bookmarkedIds),
    ).catch(() => {
      console.warn("Unable to save university bookmarks locally.");
    });
  }, [bookmarkedIds, loadedScope, storageScope]);

  useEffect(() => {
    if (loadedScope !== storageScope) return;
    AsyncStorage.setItem(
      `${COURSE_BOOKMARKS_KEY}${storageScope}`,
      JSON.stringify(bookmarkedCourseIds),
    ).catch(() => {
      console.warn("Unable to save course bookmarks locally.");
    });
  }, [bookmarkedCourseIds, loadedScope, storageScope]);

  useEffect(() => {
    if (loadedScope !== storageScope) return;
    AsyncStorage.setItem(
      `${FUNDING_BOOKMARKS_KEY}${storageScope}`,
      JSON.stringify(bookmarkedFundingIds),
    ).catch(() => {
      console.warn("Unable to save bursary bookmarks locally.");
    });
  }, [bookmarkedFundingIds, loadedScope, storageScope]);

  useEffect(() => {
    if (loadedScope !== storageScope) return;
    AsyncStorage.setItem(
      `${FUNDING_BOOKMARK_DATA_KEY}${storageScope}`,
      JSON.stringify(bookmarkedFunding),
    ).catch(() => {
      console.warn("Unable to cache bursary bookmark details locally.");
    });
  }, [bookmarkedFunding, loadedScope, storageScope]);

  useEffect(() => {
    if (!userId || cloudReadyUid !== userId || loadedScope !== storageScope) return;
    setDoc(
      doc(db, "users", userId),
      { bookmarkedUniversityIds: bookmarkedIds, bookmarkedCourseIds, bookmarkedFundingIds },
      { merge: true },
    ).catch((error) => {
      console.warn("Unable to sync bookmarks to Firestore.", error);
    });
  }, [bookmarkedIds, bookmarkedCourseIds, bookmarkedFundingIds, cloudReadyUid, loadedScope, storageScope, userId]);

  const value = useMemo(
    () => ({
      bookmarkedIds,
      isBookmarked: (universityId) => bookmarkedIds.includes(universityId),
      addBookmark: (universityId) =>
        setBookmarkedIds((current) => {
          if (current.includes(universityId)) return current;
          if (isGuest && current.length >= 3) return current;
          return [...current, universityId];
        }),
      removeBookmark: (universityId) =>
        setBookmarkedIds((current) =>
          current.filter((id) => id !== universityId),
        ),
      bookmarkedCourseIds,
      isCourseBookmarked: (courseId) => bookmarkedCourseIds.includes(courseId),
      addCourseBookmark: (courseId) =>
        setBookmarkedCourseIds((current) =>
          current.includes(courseId) ? current : [...current, courseId],
        ),
      removeCourseBookmark: (courseId) =>
        setBookmarkedCourseIds((current) =>
          current.filter((id) => id !== courseId),
        ),
      bookmarkedFundingIds,
      isFundingBookmarked: (fundingId) => bookmarkedFundingIds.includes(String(fundingId)),
      addFundingBookmark: (fundingId) =>
        setBookmarkedFundingIds((current) => {
          const id = String(fundingId);
          return current.includes(id) ? current : [...current, id];
        }),
      saveFundingBookmark: (funding) => {
        if (!funding?.id) return;
        const id = String(funding.id);
        setBookmarkedFundingIds((current) => current.includes(id) ? current : [...current, id]);
        setBookmarkedFunding((current) => {
          const next = current.filter((item) => String(item.id) !== id);
          return [...next, { ...funding, id }];
        });
      },
      removeFundingBookmark: (fundingId) =>
        (() => {
          const id = String(fundingId);
          setBookmarkedFundingIds((current) => current.filter((itemId) => itemId !== id));
          setBookmarkedFunding((current) => current.filter((item) => String(item.id) !== id));
        })(),
      updateFundingBookmarkDetails: (items) => {
        if (!Array.isArray(items) || items.length === 0) return;
        setBookmarkedFunding((current) => {
          const savedIds = new Set(bookmarkedFundingIds);
          const byId = new Map(current.map((item) => [String(item.id), item]));
          items.forEach((item) => {
            const id = String(item.id);
            if (savedIds.has(id)) byId.set(id, { ...byId.get(id), ...item, id });
          });
          return [...byId.values()].filter((item) => savedIds.has(String(item.id)));
        });
      },
      bookmarkedFunding,
    }),
    [bookmarkedIds, bookmarkedCourseIds, bookmarkedFundingIds, bookmarkedFunding, isGuest],
  );

  return (
    <BookmarksContext.Provider value={value}>
      {children}
    </BookmarksContext.Provider>
  );
}

export function useBookmarks() {
  const context = useContext(BookmarksContext);

  if (!context) {
    throw new Error("useBookmarks must be used inside a BookmarksProvider");
  }

  return context;
}
