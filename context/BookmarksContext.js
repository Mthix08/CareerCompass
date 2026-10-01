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

const BookmarksContext = createContext(null);
const UNIVERSITY_BOOKMARKS_KEY = "@careercompass:bookmarkedIds";
const COURSE_BOOKMARKS_KEY = "@careercompass:bookmarkedCourseIds";

export function BookmarksProvider({ children }) {
  const { isGuest } = useProfile();
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