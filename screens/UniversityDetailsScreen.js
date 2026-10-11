import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  Alert,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AboutSection from "../components/AboutSection";
import ApplySection from "../components/ApplySection";
import CoursesSection from "../components/CoursesSection";
import UniversityTabs from "../components/UniversityTabs";
import { useBookmarks } from "../context/BookmarksContext";
import { getUniversityTheme } from "../data/universityTheme";
import { courseExamples } from "../data/courseExamples";

export default function UniversityDetailsScreen({ navigation, route }) {
  const university = route.params?.university;
  const [activeTab, setActiveTab] = useState("About");
  const { addBookmark, isBookmarked, removeBookmark } = useBookmarks();
  const bookmarked = university ? isBookmarked(university.id) : false;
  const universityTheme = getUniversityTheme(university);
  const publishedCourses = university
    ? courseExamples.filter((course) => course.universityId === university.id)
    : [];
  const previewCourses = publishedCourses.length ? publishedCourses : university?.courses || [];
  const registrationFeeInfo = university?.registrationFeeInfo;

  const openFeeSource = async () => {
    if (!registrationFeeInfo?.sourceUrl) return;
    try {
      await Linking.openURL(registrationFeeInfo.sourceUrl);
    } catch {
      Alert.alert("Could not open fee information", "Please try again in a moment.");
    }
  };

  const handleBookmarkPress = () => {
    if (bookmarked) {
      removeBookmark(university.id);
      return;
    }

    addBookmark(university.id);
  };

  const openProspectus = () => {
    const url = university.prospectusUrl;
    if (!url || !/^https?:\/\//i.test(url)) {
      Alert.alert(
        "Prospectus unavailable",
        "This university does not have a valid prospectus website yet.",
      );
      return;
    }

    navigation.navigate("Prospectus", { university, url });
  };

  if (!university) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.missingContainer}>
          <Text style={styles.missingTitle}>University not found</Text>
          <Pressable
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={styles.missingButton}
          >
            <Text style={styles.missingButtonText}>Go back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const renderActiveSection = () => {
    if (activeTab === "Courses") {
      return (
        <CoursesSection
          courses={previewCourses}
          accentColor={universityTheme.accentLight}
          onSeeMore={() => navigation.navigate("Home", {
            screen: "Courses",
            params: { universityId: university.id, filterRequestId: Date.now() },
          })}
        />
      );
    }
    if (activeTab === "Apply") {
      return <ApplySection university={university} />;
    }
    return (
      <AboutSection
        university={university}
        onApsPress={() => navigation.navigate("ApsCalculator", { university })}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.hero,
            { backgroundColor: universityTheme.placeholderBackground },
          ]}
        >
          {university.image ? (
            <Image
              source={university.image}
              style={styles.coverImage}
              resizeMode="cover"
              accessibilityLabel={`${university.name} campus`}
            />
          ) : (
            <View
              style={[
                styles.coverPlaceholder,
                { backgroundColor: universityTheme.placeholderBackground },
              ]}
              accessible={false}
            >
              <Ionicons
                name="school-outline"
                size={68}
                color={universityTheme.accentLight}
              />
              <Text
                style={[
                  styles.placeholderText,
                  { color: universityTheme.accentLight },
                ]}
              >
                Campus image coming soon
              </Text>
            </View>
          )}
          <View style={styles.heroShade} pointerEvents="none" />
          <Pressable
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={8}
            style={({ pressed }) => [
              styles.heroButton,
              styles.backButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </Pressable>
          <Pressable
            onPress={handleBookmarkPress}
            accessibilityRole="button"
            accessibilityLabel={`${bookmarked ? "Remove" : "Add"} ${university.name} ${bookmarked ? "from" : "to"} bookmarks`}
            accessibilityState={{ selected: bookmarked }}
            hitSlop={8}
            style={({ pressed }) => [
              styles.heroButton,
              styles.bookmarkButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name={bookmarked ? "bookmark" : "bookmark-outline"}
              size={24}
              color={bookmarked ? universityTheme.accent : "#FFFFFF"}
            />
          </Pressable>
        </View>

        <View style={styles.content}>
          <View
            style={[styles.logoWrap, { borderColor: universityTheme.accent }]}
          >
            {university.logo ? (
              <Image
                source={university.logo}
                style={styles.logo}
                resizeMode="contain"
                accessibilityLabel={`${university.shortName} logo`}
              />
            ) : (
              <Text
                style={[styles.logoText, { color: universityTheme.accent }]}
              >
                {university.shortName}
              </Text>
            )}
          </View>
          <Text style={styles.name}>{university.name}</Text>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, styles.provinceBadge]}>
              <Ionicons name="location-outline" size={15} color="#D7DCE4" />
              <Text style={styles.badgeText}>{university.province}</Text>
            </View>
            <View
              style={[
                styles.badge,
                { backgroundColor: universityTheme.accentSoft },
              ]}
            >
              <Text
                style={[
                  styles.typeBadgeText,
                  { color: universityTheme.accentLight },
                ]}
              >
                {university.type}
              </Text>
            </View>
          </View>

          <View style={styles.tabsWrap}>
            <UniversityTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              accentColor={universityTheme.accent}
            />
          </View>
          {renderActiveSection()}
          <View style={styles.feeCard}>
            <View style={styles.feeTitleRow}>
              <Ionicons name="wallet-outline" size={21} color={universityTheme.accentLight} />
              <Text style={styles.feeTitle}>Plan for registration costs</Text>
            </View>
            <Text style={styles.feeYear}>Official information found for {registrationFeeInfo?.year || 2026}</Text>
            <Text style={styles.feeBody}>
              {registrationFeeInfo?.summary || "The upfront amount depends on your programme, accommodation and funding. Ask the university for a fee quote before setting a savings target."}
            </Text>
            {!!registrationFeeInfo?.details && (
              <Text style={styles.feeBody}>{registrationFeeInfo.details}</Text>
            )}
            <Text style={styles.feeDisclaimer}>
              Fees are subject to change. These figures and dates are for {registrationFeeInfo?.year || 2026}; confirm the latest amount and payment deadline with the university. Application fees, tuition and residence costs may be separate.
            </Text>
            {!!registrationFeeInfo?.sourceUrl && (
              <Pressable
                onPress={openFeeSource}
                accessibilityRole="link"
                style={({ pressed }) => [styles.feeSourceButton, pressed && styles.pressed]}
              >
                <Text style={[styles.feeSourceText, { color: universityTheme.accentLight }]}>Check official fee information</Text>
                <Ionicons name="open-outline" size={16} color={universityTheme.accentLight} />
              </Pressable>
            )}
          </View>
          <Pressable
            onPress={openProspectus}
            accessibilityRole="button"
            accessibilityLabel={`View ${university.name} prospectus`}
            style={({ pressed }) => [
              styles.prospectusButton,
              { backgroundColor: universityTheme.accent },
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.prospectusButtonText}>View Prospectus</Text>
            <Ionicons name="document-text-outline" size={20} color="#FFFFFF" />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#05080D" },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 46 },
  hero: {
    width: "100%",
    aspectRatio: 1.35,
    maxHeight: 330,
    backgroundColor: "#301B14",
  },
  coverImage: { width: "100%", height: "100%" },
  coverPlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    backgroundColor: "#301B14",
  },
  placeholderText: { fontSize: 14, fontWeight: "600" },
  heroShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(5, 8, 13, 0.18)",
  },
  heroButton: {
    position: "absolute",
    top: 16,
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(5, 8, 13, 0.78)",
  },
  backButton: { left: 18 },
  bookmarkButton: { right: 18 },
  pressed: { opacity: 0.7 },
  content: { paddingHorizontal: 20 },
  logoWrap: {
    width: 76,
    height: 76,
    marginTop: -38,
    borderRadius: 21,
    borderWidth: 4,
    borderColor: "#05080D",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  logo: { width: 62, height: 62 },
  logoText: { fontSize: 24, fontWeight: "900" },
  name: {
    marginTop: 16,
    color: "#FFFFFF",
    fontSize: 27,
    lineHeight: 34,
    fontWeight: "900",
  },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 13 },
  badge: {
    minHeight: 34,
    paddingHorizontal: 11,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  provinceBadge: { backgroundColor: "#202733" },
  badgeText: { color: "#D7DCE4", fontSize: 12, fontWeight: "700" },
  typeBadgeText: { fontSize: 12, fontWeight: "800" },
  tabsWrap: { marginTop: 26 },
  prospectusButton: {
    minHeight: 54,
    marginTop: 28,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },
  feeCard: {
    marginTop: 24,
    padding: 17,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#293241",
    backgroundColor: "#101722",
  },
  feeTitleRow: { flexDirection: "row", alignItems: "center", gap: 9 },
  feeTitle: { color: "#FFFFFF", fontSize: 17, fontWeight: "800" },
  feeYear: { marginTop: 10, color: "#D3DBE7", fontSize: 12, fontWeight: "700" },
  feeBody: { marginTop: 9, color: "#B3BDCB", fontSize: 13, lineHeight: 20 },
  feeDisclaimer: { marginTop: 12, color: "#8792A2", fontSize: 12, lineHeight: 18 },
  feeSourceButton: {
    alignSelf: "flex-start",
    minHeight: 38,
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  feeSourceText: { fontSize: 13, fontWeight: "800" },
  prospectusButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  missingContainer: {
    flex: 1,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  missingTitle: { color: "#FFFFFF", fontSize: 22, fontWeight: "800" },
  missingButton: {
    minHeight: 50,
    marginTop: 20,
    paddingHorizontal: 24,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F26522",
  },
  missingButtonText: { color: "#FFFFFF", fontWeight: "800" },
});
