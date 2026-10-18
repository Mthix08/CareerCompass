import React, { useMemo, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useProfile } from "../context/ProfileContext";

const { width: screenWidth } = Dimensions.get("window");

const slides = [
  {
    eyebrow: "YOUR NEXT CHAPTER STARTS HERE",
    title: "Find Your\nFuture",
    description:
      "Discover university qualifications that match your interests, strengths, and goals.",
    icon: "compass-outline",
    accent: "#DDF4EF",
    symbol: "sparkles-outline",
  },
  {
    eyebrow: "EXPLORE YOUR OPTIONS",
    title: "Find Your\nUniversity",
    description:
      "Explore South African universities and compare the admission requirements that matter to you.",
    icon: "school-outline",
    accent: "#E8EAFE",
    symbol: "location-outline",
  },
  {
    eyebrow: "MAKE YOUR MARKS COUNT",
    title: "Calculate\nYour APS",
    description:
      "Work out your Admission Point Score and find qualifications that could be within reach.",
    icon: "calculator-outline",
    accent: "#FFF1D9",
    symbol: "checkmark-circle-outline",
  },
  {
    eyebrow: "TAKE THE NEXT STEP",
    title: "Fund Your\nEducation",
    description:
      "Explore bursaries and funding opportunities to help make your study plans possible.",
    icon: "wallet-outline",
    accent: "#FCE6E8",
    symbol: "heart-outline",
  },
];

export default function OnboardingScreen({ navigation }) {
  const { publicColors: colors } = useProfile();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const listRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const isLastSlide = activeIndex === slides.length - 1;

  const goToSlide = (index) => {
    const safeIndex = Math.max(0, Math.min(index, slides.length - 1));
    listRef.current?.scrollToIndex({ index: safeIndex, animated: true });
    setActiveIndex(safeIndex);
  };

    const finishOnboarding = async () => {
    try {
      await AsyncStorage.setItem("@careercompass:hasSeenOnboarding", "true");
    } catch (_error) {
      // non-fatal: onboarding will just show again next launch
    }
    navigation.replace("Login");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={styles.container}>
        <View style={styles.topBar}>
          <View style={styles.brand}>
            <View style={styles.brandMark}>
              <Ionicons name="navigate" size={15} color={colors.onPrimary} />
            </View>
            <Text style={styles.brandName}>CareerCompass</Text>
          </View>
          {!isLastSlide ? (
            <TouchableOpacity
              onPress={finishOnboarding}
              accessibilityRole="button"
              accessibilityLabel="Skip introduction"
              hitSlop={12}
            >
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.skipPlaceholder} />
          )}
        </View>

        <FlatList
          ref={listRef}
          data={slides}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.title}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(
              event.nativeEvent.contentOffset.x / screenWidth,
            );
            setActiveIndex(index);
          }}
          getItemLayout={(_, index) => ({
            length: screenWidth,
            offset: screenWidth * index,
            index,
          })}
          renderItem={({ item, index }) => (
            <View style={styles.slide}>
              <View style={styles.artworkArea}>
                <View style={[styles.artHalo, { backgroundColor: item.accent }]} />
                <View style={styles.artCard}>
                  <View style={styles.artTopRow}>
                    <View style={styles.artDot} />
                    <View style={styles.artLine} />
                    <Ionicons name="ellipsis-horizontal" size={20} color="#AAB8B4" />
                  </View>
                  <View style={[styles.artIconWrap, { backgroundColor: item.accent }]}>
                    <Ionicons name={item.icon} size={66} color="#11796F" />
                  </View>
                  <View style={styles.artBottomRow}>
                    <View style={styles.artPill} />
                    <View style={styles.artPillShort} />
                  </View>
                  <View style={styles.artCardShadow} />
                </View>
                <View style={[styles.floatingBadge, styles.badgeOne]}>
                  <Ionicons name={item.symbol} size={23} color="#11796F" />
                </View>
                <View style={[styles.floatingBadge, styles.badgeTwo]}>
                  <Ionicons
                    name={index === 1 ? "book-outline" : "checkmark"}
                    size={20}
                    color="#C28B32"
                  />
                </View>
                <View style={styles.artDecorationOne} />
                <View style={styles.artDecorationTwo} />
              </View>

              <View style={styles.copyArea}>
                <Text style={styles.eyebrow}>{item.eyebrow}</Text>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description}>{item.description}</Text>
              </View>
            </View>
          )}
        />

        <View style={styles.footer}>
          <View style={styles.pagination} accessibilityLabel={`Slide ${activeIndex + 1} of ${slides.length}`}>
            {slides.map((slide, index) => (
              <TouchableOpacity
                key={slide.title}
                onPress={() => goToSlide(index)}
                accessibilityRole="button"
                accessibilityLabel={`Go to slide ${index + 1}`}
                style={[styles.dot, index === activeIndex && styles.activeDot]}
              />
            ))}
          </View>
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.86}
            onPress={() => (isLastSlide ? finishOnboarding() : goToSlide(activeIndex + 1))}
            accessibilityRole="button"
          >
            <Text style={styles.primaryButtonText}>
              {isLastSlide ? "Get Started" : "Next"}
            </Text>
            <Ionicons
              name={isLastSlide ? "arrow-forward" : "arrow-forward"}
              size={19}
              color={colors.onPrimary}
            />
          </TouchableOpacity>
          <Text style={styles.footerNote}>Your future, one step at a time.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  topBar: {
    height: 62,
    paddingHorizontal: 25,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: { flexDirection: "row", alignItems: "center", gap: 9 },
  brandMark: {
    height: 29,
    width: 29,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "-8deg" }],
  },
  brandName: { color: colors.text, fontSize: 14, fontWeight: "700", letterSpacing: 0.1 },
  skipText: { color: colors.secondaryText, fontSize: 15, fontWeight: "600", padding: 6 },
  skipPlaceholder: { width: 44 },
  slide: { width: screenWidth, flex: 1, paddingHorizontal: 26 },
  artworkArea: { flex: 1.18, minHeight: 250, maxHeight: 390, alignItems: "center", justifyContent: "center" },
  artHalo: {
    position: "absolute",
    width: screenWidth * 0.66,
    height: screenWidth * 0.66,
    maxWidth: 285,
    maxHeight: 285,
    borderRadius: 200,
    opacity: 0.72,
  },
  artCard: {
    width: screenWidth * 0.59,
    maxWidth: 250,
    height: screenWidth * 0.68,
    maxHeight: 290,
    minHeight: 220,
    borderRadius: 28,
    backgroundColor: colors.surface,
    padding: 20,
    justifyContent: "space-between",
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.11,
    shadowRadius: 25,
    elevation: 7,
  },
  artTopRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  artDot: { height: 9, width: 9, borderRadius: 5, backgroundColor: "#E3B45E" },
  artLine: { height: 6, width: 55, borderRadius: 4, backgroundColor: colors.border, flex: 1 },
  artIconWrap: { width: 116, height: 116, borderRadius: 34, alignSelf: "center", alignItems: "center", justifyContent: "center" },
  artBottomRow: { flexDirection: "row", gap: 8, justifyContent: "center" },
  artPill: { height: 8, width: 68, borderRadius: 5, backgroundColor: colors.primarySoft },
  artPillShort: { height: 8, width: 38, borderRadius: 5, backgroundColor: colors.elevatedSurface },
  artCardShadow: { position: "absolute", bottom: -10, left: 25, right: 25, height: 16, borderRadius: 20, backgroundColor: colors.border, zIndex: -1 },
  floatingBadge: { position: "absolute", width: 52, height: 52, borderRadius: 18, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center", shadowColor: colors.text, shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.12, shadowRadius: 10, elevation: 4 },
  badgeOne: { top: "21%", right: "13%" },
  badgeTwo: { bottom: "18%", left: "12%" },
  artDecorationOne: { position: "absolute", height: 13, width: 13, borderRadius: 5, borderWidth: 3, borderColor: "#E0B35F", top: "24%", left: "16%", transform: [{ rotate: "20deg" }] },
  artDecorationTwo: { position: "absolute", height: 9, width: 9, borderRadius: 5, backgroundColor: "#72B9A9", bottom: "24%", right: "17%" },
  copyArea: { flex: 0.82, minHeight: 190, alignItems: "center", paddingTop: 12 },
  eyebrow: { color: colors.primary, fontSize: 10, fontWeight: "800", letterSpacing: 1.8, textAlign: "center", marginBottom: 13 },
  title: { color: colors.text, fontSize: 38, fontWeight: "800", lineHeight: 43, textAlign: "center" },
  description: { color: colors.secondaryText, fontSize: 15, lineHeight: 23, textAlign: "center", marginTop: 13, maxWidth: 330, paddingHorizontal: 8 },
  footer: { paddingHorizontal: 27, paddingTop: 7, paddingBottom: 18, alignItems: "center" },
  pagination: { height: 29, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 13 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.border },
  activeDot: { width: 23, backgroundColor: colors.primary },
  primaryButton: { height: 58, width: "100%", borderRadius: 17, backgroundColor: colors.primary, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12, shadowColor: colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 11, elevation: 4 },
  primaryButtonText: { color: colors.onPrimary, fontSize: 16, fontWeight: "700" },
  footerNote: { color: colors.mutedText, fontSize: 11, marginTop: 13 },
  });
}
