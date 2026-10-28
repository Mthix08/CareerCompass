import React, { useMemo } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, StatusBar, StyleSheet, View } from "react-native";
import Text from '../components/TranslatedText';
import { SafeAreaView } from "react-native-safe-area-context";
import { useBookmarks } from "../context/BookmarksContext";
import { useProfile } from "../context/ProfileContext";
import { getInstitutionCourseMatchStatus, getLatestApsRecord } from "../data/apsMatching";
import { universities } from "../data/universities";
import { calculateUniversityScores } from "../services/apsScoring";
import { getCourseRequirementChecks } from "../services/qualificationRequirements";

function DetailRow({ icon, label, value }) {
  const { colors } = useProfile();
  const COLORS = useMemo(() => getThemeColors(colors), [colors]);
  const styles = useMemo(() => makeStyles(COLORS), [COLORS]);
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailIcon}>
        <Ionicons name={icon} size={19} color={COLORS.primary} />
      </View>
      <View style={styles.detailText}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

export default function CourseDetailsScreen({ navigation, route }) {
  const { colors, resolvedTheme, profile } = useProfile();
  const COLORS = useMemo(() => getThemeColors(colors), [colors]);
  const styles = useMemo(() => makeStyles(COLORS), [COLORS]);
  const course = route.params?.course;
  const {
    addCourseBookmark,
    isCourseBookmarked,
    removeCourseBookmark,
  } = useBookmarks();
  const bookmarked = course ? isCourseBookmarked(course.id) : false;
  const courseMathStatus = useMemo(
    () => course ? getInstitutionCourseMatchStatus(course, getLatestApsRecord(profile?.apsRecords)?.marks) : null,
    [course, profile?.apsRecords],
  );
  const subjectChecks = useMemo(
    () => course ? getCourseRequirementChecks(course, getLatestApsRecord(profile?.apsRecords)?.marks || []) : [],
    [course, profile?.apsRecords],
  );
  const qualification = useMemo(() => {
    if (!course) return { status: "unavailable", score: null };
    const record = getLatestApsRecord(profile?.apsRecords);
    if (!record?.marks?.length || !Number.isFinite(course.minimumAps)) {
      return { status: "unavailable", score: null };
    }
    const university = universities.find(({ id }) => id === course.universityId);
    const score = calculateUniversityScores(university ? [university] : [], record.marks)[0];
    if (!Number.isFinite(score?.score)) return { status: "unavailable", score: null };
    return {
      status: score.score >= course.minimumAps ? "may_qualify" : "not_qualified",
      score: score.score,
    };
  }, [course, profile?.apsRecords]);

  if (!course) {
    return (
      <SafeAreaView style={styles.missingContainer}>
        <Text style={styles.missingTitle}>Course not found</Text>
        <Pressable onPress={() => navigation.goBack()} style={styles.backToCourses}>
          <Text style={styles.backToCoursesText}>Go back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={resolvedTheme === "dark" ? "light-content" : "dark-content"} backgroundColor={COLORS.primary} />
      <View style={styles.header}>
        <View style={styles.headerActions}>
          <Pressable onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Go back" hitSlop={8} style={styles.headerButton}>
            <Ionicons name="arrow-back" size={25} color={COLORS.onPrimary} />
          </Pressable>
          <Pressable
            onPress={() =>
              bookmarked
                ? removeCourseBookmark(course.id)
                : addCourseBookmark(course.id)
            }
            accessibilityRole="button"
            accessibilityLabel={`${bookmarked ? "Remove" : "Add"} ${course.name} ${bookmarked ? "from" : "to"} bookmarks`}
            accessibilityState={{ selected: bookmarked }}
            style={({ pressed }) => [styles.bookmarkButton, pressed && styles.pressed]}
          >
            <Ionicons name={bookmarked ? "bookmark" : "bookmark-outline"} size={23} color={COLORS.onPrimary} />
          </Pressable>
        </View>
        <Text style={styles.headerLabel}>COURSE DETAILS</Text>
        <Text style={styles.title}>{course.name}</Text>
        <Text style={styles.university}>{course.universityName}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[
          styles.qualificationCard,
          qualification.status === "may_qualify" && styles.qualificationCardPositive,
          qualification.status === "not_qualified" && styles.qualificationCardNegative,
        ]}>
          <View style={styles.qualificationHeading}>
            <Ionicons
              name={qualification.status === "may_qualify" ? "checkmark-circle" : qualification.status === "not_qualified" ? "close-circle" : "information-circle"}
              size={22}
              color={qualification.status === "not_qualified" ? COLORS.danger : COLORS.primary}
            />
            <Text style={styles.qualificationTitle}>
              {qualification.status === "may_qualify" ? "May Qualify" : qualification.status === "not_qualified" ? "Not Qualified" : "Qualification not determined"}
            </Text>
          </View>
          <Text style={styles.qualificationText}>
            {qualification.status === "may_qualify"
              ? `Your ${course.universityShortName} APS score of ${qualification.score} meets the listed minimum. Check the official prospectus for the required Mathematics type, subject levels and other admission conditions.`
              : qualification.status === "not_qualified"
                ? `Your ${course.universityShortName} APS score of ${qualification.score} is below the listed minimum of ${course.minimumAps}. Admission rules may include other routes; confirm with the latest official prospectus.`
                : "Save valid marks in My Marks to compare your score using this university's APS scorer. This is an estimate; confirm all requirements in the official prospectus."}
          </Text>
          {qualification.status === "may_qualify" && courseMathStatus?.status === "needs_verification" && (
            <Text style={styles.qualificationText}>Maths subject requirement: needs verification. Check the official prospectus.</Text>
          )}
        </View>
        <View style={styles.apsCard}>
          <View>
            <Text style={styles.apsLabel}>{course.minimumAps == null ? "Admission points" : "Minimum APS"}</Text>
            <Text style={styles.apsHint}>Confirm this in the latest prospectus</Text>
          </View>
          <View style={styles.apsValueWrap}>
            <Text style={styles.apsValue}>{course.minimumAps ?? "—"}</Text>
            <Text style={styles.apsUnit}>{course.minimumAps == null ? "SEE BELOW" : "APS"}</Text>
          </View>
        </View>
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Programme overview</Text>
          <Text style={styles.description}>{course.description}</Text>
          <View style={styles.detailsList}>
            <DetailRow icon="stats-chart-outline" label="Admission points" value={course.apsDisplay} />
            <DetailRow icon="ribbon-outline" label="Qualification" value={course.qualificationType} />
            <DetailRow icon="barcode-outline" label="Qualification code" value={course.qualificationCode} />
            <DetailRow icon="business-outline" label="Faculty" value={course.faculty} />
            <DetailRow icon="location-outline" label="Campus" value={course.campus} />
            <DetailRow icon="time-outline" label="Duration" value={course.duration} />
          </View>
        </View>
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Required subjects</Text>
          <View style={styles.subjectWrap}>
            {course.requiredSubjects.map((subject) => (
              <View key={subject} style={styles.subjectBadge}>
                <Text style={styles.subjectText}>{subject}</Text>
              </View>
            ))}
          </View>
        </View>
        {!!subjectChecks.length && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Compare your saved marks</Text>
            <Text style={styles.checklistIntro}>
              This compares marks with subject minimums listed for this course. Alternative subject combinations and selection rules may need a manual check.
            </Text>
            {subjectChecks.map((check) => {
              const statusColor = check.status === "met" || check.status === "recorded"
                ? COLORS.primary
                : check.status === "below"
                  ? COLORS.danger
                  : COLORS.accent;
              const statusLabel = check.status === "met"
                ? "Minimum met"
                : check.status === "recorded"
                  ? "Mark recorded"
                  : check.status === "below"
                    ? "Below listed minimum"
                    : check.status === "missing"
                      ? "Add this subject"
                      : "Check prospectus";
              return (
                <View key={check.key} style={styles.requirementRow}>
                  <View style={styles.requirementCopy}>
                    <Text style={styles.requirementName}>{check.label}</Text>
                    <Text style={styles.requirementDetail}>{check.current}</Text>
                    <Text style={styles.requirementDetail}>{check.minimum}</Text>
                  </View>
                  <Text style={[styles.requirementStatus, { color: statusColor }]}>{statusLabel}</Text>
                </View>
              );
            })}
            <Text style={styles.checklistFootnote}>
              This is planning guidance, not an admission decision. Confirm every requirement in the current official prospectus.
            </Text>
          </View>
        )}
        {course.careerOpportunities.length > 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Career opportunities</Text>
            <View style={styles.careerList}>
              {course.careerOpportunities.map((career, index) => (
                <View key={`${career}-${index}`} style={styles.careerRow}>
                  <View style={styles.careerBullet} />
                  <Text style={styles.careerText}>{career}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        <View style={styles.notice}>
          <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
          <Text style={styles.noticeText}>
            From {course.universityShortName}&apos;s {course.prospectusYear ? `${course.prospectusYear} ` : ""}programme information
            {course.prospectusPage ? `, page ${course.prospectusPage}` : ""}. {course.verificationNote}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getThemeColors(colors) {
  return { ...colors, secondary: colors.secondaryText };
}

function makeStyles(COLORS) {
  return StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: 22, paddingTop: 14, paddingBottom: 24, backgroundColor: COLORS.primary },
  headerActions: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerButton: { width: 42, height: 42, marginLeft: -8, alignItems: "center", justifyContent: "center" },
  bookmarkButton: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: "rgba(255,255,255,0.46)", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.14)" },
  pressed: { opacity: 0.65 },
  headerLabel: { marginTop: 18, color: COLORS.onPrimary, fontSize: 10, fontWeight: "900", letterSpacing: 1.2 },
  title: { marginTop: 7, color: COLORS.onPrimary, fontSize: 25, lineHeight: 32, fontWeight: "900" },
  university: { marginTop: 7, color: COLORS.onPrimary, fontSize: 14, fontWeight: "700" },
  content: { padding: 20, paddingBottom: 40 },
  apsCard: { padding: 18, borderRadius: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: COLORS.primarySoft },
  qualificationCard: { marginBottom: 16, padding: 16, borderRadius: 18, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface },
  qualificationCardPositive: { borderColor: COLORS.primary, backgroundColor: COLORS.primarySoft },
  qualificationCardNegative: { borderColor: COLORS.danger, backgroundColor: COLORS.dangerSoft },
  qualificationHeading: { flexDirection: "row", alignItems: "center", gap: 8 },
  qualificationTitle: { color: COLORS.text, fontSize: 16, fontWeight: "900" },
  qualificationText: { marginTop: 8, color: COLORS.secondary, fontSize: 12, lineHeight: 18 },
  apsLabel: { color: COLORS.primary, fontSize: 14, fontWeight: "900" },
  apsHint: { maxWidth: 230, marginTop: 4, color: COLORS.secondary, fontSize: 11, lineHeight: 16 },
  apsValueWrap: { alignItems: "flex-end" },
  apsValue: { color: COLORS.primary, fontSize: 34, lineHeight: 38, fontWeight: "900" },
  apsUnit: { color: COLORS.primary, fontSize: 10, fontWeight: "900" },
  sectionCard: { marginTop: 16, padding: 19, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface },
  sectionTitle: { color: COLORS.text, fontSize: 18, fontWeight: "900" },
  description: { marginTop: 9, color: COLORS.secondary, fontSize: 13, lineHeight: 21 },
  detailsList: { marginTop: 16, gap: 10 },
  detailRow: { minHeight: 62, padding: 11, borderRadius: 14, flexDirection: "row", alignItems: "center", backgroundColor: COLORS.background },
  detailIcon: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: COLORS.primarySoft },
  detailText: { flex: 1, marginLeft: 11 },
  detailLabel: { color: COLORS.secondary, fontSize: 10, fontWeight: "800", textTransform: "uppercase" },
  detailValue: { marginTop: 3, color: COLORS.text, fontSize: 13, lineHeight: 18, fontWeight: "700" },
  subjectWrap: { marginTop: 13, flexDirection: "row", flexWrap: "wrap", gap: 8 },
  subjectBadge: { paddingHorizontal: 11, paddingVertical: 8, borderRadius: 999, backgroundColor: COLORS.primarySoft },
  subjectText: { color: COLORS.primary, fontSize: 12, fontWeight: "700" },
  checklistIntro: { marginTop: 7, color: COLORS.secondary, fontSize: 12, lineHeight: 18 },
  requirementRow: { marginTop: 12, padding: 12, borderRadius: 14, backgroundColor: COLORS.background, flexDirection: "row", alignItems: "center", gap: 10 },
  requirementCopy: { flex: 1 },
  requirementName: { color: COLORS.text, fontSize: 13, fontWeight: "800" },
  requirementDetail: { marginTop: 3, color: COLORS.secondary, fontSize: 11, lineHeight: 16 },
  requirementStatus: { maxWidth: 105, fontSize: 11, lineHeight: 16, fontWeight: "800", textAlign: "right" },
  checklistFootnote: { marginTop: 11, color: COLORS.secondary, fontSize: 11, lineHeight: 17 },
  careerList: { marginTop: 12, gap: 10 },
  careerRow: { flexDirection: "row", alignItems: "flex-start" },
  careerBullet: { width: 7, height: 7, marginTop: 6, borderRadius: 4, backgroundColor: COLORS.primary },
  careerText: { flex: 1, marginLeft: 9, color: COLORS.secondary, fontSize: 13, lineHeight: 19 },
  notice: { marginTop: 16, padding: 15, borderRadius: 16, flexDirection: "row", alignItems: "flex-start", backgroundColor: COLORS.primarySoft },
  noticeText: { flex: 1, marginLeft: 8, color: COLORS.secondary, fontSize: 12, lineHeight: 18 },
  missingContainer: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: COLORS.background },
  missingTitle: { color: COLORS.text, fontSize: 20, fontWeight: "900" },
  backToCourses: { marginTop: 16, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 22, backgroundColor: COLORS.primary },
  backToCoursesText: { color: COLORS.onPrimary, fontWeight: "800" },
  });
}
