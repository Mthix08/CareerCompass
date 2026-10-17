import React, { useEffect, useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";

import UniversityCard from "../components/Varsity-Card";
import { useBookmarks } from "../context/BookmarksContext";
import { loadCollection } from "../data/firestoreContent";
import { universities } from "../data/universities";

// NEW: card for a college (from the Firestore "colleges" collection)
function CollegeCard({ college, onPress }) {
  const fee =
    college.applicationFee === 0
      ? college.applicationFeeLabel || "Free to apply"
      : Number.isFinite(college.applicationFee)
        ? `Application fee R${college.applicationFee}`
        : "Check official site";

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open ${college.name} details`}
      style={({ pressed }) => [styles.collegeCard, pressed && styles.buttonPressed]}
    >
      {college.imageUrl ? (
        <Image source={{ uri: college.imageUrl }} style={styles.collegeImage} resizeMode="cover" />
      ) : (
        <View style={styles.collegePlaceholder}>
          <Ionicons name="school-outline" size={44} color="#117C72" />
          <Text style={styles.placeholderText}>Campus image coming soon</Text>
        </View>
      )}
      <View style={styles.collegeBody}>
        <Text style={styles.collegeName} numberOfLines={2}>{college.name}</Text>
        <View style={styles.collegeLocation}>
          <Ionicons name="location-outline" size={15} color="#7B8798" />
          <Text style={styles.collegeProvince}>{college.province}</Text>
        </View>
        <View style={styles.tagRow}>
          <View style={styles.tag}><Text style={styles.tagText}>{college.type}</Text></View>
          <View style={[styles.tag, styles.feeTag]}><Text style={[styles.tagText, styles.feeTagText]}>{fee}</Text></View>
          {college.isPlaceholder && (
            <View style={styles.tag}><Text style={styles.tagText}>EXAMPLE</Text></View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

export default function UniversitiesScreen({ navigation }) {
  const { addBookmark, isBookmarked, removeBookmark } = useBookmarks();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [freeToApplyOnly, setFreeToApplyOnly] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);
  // NEW: Universities | Colleges toggle, colleges come from Firestore (cached for offline)
  const [mode, setMode] = useState("Universities");
  const [colleges, setColleges] = useState([]);
  const showingColleges = mode === "Colleges";

  useEffect(() => {
    let active = true;
    loadCollection("colleges", { sortBy: "order" }).then((items) => {
      if (active) setColleges(items);
    });
    return () => {
      active = false;
    };
  }, []);

  const provinces = useMemo(
    () =>
      [...new Set([...universities, ...colleges].map(({ province }) => province).filter(Boolean))].sort((a, b) =>
        a.localeCompare(b),
      ),
    [colleges],
  );

  const filteredUniversities = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase();

    return [...universities]
      .filter((university) => {
        const matchesSearch =
          !normalizedQuery ||
          university.name.toLocaleLowerCase().includes(normalizedQuery) ||
          university.shortName.toLocaleLowerCase().includes(normalizedQuery);
        const matchesProvince =
          !selectedProvince || university.province === selectedProvince;
        const matchesApplicationFee =
          !freeToApplyOnly || university.applicationFee === 0;

        return matchesSearch && matchesProvince && matchesApplicationFee;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [freeToApplyOnly, searchQuery, selectedProvince]);

  const filteredColleges = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase();

    return colleges.filter((college) => {
      const matchesSearch =
        !normalizedQuery ||
        (college.name || "").toLocaleLowerCase().includes(normalizedQuery) ||
        (college.shortName || "").toLocaleLowerCase().includes(normalizedQuery);
      const matchesProvince = !selectedProvince || college.province === selectedProvince;
      const matchesApplicationFee = !freeToApplyOnly || college.applicationFee === 0;
      return matchesSearch && matchesProvince && matchesApplicationFee;
    });
  }, [colleges, freeToApplyOnly, searchQuery, selectedProvince]);

  const listData = showingColleges ? filteredColleges : filteredUniversities;
  const noun = showingColleges
    ? listData.length === 1 ? "college" : "colleges"
    : listData.length === 1 ? "university" : "universities";

  const hasActiveFilters = Boolean(selectedProvince || freeToApplyOnly);

  const clearFilters = () => {
    setSelectedProvince(null);
    setFreeToApplyOnly(false);
  };

  const handleBookmarkPress = (universityId) => {
    if (isBookmarked(universityId)) {
      removeBookmark(universityId);
      return;
    }

    addBookmark(universityId);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <FlatList
        data={listData}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={34} color="#117C72" />
            <Text style={styles.emptyTitle}>
              {showingColleges ? "No colleges found" : "No universities found"}
            </Text>
            <Text style={styles.emptyText}>
              Try another search or clear your filters.
            </Text>
          </View>
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.eyebrow}>EXPLORE YOUR OPTIONS</Text>
            <Text style={styles.title}>{showingColleges ? "Colleges" : "Universities"}</Text>
            <Text style={styles.subtitle}>
              {showingColleges
                ? "Explore private higher education institutions and public TVET colleges."
                : `Compare all ${universities.length} public universities, their courses and application information.`}
            </Text>

            <View style={styles.segment}>
              {["Universities", "Colleges"].map((option) => {
                const active = mode === option;
                return (
                  <Pressable
                    key={option}
                    onPress={() => setMode(option)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    style={[styles.segmentItem, active && styles.segmentItemActive]}
                  >
                    <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{option}</Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.searchRow}>
              <View style={styles.searchBox}>
                <Ionicons name="search-outline" size={20} color="#7B8798" />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder={showingColleges ? "Search colleges" : "Search universities"}
                  placeholderTextColor="#9CA6B5"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="search"
                  accessibilityLabel={showingColleges ? "Search colleges" : "Search universities"}
                  style={styles.searchInput}
                />
                {searchQuery.length > 0 && (
                  <Pressable
                    onPress={() => setSearchQuery("")}
                    accessibilityRole="button"
                    accessibilityLabel="Clear search"
                    hitSlop={8}
                  >
                    <Ionicons name="close-circle" size={20} color="#9CA6B5" />
                  </Pressable>
                )}
              </View>

              <Pressable
                onPress={() => setFiltersVisible((visible) => !visible)}
                accessibilityRole="button"
                accessibilityLabel="Show filters"
                accessibilityState={{ expanded: filtersVisible }}
                style={({ pressed }) => [
                  styles.filterButton,
                  hasActiveFilters && styles.filterButtonActive,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Ionicons
                  name="options-outline"
                  size={22}
                  color={hasActiveFilters ? "#FFFFFF" : "#117C72"}
                />
                {hasActiveFilters && <View style={styles.filterIndicator} />}
              </Pressable>
            </View>

            {filtersVisible && (
              <View style={styles.filterPanel}>
                <View style={styles.filterHeadingRow}>
                  <Text style={styles.filterHeading}>Filter by province</Text>
                  {hasActiveFilters && (
                    <Pressable onPress={clearFilters} hitSlop={8}>
                      <Text style={styles.clearFilters}>Clear filters</Text>
                    </Pressable>
                  )}
                </View>
                <View style={styles.chipContainer}>
                  {provinces.map((province) => {
                    const selected = selectedProvince === province;
                    return (
                      <Pressable
                        key={province}
                        onPress={() =>
                          setSelectedProvince(selected ? null : province)
                        }
                        accessibilityRole="button"
                        accessibilityState={{ selected }}
                        style={[styles.chip, selected && styles.chipSelected]}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            selected && styles.chipTextSelected,
                          ]}
                        >
                          {province}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
                <Pressable
                  onPress={() => setFreeToApplyOnly((current) => !current)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: freeToApplyOnly }}
                  style={styles.freeFilterRow}
                >
                  <Ionicons
                    name={freeToApplyOnly ? "checkbox" : "square-outline"}
                    size={24}
                    color="#117C72"
                  />
                  <Text style={styles.freeFilterText}>Free to apply only</Text>
                </Pressable>
              </View>
            )}

            <Text style={styles.resultCount}>
              {listData.length} {noun}
            </Text>
          </View>
        }
        renderItem={({ item }) =>
          showingColleges ? (
            <CollegeCard
              college={item}
              onPress={() => navigation.navigate("CollegeDetails", { college: item })}
            />
          ) : (
            <UniversityCard
              university={item}
              bookmarked={isBookmarked(item.id)}
              onBookmarkPress={() => handleBookmarkPress(item.id)}
              onPress={() =>
                navigation.navigate("UniversityDetails", { university: item })
              }
            />
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F8FC",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 20,
  },
  separator: { height: 20 },
  eyebrow: {
    color: "#117C72",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  title: {
    marginTop: 7,
    color: "#117C72",
    fontSize: 31,
    fontWeight: "900",
  },
  subtitle: {
    maxWidth: 420,
    marginTop: 8,
    color: "#9CA6B5",
    fontSize: 15,
    lineHeight: 22,
  },
  segment: {
    marginTop: 18,
    padding: 4,
    borderRadius: 16,
    flexDirection: "row",
    backgroundColor: "#E8EDF3",
  },
  segmentItem: {
    flex: 1,
    minHeight: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentItemActive: { backgroundColor: "#FFFFFF" },
  segmentText: { color: "#667085", fontSize: 14, fontWeight: "700" },
  segmentTextActive: { color: "#117C72", fontWeight: "900" },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
    gap: 10,
  },
  searchBox: {
    flex: 1,
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#DDE3EC",
    backgroundColor: "#FFFFFF",
  },
  searchInput: {
    flex: 1,
    height: "100%",
    marginHorizontal: 10,
    color: "#172033",
    fontSize: 15,
  },
  filterButton: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#B7D7D3",
    backgroundColor: "#FFFFFF",
  },
  filterButtonActive: { backgroundColor: "#117C72", borderColor: "#117C72" },
  filterIndicator: {
    position: "absolute",
    top: 9,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#58E58F",
  },
  buttonPressed: { opacity: 0.72 },
  filterPanel: {
    marginTop: 12,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#DDE3EC",
    backgroundColor: "#FFFFFF",
  },
  filterHeadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  filterHeading: { color: "#172033", fontSize: 14, fontWeight: "800" },
  clearFilters: { color: "#117C72", fontSize: 13, fontWeight: "700" },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#DDE3EC",
    backgroundColor: "#F6F8FC",
  },
  chipSelected: { borderColor: "#117C72", backgroundColor: "#E5F3F1" },
  chipText: { color: "#667085", fontSize: 12, fontWeight: "600" },
  chipTextSelected: { color: "#117C72", fontWeight: "800" },
  freeFilterRow: { flexDirection: "row", alignItems: "center", marginTop: 17 },
  freeFilterText: {
    marginLeft: 9,
    color: "#172033",
    fontSize: 14,
    fontWeight: "700",
  },
  resultCount: {
    marginTop: 14,
    color: "#7B8798",
    fontSize: 13,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 44,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    marginTop: 12,
    color: "#172033",
    fontSize: 18,
    fontWeight: "800",
  },
  emptyText: {
    marginTop: 6,
    color: "#7B8798",
    fontSize: 14,
    textAlign: "center",
  },
  collegeCard: {
    overflow: "hidden",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#DDE3EC",
    backgroundColor: "#FFFFFF",
    elevation: 3,
    shadowColor: "#172033",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  collegeImage: { width: "100%", height: 170 },
  collegePlaceholder: {
    height: 150,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#E7F3F1",
  },
  placeholderText: { color: "#117C72", fontSize: 13, fontWeight: "600" },
  collegeBody: { padding: 16 },
  collegeName: { color: "#172033", fontSize: 18, lineHeight: 24, fontWeight: "800" },
  collegeLocation: { marginTop: 6, flexDirection: "row", alignItems: "center", gap: 4 },
  collegeProvince: { color: "#7B8798", fontSize: 13 },
  tagRow: { marginTop: 12, flexDirection: "row", flexWrap: "wrap", gap: 7 },
  tag: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: "#F2F6FA" },
  tagText: { color: "#526078", fontSize: 11, fontWeight: "800" },
  feeTag: { backgroundColor: "#E7F3F1" },
  feeTagText: { color: "#117C72" },
});