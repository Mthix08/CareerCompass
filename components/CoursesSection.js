import React, { useMemo, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

function CourseCard({ course }) {
  return (
    <View style={styles.courseCard}>
      <Text style={styles.courseName}>{course.name}</Text>
      <Text style={styles.faculty}>{course.faculty}</Text>
      <View style={styles.divider} />
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Minimum APS</Text>
          <Text style={styles.metaValue}>{course.minimumAPS}</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Duration</Text>
          <Text style={styles.metaValue}>{course.duration}</Text>
        </View>
      </View>
      {!!course.requiredSubjects?.length && (
        <View style={styles.subjectsBlock}>
          <Text style={styles.metaLabel}>Required subjects</Text>
          <View style={styles.subjectsRow}>
            {course.requiredSubjects.map((subject) => (
              <View key={subject} style={styles.subjectBadge}>
                <Text style={styles.subjectText}>{subject}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

export default function CoursesSection({ courses = [] }) {
  const [query, setQuery] = useState("");
  const filteredCourses = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return courses;
    return courses.filter((course) =>
      `${course.name} ${course.faculty}`.toLowerCase().includes(search),
    );
  }, [courses, query]);

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>Courses</Text>
      <Text style={styles.notice}>
        this is an example of courses and how they are displayed.
      </Text>
      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={20} color="#9CA6B5" />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search courses or faculties"
          placeholderTextColor="#737D8C"
          style={styles.searchInput}
          accessibilityLabel="Search university courses"
          returnKeyType="search"
        />
      </View>
      {filteredCourses.length ? (
        filteredCourses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))
      ) : (
        <Text style={styles.emptyText}>
          No example courses match your search.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { paddingTop: 24 },
  heading: { color: "#FFFFFF", fontSize: 22, fontWeight: "800" },
  notice: { marginTop: 8, color: "#F4B08F", fontSize: 13, lineHeight: 19 },
  searchBox: {
    minHeight: 52,
    marginTop: 18,
    paddingHorizontal: 15,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#29313D",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#151A22",
  },
  searchInput: {
    flex: 1,
    minHeight: 50,
    marginLeft: 9,
    color: "#FFFFFF",
    fontSize: 15,
  },
  courseCard: {
    marginTop: 15,
    padding: 18,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#252D39",
    backgroundColor: "#151A22",
  },
  courseName: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
    lineHeight: 23,
  },
  faculty: { marginTop: 6, color: "#9CA6B5", fontSize: 13, lineHeight: 19 },
  divider: { height: 1, marginVertical: 15, backgroundColor: "#29313D" },
  metaRow: { flexDirection: "row", gap: 14 },
  metaItem: { flex: 1 },
  metaLabel: {
    color: "#818C9B",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  metaValue: {
    marginTop: 5,
    color: "#FFFFFF",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
  },
  subjectsBlock: { marginTop: 17 },
  subjectsRow: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginTop: 8 },
  subjectBadge: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "#222936",
  },
  subjectText: { color: "#D7DCE4", fontSize: 12, fontWeight: "600" },
  emptyText: { paddingVertical: 30, color: "#9CA6B5", textAlign: "center" },
});
