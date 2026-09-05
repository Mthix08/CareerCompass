import React, { useMemo } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  FlatList,
  Image,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { universities } from "../data/universities";

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

function UniversityScoreCard({ university, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${university.name}, 0 APS, 0 matching courses`}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.logoWrap}>
        {university.logo ? (
          <Image
            source={university.logo}
            resizeMode="contain"
            accessibilityLabel={`${university.shortName} logo`}
            style={styles.logo}
          />
        ) : (
          <Ionicons name="school-outline" size={26} color={COLORS.primary} />
        )}
      </View>
      <View style={styles.universityDetails}>
        <Text style={styles.universityName} numberOfLines={2}>
          {university.name}
        </Text>
        <Text style={styles.courseCount}>0 matching courses</Text>
      </View>
      <View style={styles.scoreWrap}>
        <Text style={styles.score}>0</Text>
        <Text style={styles.scoreLabel}>APS</Text>
      </View>
    </Pressable>
  );
}

export default function UniversityApsScoresScreen({ navigation }) {
  const sortedUniversities = useMemo(
    () => [...universities].sort((a, b) => a.name.localeCompare(b.name)),
    [],
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={8}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <Ionicons name="arrow-back" size={25} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle}>{sortedUniversities.length} universities</Text>
        <Text style={styles.headerSubtitle}>
          APS and course matching will appear here
        </Text>
      </View>

      <FlatList
        data={sortedUniversities}
        keyExtractor={({ id }) => id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.listHeadingRow}>
            <View>
              <Text style={styles.listTitle}>University APS Scores</Text>
              <Text style={styles.listSubtitle}>General preview values</Text>
            </View>
            <View style={styles.previewBadge}>
              <Text style={styles.previewBadgeText}>COMING SOON</Text>
            </View>
          </View>
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <UniversityScoreCard
            university={item}
            onPress={() =>
              navigation.navigate("UniversityDetails", { university: item })
            }
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 22,
    backgroundColor: COLORS.primary,
  },
  backButton: {
    width: 42,
    height: 42,
    marginLeft: -8,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    marginTop: 5,
    color: "#FFFFFF",
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "900",
  },
  headerSubtitle: {
    marginTop: 4,
    color: "#D8F3EF",
    fontSize: 14,
    fontWeight: "600",
  },
  listContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 36 },
  listHeadingRow: {
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  listTitle: { color: COLORS.text, fontSize: 20, fontWeight: "900" },
  listSubtitle: { marginTop: 4, color: COLORS.secondary, fontSize: 12 },
  previewBadge: {
    marginLeft: 12,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: COLORS.primarySoft,
  },
  previewBadgeText: {
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.4,
  },
  separator: { height: 11 },
  card: {
    minHeight: 82,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    shadowColor: "#172033",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardPressed: { opacity: 0.76, transform: [{ scale: 0.99 }] },
  logoWrap: {
    width: 54,
    height: 54,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  logo: { width: 44, height: 44 },
  universityDetails: { flex: 1, minWidth: 0, marginHorizontal: 13 },
  universityName: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "800",
  },
  courseCount: {
    marginTop: 5,
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "700",
  },
  scoreWrap: { minWidth: 46, alignItems: "flex-end" },
  score: { color: COLORS.primary, fontSize: 25, lineHeight: 28, fontWeight: "900" },
  scoreLabel: { marginTop: 2, color: COLORS.primary, fontSize: 9, fontWeight: "900" },
  pressed: { opacity: 0.65 },
});
