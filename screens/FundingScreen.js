import React, { useMemo, useState, useEffect } from "react";
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { useProfile } from "../context/ProfileContext";
import { NSFAS, SAMPLE_BURSARY, getFundingCountdown } from "../data/funding";

const NSFAS_IMAGE = require("../assets/nsfas.jpg");
const FUNDING_OPTIONS = [
  {
    ...NSFAS,
    description: "Funding for eligible students at public universities and TVET colleges.",
  },
  SAMPLE_BURSARY,
];

export default function FundingScreen({ navigation }) {
  const { colors, resolvedTheme } = useProfile();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [now, setNow] = useState(() => new Date());
  const [searchQuery, setSearchQuery] = useState("");
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);
  const { days, isClosed } = getFundingCountdown(now);
  const filteredOptions = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    if (!query) return FUNDING_OPTIONS;
    return FUNDING_OPTIONS.filter((option) =>
      [option.name, option.fullName, option.description]
        .some((value) => value.toLocaleLowerCase().includes(query)),
    );
  }, [searchQuery]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar style={resolvedTheme === "dark" ? "light" : "dark"} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Go back" style={styles.back}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.eyebrow}>STUDENT FUNDING</Text>
        <Text style={styles.title}>Funding</Text>
        <Text style={styles.intro}>Explore support for your studies. Start with South Africa's national student funding scheme.</Text>

        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={21} color={colors.mutedText} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search bursaries"
            placeholderTextColor={colors.mutedText}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            accessibilityLabel="Search bursaries"
            style={styles.searchInput}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")} accessibilityRole="button" accessibilityLabel="Clear bursary search" hitSlop={8}>
              <Ionicons name="close-circle" size={21} color={colors.mutedText} />
            </Pressable>
          )}
        </View>

        <Text style={styles.sectionTitle}>Funding opportunities</Text>
        {filteredOptions.map((option) => (
        <Pressable
          key={option.id}
          onPress={() => navigation.navigate("FundingDetails", { fundingId: option.id })}
          accessibilityRole="button"
          accessibilityLabel={`View ${option.name} funding details`}
          style={({ pressed }) => [option.id === NSFAS.id ? styles.featureCard : styles.listCard, pressed && styles.pressed]}
        >
          {option.id === NSFAS.id ? (
          <ImageBackground source={NSFAS_IMAGE} resizeMode="cover" imageStyle={styles.image} style={styles.imageBackground}>
            <View style={styles.shade} />
            <View style={styles.cardContent}>
              <View style={styles.topRow}>
                <View style={styles.featureBadge}><Text style={styles.featureBadgeText}>FEATURED FUNDING</Text></View>
                <Ionicons name="arrow-forward-circle" size={30} color="#FFFFFF" />
              </View>
              <Text style={styles.cardTitle}>{option.name}</Text>
              <Text style={styles.cardSubtitle}>{option.fullName}</Text>
              <Text style={styles.cardDescription}>{option.description}</Text>
              <View style={styles.dateRow}>
                <Ionicons name="calendar-outline" size={17} color="#FFFFFF" />
                <Text style={styles.dateText}>{isClosed ? "Applications closed" : `${days} day${days === 1 ? "" : "s"} until closing`} · Closes {option.closes}</Text>
              </View>
            </View>
          </ImageBackground>
          ) : (
            <View style={styles.listCardContent}>
              <View style={styles.listIcon}><Ionicons name="wallet-outline" size={24} color={colors.primary} /></View>
              <View style={styles.listCopy}>
                <View style={styles.listTitleRow}>
                  <Text style={styles.listTitle}>{option.name}</Text>
                  {option.isPlaceholder && <View style={styles.exampleBadge}><Text style={styles.exampleBadgeText}>EXAMPLE</Text></View>}
                </View>
                <Text style={styles.listDescription}>{option.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.mutedText} />
            </View>
          )}
        </Pressable>
        ))}
        {filteredOptions.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={32} color={colors.primary} />
            <Text style={styles.emptyTitle}>No bursaries found</Text>
            <Text style={styles.emptyText}>Try another name or clear your search.</Text>
          </View>
        )}
        {!searchQuery.trim() && <View style={styles.comingSoon}>
          <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
          <View style={styles.comingSoonText}>
            <Text style={styles.comingSoonTitle}>More bursaries coming soon</Text>
            <Text style={styles.comingSoonBody}>New funding opportunities will appear here.</Text>
          </View>
        </View>}
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(c) {
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: c.background },
    content: { padding: 20, paddingBottom: 42 },
    back: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", gap: 8, marginBottom: 24 },
    backText: { color: c.text, fontSize: 16, fontWeight: "600" },
    eyebrow: { color: c.primary, fontSize: 12, fontWeight: "800", letterSpacing: 1.5 },
    title: { color: c.text, fontSize: 34, fontWeight: "800", marginTop: 6 },
    intro: { color: c.secondaryText, fontSize: 15, lineHeight: 23, marginTop: 9, marginBottom: 22 },
    searchBox: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: c.surface, borderColor: c.border, borderWidth: 1, borderRadius: 14, paddingHorizontal: 15, height: 54, marginBottom: 28 },
    searchInput: { flex: 1, color: c.text, fontSize: 15, height: "100%" },
    sectionTitle: { color: c.text, fontSize: 20, fontWeight: "700", marginBottom: 14 },
    featureCard: { borderRadius: 22, overflow: "hidden", elevation: 4, backgroundColor: c.primary },
    listCard: { backgroundColor: c.surface, borderColor: c.border, borderWidth: 1, borderRadius: 18, marginTop: 14 },
    listCardContent: { flexDirection: "row", alignItems: "center", gap: 12, padding: 17 },
    listIcon: { width: 46, height: 46, borderRadius: 13, backgroundColor: c.primarySoft, alignItems: "center", justifyContent: "center" },
    listCopy: { flex: 1 },
    listTitleRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8 },
    listTitle: { color: c.text, fontSize: 16, fontWeight: "700" },
    exampleBadge: { backgroundColor: c.primarySoft, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 4 },
    exampleBadgeText: { color: c.primary, fontSize: 9, fontWeight: "800", letterSpacing: 0.7 },
    listDescription: { color: c.secondaryText, fontSize: 13, lineHeight: 18, marginTop: 4 },
    pressed: { opacity: 0.88 },
    imageBackground: { minHeight: 290, justifyContent: "flex-end" },
    image: { borderRadius: 22 },
    shade: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0, 42, 42, 0.76)" },
    cardContent: { padding: 22 },
    topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 30 },
    featureBadge: { backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 11, paddingVertical: 7, borderRadius: 50 },
    featureBadgeText: { color: "#FFFFFF", fontSize: 11, fontWeight: "800", letterSpacing: 0.8 },
    cardTitle: { color: "#FFFFFF", fontSize: 36, fontWeight: "800" },
    cardSubtitle: { color: "#E3F1EF", fontSize: 15, fontWeight: "600", marginTop: 2 },
    cardDescription: { color: "#FFFFFF", fontSize: 14, lineHeight: 21, marginTop: 14 },
    dateRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 20 },
    dateText: { color: "#FFFFFF", flex: 1, fontSize: 13, fontWeight: "700" },
    comingSoon: { flexDirection: "row", gap: 13, alignItems: "center", backgroundColor: c.surface, borderColor: c.border, borderWidth: 1, borderRadius: 18, padding: 17, marginTop: 16 },
    comingSoonText: { flex: 1 },
    comingSoonTitle: { color: c.text, fontSize: 15, fontWeight: "700" },
    comingSoonBody: { color: c.secondaryText, fontSize: 13, marginTop: 4 },
    emptyState: { alignItems: "center", backgroundColor: c.surface, borderColor: c.border, borderWidth: 1, borderRadius: 18, padding: 28 },
    emptyTitle: { color: c.text, fontSize: 17, fontWeight: "700", marginTop: 10 },
    emptyText: { color: c.secondaryText, fontSize: 14, textAlign: "center", marginTop: 5 },
  });
}
