import React, { useMemo } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  FlatList,
  Image,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useProfile } from "../context/ProfileContext";
import { getApsUniversityMatches, getLatestApsRecord } from "../data/apsMatching";

const COLORS = {
  primary: "#117C72",
  primarySoft: "#E7F3F1",
  background: "#F6F8FC",
  surface: "#FFFFFF",
  text: "#172033",
  secondary: "#667085",
  muted: "#98A2B3",
  border: "#DDE4ED",
};

function UniversityMatchCard({ university, onPressUniversity, onPressCourse }) {
  return (
    <View style={styles.card}>
      <Pressable
        onPress={onPressUniversity}
        accessibilityRole="button"
        accessibilityLabel={`Open ${university.name}`}
        style={({ pressed }) => [styles.universityRow, pressed && styles.cardPressed]}
      >
        <View style={styles.logoWrap}>
          {university.logo ? (
            <Image
              source={university.logo}
              resizeMode="contain"
              accessibilityLabel={`${university.shortName} logo`}
              style={styles.logo}
            />
          ) : (
            <Ionicons name="school-outline" size={26} color={COLORS.primary} />
          )}
        </View>
        <View style={styles.universityDetails}>
          <Text style={styles.universityName} numberOfLines={2}>
            {university.name}
          </Text>
          <Text style={styles.courseCount}>
            {university.qualifyingCourses.length} course
            {university.qualifyingCourses.length === 1 ? "" : "s"} meet APS minimum
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
      </Pressable>
      {university.qualifyingCourses.map((course) => (
        <Pressable
          key={course.id}
          onPress={() => onPressCourse(course)}
          accessibilityRole="button"
          accessibilityLabel={`View ${course.name}, minimum APS ${course.minimumAps}`}
          style={({ pressed }) => [styles.courseRow, pressed && styles.cardPressed]}
        >
          <View style={styles.courseCopy}>
            <Text style={styles.courseName}>{course.name}</Text>
            <Text style={styles.courseRequirement}>
              Minimum APS {course.minimumAps}
              {course.prospectusYear ? ` · ${course.prospectusYear} prospectus` : ""}
            </Text>
          </View>
          <Ionicons name="open-outline" size={18} color={COLORS.primary} />
        </Pressable>
      ))}
    </View>
  );
}

export default function UniversityApsScoresScreen({ navigation }) {
  const { profile } = useProfile();
  const apsRecord = useMemo(
    () => getLatestApsRecord(profile?.apsRecords),
    [profile?.apsRecords],
  );
  const matchingUniversities = useMemo(
    () => getApsUniversityMatches(apsRecord?.totalAps),
    [apsRecord?.totalAps],
  );
  const matchingCourseCount = matchingUniversities.reduce(
    (total, university) => total + university.qualifyingCourses.length,
    0,
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={8}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <Ionicons name="arrow-back" size={25} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle}>Your APS matches</Text>
        <Text style={styles.headerSubtitle}>
          {apsRecord
            ? `${apsRecord.totalAps} general APS estimate · ${apsRecord.period}`
            : "Save your marks to see course matches"}
        </Text>
      </View>

      <FlatList
        data={matchingUniversities}
        keyExtractor={({ id }) => id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.listHeadingRow}>
            <View>
              <Text style={styles.listTitle}>
                {apsRecord
                  ? `${matchingCourseCount} APS-minimum matches`
                  : "APS course matches"}
              </Text>
              <Text style={styles.listSubtitle}>
                Grouped by university; subject rules may also apply
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="school-outline" size={32} color={COLORS.primary} />
            <Text style={styles.emptyTitle}>
              {apsRecord ? "No APS matches found" : "Calculate your APS first"}
            </Text>
            <Text style={styles.emptyText}>
              {apsRecord
                ? "No listed course has a numeric APS minimum at or below this score. Check each prospectus for current requirements."
                : "Save subject marks in the APS calculator to compare your score with course requirements."}
            </Text>
            <Pressable
              onPress={() => navigation.navigate("ApsCalculator")}
              accessibilityRole="button"
              style={({ pressed }) => [styles.calculateButton, pressed && styles.cardPressed]}
            >
              <Ionicons name="calculator-outline" size={18} color="#FFFFFF" />
              <Text style={styles.calculateButtonText}>Open APS calculator</Text>
            </Pressable>
          </View>
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <UniversityMatchCard
            university={item}
            onPressUniversity={() =>
              navigation.navigate("UniversityDetails", { university: item })
            }
            onPressCourse={(course) =>
              navigation.navigate("CourseDetails", { course })
            }
          />
        )}
        ListFooterComponent={
          apsRecord && matchingCourseCount > 0 ? (
            <Text style={styles.disclaimer}>
              These matches compare your general APS estimate with the listed
              minimum. Universities may calculate points differently. Subject
              requirements, selection and current prospectus rules also apply;
              this is not an admission decision or offer.
            </Text>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 22,
    backgroundColor: COLORS.primary,
  },
  backButton: {
    width: 42,
    height: 42,
    marginLeft: -8,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    marginTop: 5,
    color: "#FFFFFF",
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "900",
  },
  headerSubtitle: {
    marginTop: 4,
    color: "#D8F3EF",
    fontSize: 14,
    fontWeight: "600",
  },
  listContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 36 },
  listHeadingRow: {
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  listTitle: { color: COLORS.text, fontSize: 20, fontWeight: "900" },
  listSubtitle: { marginTop: 4, color: COLORS.secondary, fontSize: 12 },
  separator: { height: 11 },
  card: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    shadowColor: "#172033",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  universityRow: { minHeight: 66, flexDirection: "row", alignItems: "center" },
  cardPressed: { opacity: 0.76 },
  logoWrap: {
    width: 54,
    height: 54,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  logo: { width: 44, height: 44 },
  universityDetails: { flex: 1, minWidth: 0, marginHorizontal: 13 },
  universityName: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "800",
  },
  courseCount: {
    marginTop: 5,
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "700",
  },
  courseRow: {
    minHeight: 56,
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 9,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primarySoft,
  },
  courseCopy: { flex: 1, minWidth: 0, marginRight: 10 },
  courseName: { color: COLORS.text, fontSize: 13, lineHeight: 18, fontWeight: "800" },
  courseRequirement: { marginTop: 3, color: COLORS.secondary, fontSize: 11 },
  emptyState: { alignItems: "center", paddingHorizontal: 18, paddingVertical: 34 },
  emptyTitle: { marginTop: 12, color: COLORS.text, fontSize: 17, fontWeight: "900" },
  emptyText: { marginTop: 8, color: COLORS.secondary, fontSize: 13, lineHeight: 19, textAlign: "center" },
  calculateButton: { marginTop: 18, paddingHorizontal: 15, paddingVertical: 11, borderRadius: 10, flexDirection: "row", alignItems: "center", backgroundColor: COLORS.primary },
  calculateButtonText: { marginLeft: 8, color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
  disclaimer: { marginTop: 16, color: COLORS.secondary, fontSize: 11, lineHeight: 17 },
  pressed: { opacity: 0.65 },
});
