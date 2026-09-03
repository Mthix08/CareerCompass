import React from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { getUniversityTheme } from "../data/universityTheme";

export default function UniversityCard({
  university,
  onPress,
  bookmarked = false,
  onBookmarkPress,
}) {
  const isFree = university.applicationFee === 0;
  const universityTheme = getUniversityTheme(university);
  const feeValue = isFree
    ? "R0"
    : Number.isFinite(university.applicationFee)
      ? `R${university.applicationFee}`
      : university.applicationFeeLabel || "Check official site";

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open ${university.name} details`}
      style={({ pressed }) => [
        styles.card,
        { borderColor: universityTheme.accentSoft },
        pressed && styles.cardPressed,
      ]}
    >
      {university.image ? (
        <Image
          source={university.image}
          style={styles.coverImage}
          resizeMode="cover"
          accessibilityLabel={`${university.name} campus`}
        />
      ) : (
        <View
          style={[
            styles.coverPlaceholder,
            { backgroundColor: universityTheme.placeholderBackground },
          ]}
          accessible={false}
        >
          <Ionicons name="school-outline" size={54} color={universityTheme.accentLight} />
          <Text style={[styles.placeholderText, { color: universityTheme.accentLight }]}>Campus image coming soon</Text>
        </View>
      )}

      <View style={[styles.brandBar, { backgroundColor: universityTheme.accent }]} />

      <View style={styles.body}>
        <View style={[styles.logoWrap, { borderColor: universityTheme.accent }]}>
          {university.logo ? (
            <Image
              source={university.logo}
              style={styles.logo}
              resizeMode="contain"
              accessibilityLabel={`${university.shortName} logo`}
            />
          ) : (
            <Text style={[styles.logoText, { color: universityTheme.accent }]}>{university.shortName}</Text>
          )}
        </View>

        <View style={styles.details}>
          <Text style={styles.name} numberOfLines={2}>
            {university.name}
          </Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={16} color="#9CA6B5" />
            <Text style={styles.province}>{university.province}</Text>
          </View>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Application fee</Text>
            <Text style={styles.feeValue}>{feeValue}</Text>
            {isFree && (
              <View style={styles.freeBadge}>
                <Text style={styles.freeBadgeText}>
                  {university.applicationFeeLabel || "Free to apply"}
                </Text>
              </View>
            )}
          </View>
        </View>

        <Pressable
          onPress={(event) => {
            event.stopPropagation?.();
            onBookmarkPress?.();
          }}
          accessibilityRole="button"
          accessibilityLabel={`${bookmarked ? "Remove" : "Add"} ${university.name} ${bookmarked ? "from" : "to"} bookmarks`}
          accessibilityState={{ selected: bookmarked }}
          hitSlop={8}
          style={({ pressed }) => [
            styles.bookmarkButton,
            pressed && styles.iconPressed,
          ]}
        >
          <Ionicons
            name={bookmarked ? "bookmark" : "bookmark-outline"}
            size={24}
            color={bookmarked ? universityTheme.accent : "#FFFFFF"}
          />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    height: 384,
    overflow: "hidden",
    borderRadius: 22,
    backgroundColor: "#0D1117",
    borderWidth: 1,
    borderColor: "#202733",
    elevation: 8,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.32,
    shadowRadius: 12,
  },
  cardPressed: { opacity: 0.88, transform: [{ scale: 0.99 }] },
  coverImage: { width: "100%", height: 190 },
  brandBar: { width: "100%", height: 4 },
  coverPlaceholder: {
    width: "100%",
    height: 190,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#301B14",
  },
  placeholderText: { fontSize: 13, fontWeight: "600" },
  body: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 18,
  },
  logoWrap: {
    width: 58,
    height: 58,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
  },
  logo: { width: 48, height: 48 },
  logoText: { fontSize: 20, fontWeight: "900" },
  details: { flex: 1, minWidth: 0, marginHorizontal: 14 },
  name: { minHeight: 48, color: "#FFFFFF", fontSize: 19, fontWeight: "800", lineHeight: 24 },
  locationRow: { flexDirection: "row", alignItems: "center", marginTop: 7 },
  province: { marginLeft: 4, color: "#9CA6B5", fontSize: 14 },
  feeRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", marginTop: 12, gap: 7 },
  feeLabel: { color: "#9CA6B5", fontSize: 12 },
  feeValue: { flexShrink: 1, color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  freeBadge: { borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5, backgroundColor: "rgba(0, 200, 83, 0.16)" },
  freeBadgeText: { color: "#58E58F", fontSize: 11, fontWeight: "800" },
  bookmarkButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#151A22",
  },
  iconPressed: { opacity: 0.65 },
});
