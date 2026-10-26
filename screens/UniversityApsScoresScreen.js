import React, { useMemo } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  FlatList,
  Pressable,
  StatusBar,
  StyleSheet,
  
  View,
} from "react-native";
import Text from '../components/TranslatedText';
import { SafeAreaView } from "react-native-safe-area-context";

import { APSScoreRow } from "../components/HomeComponents";
import { useProfile } from "../context/ProfileContext";
import { getInstitutionApsMatches, getInstitutionApsResults, getLatestApsRecord } from "../data/apsMatching";

export default function UniversityApsScoresScreen({ navigation }) {
  const { profile, colors, resolvedTheme } = useProfile();
  const COLORS = useMemo(() => getThemeColors(colors), [colors]);
  const styles = useMemo(() => makeStyles(COLORS), [COLORS]);
  const apsRecord = useMemo(
    () => getLatestApsRecord(profile?.apsRecords),
    [profile?.apsRecords],
  );
  const matchingUniversities = useMemo(
    () => getInstitutionApsMatches(apsRecord?.marks),
    [apsRecord?.marks],
  );
  const apsByUniversity = useMemo(
    () => getInstitutionApsResults(apsRecord?.marks),
    [apsRecord?.marks],
  );
  const matchingCourseCount = matchingUniversities.reduce(
    (total, university) => total + university.qualifyingCourses.length,
    0,
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={resolvedTheme === "dark" ? "light-content" : "dark-content"} backgroundColor={COLORS.primary} />
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={8}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <Ionicons name="arrow-back" size={25} color={COLORS.onPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Your APS matches</Text>
        <Text style={styles.headerSubtitle}>
          {apsRecord
            ? `Institution-specific score estimates · ${apsRecord.period}`
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
                  ? `${matchingUniversities.length} universities with APS matches`
                  : "Universities with APS matches"}
              </Text>
              <Text style={styles.listSubtitle}>
                Matches use institution-specific scores recalculated from your saved marks.
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
                ? "No listed course minimum is met by the calculated institution-specific scores. Check each prospectus for current requirements."
                : "Save subject marks in the APS calculator to compare your score with course requirements."}
            </Text>
            <Pressable
              onPress={() => navigation.navigate("ApsCalculator")}
              accessibilityRole="button"
              style={({ pressed }) => [styles.calculateButton, pressed && styles.cardPressed]}
            >
              <Ionicons name="calculator-outline" size={18} color={COLORS.onPrimary} />
              <Text style={styles.calculateButtonText}>Open APS calculator</Text>
            </Pressable>
          </View>
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <APSScoreRow
            university={item}
            score={item.score}
            maximumScore={item.maximumScore}
            caption={`${item.qualifyingCourses.length} course${item.qualifyingCourses.length === 1 ? "" : "s"} at or below this score${item.status === "needs_verification" ? " · Needs verification" : ""}`}
            colors={colors}
          />
        )}
        ListFooterComponent={
          apsRecord && matchingCourseCount > 0 ? (
            <View>
              <Text style={styles.disclaimer}>
                Matches compare institution-specific score estimates with listed course minimums. Some rules still need verification; subject requirements, selection and current prospectus rules also apply. This is not an admission decision or offer.
              </Text>
              <Pressable
                onPress={() => navigation.navigate("Home", {
                  screen: "Courses",
                  params: {
                    matchedOnly: true,
                    apsByUniversity,
                    filterRequestId: Date.now(),
                  },
                })}
                accessibilityRole="button"
                accessibilityLabel="See courses matching your APS"
                style={({ pressed }) => [styles.coursesButton, pressed && styles.pressed]}
              >
                <Ionicons name="book-outline" size={19} color={COLORS.onPrimary} />
                <Text style={styles.coursesButtonText}>See Courses</Text>
              </Pressable>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

function getThemeColors(colors) {
  return { ...colors, secondary: colors.secondaryText, muted: colors.mutedText };
}

function makeStyles(COLORS) {
  return StyleSheet.create({
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
    color: COLORS.onPrimary,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "900",
  },
  headerSubtitle: {
    marginTop: 4,
    color: COLORS.onPrimary,
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
    shadowColor: COLORS.text,
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
    backgroundColor: COLORS.surface,
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
  calculateButtonText: { marginLeft: 8, color: COLORS.onPrimary, fontSize: 13, fontWeight: "800" },
  disclaimer: { marginTop: 16, color: COLORS.secondary, fontSize: 11, lineHeight: 17 },
  coursesButton: {
    minHeight: 50,
    marginTop: 18,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
  },
  coursesButtonText: { marginLeft: 8, color: COLORS.onPrimary, fontSize: 14, fontWeight: "800" },
  pressed: { opacity: 0.65 },
  });
}
