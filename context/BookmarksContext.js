import React, { createContext, useContext, useMemo, useState } from "react";

const BookmarksContext = createContext(null);

export function BookmarksProvider({ children }) {
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  const [bookmarkedCourseIds, setBookmarkedCourseIds] = useState([]);

  const value = useMemo(
    () => ({
      bookmarkedIds,
      isBookmarked: (universityId) => bookmarkedIds.includes(universityId),
      addBookmark: (universityId) =>
        setBookmarkedIds((current) =>
          current.includes(universityId) ? current : [...current, universityId],
        ),
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
    [bookmarkedCourseIds, bookmarkedIds],
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
