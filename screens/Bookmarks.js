import React, { useMemo } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import UniversityCard from "../components/Varsity-Card";
import { useBookmarks } from "../context/BookmarksContext";
import { universities } from "../data/universities";

export default function Bookmarks({ navigation }) {
  const { bookmarkedIds, removeBookmark } = useBookmarks();
  const bookmarkedUniversities = useMemo(
    () =>
      universities
        .filter(({ id }) => bookmarkedIds.includes(id))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [bookmarkedIds],
  );

  return (
    <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
      <FlatList
        data={bookmarkedUniversities}
        keyExtractor={({ id }) => id}
        contentContainerStyle={[
          styles.listContent,
          bookmarkedUniversities.length === 0 && styles.emptyListContent,
        ]}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          bookmarkedUniversities.length > 0 ? (
            <Text style={styles.resultCount}>
              {bookmarkedUniversities.length} saved {bookmarkedUniversities.length === 1 ? "university" : "universities"}
            </Text>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="bookmark-outline" size={38} color="#117C72" />
            </View>
            <Text style={styles.emptyTitle}>No saved universities yet</Text>
            <Text style={styles.emptyText}>
              Tap a bookmark icon on the Universities screen to save it here.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <UniversityCard
            university={item}
            bookmarked
            onBookmarkPress={() => removeBookmark(item.id)}
            onPress={() =>
              navigation.navigate("UniversityDetails", { university: item })
            }
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F8FC" },
  listContent: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 32 },
  emptyListContent: { flexGrow: 1 },
  separator: { height: 20 },
  resultCount: {
    marginBottom: 16,
    color: "#7B8798",
    fontSize: 13,
    fontWeight: "600",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  emptyIcon: {
    width: 76,
    height: 76,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 38,
    backgroundColor: "#E5F3F1",
  },
  emptyTitle: {
    marginTop: 18,
    color: "#172033",
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
  },
  emptyText: {
    maxWidth: 320,
    marginTop: 8,
    color: "#7B8798",
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },
});
