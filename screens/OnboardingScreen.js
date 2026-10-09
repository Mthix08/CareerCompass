import React, { useRef, useState } from "react";
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
  const listRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const isLastSlide = activeIndex === slides.length - 1;

  const goToSlide = (index) => {
    const safeIndex = Math.max(0, Math.min(index, slides.length - 1));
    listRef.current?.scrollToIndex({ index: safeIndex, animated: true });
    setActiveIndex(safeIndex);
  };

  const finishOnboarding = () => navigation.replace("Login");

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF9F6" />
      <View style={styles.container}>
        <View style={styles.topBar}>
          <View style={styles.brand}>
            <View style={styles.brandMark}>
              <Ionicons name="navigate" size={15} color="#FFFFFF" />
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
              color="#FFFFFF"
            />
          </TouchableOpacity>
          <Text style={styles.footerNote}>Your future, one step at a time.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FAF9F6" },
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
    backgroundColor: "#11796F",
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "-8deg" }],
  },
  brandName: { color: "#26312F", fontSize: 14, fontWeight: "700", letterSpacing: 0.1 },
  skipText: { color: "#777F7D", fontSize: 15, fontWeight: "600", padding: 6 },
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
    backgroundColor: "#FFFFFF",
    padding: 20,
    justifyContent: "space-between",
    shadowColor: "#183C36",
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.11,
    shadowRadius: 25,
    elevation: 7,
  },
  artTopRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  artDot: { height: 9, width: 9, borderRadius: 5, backgroundColor: "#E3B45E" },
  artLine: { height: 6, width: 55, borderRadius: 4, backgroundColor: "#E9EEEB", flex: 1 },
  artIconWrap: { width: 116, height: 116, borderRadius: 34, alignSelf: "center", alignItems: "center", justifyContent: "center" },
  artBottomRow: { flexDirection: "row", gap: 8, justifyContent: "center" },
  artPill: { height: 8, width: 68, borderRadius: 5, backgroundColor: "#D8E8E3" },
  artPillShort: { height: 8, width: 38, borderRadius: 5, backgroundColor: "#EEF1EF" },
  artCardShadow: { position: "absolute", bottom: -10, left: 25, right: 25, height: 16, borderRadius: 20, backgroundColor: "#DFE7E2", zIndex: -1 },
  floatingBadge: { position: "absolute", width: 52, height: 52, borderRadius: 18, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center", shadowColor: "#183C36", shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.12, shadowRadius: 10, elevation: 4 },
  badgeOne: { top: "21%", right: "13%" },
  badgeTwo: { bottom: "18%", left: "12%" },
  artDecorationOne: { position: "absolute", height: 13, width: 13, borderRadius: 5, borderWidth: 3, borderColor: "#E0B35F", top: "24%", left: "16%", transform: [{ rotate: "20deg" }] },
  artDecorationTwo: { position: "absolute", height: 9, width: 9, borderRadius: 5, backgroundColor: "#72B9A9", bottom: "24%", right: "17%" },
  copyArea: { flex: 0.82, minHeight: 190, alignItems: "center", paddingTop: 12 },
  eyebrow: { color: "#11796F", fontSize: 10, fontWeight: "800", letterSpacing: 1.8, textAlign: "center", marginBottom: 13 },
  title: { color: "#202B29", fontSize: 38, fontWeight: "800", letterSpacing: -1.2, lineHeight: 43, textAlign: "center" },
  description: { color: "#737E7B", fontSize: 15, lineHeight: 23, textAlign: "center", marginTop: 13, maxWidth: 330, paddingHorizontal: 8 },
  footer: { paddingHorizontal: 27, paddingTop: 7, paddingBottom: 18, alignItems: "center" },
  pagination: { height: 29, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 13 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#D7DEDA" },
  activeDot: { width: 23, backgroundColor: "#11796F" },
  primaryButton: { height: 58, width: "100%", borderRadius: 17, backgroundColor: "#11796F", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12, shadowColor: "#11796F", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 11, elevation: 4 },
  primaryButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  footerNote: { color: "#9BA39F", fontSize: 11, marginTop: 13, letterSpacing: 0.2 },
});
