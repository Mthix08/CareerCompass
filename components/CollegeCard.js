import React, { useMemo } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useProfile } from "../context/ProfileContext";
import { getCollegeImage, getCollegeLogo } from "../data/collegeImages";

export default function CollegeCard({ college, onPress }) {
  const { colors } = useProfile();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const photo = getCollegeImage(college);
  const logo = getCollegeLogo(college);

  const isFree = college.applicationFee === 0;
  const hasFee = Number.isFinite(college.applicationFee);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open ${college.name} details`}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.photoWrap}>
        {photo ? (
          <Image source={photo} style={styles.photo} resizeMode="cover" />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="school-outline" size={44} color={colors.primary} />
            <Text style={styles.placeholderText}>Campus image coming soon</Text>
          </View>
        )}
      </View>

      <View style={styles.body}>
        <View style={styles.logoBox}>
          {logo ? (
            <Image source={logo} style={styles.logo} resizeMode="contain" />
          ) : (
            <Text style={styles.logoFallback}>
              {(college.shortName || college.name || "?").slice(0, 3).toUpperCase()}
            </Text>
          )}
        </View>

        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={2}>{college.name}</Text>

          {!!college.province && (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={16} color={colors.mutedText} />
              <Text style={styles.location}>{college.province}</Text>
            </View>
          )}

          <View style={styles.feeRow}>
            {hasFee ? (
              <>
                <Text style={styles.feeLabel}>Application fee</Text>
                <Text style={styles.feeValue}>{isFree ? "R0" : `R${college.applicationFee}`}</Text>
                {isFree && (
                  <View style={styles.chipGreen}>
                    <Text style={styles.chipGreenText}>Free to apply</Text>
                  </View>
                )}
              </>
            ) : (
              <View style={styles.chipGreen}>
                <Text style={styles.chipGreenText}>Check official site</Text>
              </View>
            )}
          </View>

          {!!college.type && <Text style={styles.type}>{college.type}</Text>}
        </View>
      </View>
    </Pressable>
  );
}

function makeStyles(c) {
  return StyleSheet.create({
    card: {
      overflow: "hidden",
      borderRadius: 24,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.surface,
    },
    pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
    photoWrap: {
      borderBottomWidth: 4,
      borderBottomColor: c.primary,
      backgroundColor: c.primarySoft,
    },
    photo: { width: "100%", aspectRatio: 1.8 },
    placeholder: {
      width: "100%",
      aspectRatio: 1.8,
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    placeholderText: { color: c.primary, fontSize: 13, fontWeight: "600" },
    body: { flexDirection: "row", alignItems: "flex-start", padding: 16, paddingBottom: 20 },
    logoBox: {
      width: 64,
      height: 64,
      borderRadius: 18,
      borderWidth: 2,
      borderColor: c.primary,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#FFFFFF",
    },
    logo: { width: 50, height: 50 },
    logoFallback: { color: c.primary, fontSize: 16, fontWeight: "900" },
    info: { flex: 1, marginLeft: 14 },
    name: { color: c.text, fontSize: 18, lineHeight: 24, fontWeight: "900" },
    locationRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 8 },
    location: { color: c.secondaryText, fontSize: 14 },
    feeRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8, marginTop: 10 },
    feeLabel: { color: c.secondaryText, fontSize: 13 },
    feeValue: { color: c.text, fontSize: 14, fontWeight: "900" },
    chipGreen: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: c.primarySoft },
    chipGreenText: { color: c.primary, fontSize: 12, fontWeight: "800" },
    type: { marginTop: 8, color: c.mutedText, fontSize: 12, fontWeight: "700" },
  });
}