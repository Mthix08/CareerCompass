import React, { createContext, useContext, useMemo, useState } from "react";

const BookmarksContext = createContext(null);

export function BookmarksProvider({ children }) {
  const [bookmarkedIds, setBookmarkedIds] = useState([]);

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
    }),
    [bookmarkedIds],
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
