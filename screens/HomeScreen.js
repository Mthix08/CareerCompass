import React, { useCallback, useMemo } from "react";
import {
  FlatList,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  APSScoreRow,
  DeadlineCard,
  HomeUniversityCard,
  QuickActionCard,
  SectionHeader,
  ViewAllUniversitiesCard,
} from "../components/HomeComponents";
import { useProfile } from "../context/ProfileContext";
import {
  HOME_PREVIEW_VALUES,
  MOCK_APPLICATION_DEADLINES,
} from "../data/homeMockData";
import { universities } from "../data/universities";

const NSFAS_IMAGE = require("../assets/nsfas.jpg");
const HORIZONTAL_GAP = 14;

export default function HomeScreen({ navigation }) {
  const { profile, colors, resolvedTheme } = useProfile();
  const { width: screenWidth } = useWindowDimensions();
  const headerAccent = resolvedTheme === "dark" ? "#0D6F67" : colors.primary;
  const styles = useMemo(
    () => createStyles(colors, resolvedTheme, headerAccent),
    [colors, resolvedTheme, headerAccent],
  );
  const learnerName = profile?.firstName?.trim() || "Zethembe";
  const sliderCardWidth = Math.min(Math.max(screenWidth - 66, 254), 310);
  const universityCardWidth = Math.min(
    Math.max(screenWidth * 0.73, 258),
    304,
  );

  const deadlineItems = useMemo(
    () =>
      MOCK_APPLICATION_DEADLINES.map((deadline) => ({
        ...deadline,
        university: universities.find(
          (university) => university.id === deadline.universityId,
        ),
      })).filter((deadline) => deadline.university),
    [],
  );

  const openApsCalculator = useCallback(
    () => navigation.navigate("ApsCalculator"),
    [navigation],
  );

  const openFunding = useCallback(
    () => navigation.navigate("NsfasDetails"),
    [navigation],
  );

  const openCourses = useCallback(
    () => navigation.navigate("Courses"),
    [navigation],
  );
  const openUniversities = useCallback(
    () => navigation.navigate("Universities"),
    [navigation],
  );
  const openUniversity = useCallback(
    (university) =>
      navigation.getParent()?.navigate("UniversityDetails", { university }),
    [navigation],
  );

  const quickActions = useMemo(
    () => [
      {
        id: "courses",
        title: "Courses",
        subtitle: "Find your course",
        icon: "book-outline",
        onPress: openCourses,
      },
      {
        id: "aps",
        title: "View My APS",
        subtitle: "Know your score",
        icon: "calculator-outline",
        onPress: openApsCalculator,
      },
      {
        id: "funding",
        title: "Find Bursaries",
        subtitle: "Explore funding options",
        icon: "wallet-outline",
        onPress: openFunding,
      },
      {
        id: "universities",
        title: "Universities",
        subtitle: "Explore campuses",
        icon: "business-outline",
        onPress: openUniversities,
      },
    ],
    [openApsCalculator, openCourses, openFunding, openUniversities],
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar style="light" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.welcomeHeader}>
          <Text style={styles.welcomeTitle} numberOfLines={2}>
            Welcome, {learnerName}
          </Text>
          <Text style={styles.welcomeMessage}>
            Explore universities and find the right path for your future.
          </Text>
          <Pressable
            onPress={openApsCalculator}
            accessibilityRole="button"
            accessibilityLabel="View My APS"
            style={({ pressed }) => [
              styles.headerButton,
              pressed && styles.lightPressed,
            ]}
          >
            <Ionicons
              name="calculator-outline"
              size={20}
              color={headerAccent}
            />
            <Text style={styles.headerButtonText}>View My APS</Text>
          </Pressable>
        </View>

        <View style={styles.pageContent}>
          <View style={styles.matchedCard}>
            <View style={styles.matchedIcon}>
              <Ionicons name="school-outline" size={26} color={colors.primary} />
            </View>
            <View style={styles.matchedCopy}>
              <Text style={styles.matchedTitle}>
                {HOME_PREVIEW_VALUES.matchedUniversities} universities matched
              </Text>
              <Text style={styles.matchedText}>
                Calculate your APS to discover matching courses.
              </Text>
            </View>
            <Pressable
              onPress={openCourses}
              accessibilityRole="button"
              accessibilityLabel="View matching courses"
              style={({ pressed }) => [
                styles.compactButton,
                pressed && styles.primaryPressed,
              ]}
            >
              <Text style={styles.compactButtonText}>View</Text>
            </Pressable>
          </View>

          <Pressable
            onPress={openFunding}
            accessibilityRole="button"
            accessibilityLabel="Learn more about NSFAS funding"
            style={({ pressed }) => [
              styles.fundingBanner,
              pressed && styles.cardPressed,
            ]}
          >
            <ImageBackground
              source={NSFAS_IMAGE}
              resizeMode="cover"
              imageStyle={styles.fundingImage}
              style={styles.fundingBackground}
            >
              <View style={styles.fundingOverlay} />
              <View style={styles.fundingContent}>
                <View style={styles.fundingLabel}>
                  <Ionicons
                    name="wallet-outline"
                    size={14}
                    color="#FFFFFF"
                  />
                  <Text style={styles.fundingLabelText}>STUDENT FUNDING</Text>
                </View>
                <Text style={styles.fundingTitle}>
                  Don’t forget to apply for NSFAS
                </Text>
                <Text style={styles.fundingText}>
                  Financial support can make your study journey possible. Check
                  the requirements and apply before applications close.
                </Text>
                <View style={styles.fundingActionRow}>
                  <Text style={styles.fundingAction}>View Funding</Text>
                  <Ionicons
                    name="arrow-forward"
                    size={18}
                    color="#FFFFFF"
                  />
                </View>
              </View>
            </ImageBackground>
          </Pressable>

          <View style={styles.section}>
            <View style={styles.paddedHeader}>
              <SectionHeader
                title="Upcoming Application Deadlines"
                icon="calendar-outline"
                colors={colors}
              />
            </View>
            <FlatList
              horizontal
              data={deadlineItems}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <DeadlineCard
                  item={item}
                  university={item.university}
                  colors={colors}
                  width={sliderCardWidth}
                />
              )}
              ItemSeparatorComponent={() => (
                <View style={styles.horizontalGap} />
              )}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.sliderContent}
              snapToInterval={sliderCardWidth + HORIZONTAL_GAP}
              decelerationRate="fast"
            />
          </View>

          <View style={styles.sectionWithPadding}>
            <SectionHeader title="Your APS Scores" colors={colors} />
            <Text style={styles.helperText}>
              Calculate your APS to see your scores for each university.
            </Text>
            {universities.map((university) => (
              <APSScoreRow
                key={university.id}
                university={university}
                score={HOME_PREVIEW_VALUES.defaultAps}
                colors={colors}
              />
            ))}
            <Pressable
              onPress={openApsCalculator}
              accessibilityRole="button"
              accessibilityLabel="Calculate APS"
              style={({ pressed }) => [
                styles.outlineButton,
                pressed && styles.primaryPressed,
              ]}
            >
              <Ionicons
                name="calculator-outline"
                size={19}
                color={colors.primary}
              />
              <Text style={styles.outlineButtonText}>Calculate APS</Text>
            </Pressable>
          </View>

          <View style={styles.section}>
            <View style={styles.paddedHeader}>
              <SectionHeader
                title="Universities"
                actionLabel="View all"
                onActionPress={openUniversities}
                colors={colors}
              />
            </View>
            <FlatList
              horizontal
              data={universities}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <HomeUniversityCard
                  university={item}
                  onPress={() => openUniversity(item)}
                  colors={colors}
                  width={universityCardWidth}
                />
              )}
              ListFooterComponent={
                <View style={styles.viewAllFooter}>
                  <ViewAllUniversitiesCard
                    onPress={openUniversities}
                    colors={colors}
                    width={Math.min(universityCardWidth * 0.72, 210)}
                  />
                </View>
              }
              ItemSeparatorComponent={() => (
                <View style={styles.horizontalGap} />
              )}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.sliderContent}
              decelerationRate="fast"
            />
          </View>

          <View style={styles.sectionWithPadding}>
            <SectionHeader title="Quick Actions" colors={colors} />
            <View style={styles.quickGrid}>
              {quickActions.map((action) => (
                <QuickActionCard
                  key={action.id}
                  {...action}
                  colors={colors}
                />
              ))}
            </View>

            <View style={styles.apsReminder}>
              <View style={styles.apsBadge}>
                <Text style={styles.apsBadgeText}>APS</Text>
              </View>
              <Text style={styles.reminderTitle}>
                Check your APS before applying
              </Text>
              <Text style={styles.reminderText}>
                APS helps you understand which university courses you may
                qualify for before you apply.
              </Text>
              <Pressable
                onPress={openApsCalculator}
                accessibilityRole="button"
                accessibilityLabel="Calculate My APS"
                style={({ pressed }) => [
                  styles.reminderButton,
                  pressed && styles.lightPressed,
                ]}
              >
                <Text style={styles.reminderButtonText}>Calculate My APS</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors, resolvedTheme, headerAccent) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: headerAccent },
    scrollView: { flex: 1, backgroundColor: colors.background },
    scrollContent: { paddingBottom: 136 },
    welcomeHeader: {
      paddingHorizontal: 20,
      paddingTop: 26,
      paddingBottom: 78,
      backgroundColor: headerAccent,
    },
    welcomeTitle: {
      color: "#FFFFFF",
      fontSize: 29,
      lineHeight: 36,
      fontWeight: "900",
    },
    welcomeMessage: {
      maxWidth: 430,
      marginTop: 9,
      color: "rgba(255,255,255,0.88)",
      fontSize: 15,
      lineHeight: 22,
    },
    headerButton: {
      alignSelf: "flex-start",
      minHeight: 48,
      marginTop: 22,
      paddingHorizontal: 17,
      borderRadius: 15,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: "#FFFFFF",
    },
    headerButtonText: {
      color: headerAccent,
      fontSize: 14,
      fontWeight: "900",
    },
    pageContent: { marginTop: -50 },
    matchedCard: {
      minHeight: 112,
      marginHorizontal: 18,
      padding: 15,
      borderRadius: 21,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      shadowColor: "#062D29",
      shadowOffset: { width: 0, height: 7 },
      shadowOpacity: resolvedTheme === "dark" ? 0.3 : 0.14,
      shadowRadius: 12,
      elevation: 6,
    },
    matchedIcon: {
      width: 52,
      height: 52,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primarySoft,
    },
    matchedCopy: { flex: 1, minWidth: 0, marginHorizontal: 12 },
    matchedTitle: {
      color: colors.text,
      fontSize: 16,
      lineHeight: 21,
      fontWeight: "900",
    },
    matchedText: {
      marginTop: 5,
      color: colors.secondaryText,
      fontSize: 12,
      lineHeight: 17,
    },
    compactButton: {
      minWidth: 57,
      minHeight: 44,
      paddingHorizontal: 13,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primarySoft,
    },
    compactButtonText: {
      color: colors.primary,
      fontSize: 13,
      fontWeight: "900",
    },
    fundingBanner: {
      overflow: "hidden",
      minHeight: 236,
      marginHorizontal: 18,
      marginTop: 22,
      borderRadius: 23,
      backgroundColor: colors.primary,
    },
    fundingBackground: { flex: 1, minHeight: 236, justifyContent: "center" },
    fundingImage: { opacity: 0.2 },
    fundingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor:
        resolvedTheme === "dark"
          ? "rgba(5, 35, 32, 0.91)"
          : "rgba(8, 76, 70, 0.88)",
    },
    fundingContent: { padding: 22 },
    fundingLabel: {
      alignSelf: "flex-start",
      minHeight: 30,
      paddingHorizontal: 10,
      borderRadius: 999,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: "rgba(255,255,255,0.16)",
    },
    fundingLabelText: {
      color: "#FFFFFF",
      fontSize: 10,
      fontWeight: "900",
      letterSpacing: 0.7,
    },
    fundingTitle: {
      maxWidth: 390,
      marginTop: 17,
      color: "#FFFFFF",
      fontSize: 23,
      lineHeight: 29,
      fontWeight: "900",
    },
    fundingText: {
      maxWidth: 430,
      marginTop: 10,
      color: "rgba(255,255,255,0.85)",
      fontSize: 13,
      lineHeight: 20,
    },
    fundingActionRow: {
      marginTop: 17,
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
    },
    fundingAction: { color: "#FFFFFF", fontSize: 14, fontWeight: "900" },
    section: { marginTop: 28 },
    sectionWithPadding: { marginTop: 28, paddingHorizontal: 18 },
    paddedHeader: { paddingHorizontal: 18 },
    helperText: {
      marginTop: 2,
      marginBottom: 3,
      color: colors.secondaryText,
      fontSize: 13,
      lineHeight: 19,
    },
    sliderContent: {
      paddingHorizontal: 18,
      paddingTop: 10,
      paddingBottom: 9,
    },
    horizontalGap: { width: HORIZONTAL_GAP },
    viewAllFooter: { marginLeft: HORIZONTAL_GAP },
    outlineButton: {
      minHeight: 50,
      marginTop: 14,
      borderRadius: 15,
      borderWidth: 1,
      borderColor: colors.primary,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: colors.primarySoft,
    },
    outlineButtonText: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: "900",
    },
    quickGrid: {
      marginTop: 10,
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },
    apsReminder: {
      marginTop: 18,
      padding: 20,
      borderRadius: 21,
      borderWidth: 1,
      borderColor: colors.primary,
      backgroundColor: colors.primarySoft,
    },
    apsBadge: {
      alignSelf: "flex-start",
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: colors.primary,
    },
    apsBadgeText: {
      color: "#FFFFFF",
      fontSize: 10,
      fontWeight: "900",
      letterSpacing: 0.5,
    },
    reminderTitle: {
      marginTop: 14,
      color: colors.text,
      fontSize: 18,
      lineHeight: 24,
      fontWeight: "900",
    },
    reminderText: {
      marginTop: 8,
      color: colors.secondaryText,
      fontSize: 13,
      lineHeight: 20,
    },
    reminderButton: {
      alignSelf: "flex-start",
      minHeight: 46,
      marginTop: 17,
      paddingHorizontal: 16,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary,
    },
    reminderButtonText: {
      color: "#FFFFFF",
      fontSize: 13,
      fontWeight: "900",
    },
    cardPressed: { opacity: 0.8, transform: [{ scale: 0.99 }] },
    primaryPressed: { opacity: 0.68 },
    lightPressed: { opacity: 0.78 },
  });
