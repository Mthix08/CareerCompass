import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

function CourseCard({ course }) {
  return (
    <View style={styles.courseCard}>
      <Text style={styles.courseName}>{course.name}</Text>
      <Text style={styles.faculty}>{course.faculty}</Text>
      <View style={styles.divider} />
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Minimum APS</Text>
          <Text style={styles.metaValue}>{course.apsDisplay || course.minimumAPS}</Text>
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

export default function CoursesSection({ courses = [], accentColor = "#F4B08F", onSeeMore }) {
  const previewCourses = courses.slice(0, 5);
  return (
    <View style={styles.section}>
      <Text style={styles.heading}>Courses</Text>
      <Text style={[styles.notice, { color: accentColor }]}>
        {courses[0]?.prospectusYear
          ? `Showing courses from the ${courses[0].prospectusYear} prospectus. Confirm current entry requirements with the university.`
          : "Representative programmes are shown below. Confirm current offerings and entry requirements in the university's latest prospectus."}
      </Text>
      {previewCourses.length ? (
        <ScrollView
          nestedScrollEnabled
          style={styles.previewList}
          showsVerticalScrollIndicator
        >
          {previewCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </ScrollView>
      ) : (
        <Text style={styles.emptyText}>No courses available yet.</Text>
      )}
      <Pressable
        onPress={onSeeMore}
        accessibilityRole="button"
        accessibilityLabel="See more courses"
        style={({ pressed }) => [styles.seeMoreButton, pressed && styles.pressed]}
      >
        <Text style={styles.seeMoreText}>See More</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { paddingTop: 24 },
  heading: { color: "#FFFFFF", fontSize: 22, fontWeight: "800" },
  notice: { marginTop: 8, fontSize: 13, lineHeight: 19 },
  previewList: { maxHeight: 550, marginTop: 3 },
  seeMoreButton: { minHeight: 50, marginTop: 18, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: "#29313D" },
  seeMoreText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  pressed: { opacity: 0.7 },
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
