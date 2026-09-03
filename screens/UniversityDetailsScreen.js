import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  Image,
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
import { getUniversityTheme } from "../data/universityTheme";

export default function UniversityDetailsScreen({ navigation, route }) {
  const university = route.params?.university;
  const [activeTab, setActiveTab] = useState("About");
  const [bookmarked, setBookmarked] = useState(false);
  const universityTheme = getUniversityTheme(university);

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
      return <CoursesSection courses={university.courses} accentColor={universityTheme.accentLight} />;
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
        <View style={[styles.hero, { backgroundColor: universityTheme.placeholderBackground }]}>
          {university.image ? (
            <Image
              source={university.image}
              style={styles.coverImage}
              resizeMode="cover"
              accessibilityLabel={`${university.name} campus`}
            />
          ) : (
            <View style={[styles.coverPlaceholder, { backgroundColor: universityTheme.placeholderBackground }]} accessible={false}>
              <Ionicons name="school-outline" size={68} color={universityTheme.accentLight} />
              <Text style={[styles.placeholderText, { color: universityTheme.accentLight }]}>Campus image coming soon</Text>
            </View>
          )}
          <View style={styles.heroShade} pointerEvents="none" />
          <Pressable
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={8}
            style={({ pressed }) => [styles.heroButton, styles.backButton, pressed && styles.pressed]}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </Pressable>
          <Pressable
            onPress={() => setBookmarked((current) => !current)}
            accessibilityRole="button"
            accessibilityLabel={`${bookmarked ? "Remove" : "Add"} ${university.name} ${bookmarked ? "from" : "to"} bookmarks`}
            accessibilityState={{ selected: bookmarked }}
            hitSlop={8}
            style={({ pressed }) => [styles.heroButton, styles.bookmarkButton, pressed && styles.pressed]}
          >
            <Ionicons name={bookmarked ? "bookmark" : "bookmark-outline"} size={24} color={bookmarked ? universityTheme.accent : "#FFFFFF"} />
          </Pressable>
        </View>

        <View style={styles.content}>
          <View style={styles.logoWrap}>
            {university.logo ? (
              <Image source={university.logo} style={styles.logo} resizeMode="contain" accessibilityLabel={`${university.shortName} logo`} />
            ) : (
              <Text style={[styles.logoText, { color: universityTheme.accent }]}>{university.shortName}</Text>
            )}
          </View>
          <Text style={styles.name}>{university.name}</Text>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, styles.provinceBadge]}>
              <Ionicons name="location-outline" size={15} color="#D7DCE4" />
              <Text style={styles.badgeText}>{university.province}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: universityTheme.accentSoft }]}>
              <Text style={[styles.typeBadgeText, { color: universityTheme.accentLight }]}>{university.type}</Text>
            </View>
          </View>

          <View style={styles.tabsWrap}>
            <UniversityTabs activeTab={activeTab} onTabChange={setActiveTab} accentColor={universityTheme.accent} />
          </View>
          {renderActiveSection()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#05080D" },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 46 },
  hero: { width: "100%", aspectRatio: 1.35, maxHeight: 330, backgroundColor: "#301B14" },
  coverImage: { width: "100%", height: "100%" },
  coverPlaceholder: { width: "100%", height: "100%", alignItems: "center", justifyContent: "center", gap: 9, backgroundColor: "#301B14" },
  placeholderText: { fontSize: 14, fontWeight: "600" },
  heroShade: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(5, 8, 13, 0.18)" },
  heroButton: { position: "absolute", top: 16, width: 48, height: 48, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(5, 8, 13, 0.78)" },
  backButton: { left: 18 },
  bookmarkButton: { right: 18 },
  pressed: { opacity: 0.7 },
  content: { paddingHorizontal: 20 },
  logoWrap: { width: 76, height: 76, marginTop: -38, borderRadius: 21, borderWidth: 4, borderColor: "#05080D", alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF" },
  logo: { width: 62, height: 62 },
  logoText: { fontSize: 24, fontWeight: "900" },
  name: { marginTop: 16, color: "#FFFFFF", fontSize: 27, lineHeight: 34, fontWeight: "900" },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 13 },
  badge: { minHeight: 34, paddingHorizontal: 11, borderRadius: 999, flexDirection: "row", alignItems: "center", gap: 5 },
  provinceBadge: { backgroundColor: "#202733" },
  badgeText: { color: "#D7DCE4", fontSize: 12, fontWeight: "700" },
  typeBadgeText: { fontSize: 12, fontWeight: "800" },
  tabsWrap: { marginTop: 26 },
  missingContainer: { flex: 1, padding: 24, alignItems: "center", justifyContent: "center" },
  missingTitle: { color: "#FFFFFF", fontSize: 22, fontWeight: "800" },
  missingButton: { minHeight: 50, marginTop: 20, paddingHorizontal: 24, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: "#F26522" },
  missingButtonText: { color: "#FFFFFF", fontWeight: "800" },
});
