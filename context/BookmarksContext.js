import React, {
  createContext,
  useCallback,
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

export function BookmarksProvider({ children }) {
  const { isGuest, firebaseUser } = useProfile();
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  const [bookmarkedCourseIds, setBookmarkedCourseIds] = useState([]);
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
          const [storedUniversityIds, storedCourseIds] = await Promise.all([
            AsyncStorage.getItem(`${UNIVERSITY_BOOKMARKS_KEY}${storageScope}`),
            AsyncStorage.getItem(`${COURSE_BOOKMARKS_KEY}${storageScope}`),
          ]);
          if (!isActive) return;
          setBookmarkedIds(storedUniversityIds ? JSON.parse(storedUniversityIds) : []);
          setBookmarkedCourseIds(storedCourseIds ? JSON.parse(storedCourseIds) : []);
        } catch (error) {
          if (isActive) {
            setBookmarkedIds([]);
            setBookmarkedCourseIds([]);
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
    if (!userId || cloudReadyUid !== userId || loadedScope !== storageScope) return;
    setDoc(
      doc(db, "users", userId),
      { bookmarkedUniversityIds: bookmarkedIds, bookmarkedCourseIds },
      { merge: true },
    ).catch((error) => {
      console.warn("Unable to sync bookmarks to Firestore.", error);
    });
  }, [bookmarkedIds, bookmarkedCourseIds, cloudReadyUid, loadedScope, storageScope, userId]);

  useEffect(() => {
    let active = true;
    const loadBookmarks = async () => {
      if (!firebaseUser) {
        setBookmarkedIds([]);
        setBookmarkedCourseIds([]);
        return;
      }

      const snapshot = await getDoc(doc(db, "users", firebaseUser.uid));
      if (!active) return;
      const data = snapshot.exists() ? snapshot.data() : {};
      setBookmarkedIds(Array.isArray(data.bookmarkedIds) ? data.bookmarkedIds : []);
      setBookmarkedCourseIds(
        Array.isArray(data.bookmarkedCourseIds) ? data.bookmarkedCourseIds : [],
      );
    };

    loadBookmarks().catch(() => {
      if (active) {
        setBookmarkedIds([]);
        setBookmarkedCourseIds([]);
      }
    });
    return () => {
      active = false;
    };
  }, [firebaseUser]);

  const persistBookmarks = useCallback(
    async (nextBookmarks, nextCourseBookmarks) => {
      if (!firebaseUser) return;
      await setDoc(
        doc(db, "users", firebaseUser.uid),
        {
          bookmarkedIds: nextBookmarks,
          bookmarkedCourseIds: nextCourseBookmarks,
        },
        { merge: true },
      );
    },
    [firebaseUser],
  );

  const value = useMemo(
    () => ({
      bookmarkedIds,
      isBookmarked: (universityId) => bookmarkedIds.includes(universityId),
      addBookmark: (universityId) =>
        setBookmarkedIds((current) => {
          if (current.includes(universityId)) return current;
          if (isGuest && current.length >= 3) return current;
          const next = [...current, universityId];
          persistBookmarks(next, bookmarkedCourseIds).catch(() => {});
          return next;
        }),
      removeBookmark: (universityId) =>
        setBookmarkedIds((current) => {
          const next = current.filter((id) => id !== universityId);
          persistBookmarks(next, bookmarkedCourseIds).catch(() => {});
          return next;
        }),
      bookmarkedCourseIds,
      isCourseBookmarked: (courseId) => bookmarkedCourseIds.includes(courseId),
      addCourseBookmark: (courseId) =>
        setBookmarkedCourseIds((current) => {
          if (current.includes(courseId)) return current;
          const next = [...current, courseId];
          persistBookmarks(bookmarkedIds, next).catch(() => {});
          return next;
        }),
      removeCourseBookmark: (courseId) =>
        setBookmarkedCourseIds((current) => {
          const next = current.filter((id) => id !== courseId);
          persistBookmarks(bookmarkedIds, next).catch(() => {});
          return next;
        }),
    }),
    [bookmarkedIds, bookmarkedCourseIds, isGuest],
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