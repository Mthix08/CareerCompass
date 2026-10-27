import React, { useMemo } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  Alert,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  
  View,
} from "react-native";
import Text from '../components/TranslatedText';
import { SafeAreaView } from "react-native-safe-area-context";
import { useProfile } from "../context/ProfileContext";
import { getCollegeImage, getCollegeLogo } from "../data/collegeImages";

function toDisplayStrings(value) {
  const items = Array.isArray(value) ? value : typeof value === "string" ? [value] : [];
  return items
    .map((item) => {
      if (typeof item === "string") return item.trim();
      if (!item || typeof item !== "object") return "";
      const name = item.name || item.campusName || item.title || item.address || "";
      return name && item.location ? `${name} · ${item.location}` : name;
    })
    .filter(Boolean);
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
  const phone = college.contactPhone || college.phone;
  const email = college.contactEmail || college.email;
  const overview = college.description || college.overview || college.about;
  const campuses = toDisplayStrings(college.campuses);
  const programmes = college.programmes || college.programs || college.qualifications || college.courses;
  const programmeList = toDisplayStrings(programmes);
  const studyAreas = toDisplayStrings(college.studyAreas || college.fieldsOfStudy);

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

  const aboutText = overview || (
    college.province
      ? `${college.name} is a public TVET college in ${college.province}. This directory entry currently includes basic contact information; check the official college website for its current programmes, campuses, fees, and application dates.`
      : "This directory entry currently includes basic contact information. Check the official college website for current programmes, campuses, fees, and application dates."
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

          <View style={styles.card}>
            <Text style={styles.cardTitle}>About {college.shortName || "this college"}</Text>
            <Text style={styles.body}>{aboutText}</Text>
          </View>

          {programmeList.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Programmes and qualifications</Text>
              {programmeList.map((programme) => (
                <InfoLine key={programme} icon="school-outline" text={programme} styles={styles} colors={colors} />
              ))}
            </View>
          )}

          {studyAreas.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Study areas</Text>
              {studyAreas.map((area) => (
                <InfoLine key={area} icon="book-outline" text={area} styles={styles} colors={colors} />
              ))}
            </View>
          )}

          {campuses.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Campuses</Text>
              {campuses.map((campus) => (
                <InfoLine
                  key={campus}
                  icon="location-outline"
                  text={campus}
                  styles={styles}
                  colors={colors}
                />
              ))}
            </View>
          )}

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Contact and official information</Text>
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
            {!!college.lastVerified && (
              <Text style={styles.sourceNote}>Information last checked {college.lastVerified}.</Text>
            )}
          </View>

          <Text style={styles.disclaimer}>
            Confirm fees, dates and requirements on the college&apos;s official website before applying.
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
      backgroundColor: c.surface,
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
    card: { marginTop: 16, padding: 18, borderRadius: 18, borderWidth: 1, borderColor: c.border, backgroundColor: c.surface },
    cardTitle: { color: c.text, fontSize: 18, fontWeight: "900" },
    body: { marginTop: 9, color: c.secondaryText, fontSize: 13, lineHeight: 21 },
    info: { marginTop: 12, flexDirection: "row", alignItems: "flex-start", gap: 9 },
    infoText: { flex: 1, color: c.secondaryText, fontSize: 13, lineHeight: 19 },
    link: { color: c.primary, fontSize: 13, fontWeight: "800" },
    sourceNote: { marginTop: 12, color: c.mutedText, fontSize: 11, lineHeight: 16 },
    disclaimer: { marginTop: 20, color: c.mutedText, fontSize: 12, lineHeight: 18, textAlign: "center" },
    missing: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: c.background },
    missingTitle: { color: c.text, fontSize: 20, fontWeight: "900" },
    button: { minHeight: 52, marginTop: 16, paddingHorizontal: 18, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: c.primary },
    buttonText: { color: c.onPrimary, fontSize: 15, fontWeight: "800" },
  });
}
