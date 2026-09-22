import React, { useEffect, useMemo, useState } from "react";
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { useProfile } from "../context/ProfileContext";
import { NSFAS, SAMPLE_BURSARY, getFundingCountdown } from "../data/funding";

const SECTIONS = [
  { title: "Who qualifies?", icon: "people-outline", items: [
    "South African citizens and eligible permanent residents studying an approved qualification at a public university or TVET college.",
    "Combined annual household income of R350,000 or less, or R600,000 or less for applicants with disabilities.",
    "Verified SASSA grant recipients meet the financial eligibility test, subject to the remaining requirements.",
  ] },
  { title: "Fields and courses funded", icon: "school-outline", items: [
    "Approved undergraduate qualifications across fields of study at public universities and TVET colleges.",
    "Funding depends on the specific qualification and institution being approved. Check your course before applying.",
  ] },
  { title: "What does it fund?", icon: "wallet-outline", items: [
    "Registration and tuition fees for an approved programme.",
    "Learning materials, plus eligible living, personal care, and accommodation or transport allowances.",
    "Approved disability support may be available after assessment. Allowances depend on your study and living arrangements.",
  ] },
  { title: "Application requirements", icon: "document-text-outline", items: [
    "Create or sign in to myNSFAS with your South African ID number, cellphone number, and email address.",
    "Complete your personal and household details, consent to income verification, and upload requested supporting documents.",
    "Submit before the closing date and keep your reference number to track your application.",
  ] },
  { title: "Marks needed to keep funding", icon: "stats-chart-outline", items: [
    "The published 2026 NSFAS bursary policy requires university students who are not first-time entrants to pass at least 50% of registered modules for the next year of funding.",
    "TVET students who are not first-time entrants must pass at least 70% of their registered modules or courses. TVET progression rules also apply.",
    "These are study progress rules, not a minimum school mark or APS for a new application. Confirm the policy for your funding year.",
  ] },
];

const SAMPLE_SECTIONS = [
  { title: "Who can apply?", icon: "people-outline", items: [
    "South African students planning to study full-time at a recognised university or TVET college.",
    "Applicants should demonstrate financial need and involvement in their school or community.",
  ] },
  { title: "Fields of study", icon: "school-outline", items: [
    "Example priority fields include education, engineering, information technology, and health sciences.",
  ] },
  { title: "What could it cover?", icon: "wallet-outline", items: [
    "Tuition fees, prescribed learning materials, and a possible living allowance.",
    "Final benefits would need to be confirmed with the real bursary provider.",
  ] },
  { title: "Documents to prepare", icon: "document-text-outline", items: [
    "A certified ID copy, latest academic results, proof of household income, and proof of admission.",
    "A short motivation letter explaining your study plans and career goals.",
  ] },
];

export default function FundingDetailsScreen({ navigation, route }) {
  const { colors, resolvedTheme } = useProfile();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);
  const { days, isClosed } = getFundingCountdown(now);
  const fundingId = route.params?.fundingId;
  const isNsfas = fundingId === NSFAS.id;
  const isSample = fundingId === SAMPLE_BURSARY.id;
  const validFunding = isNsfas || isSample;
  const funding = isSample ? SAMPLE_BURSARY : NSFAS;
  const sections = isSample ? SAMPLE_SECTIONS : SECTIONS;

  const openLink = async (url) => {
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert("Could not open website", "Please try again later or visit nsfas.org.za in your browser.");
    }
  };

  if (!validFunding) return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <Text style={styles.title}>Funding option not found</Text>
        <Pressable onPress={() => navigation.goBack()} accessibilityRole="button"><Text style={styles.link}>Go back</Text></Pressable>
      </View>
    </SafeAreaView>
  );

  if (isSample) return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar style={resolvedTheme === "dark" ? "light" : "dark"} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Go back" style={styles.back}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
          <Text style={styles.backText}>Funding</Text>
        </Pressable>
        <View style={styles.sampleNotice}>
          <Ionicons name="information-circle-outline" size={21} color={colors.primary} />
          <Text style={styles.sampleNoticeText}>Example bursary — placeholder content demonstrating the expected layout.</Text>
        </View>
        <View style={styles.hero}>
          <View style={styles.heroIcon}><Ionicons name="ribbon-outline" size={28} color="#FFFFFF" /></View>
          <Text style={styles.heroEyebrow}>BURSARY OPPORTUNITY</Text>
          <Text style={styles.sampleHeroTitle}>{funding.name}</Text>
          <Text style={styles.heroSubtitle}>{funding.provider}</Text>
          <Text style={styles.heroDescription}>{funding.description}</Text>
        </View>
        <View style={styles.deadlineCard}>
          <View style={styles.deadlineHeader}>
            <Ionicons name="calendar-outline" size={22} color={colors.primary} />
            <Text style={styles.deadlineTitle}>{funding.cycle}</Text>
          </View>
          <View style={styles.dates}>
            <View><Text style={styles.dateLabel}>OPENS</Text><Text style={styles.dateValue}>{funding.opens}</Text></View>
            <View><Text style={styles.dateLabel}>CLOSES</Text><Text style={styles.dateValue}>{funding.closes}</Text></View>
          </View>
        </View>
        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name={section.icon} size={21} color={colors.primary} />
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            {section.items.map((item) => (
              <View key={item} style={styles.bulletRow}><View style={styles.bullet} /><Text style={styles.bulletText}>{item}</Text></View>
            ))}
          </View>
        ))}
        <View style={styles.disabledButton}><Text style={styles.disabledButtonText}>Application link not available</Text></View>
        <Text style={styles.footnote}>This bursary is fictional. Replace all example content with verified details and an official application link before publishing it as a real opportunity.</Text>
      </ScrollView>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar style={resolvedTheme === "dark" ? "light" : "dark"} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Go back" style={styles.back}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
          <Text style={styles.backText}>Funding</Text>
        </Pressable>

        <View style={styles.hero}>
          <View style={styles.heroIcon}><Ionicons name="wallet-outline" size={28} color="#FFFFFF" /></View>
          <Text style={styles.heroEyebrow}>NATIONAL STUDENT FUNDING</Text>
          <Text style={styles.heroTitle}>NSFAS</Text>
          <Text style={styles.heroSubtitle}>{NSFAS.fullName}</Text>
          <Text style={styles.heroDescription}>A national funding scheme that helps eligible students study approved qualifications at South African public universities and TVET colleges.</Text>
        </View>

        <View style={styles.deadlineCard}>
          <View style={styles.deadlineHeader}>
            <Ionicons name="time-outline" size={22} color={colors.primary} />
            <Text style={styles.deadlineTitle}>{NSFAS.cycle} applications</Text>
          </View>
          <View style={styles.dates}>
            <View><Text style={styles.dateLabel}>OPENS</Text><Text style={styles.dateValue}>{NSFAS.opens}</Text></View>
            <View><Text style={styles.dateLabel}>CLOSES</Text><Text style={styles.dateValue}>{NSFAS.closes}</Text></View>
          </View>
          <View style={styles.countdown}><Text style={styles.countdownText}>{isClosed ? "Applications closed" : `${days} day${days === 1 ? "" : "s"} until applications close`}</Text></View>
        </View>

        {SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name={section.icon} size={21} color={colors.primary} />
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            {section.items.map((item) => (
              <View key={item} style={styles.bulletRow}>
                <View style={styles.bullet} />
                <Text style={styles.bulletText}>{item}</Text>
              </View>
            ))}
          </View>
        ))}

        <Pressable onPress={() => openLink(NSFAS.applyUrl)} accessibilityRole="link" style={({ pressed }) => [styles.applyButton, pressed && styles.pressed]}>
          <Text style={styles.applyText}>Open myNSFAS</Text>
          <Ionicons name="open-outline" size={19} color="#FFFFFF" />
        </Pressable>
        <Pressable onPress={() => openLink(NSFAS.infoUrl)} accessibilityRole="link" style={styles.sourceButton}>
          <Text style={styles.link}>Read official NSFAS application information</Text>
          <Ionicons name="open-outline" size={16} color={colors.primary} />
        </Pressable>
        <Pressable onPress={() => openLink(NSFAS.policyUrl)} accessibilityRole="link" style={styles.sourceButton}>
          <Text style={styles.link}>Read published bursary policy</Text>
          <Ionicons name="open-outline" size={16} color={colors.primary} />
        </Pressable>
        <Text style={styles.footnote}>Dates are for the 2027 application cycle. Study progress figures are from the published 2026 bursary policy; check NSFAS for current rules before applying.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(c) {
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: c.background },
    content: { padding: 20, paddingBottom: 48 },
    back: { flexDirection: "row", alignItems: "center", gap: 9, alignSelf: "flex-start", marginBottom: 18 },
    backText: { color: c.text, fontSize: 16, fontWeight: "600" },
    hero: { backgroundColor: "#0B665E", borderRadius: 22, padding: 24 },
    heroIcon: { width: 52, height: 52, borderRadius: 15, backgroundColor: "rgba(255,255,255,0.16)", alignItems: "center", justifyContent: "center", marginBottom: 22 },
    heroEyebrow: { color: "#CFEAE5", fontSize: 11, fontWeight: "800", letterSpacing: 1.2 },
    heroTitle: { color: "#FFFFFF", fontSize: 37, fontWeight: "800", marginTop: 5 },
    sampleHeroTitle: { color: "#FFFFFF", fontSize: 30, lineHeight: 36, fontWeight: "800", marginTop: 5 },
    heroSubtitle: { color: "#E0F0ED", fontSize: 15, fontWeight: "600", marginTop: 2 },
    heroDescription: { color: "#FFFFFF", fontSize: 14, lineHeight: 22, marginTop: 18 },
    deadlineCard: { backgroundColor: c.surface, borderColor: c.border, borderWidth: 1, borderRadius: 18, padding: 18, marginTop: 17 },
    deadlineHeader: { flexDirection: "row", alignItems: "center", gap: 9 },
    deadlineTitle: { color: c.text, fontSize: 17, fontWeight: "700" },
    dates: { flexDirection: "row", justifyContent: "space-between", gap: 8, marginTop: 22 },
    dateLabel: { color: c.mutedText, fontSize: 11, fontWeight: "800", letterSpacing: 1 },
    dateValue: { color: c.text, fontSize: 14, fontWeight: "700", marginTop: 5 },
    countdown: { alignSelf: "flex-start", backgroundColor: c.primarySoft, borderRadius: 30, paddingHorizontal: 13, paddingVertical: 9, marginTop: 20 },
    countdownText: { color: c.primary, fontSize: 13, fontWeight: "800" },
    section: { backgroundColor: c.surface, borderColor: c.border, borderWidth: 1, borderRadius: 18, padding: 18, marginTop: 16 },
    sectionHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
    sectionTitle: { color: c.text, fontSize: 18, fontWeight: "700", flex: 1 },
    bulletRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginTop: 10 },
    bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: c.primary, marginTop: 8 },
    bulletText: { color: c.secondaryText, fontSize: 14, lineHeight: 21, flex: 1 },
    applyButton: { backgroundColor: c.primary, borderRadius: 14, padding: 16, marginTop: 25, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
    applyText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
    pressed: { opacity: 0.8 },
    sourceButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, marginTop: 19 },
    link: { color: c.primary, fontSize: 14, fontWeight: "700" },
    footnote: { color: c.mutedText, fontSize: 12, lineHeight: 18, marginTop: 22 },
    title: { color: c.text, fontSize: 24, fontWeight: "800" },
    sampleNotice: { flexDirection: "row", alignItems: "flex-start", gap: 9, backgroundColor: c.primarySoft, borderRadius: 14, padding: 14, marginBottom: 16 },
    sampleNoticeText: { color: c.primary, fontSize: 13, lineHeight: 19, fontWeight: "700", flex: 1 },
    disabledButton: { backgroundColor: c.border, borderRadius: 14, padding: 16, marginTop: 25, alignItems: "center" },
    disabledButtonText: { color: c.mutedText, fontSize: 15, fontWeight: "700" },
  });
}
