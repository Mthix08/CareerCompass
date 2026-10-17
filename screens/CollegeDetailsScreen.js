import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Alert, Image, Linking, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const COLORS = {
  primary: "#117C72",
  primarySoft: "#E7F3F1",
  background: "#F6F8FC",
  surface: "#FFFFFF",
  text: "#172033",
  secondary: "#667085",
  muted: "#98A2B3",
  border: "#DDE4ED",
};

// R25 000 for numbers, the text itself for strings, "Not supplied" when empty
const formatMoney = (value) =>
  typeof value === "number" ? `R${value.toLocaleString("en-ZA")}` : value || "Not supplied";

function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export default function CollegeDetailsScreen({ navigation, route }) {
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

  const costs = college.costs || {};
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
      Alert.alert("Could not open website", "Please try again or visit the college website in your browser.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Go back" hitSlop={8}>
          <Ionicons name="arrow-back" size={25} color="#FFFFFF" />
        </Pressable>
        <View style={styles.headerRow}>
          {college.logoUrl ? <Image source={{ uri: college.logoUrl }} style={styles.logo} resizeMode="contain" /> : null}
          <View style={styles.headerCopy}>
            <Text style={styles.name}>{college.name}</Text>
            <Text style={styles.meta}>{college.type} · {college.province}</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {college.isPlaceholder && (
          <View style={styles.example}>
            <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
            <Text style={styles.exampleText}>Example college. All details and figures are placeholders.</Text>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.title}>About</Text>
          <Text style={styles.body}>{college.description || "No description available yet."}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Costs and details</Text>
          <Text style={styles.sub}>
            {costs.year ? `Figures for ${costs.year}. ` : ""}Fees change, so always confirm the latest amounts.
          </Text>
          <Row label="Application fee" value={applicationFee} />
          <Row label="Registration fee" value={formatMoney(costs.registrationFee)} />
          <Row label="Tuition per year" value={formatMoney(costs.tuitionPerYear)} />
          <Row label="Accommodation per year" value={formatMoney(costs.accommodationPerYear)} />
          <Row label="NSFAS funding" value={costs.nsfasFunding || "Check with the college"} />
          {!!costs.sourceUrl && (
            <Pressable onPress={() => openLink(costs.sourceUrl, "Fee information")} accessibilityRole="link" style={styles.linkRow}>
              <Text style={styles.link}>Check official fee information</Text>
              <Ionicons name="open-outline" size={16} color={COLORS.primary} />
            </Pressable>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Applications</Text>
          <Row label="Status" value={college.applicationStatus || "Not supplied"} />
          <Row label="Opens" value={college.openingDate || "Not supplied"} />
          <Row label="Closes" value={college.closingDate || "Not supplied"} />
          <Text style={styles.body}>{college.applicationInstructions || "Check the official college website for how to apply."}</Text>
          <Pressable onPress={() => openLink(college.applicationUrl, "Application link unavailable")} accessibilityRole="link" style={styles.button}>
            <Text style={styles.buttonText}>Apply on college website</Text>
            <Ionicons name="open-outline" size={19} color="#FFFFFF" />
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Campuses and contact</Text>
          {(college.campuses || []).map((campus) => (
            <View key={campus} style={styles.info}>
              <Ionicons name="location-outline" size={18} color={COLORS.primary} />
              <Text style={styles.infoText}>{campus}</Text>
            </View>
          ))}
          {!!college.contactEmail && (
            <View style={styles.info}><Ionicons name="mail-outline" size={18} color={COLORS.primary} /><Text style={styles.infoText}>{college.contactEmail}</Text></View>
          )}
          {!!college.contactPhone && (
            <View style={styles.info}><Ionicons name="call-outline" size={18} color={COLORS.primary} /><Text style={styles.infoText}>{college.contactPhone}</Text></View>
          )}
          {!!college.website && (
            <Pressable onPress={() => openLink(college.website, "Website")} style={styles.info}>
              <Ionicons name="globe-outline" size={18} color={COLORS.primary} /><Text style={[styles.infoText, styles.link]}>{college.website}</Text>
            </Pressable>
          )}
        </View>

        <Text style={styles.disclaimer}>Confirm fees, dates and requirements on the college's official website before applying.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: 22, paddingTop: 14, paddingBottom: 22, backgroundColor: COLORS.primary },
  headerRow: { marginTop: 16, flexDirection: "row", alignItems: "center" },
  logo: { width: 54, height: 54, marginRight: 14, borderRadius: 14, backgroundColor: "#FFFFFF" },
  headerCopy: { flex: 1 },
  name: { color: "#FFFFFF", fontSize: 24, lineHeight: 30, fontWeight: "900" },
  meta: { marginTop: 5, color: "#D8F3EF", fontSize: 13, fontWeight: "600" },
  content: { padding: 20, paddingBottom: 40 },
  example: { padding: 13, marginBottom: 14, borderRadius: 14, flexDirection: "row", alignItems: "flex-start", backgroundColor: COLORS.primarySoft },
  exampleText: { flex: 1, marginLeft: 8, color: COLORS.primary, fontSize: 12, lineHeight: 18, fontWeight: "700" },
  card: { marginBottom: 14, padding: 18, borderRadius: 18, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface },
  title: { color: COLORS.text, fontSize: 18, fontWeight: "900" },
  sub: { marginTop: 5, marginBottom: 6, color: COLORS.secondary, fontSize: 12, lineHeight: 18 },
  body: { marginTop: 9, color: COLORS.secondary, fontSize: 13, lineHeight: 21 },
  row: { paddingVertical: 11, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: COLORS.border, flexDirection: "row", justifyContent: "space-between", gap: 12 },
  rowLabel: { flex: 0.5, color: COLORS.secondary, fontSize: 13 },
  rowValue: { flex: 0.5, color: COLORS.text, fontSize: 13, fontWeight: "800", textAlign: "right" },
  linkRow: { marginTop: 14, flexDirection: "row", alignItems: "center", gap: 6 },
  link: { color: COLORS.primary, fontSize: 13, fontWeight: "800" },
  button: { minHeight: 52, marginTop: 16, paddingHorizontal: 18, borderRadius: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: COLORS.primary },
  buttonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  info: { marginTop: 12, flexDirection: "row", alignItems: "flex-start", gap: 9 },
  infoText: { flex: 1, color: COLORS.secondary, fontSize: 13, lineHeight: 19 },
  disclaimer: { marginTop: 6, color: COLORS.muted, fontSize: 12, lineHeight: 18, textAlign: "center" },
  missing: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: COLORS.background },
  missingTitle: { color: COLORS.text, fontSize: 20, fontWeight: "900" },
});