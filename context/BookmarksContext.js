import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useProfile } from "./ProfileContext";
import { db } from "../screens/firebaseConfig";

const BookmarksContext = createContext(null);

export function BookmarksProvider({ children }) {
  const { firebaseUser, isGuest } = useProfile();
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  const [bookmarkedCourseIds, setBookmarkedCourseIds] = useState([]);

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
    [bookmarkedIds, bookmarkedCourseIds, isGuest, persistBookmarks],
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
