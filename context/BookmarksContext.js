import React, { createContext, useContext, useMemo, useState } from "react";
import { useProfile } from "./ProfileContext";

const BookmarksContext = createContext(null);

export function BookmarksProvider({ children }) {
  const { isGuest } = useProfile();
  const [bookmarkedIds, setBookmarkedIds] = useState([]);

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
    }),
    [bookmarkedIds, isGuest],
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
