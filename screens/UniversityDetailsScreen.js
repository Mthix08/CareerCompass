import React from "react";
import {
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function UniversityDetailsScreen({ route, navigation }) {
  const { university } = route.params || {};

  if (!university) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>University unavailable</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  async function openWebsite() {
    if (university.website && (await Linking.canOpenURL(university.website))) {
      Linking.openURL(university.website);
    }
  }

  async function openApplications() {
    const admissionsUrl = `https://www.google.com/search?q=${encodeURIComponent(`${university.name} applications`)}`;
    if (await Linking.canOpenURL(admissionsUrl)) {
      Linking.openURL(admissionsUrl);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {university.campusImage ?
        <Image source={university.campusImage} style={styles.campusImage} />
      : null}
      <View style={styles.hero}>
        <View style={styles.mark}>
          <Text style={styles.initials}>
            {university.name.slice(0, 2).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.title}>{university.name}</Text>
        <Text style={styles.location}>
          {university.province} · {university.country || "South Africa"}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>AT A GLANCE</Text>
        <View style={styles.detailRow}>
          <Ionicons name="globe-outline" size={20} color="#117C72" />
          <View style={styles.detailText}>
            <Text style={styles.detailLabel}>Official domain</Text>
            <Text style={styles.detailValue}>
              {university.domain || "Not listed"}
            </Text>
          </View>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="map-outline" size={20} color="#117C72" />
          <View style={styles.detailText}>
            <Text style={styles.detailLabel}>Province</Text>
            <Text style={styles.detailValue}>{university.province}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>NEXT STEPS</Text>
        <TouchableOpacity
          style={[
            styles.actionButton,
            !university.website && styles.disabledButton,
          ]}
          onPress={openWebsite}
          disabled={!university.website}
          accessibilityRole="button"
        >
          <Ionicons name="open-outline" size={20} color="#FFFFFF" />
          <Text style={styles.actionText}>Visit official website</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryAction}
          onPress={openApplications}
          accessibilityRole="button"
        >
          <Ionicons name="document-text-outline" size={20} color="#117C72" />
          <Text style={styles.secondaryActionText}>
            Find application information
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.note}>
        Application information is linked through the university name. Confirm
        deadlines and requirements on the official site.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F8FC" },
  content: { padding: 20, paddingBottom: 40 },
  campusImage: { borderRadius: 18, height: 190, marginTop: 8, width: "100%" },
  hero: { alignItems: "center", paddingVertical: 24 },
  mark: {
    alignItems: "center",
    backgroundColor: "#117C72",
    borderRadius: 32,
    height: 64,
    justifyContent: "center",
    width: 64,
  },
  initials: { color: "#FFFFFF", fontSize: 20, fontWeight: "800" },
  title: {
    color: "#172033",
    fontSize: 25,
    fontWeight: "800",
    marginTop: 16,
    textAlign: "center",
  },
  location: {
    color: "#526078",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    marginTop: 12,
    padding: 18,
  },
  sectionLabel: {
    color: "#117C72",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 14,
  },
  detailRow: { alignItems: "center", flexDirection: "row", marginTop: 12 },
  detailText: { marginLeft: 14 },
  detailLabel: { color: "#6D7A8F", fontSize: 12 },
  detailValue: {
    color: "#172033",
    fontSize: 15,
    fontWeight: "600",
    marginTop: 3,
  },
  actionButton: {
    alignItems: "center",
    backgroundColor: "#117C72",
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    padding: 14,
  },
  actionText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 9,
  },
  secondaryAction: {
    alignItems: "center",
    borderColor: "#B9D7D2",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
    padding: 14,
  },
  secondaryActionText: {
    color: "#117C72",
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 9,
  },
  disabledButton: { backgroundColor: "#A4B5B2" },
  note: {
    color: "#6D7A8F",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 18,
    textAlign: "center",
  },
  emptyState: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  emptyTitle: {
    color: "#172033",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 18,
  },
  backButton: {
    backgroundColor: "#117C72",
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  backButtonText: { color: "#FFFFFF", fontWeight: "700" },
});
