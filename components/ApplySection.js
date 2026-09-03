import React from "react";
import { Alert, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getUniversityTheme } from "../data/universityTheme";

function DetailRow({ label, value, accent = false }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, accent && styles.accentValue]}>{value}</Text>
    </View>
  );
}

export default function ApplySection({ university }) {
  const universityTheme = getUniversityTheme(university);
  const applicationFee =
    university.applicationFee === 0
      ? university.applicationFeeLabel || "Free to apply"
      : `R${university.applicationFee}`;

  const openApplicationWebsite = async () => {
    const url = university.applicationUrl;
    if (!url || !/^https?:\/\//i.test(url)) {
      Alert.alert(
        "Application link unavailable",
        "This university does not have a valid application website yet.",
      );
      return;
    }

    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        Alert.alert(
          "Cannot open link",
          "Your device cannot open this application website.",
        );
        return;
      }
      await Linking.openURL(url);
    } catch {
      Alert.alert(
        "Could not open website",
        "Please try again or visit the university website in your browser.",
      );
    }
  };

  const confirmOpenWebsite = () => {
    if (!university.applicationUrl || !/^https?:\/\//i.test(university.applicationUrl)) {
      openApplicationWebsite();
      return;
    }
    Alert.alert(
      "Open external website?",
      `You are about to leave CareerCompass and open ${university.shortName}'s official website.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Continue", onPress: openApplicationWebsite },
      ],
    );
  };

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>Application information</Text>
      <Text style={[styles.notice, { color: universityTheme.accentLight }]}>
        Dates and requirements can change. Confirm all information on the official
        university website.
      </Text>

      <View style={styles.detailsCard}>
        <DetailRow label="Status" value={university.applicationStatus || "Not supplied"} />
        <DetailRow label="Application fee" value={applicationFee} accent={university.applicationFee === 0} />
        <DetailRow label="Opening date" value={university.openingDate || "Not supplied"} />
        <DetailRow label="Closing date" value={university.closingDate || "Not supplied"} />
      </View>

      <Text style={styles.subheading}>How to apply</Text>
      <Text style={styles.instructions}>
        {university.applicationInstructions ||
          "Application instructions have not been supplied. Check the official university website."}
      </Text>

      <Pressable
        onPress={confirmOpenWebsite}
        accessibilityRole="link"
        accessibilityLabel={`Apply to ${university.name} on its official website`}
        style={({ pressed }) => [styles.button, { backgroundColor: universityTheme.accent }, pressed && styles.pressed]}
      >
        <Text style={styles.buttonText}>Apply on university website</Text>
        <Ionicons name="open-outline" size={20} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { paddingTop: 24 },
  heading: { color: "#FFFFFF", fontSize: 22, fontWeight: "800" },
  notice: { marginTop: 9, fontSize: 13, lineHeight: 19 },
  detailsCard: { marginTop: 19, paddingHorizontal: 17, borderRadius: 17, borderWidth: 1, borderColor: "#252D39", backgroundColor: "#151A22" },
  detailRow: { minHeight: 61, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#343C48", flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 14 },
  detailLabel: { flex: 0.42, color: "#9CA6B5", fontSize: 13 },
  detailValue: { flex: 0.58, color: "#FFFFFF", fontSize: 13, lineHeight: 19, fontWeight: "700", textAlign: "right" },
  accentValue: { color: "#58E58F" },
  subheading: { marginTop: 25, color: "#FFFFFF", fontSize: 17, fontWeight: "700" },
  instructions: { marginTop: 9, color: "#B9C1CD", fontSize: 14, lineHeight: 22 },
  button: { minHeight: 56, marginTop: 25, paddingHorizontal: 18, borderRadius: 15, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9, backgroundColor: "#F26522" },
  buttonText: { flexShrink: 1, color: "#FFFFFF", fontSize: 15, fontWeight: "800", textAlign: "center" },
  pressed: { opacity: 0.75 },
});
