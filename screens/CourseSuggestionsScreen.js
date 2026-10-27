import React, { useMemo } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, View } from "react-native";
import Text from "../components/TranslatedText";
import { courseExamples } from "../data/courseExamples";
import {
  COURSE_SUGGESTION_CATEGORIES,
  getSuggestedCourses,
} from "../data/courseSuggestions";
import { useProfile } from "../context/ProfileContext";

const CATEGORY_COPY = {
  [COURSE_SUGGESTION_CATEGORIES.mathematicsFriendly]: {
    title: "Mathematics-friendly qualifications",
    description: "Explore qualifications where the catalogue records Mathematics as an admission subject.",
  },
  [COURSE_SUGGESTION_CATEGORIES.lessMathematics]: {
    title: "More fields to explore",
    description: "Explore these varied qualifications. Requirements differ, and some include Mathematics or Mathematical Literacy.",
  },
  [COURSE_SUGGESTION_CATEGORIES.balanced]: {
    title: "A balanced selection to explore",
    description: "Here are qualifications across different fields to help you explore your options.",
  },
};

export default function CourseSuggestionsScreen({ navigation, route }) {
  const { colors, resolvedTheme } = useProfile();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const category = route.params?.category || COURSE_SUGGESTION_CATEGORIES.balanced;
  const copy = CATEGORY_COPY[category] || CATEGORY_COPY[COURSE_SUGGESTION_CATEGORIES.balanced];
  const courses = useMemo(() => getSuggestedCourses(category, courseExamples), [category]);

  const openCourse = (course) => navigation.navigate("CourseDetails", { course });

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle={resolvedTheme === "dark" ? "light-content" : "dark-content"} backgroundColor={colors.background} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Go back" style={styles.back}>
          <Ionicons name="arrow-back" size={21} color={colors.text} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.eyebrow}>YOUR COURSE SUGGESTIONS</Text>
        <Text style={styles.title}>{copy.title}</Text>
        <Text style={styles.description}>{copy.description}</Text>

        <View style={styles.notice}>
          <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
          <Text style={styles.noticeText}>Suggestions are for exploration only and do not guarantee admission. Check the current official prospectus for admission requirements.</Text>
        </View>

        {courses.length ? courses.map((course) => (
          <Pressable key={course.id} onPress={() => openCourse(course)} accessibilityRole="button" accessibilityLabel={`View ${course.name} at ${course.universityName}`} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
            <Text style={styles.university}>{course.universityName}</Text>
            <Text style={styles.courseName}>{course.name}</Text>
            {!!course.qualificationType && <Text style={styles.type}>{course.qualificationType}</Text>}
            {!!course.description && <Text style={styles.courseDescription} numberOfLines={3}>{course.description}</Text>}
            <View style={styles.button}>
              <Text style={styles.buttonText}>View Course</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.onPrimary} />
            </View>
          </Pressable>
        )) : (
          <View style={styles.empty}>
            <Ionicons name="book-outline" size={30} color={colors.primary} />
            <Text style={styles.emptyText}>Course suggestions are not available right now.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(c) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.background },
    content: { padding: 20, paddingBottom: 36 },
    back: { minHeight: 42, flexDirection: "row", alignItems: "center", gap: 8, alignSelf: "flex-start", marginBottom: 14 },
    backText: { color: c.text, fontSize: 14, fontWeight: "700" },
    eyebrow: { color: c.primary, fontSize: 10, fontWeight: "900", letterSpacing: 1.2 },
    title: { marginTop: 7, color: c.text, fontSize: 25, lineHeight: 32, fontWeight: "900" },
    description: { marginTop: 7, color: c.secondaryText, fontSize: 14, lineHeight: 21 },
    notice: { marginTop: 16, padding: 13, borderRadius: 14, backgroundColor: c.primarySoft, flexDirection: "row", alignItems: "flex-start", gap: 9 },
    noticeText: { flex: 1, color: c.text, fontSize: 12, lineHeight: 18 },
    card: { marginTop: 13, padding: 16, borderRadius: 17, borderWidth: 1, borderColor: c.border, backgroundColor: c.surface },
    university: { color: c.primary, fontSize: 12, lineHeight: 18, fontWeight: "800" },
    courseName: { marginTop: 5, color: c.text, fontSize: 17, lineHeight: 23, fontWeight: "900" },
    type: { marginTop: 5, color: c.secondaryText, fontSize: 12, lineHeight: 18, fontWeight: "700" },
    courseDescription: { marginTop: 9, color: c.secondaryText, fontSize: 13, lineHeight: 19 },
    button: { alignSelf: "flex-start", minHeight: 40, marginTop: 13, paddingHorizontal: 13, borderRadius: 11, backgroundColor: c.primary, flexDirection: "row", alignItems: "center", gap: 8 },
    buttonText: { color: c.onPrimary, fontSize: 13, fontWeight: "800" },
    empty: { marginTop: 20, padding: 24, alignItems: "center", gap: 10, borderRadius: 16, borderWidth: 1, borderColor: c.border, backgroundColor: c.surface },
    emptyText: { color: c.secondaryText, fontSize: 14, textAlign: "center" },
    pressed: { opacity: 0.7 },
  });
}
