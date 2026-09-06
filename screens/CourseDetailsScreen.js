import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const COLORS = {
  primary: "#117C72",
  primarySoft: "#E7F3F1",
  background: "#F6F8FC",
  surface: "#FFFFFF",
  text: "#172033",
  secondary: "#667085",
  border: "#DDE4ED",
};

function DetailRow({ icon, label, value }) {
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
  const course = route.params?.course;

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
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Go back" hitSlop={8}>
          <Ionicons name="arrow-back" size={25} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerLabel}>COURSE DETAILS</Text>
        <Text style={styles.title}>{course.name}</Text>
        <Text style={styles.university}>{course.universityName}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.apsCard}>
          <View>
            <Text style={styles.apsLabel}>Minimum APS</Text>
            <Text style={styles.apsHint}>Confirm this in the latest prospectus</Text>
          </View>
          <View style={styles.apsValueWrap}>
            <Text style={styles.apsValue}>{course.minimumAps}</Text>
            <Text style={styles.apsUnit}>APS</Text>
          </View>
        </View>
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Programme overview</Text>
          <Text style={styles.description}>{course.description}</Text>
          <View style={styles.detailsList}>
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
            Extracted from the UJ {course.prospectusYear} undergraduate prospectus
            {course.prospectusPage ? `, page ${course.prospectusPage}` : ""}. {course.verificationNote}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: 22, paddingTop: 14, paddingBottom: 24, backgroundColor: COLORS.primary },
  headerLabel: { marginTop: 18, color: "#BFE6E1", fontSize: 10, fontWeight: "900", letterSpacing: 1.2 },
  title: { marginTop: 7, color: "#FFFFFF", fontSize: 25, lineHeight: 32, fontWeight: "900" },
  university: { marginTop: 7, color: "#D8F3EF", fontSize: 14, fontWeight: "700" },
  content: { padding: 20, paddingBottom: 40 },
  apsCard: { padding: 18, borderRadius: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: COLORS.primarySoft },
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
  careerList: { marginTop: 12, gap: 10 },
  careerRow: { flexDirection: "row", alignItems: "flex-start" },
  careerBullet: { width: 7, height: 7, marginTop: 6, borderRadius: 4, backgroundColor: COLORS.primary },
  careerText: { flex: 1, marginLeft: 9, color: COLORS.secondary, fontSize: 13, lineHeight: 19 },
  notice: { marginTop: 16, padding: 15, borderRadius: 16, flexDirection: "row", alignItems: "flex-start", backgroundColor: COLORS.primarySoft },
  noticeText: { flex: 1, marginLeft: 8, color: COLORS.secondary, fontSize: 12, lineHeight: 18 },
  missingContainer: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: COLORS.background },
  missingTitle: { color: COLORS.text, fontSize: 20, fontWeight: "900" },
  backToCourses: { marginTop: 16, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 22, backgroundColor: COLORS.primary },
  backToCoursesText: { color: "#FFFFFF", fontWeight: "800" },
});
