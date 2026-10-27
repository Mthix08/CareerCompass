import React, { useEffect, useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  FlatList,
  Pressable,
  StyleSheet,
  
  TextInput,
  View,
} from "react-native";
import Text from '../components/TranslatedText';
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";

import UniversityCard from "../components/Varsity-Card";
import CollegeCard from "../components/CollegeCard";
import { useBookmarks } from "../context/BookmarksContext";
import { useProfile } from "../context/ProfileContext";
import { loadCollection } from "../data/firestoreContent";
import { bundledColleges } from "../data/collegeDirectory";
import { universities } from "../data/universities";

export default function UniversitiesScreen({ navigation }) {
  const { colors, resolvedTheme } = useProfile();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { addBookmark, isBookmarked, removeBookmark } = useBookmarks();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [freeToApplyOnly, setFreeToApplyOnly] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);
  // Universities | Colleges toggle, colleges come from Firestore (cached for offline)
  const [mode, setMode] = useState("Universities");
  const [colleges, setColleges] = useState(bundledColleges);
  const showingColleges = mode === "Colleges";

  useEffect(() => {
    let active = true;
    loadCollection("colleges", { sortBy: "order" }).then((items) => {
      if (active && items.length > 0) setColleges(items);
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
      <StatusBar style={resolvedTheme === "dark" ? "light" : "dark"} />
      <FlatList
        data={listData}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={34} color={colors.primary} />
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
                <Ionicons name="search-outline" size={20} color={colors.mutedText} />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder={showingColleges ? "Search colleges" : "Search universities"}
                  placeholderTextColor={colors.mutedText}
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
                    <Ionicons name="close-circle" size={20} color={colors.mutedText} />
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
                  color={hasActiveFilters ? colors.onPrimary : colors.primary}
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
                    color={colors.primary}
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

function makeStyles(colors) {
return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    color: colors.primary,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  title: {
    marginTop: 7,
    color: colors.text,
    fontSize: 31,
    fontWeight: "900",
  },
  subtitle: {
    maxWidth: 420,
    marginTop: 8,
    color: colors.secondaryText,
    fontSize: 15,
    lineHeight: 22,
  },
  segment: {
    marginTop: 18,
    padding: 4,
    borderRadius: 16,
    flexDirection: "row",
    backgroundColor: colors.input,
  },
  segmentItem: {
    flex: 1,
    minHeight: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentItemActive: { backgroundColor: colors.surface },
  segmentText: { color: colors.secondaryText, fontSize: 14, fontWeight: "700" },
  segmentTextActive: { color: colors.primary, fontWeight: "900" },
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
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    marginHorizontal: 10,
    color: colors.text,
    fontSize: 15,
  },
  filterButton: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filterButtonActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterIndicator: {
    position: "absolute",
    top: 9,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  buttonPressed: { opacity: 0.72 },
  filterPanel: {
    marginTop: 12,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filterHeadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  filterHeading: { color: colors.text, fontSize: 14, fontWeight: "800" },
  clearFilters: { color: colors.primary, fontSize: 13, fontWeight: "700" },
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
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  chipSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  chipText: { color: colors.secondaryText, fontSize: 12, fontWeight: "600" },
  chipTextSelected: { color: colors.primary, fontWeight: "800" },
  freeFilterRow: { flexDirection: "row", alignItems: "center", marginTop: 17 },
  freeFilterText: {
    marginLeft: 9,
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  resultCount: {
    marginTop: 14,
    color: colors.mutedText,
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
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  emptyText: {
    marginTop: 6,
    color: colors.mutedText,
    fontSize: 14,
    textAlign: "center",
  },
});
}
