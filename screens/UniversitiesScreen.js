import React, { useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  FlatList,
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
import { universities } from "../data/universities";

export default function UniversitiesScreen({ navigation }) {
  const { addBookmark, isBookmarked, removeBookmark } = useBookmarks();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [freeToApplyOnly, setFreeToApplyOnly] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);

  const provinces = useMemo(
    () =>
      [...new Set(universities.map(({ province }) => province))].sort((a, b) =>
        a.localeCompare(b),
      ),
    [],
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
        data={filteredUniversities}
        keyExtractor={(university) => university.id}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={34} color="#117C72" />
            <Text style={styles.emptyTitle}>No universities found</Text>
            <Text style={styles.emptyText}>
              Try another search or clear your filters.
            </Text>
          </View>
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.eyebrow}>EXPLORE YOUR OPTIONS</Text>
            <Text style={styles.title}>Universities</Text>
            <Text style={styles.subtitle}>
              Compare all {universities.length} public universities, their
              courses and application information.
            </Text>

            <View style={styles.searchRow}>
              <View style={styles.searchBox}>
                <Ionicons name="search-outline" size={20} color="#7B8798" />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search universities"
                  placeholderTextColor="#9CA6B5"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="search"
                  accessibilityLabel="Search universities"
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
                accessibilityLabel="Show university filters"
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
              {filteredUniversities.length}{" "}
              {filteredUniversities.length === 1
                ? "university"
                : "universities"}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <UniversityCard
            university={item}
            bookmarked={isBookmarked(item.id)}
            onBookmarkPress={() => handleBookmarkPress(item.id)}
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
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 22,
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
});
