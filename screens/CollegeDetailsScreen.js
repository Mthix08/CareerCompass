import React, { useMemo, useState } from "react";
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
import { useProfile } from "../context/ProfileContext";
import { getCollegeImage, getCollegeLogo } from "../data/collegeImages";

const TABS = ["About", "Costs", "Apply"];

const formatMoney = (value) =>
  typeof value === "number" ? `R${value.toLocaleString("en-ZA")}` : value || "Not supplied";

function Row({ label, value, styles }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function InfoLine({ icon, text, onPress, styles, colors }) {
  if (!text) return null;
  const content = (
    <>
      <Ionicons name={icon} size={18} color={colors.primary} />
      <Text style={[styles.infoText, onPress && styles.link]}>{text}</Text>
    </>
  );
  return onPress ? (
    <Pressable onPress={onPress} accessibilityRole="link" style={styles.info}>{content}</Pressable>
  ) : (
    <View style={styles.info}>{content}</View>
  );
}

export default function CollegeDetailsScreen({ navigation, route }) {
  const { colors } = useProfile();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [activeTab, setActiveTab] = useState("About");
  const college = route.params?.college;

  if (!college) {
    return (
      <SafeAreaView style={styles.missing}>
        <Text style={styles.missingTitle}>College not found</Text>
        <Pressable onPress={() => navigation.goBack()} style={styles.button}>
          <Text style={styles.buttonText}>Go back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const photo = getCollegeImage(college);
  const logo = getCollegeLogo(college);
  const costs = college.costs || {};
  const phone = college.contactPhone || college.phone;
  const email = college.contactEmail || college.email;
  const applyUrl = college.applicationUrl || college.applyUrl;
  const opens = college.openingDate || college.opens;
  const closes = college.closingDate || college.closes;

  const applicationFee =
    college.applicationFee === 0
      ? college.applicationFeeLabel || "Free to apply"
      : formatMoney(college.applicationFee);

  const openLink = async (url, title) => {
    if (!url || !/^https?:\/\//i.test(url)) {
      Alert.alert(title, "This college does not have a valid link yet.");
      return;
    }
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert("Could not open link", "Please try again or visit the college website in your browser.");
    }
  };

  const renderAbout = () => (
    <>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>About {college.shortName || "this college"}</Text>
        <Text style={styles.body}>{college.description || "No description available yet."}</Text>
      </View>

      {Array.isArray(college.campuses) && college.campuses.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Campuses</Text>
          {college.campuses.map((campus) => (
            <InfoLine key={campus} icon="location-outline" text={campus} styles={styles} colors={colors} />
          ))}
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Contact</Text>
        <InfoLine icon="call-outline" text={phone} styles={styles} colors={colors} />
        <InfoLine icon="mail-outline" text={email} styles={styles} colors={colors} />
        <InfoLine
          icon="globe-outline"
          text={college.website}
          onPress={() => openLink(college.website, "Website")}
          styles={styles}
          colors={colors}
        />
        {!phone && !email && !college.website && (
          <Text style={styles.body}>Contact details have not been added yet.</Text>
        )}
      </View>
    </>
  );

  const renderCosts = () => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Costs and details</Text>
      <Text style={styles.sub}>
        {costs.year ? `Figures for ${costs.year}. ` : ""}Fees change, so always confirm the latest amounts.
      </Text>
      <Row label="Application fee" value={applicationFee} styles={styles} />
      <Row label="Registration fee" value={formatMoney(costs.registrationFee)} styles={styles} />
      <Row label="Tuition per year" value={formatMoney(costs.tuitionPerYear)} styles={styles} />
      <Row label="Accommodation per year" value={formatMoney(costs.accommodationPerYear)} styles={styles} />
      <Row label="NSFAS funding" value={costs.nsfasFunding || "Check with the college"} styles={styles} />
      {!!costs.sourceUrl && (
        <Pressable onPress={() => openLink(costs.sourceUrl, "Fee information")} accessibilityRole="link" style={styles.linkRow}>
          <Text style={styles.link}>Check official fee information</Text>
          <Ionicons name="open-outline" size={16} color={colors.primary} />
        </Pressable>
      )}
    </View>
  );

  const renderApply = () => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Applications</Text>
      <Row label="Status" value={college.applicationStatus || "Not supplied"} styles={styles} />
      <Row label="Opens" value={opens || "Not supplied"} styles={styles} />
      <Row label="Closes" value={closes || "Not supplied"} styles={styles} />
      <Text style={styles.body}>
        {college.applicationInstructions || "Check the official college website for how to apply."}
      </Text>
      <Pressable
        onPress={() => openLink(applyUrl || college.website, "Application link unavailable")}
        accessibilityRole="link"
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Text style={styles.buttonText}>Apply on college website</Text>
        <Ionicons name="open-outline" size={19} color="#FFFFFF" />
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.hero}>
          {photo ? (
            <Image source={photo} style={styles.heroImage} resizeMode="cover" />
          ) : (
            <View style={styles.heroPlaceholder}>
              <Ionicons name="school-outline" size={68} color={colors.primary} />
              <Text style={styles.heroPlaceholderText}>Campus image coming soon</Text>
            </View>
          )}
          <View style={styles.heroShade} pointerEvents="none" />
          <Pressable
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={8}
            style={({ pressed }) => [styles.heroButton, pressed && styles.pressed]}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </Pressable>
        </View>

        <View style={styles.content}>
          <View style={styles.logoWrap}>
            {logo ? (
              <Image source={logo} style={styles.logo} resizeMode="contain" />
            ) : (
              <Text style={styles.logoText}>
                {(college.shortName || college.name || "?").slice(0, 3).toUpperCase()}
              </Text>
            )}
          </View>

          <Text style={styles.name}>{college.name}</Text>

          <View style={styles.badgeRow}>
            {!!college.province && (
              <View style={[styles.badge, styles.badgeGreen]}>
                <Ionicons name="location-outline" size={15} color={colors.primary} />
                <Text style={styles.badgeGreenText}>{college.province}</Text>
              </View>
            )}
            {!!college.type && (
              <View style={[styles.badge, styles.badgeGrey]}>
                <Text style={styles.badgeGreyText}>{college.type}</Text>
              </View>
            )}
          </View>

          <View style={styles.tabs} accessibilityRole="tablist">
            {TABS.map((tab) => {
              const selected = activeTab === tab;
              return (
                <Pressable
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  accessibilityRole="tab"
                  accessibilityState={{ selected }}
                  style={[styles.tab, selected && styles.tabSelected]}
                >
                  <Text style={[styles.tabText, selected && styles.tabTextSelected]}>{tab}</Text>
                </Pressable>
              );
            })}
          </View>

          {activeTab === "About" && renderAbout()}
          {activeTab === "Costs" && renderCosts()}
          {activeTab === "Apply" && renderApply()}

          <Text style={styles.disclaimer}>
            Confirm fees, dates and requirements on the college's official website before applying.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(c) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    scrollContent: { paddingBottom: 46 },
    pressed: { opacity: 0.7 },
    hero: { width: "100%", aspectRatio: 1.35, maxHeight: 330, backgroundColor: c.primarySoft },
    heroImage: { width: "100%", height: "100%" },
    heroPlaceholder: { width: "100%", height: "100%", alignItems: "center", justifyContent: "center", gap: 9 },
    heroPlaceholderText: { color: c.primary, fontSize: 14, fontWeight: "600" },
    heroShade: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(5, 8, 13, 0.12)" },
    heroButton: {
      position: "absolute",
      top: 16,
      left: 18,
      width: 48,
      height: 48,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(5, 8, 13, 0.78)",
    },
    content: { paddingHorizontal: 20 },
    logoWrap: {
      width: 76,
      height: 76,
      marginTop: -38,
      borderRadius: 21,
      borderWidth: 4,
      borderColor: c.primary,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#FFFFFF",
    },
    logo: { width: 60, height: 60 },
    logoText: { color: c.primary, fontSize: 22, fontWeight: "900" },
    name: { marginTop: 16, color: c.text, fontSize: 27, lineHeight: 34, fontWeight: "900" },
    badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 13 },
    badge: { minHeight: 34, paddingHorizontal: 12, borderRadius: 999, flexDirection: "row", alignItems: "center", gap: 5 },
    badgeGreen: { backgroundColor: c.primarySoft },
    badgeGreenText: { color: c.primary, fontSize: 12, fontWeight: "800" },
    badgeGrey: { backgroundColor: c.input },
    badgeGreyText: { color: c.secondaryText, fontSize: 12, fontWeight: "800" },
    tabs: {
      marginTop: 26,
      flexDirection: "row",
      gap: 6,
      padding: 5,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.input,
    },
    tab: { flex: 1, minHeight: 46, borderRadius: 12, alignItems: "center", justifyContent: "center" },
    tabSelected: { backgroundColor: c.primary },
    tabText: { color: c.secondaryText, fontSize: 14, fontWeight: "700" },
    tabTextSelected: { color: "#FFFFFF" },
    card: { marginTop: 16, padding: 18, borderRadius: 18, borderWidth: 1, borderColor: c.border, backgroundColor: c.surface },
    cardTitle: { color: c.text, fontSize: 18, fontWeight: "900" },
    sub: { marginTop: 5, marginBottom: 6, color: c.secondaryText, fontSize: 12, lineHeight: 18 },
    body: { marginTop: 9, color: c.secondaryText, fontSize: 13, lineHeight: 21 },
    row: {
      paddingVertical: 11,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 12,
    },
    rowLabel: { flex: 0.5, color: c.secondaryText, fontSize: 13 },
    rowValue: { flex: 0.5, color: c.text, fontSize: 13, fontWeight: "800", textAlign: "right" },
    info: { marginTop: 12, flexDirection: "row", alignItems: "flex-start", gap: 9 },
    infoText: { flex: 1, color: c.secondaryText, fontSize: 13, lineHeight: 19 },
    linkRow: { marginTop: 14, flexDirection: "row", alignItems: "center", gap: 6 },
    link: { color: c.primary, fontSize: 13, fontWeight: "800" },
    button: {
      minHeight: 52,
      marginTop: 16,
      paddingHorizontal: 18,
      borderRadius: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: c.primary,
    },
    buttonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
    disclaimer: { marginTop: 20, color: c.mutedText, fontSize: 12, lineHeight: 18, textAlign: "center" },
    missing: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: c.background },
    missingTitle: { color: c.text, fontSize: 20, fontWeight: "900" },
  });
}