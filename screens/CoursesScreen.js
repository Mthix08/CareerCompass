import React, { useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { courseExamples } from "../data/courseExamples";
import { universities } from "../data/universities";

const COLORS = {
  primary: "#117C72",
  primaryDark: "#0B665E",
  primarySoft: "#E7F3F1",
  background: "#F6F8FC",
  surface: "#FFFFFF",
  text: "#172033",
  secondary: "#667085",
  muted: "#98A2B3",
  border: "#DDE4ED",
  input: "#F8FAFC",
};

const QUALIFICATION_TYPES = ["Bachelor's Degree", "Diploma", "Higher Certificate"];
const EMPTY_FILTERS = { minimumAps: "", maximumAps: "", type: null, universityId: null };

function CourseCard({ course, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open ${course.name} details`}
      style={({ pressed }) => [styles.courseCard, pressed && styles.cardPressed]}
    >
      <View style={styles.courseIcon}>
        <Ionicons name="book-outline" size={24} color={COLORS.primary} />
      </View>
      <View style={styles.courseDetails}>
        <Text style={styles.universityName}>{course.universityShortName}</Text>
        <Text style={styles.courseName}>{course.name}</Text>
        <View style={styles.metaRow}>
          <View style={styles.apsBadge}>
            <Text style={styles.apsBadgeText}>APS {course.minimumAps}+</Text>
          </View>
          <Text style={styles.typeText}>{course.qualificationType}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
    </Pressable>
  );
}

function FilterSheet({ visible, filters, onApply, onClose }) {
  const [draft, setDraft] = useState(filters);

  const close = () => {
    setDraft(filters);
    onClose();
  };

  const selectUniversity = (universityId) => {
    setDraft((current) => ({
      ...current,
      universityId: current.universityId === universityId ? null : universityId,
    }));
  };

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={close}>
      <KeyboardAvoidingView style={styles.modalRoot} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <Pressable style={styles.backdrop} onPress={close} />
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Filter Courses</Text>
            <Pressable onPress={close} accessibilityRole="button" accessibilityLabel="Close filters" hitSlop={10}>
              <Ionicons name="close" size={25} color={COLORS.secondary} />
            </Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
            <Text style={styles.filterLabel}>APS RANGE</Text>
            <View style={styles.apsInputsRow}>
              <View style={styles.apsInputBlock}>
                <Text style={styles.smallLabel}>Minimum</Text>
                <TextInput
                  value={draft.minimumAps}
                  onChangeText={(value) => setDraft((current) => ({ ...current, minimumAps: value.replace(/\D/g, "").slice(0, 2) }))}
                  keyboardType="number-pad"
                  placeholder="e.g. 20"
                  placeholderTextColor={COLORS.muted}
                  style={styles.filterInput}
                />
              </View>
              <Text style={styles.rangeDash}>–</Text>
              <View style={styles.apsInputBlock}>
                <Text style={styles.smallLabel}>Maximum</Text>
                <TextInput
                  value={draft.maximumAps}
                  onChangeText={(value) => setDraft((current) => ({ ...current, maximumAps: value.replace(/\D/g, "").slice(0, 2) }))}
                  keyboardType="number-pad"
                  placeholder="e.g. 42"
                  placeholderTextColor={COLORS.muted}
                  style={styles.filterInput}
                />
              </View>
            </View>

            <Text style={styles.filterLabel}>QUALIFICATION TYPE</Text>
            <View style={styles.chipWrap}>
              {QUALIFICATION_TYPES.map((type) => {
                const selected = draft.type === type;
                return (
                  <Pressable
                    key={type}
                    onPress={() => setDraft((current) => ({ ...current, type: selected ? null : type }))}
                    style={[styles.filterChip, selected && styles.filterChipSelected]}
                  >
                    <Text style={[styles.filterChipText, selected && styles.filterChipTextSelected]}>{type}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.filterLabel}>UNIVERSITY</Text>
            <View style={styles.universityList}>
              <Pressable onPress={() => selectUniversity(null)} style={styles.universityOption}>
                <Text style={[styles.universityOptionText, !draft.universityId && styles.optionSelectedText]}>All Universities</Text>
                {!draft.universityId && <Ionicons name="checkmark" size={20} color={COLORS.primary} />}
              </Pressable>
              {universities.map((university) => {
                const selected = draft.universityId === university.id;
                return (
                  <Pressable key={university.id} onPress={() => selectUniversity(university.id)} style={styles.universityOption}>
                    <Text style={[styles.universityOptionText, selected && styles.optionSelectedText]}>{university.shortName} · {university.name}</Text>
                    {selected && <Ionicons name="checkmark" size={20} color={COLORS.primary} />}
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
          <View style={styles.filterFooter}>
            <Pressable onPress={() => setDraft(EMPTY_FILTERS)} style={({ pressed }) => [styles.clearButton, pressed && styles.pressed]}>
              <Text style={styles.clearButtonText}>Clear</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                onApply(draft);
                onClose();
              }}
              style={({ pressed }) => [styles.resultsButton, pressed && styles.pressed]}
            >
              <Text style={styles.resultsButtonText}>Show Results</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default function CoursesScreen({ navigation }) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [filterVisible, setFilterVisible] = useState(false);

  const filteredCourses = useMemo(() => {
    const search = query.trim().toLowerCase();
    const minimum = filters.minimumAps === "" ? null : Number(filters.minimumAps);
    const maximum = filters.maximumAps === "" ? null : Number(filters.maximumAps);

    return courseExamples.filter((course) => {
      const matchesSearch = !search || `${course.name} ${course.universityName} ${course.universityShortName}`.toLowerCase().includes(search);
      const matchesMinimum = minimum === null || course.minimumAps >= minimum;
      const matchesMaximum = maximum === null || course.minimumAps <= maximum;
      const matchesType = !filters.type || course.qualificationType === filters.type;
      const matchesUniversity = !filters.universityId || course.universityId === filters.universityId;
      return matchesSearch && matchesMinimum && matchesMaximum && matchesType && matchesUniversity;
    });
  }, [filters, query]);

  const activeFilterCount = [filters.minimumAps, filters.maximumAps, filters.type, filters.universityId].filter(Boolean).length;

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <View style={styles.header}>
        <Text style={styles.title}>Courses</Text>
        <Text style={styles.subtitle}>See which courses may fit your study goals</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>{courseExamples.length} courses</Text>
        </View>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchShell}>
          <Ionicons name="search-outline" size={20} color={COLORS.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search courses..."
            placeholderTextColor={COLORS.muted}
            returnKeyType="search"
            style={styles.searchInput}
          />
        </View>
        <Pressable onPress={() => setFilterVisible(true)} style={({ pressed }) => [styles.filterButton, activeFilterCount > 0 && styles.filterButtonActive, pressed && styles.pressed]}>
          <Ionicons name="options-outline" size={20} color={activeFilterCount > 0 ? "#FFFFFF" : COLORS.primary} />
          <Text style={[styles.filterButtonText, activeFilterCount > 0 && styles.filterButtonTextActive]}>Filter</Text>
          {activeFilterCount > 0 && <View style={styles.filterCount}><Text style={styles.filterCountText}>{activeFilterCount}</Text></View>}
        </Pressable>
      </View>

      <FlatList
        data={filteredCourses}
        keyExtractor={({ id }) => id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={<Text style={styles.resultText}>{filteredCourses.length} {filteredCourses.length === 1 ? "course" : "courses"}</Text>}
        ListEmptyComponent={<View style={styles.emptyState}><Ionicons name="search-outline" size={34} color={COLORS.primary} /><Text style={styles.emptyTitle}>No courses found</Text><Text style={styles.emptyText}>Try changing your search or filters.</Text></View>}
        renderItem={({ item }) => (
          <CourseCard course={item} onPress={() => navigation.getParent()?.navigate("CourseDetails", { course: item })} />
        )}
      />

      <FilterSheet visible={filterVisible} filters={filters} onApply={setFilters} onClose={() => setFilterVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: 22, paddingTop: 20, paddingBottom: 20, backgroundColor: COLORS.primary },
  title: { color: "#FFFFFF", fontSize: 29, fontWeight: "900" },
  subtitle: { marginTop: 5, color: "#D8F3EF", fontSize: 14, fontWeight: "600" },
  countBadge: { alignSelf: "flex-start", marginTop: 15, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.17)" },
  countBadgeText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },
  searchRow: { padding: 18, paddingBottom: 12, flexDirection: "row", gap: 10 },
  searchShell: { flex: 1, minHeight: 52, paddingHorizontal: 14, borderRadius: 15, borderWidth: 1, borderColor: COLORS.border, flexDirection: "row", alignItems: "center", backgroundColor: COLORS.surface },
  searchInput: { flex: 1, minHeight: 50, marginLeft: 9, color: COLORS.text, fontSize: 14 },
  filterButton: { minHeight: 52, paddingHorizontal: 13, borderRadius: 15, borderWidth: 1, borderColor: COLORS.border, flexDirection: "row", alignItems: "center", backgroundColor: COLORS.surface },
  filterButtonActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary },
  filterButtonText: { marginLeft: 6, color: COLORS.primary, fontSize: 13, fontWeight: "800" },
  filterButtonTextActive: { color: "#FFFFFF" },
  filterCount: { minWidth: 18, height: 18, marginLeft: 5, paddingHorizontal: 4, borderRadius: 9, alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF" },
  filterCountText: { color: COLORS.primary, fontSize: 10, fontWeight: "900" },
  listContent: { paddingHorizontal: 18, paddingBottom: 110 },
  resultText: { marginBottom: 10, color: COLORS.secondary, fontSize: 12, fontWeight: "700" },
  separator: { height: 11 },
  courseCard: { minHeight: 112, padding: 15, borderRadius: 18, borderWidth: 1, borderColor: COLORS.border, flexDirection: "row", alignItems: "center", backgroundColor: COLORS.surface, shadowColor: COLORS.text, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  cardPressed: { opacity: 0.75, transform: [{ scale: 0.99 }] },
  courseIcon: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: COLORS.primarySoft },
  courseDetails: { flex: 1, minWidth: 0, marginHorizontal: 12 },
  universityName: { color: COLORS.secondary, fontSize: 11, fontWeight: "800" },
  courseName: { marginTop: 4, color: COLORS.text, fontSize: 15, lineHeight: 20, fontWeight: "800" },
  metaRow: { marginTop: 8, flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 },
  apsBadge: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 999, backgroundColor: COLORS.primarySoft },
  apsBadgeText: { color: COLORS.primary, fontSize: 10, fontWeight: "900" },
  typeText: { color: COLORS.muted, fontSize: 10, fontWeight: "700" },
  emptyState: { alignItems: "center", paddingVertical: 50 },
  emptyTitle: { marginTop: 10, color: COLORS.text, fontSize: 18, fontWeight: "800" },
  emptyText: { marginTop: 5, color: COLORS.secondary, fontSize: 13 },
  pressed: { opacity: 0.68 },
  modalRoot: { flex: 1, justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(15,23,42,0.48)" },
  sheet: { height: "88%", overflow: "hidden", borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: COLORS.surface },
  sheetHandle: { width: 42, height: 4, marginTop: 10, alignSelf: "center", borderRadius: 2, backgroundColor: "#CBD5E1" },
  sheetHeader: { minHeight: 58, paddingHorizontal: 22, borderBottomWidth: 1, borderBottomColor: COLORS.border, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sheetTitle: { color: COLORS.text, fontSize: 19, fontWeight: "900" },
  filterContent: { padding: 22, paddingBottom: 28 },
  filterLabel: { marginTop: 4, marginBottom: 10, color: COLORS.secondary, fontSize: 10, fontWeight: "900", letterSpacing: 1 },
  apsInputsRow: { marginBottom: 23, flexDirection: "row", alignItems: "flex-end" },
  apsInputBlock: { flex: 1 },
  smallLabel: { marginBottom: 7, color: COLORS.secondary, fontSize: 12 },
  filterInput: { minHeight: 50, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, color: COLORS.text, backgroundColor: COLORS.input },
  rangeDash: { marginHorizontal: 11, marginBottom: 16, color: COLORS.muted, fontWeight: "800" },
  chipWrap: { marginBottom: 23, flexDirection: "row", flexWrap: "wrap", gap: 8 },
  filterChip: { paddingHorizontal: 13, paddingVertical: 10, borderRadius: 999, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.input },
  filterChipSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primarySoft },
  filterChipText: { color: COLORS.secondary, fontSize: 12, fontWeight: "700" },
  filterChipTextSelected: { color: COLORS.primary, fontWeight: "900" },
  universityList: { overflow: "hidden", borderRadius: 15, borderWidth: 1, borderColor: COLORS.border },
  universityOption: { minHeight: 50, paddingHorizontal: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: COLORS.border, flexDirection: "row", alignItems: "center", backgroundColor: COLORS.surface },
  universityOptionText: { flex: 1, marginRight: 8, color: COLORS.text, fontSize: 12, lineHeight: 17, fontWeight: "600" },
  optionSelectedText: { color: COLORS.primary, fontWeight: "900" },
  filterFooter: { padding: 16, borderTopWidth: 1, borderTopColor: COLORS.border, flexDirection: "row", gap: 10, backgroundColor: COLORS.surface },
  clearButton: { flex: 0.65, minHeight: 52, borderRadius: 26, borderWidth: 1, borderColor: COLORS.primary, alignItems: "center", justifyContent: "center" },
  clearButtonText: { color: COLORS.primary, fontSize: 14, fontWeight: "800" },
  resultsButton: { flex: 1.35, minHeight: 52, borderRadius: 26, alignItems: "center", justifyContent: "center", backgroundColor: COLORS.primary },
  resultsButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
});
