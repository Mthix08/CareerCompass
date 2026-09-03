import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

function getInitials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export default function VarsityCard({ university, onPress }) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.82}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`View details for ${university.name}`}
    >
      <View style={styles.logoFrame}>
        {university.campusImage ?
          <Image
            source={university.campusImage}
            style={styles.logo}
            resizeMode="cover"
          />
        : university.logoUrl && !imageFailed ?
          <Image
            source={{ uri: university.logoUrl }}
            style={styles.logo}
            resizeMode="contain"
            onError={() => setImageFailed(true)}
          />
        : <Text style={styles.initials}>{getInitials(university.name)}</Text>}
      </View>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>
          {university.name}
        </Text>
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={14} color="#6D7A8F" />
          <Text style={styles.meta} numberOfLines={1}>
            {university.province}
          </Text>
        </View>
        <Text style={styles.domain} numberOfLines={1}>
          {university.domain || "Official website available"}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color="#117C72" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#E4EAE8",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: 12,
    minHeight: 104,
    padding: 14,
  },
  logoFrame: {
    alignItems: "center",
    backgroundColor: "#E8F3F1",
    borderRadius: 14,
    height: 66,
    justifyContent: "center",
    marginRight: 14,
    width: 66,
  },
  logo: { height: 48, width: 48 },
  initials: { color: "#117C72", fontSize: 18, fontWeight: "800" },
  content: { flex: 1, minWidth: 0 },
  name: { color: "#172033", fontSize: 16, fontWeight: "700", lineHeight: 21 },
  metaRow: { alignItems: "center", flexDirection: "row", marginTop: 7 },
  meta: { color: "#6D7A8F", flex: 1, fontSize: 12, marginLeft: 4 },
  domain: { color: "#117C72", fontSize: 12, marginTop: 5 },
});
