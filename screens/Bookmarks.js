import React, { useMemo } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import UniversityCard from "../components/Varsity-Card";
import { useBookmarks } from "../context/BookmarksContext";
import { universities } from "../data/universities";
import { courseExamples } from "../data/courseExamples";

function SavedCourseCard({ course, onPress, onRemove }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open ${course.name} details`}
      style={({ pressed }) => [styles.courseCard, pressed && styles.cardPressed]}
    >
      <View style={styles.courseIcon}>
        <Ionicons name="book-outline" size={23} color="#117C72" />
      </View>
      <View style={styles.courseDetails}>
        <Text style={styles.courseUniversity}>{course.universityShortName}</Text>
        <Text style={styles.courseName} numberOfLines={2}>{course.name}</Text>
        <Text style={styles.courseMeta}>APS {course.minimumAps}+ · {course.qualificationType}</Text>
      </View>
      <Pressable
        onPress={(event) => {
          event.stopPropagation?.();
          onRemove();
        }}
        accessibilityRole="button"
        accessibilityLabel={`Remove ${course.name} from bookmarks`}
        hitSlop={8}
        style={styles.removeCourseButton}
      >
        <Ionicons name="bookmark" size={22} color="#117C72" />
      </Pressable>
    </Pressable>
  );
}

export default function Bookmarks({ navigation }) {
  const {
    bookmarkedCourseIds,
    bookmarkedIds,
    removeBookmark,
    removeCourseBookmark,
  } = useBookmarks();
  const bookmarkedUniversities = useMemo(
    () =>
      universities
        .filter(({ id }) => bookmarkedIds.includes(id))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [bookmarkedIds],
  );
  const bookmarkedCourses = useMemo(
    () =>
      courseExamples
        .filter(({ id }) => bookmarkedCourseIds.includes(id))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [bookmarkedCourseIds],
  );
  const totalBookmarks = bookmarkedUniversities.length + bookmarkedCourses.length;

  return (
    <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
      <FlatList
        data={bookmarkedUniversities}
        keyExtractor={({ id }) => id}
        contentContainerStyle={[
          styles.listContent,
          totalBookmarks === 0 && styles.emptyListContent,
        ]}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          totalBookmarks > 0 ? (
            <View>
              <Text style={styles.resultCount}>{totalBookmarks} saved {totalBookmarks === 1 ? "item" : "items"}</Text>
              {bookmarkedCourses.length > 0 && (
                <View style={styles.savedCoursesSection}>
                  <Text style={styles.sectionTitle}>Courses</Text>
                  {bookmarkedCourses.map((course) => (
                    <SavedCourseCard
                      key={course.id}
                      course={course}
                      onPress={() => navigation.navigate("CourseDetails", { course })}
                      onRemove={() => removeCourseBookmark(course.id)}
                    />
                  ))}
                </View>
              )}
              {bookmarkedUniversities.length > 0 && <Text style={styles.universitySectionTitle}>Universities</Text>}
            </View>
          ) : null
        }
        ListEmptyComponent={totalBookmarks === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="bookmark-outline" size={38} color="#117C72" />
            </View>
            <Text style={styles.emptyTitle}>No saved items yet</Text>
            <Text style={styles.emptyText}>
              Bookmark a university or course to save it here.
            </Text>
          </View>
        ) : null}
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
  savedCoursesSection: { marginBottom: 20 },
  sectionTitle: { marginBottom: 10, color: "#172033", fontSize: 18, fontWeight: "800" },
  universitySectionTitle: { marginBottom: 12, color: "#172033", fontSize: 18, fontWeight: "800" },
  courseCard: { minHeight: 104, marginBottom: 10, padding: 14, borderRadius: 17, borderWidth: 1, borderColor: "#DDE4ED", flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF" },
  cardPressed: { opacity: 0.74 },
  courseIcon: { width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: "#E7F3F1" },
  courseDetails: { flex: 1, minWidth: 0, marginHorizontal: 11 },
  courseUniversity: { color: "#7B8798", fontSize: 10, fontWeight: "800" },
  courseName: { marginTop: 3, color: "#172033", fontSize: 14, lineHeight: 19, fontWeight: "800" },
  courseMeta: { marginTop: 5, color: "#117C72", fontSize: 10, fontWeight: "700" },
  removeCourseButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
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
