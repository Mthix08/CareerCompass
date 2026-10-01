import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useProfile } from "./ProfileContext";
import { db } from "../screens/firebaseConfig";

const BookmarksContext = createContext(null);
const UNIVERSITY_BOOKMARKS_KEY = "@careercompass:bookmarkedIds";
const COURSE_BOOKMARKS_KEY = "@careercompass:bookmarkedCourseIds";

export function BookmarksProvider({ children }) {
  const { firebaseUser, isGuest } = useProfile();
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  const [bookmarkedCourseIds, setBookmarkedCourseIds] = useState([]);
  const hasLoadedFromStorage = useRef(false);

  // Load saved bookmarks once on mount, before any saves are allowed to run.
  useEffect(() => {
    (async () => {
      try {
        const [storedUniversityIds, storedCourseIds] = await Promise.all([
          AsyncStorage.getItem(UNIVERSITY_BOOKMARKS_KEY),
          AsyncStorage.getItem(COURSE_BOOKMARKS_KEY),
        ]);
        if (storedUniversityIds) setBookmarkedIds(JSON.parse(storedUniversityIds));
        if (storedCourseIds) setBookmarkedCourseIds(JSON.parse(storedCourseIds));
      } catch (error) {
        // If storage fails or data is corrupted, we just start with empty bookmarks.
      } finally {
        hasLoadedFromStorage.current = true;
      }
    })();
  }, []);

  // Save university bookmarks whenever they change (after the initial load).
  useEffect(() => {
    if (!hasLoadedFromStorage.current) return;
    AsyncStorage.setItem(
      UNIVERSITY_BOOKMARKS_KEY,
      JSON.stringify(bookmarkedIds),
    ).catch(() => {
      // Non-fatal: bookmarks just won't persist this time.
    });
  }, [bookmarkedIds]);

  // Save course bookmarks whenever they change (after the initial load).
  useEffect(() => {
    if (!hasLoadedFromStorage.current) return;
    AsyncStorage.setItem(
      COURSE_BOOKMARKS_KEY,
      JSON.stringify(bookmarkedCourseIds),
    ).catch(() => {
      // Non-fatal: bookmarks just won't persist this time.
    });
  }, [bookmarkedCourseIds]);

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