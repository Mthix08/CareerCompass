import React from "react";
import {
  Alert,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

function InfoRow({ icon, children }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={19} color="#F26522" />
      <Text style={styles.infoText}>{children}</Text>
    </View>
  );
}

export default function AboutSection({ university, onApsPress }) {
  const openVirtualCampus = async () => {
    const url = university.virtualCampusUrl;
    if (!url || !/^https?:\/\//i.test(url)) {
      Alert.alert(
        "Virtual campus unavailable",
        "This university does not have a valid virtual campus link yet.",
      );
      return;
    }

    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        Alert.alert(
          "Cannot open link",
          "Your device cannot open the virtual campus website.",
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

  const confirmOpenVirtualCampus = () => {
    Alert.alert(
      "Open external website?",
      `You are about to leave CareerCompass and open ${university.shortName}'s virtual campus.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Continue", onPress: openVirtualCampus },
      ],
    );
  };

  const handleApsPress = () => {
    if (onApsPress) {
      onApsPress();
      return;
    }
    Alert.alert(
      "APS calculator coming soon",
      "Connect this button to the APS screen when that route is available.",
    );
  };

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>About {university.shortName}</Text>
      <Text style={styles.body}>{university.description}</Text>

      {!!university.campuses?.length && (
        <View style={styles.block}>
          <Text style={styles.subheading}>Campuses</Text>
          {university.campuses.map((campus) => (
            <InfoRow key={campus} icon="location-outline">
              {campus}
            </InfoRow>
          ))}
          {!!university.virtualCampusUrl && (
            <Pressable
              onPress={confirmOpenVirtualCampus}
              accessibilityRole="link"
              accessibilityLabel={`View ${university.shortName} virtual campus`}
              style={({ pressed }) => [
                styles.virtualButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.virtualButtonText}>View Virtual</Text>
              <Ionicons name="open-outline" size={19} color="#FFFFFF" />
            </Pressable>
          )}
        </View>
      )}

      {(university.contactEmail ||
        university.contactPhone ||
        university.website) && (
        <View style={styles.block}>
          <Text style={styles.subheading}>Contact</Text>
          {!!university.contactEmail && (
            <InfoRow icon="mail-outline">{university.contactEmail}</InfoRow>
          )}
          {!!university.contactPhone && (
            <InfoRow icon="call-outline">{university.contactPhone}</InfoRow>
          )}
          {!!university.website && (
            <InfoRow icon="globe-outline">{university.website}</InfoRow>
          )}
        </View>
      )}

      <Pressable
        onPress={handleApsPress}
        accessibilityRole="button"
        accessibilityLabel={`See your APS at ${university.shortName}`}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Ionicons name="calculator-outline" size={21} color="#FFFFFF" />
        <Text style={styles.buttonText}>
          See your APS at {university.shortName}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { paddingTop: 24 },
  heading: { color: "#FFFFFF", fontSize: 22, fontWeight: "800" },
  body: { marginTop: 12, color: "#B9C1CD", fontSize: 15, lineHeight: 24 },
  block: { marginTop: 25 },
  subheading: {
    marginBottom: 11,
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
  infoRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 10 },
  infoText: {
    flex: 1,
    marginLeft: 10,
    color: "#B9C1CD",
    fontSize: 14,
    lineHeight: 21,
  },
  button: {
    minHeight: 54,
    marginTop: 27,
    paddingHorizontal: 18,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    backgroundColor: "#F26522",
  },
  buttonText: {
    flexShrink: 1,
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center",
  },
  virtualButton: {
    minHeight: 48,
    marginTop: 5,
    paddingHorizontal: 16,
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#202733",
    borderWidth: 1,
    borderColor: "#F26522",
  },
  virtualButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  pressed: { opacity: 0.75 },
});
