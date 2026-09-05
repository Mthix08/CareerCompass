import React, { useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  Alert,
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
  danger: "#D64545",
};

const PERIODS = [
  "Grade 11 Final",
  "Grade 12 Term 1",
  "Grade 12 Term 2",
  "Grade 12 Term 3",
  "Grade 12 Term 4",
];

const LANGUAGE_NAMES = [
  "Afrikaans",
  "English",
  "IsiNdebele",
  "IsiXhosa",
  "IsiZulu",
  "Sepedi",
  "Sesotho",
  "Setswana",
  "Siswati",
  "Tshivenda",
  "Setswana",
  "XiTsonga",
];

const SUBJECT_GROUPS = [
  {
    title: "Core subjects",
    subjects: [
      "Life Orientation",
      "Mathematical Literacy",
      "Mathematics",
      "Technical Mathematics",
    ],
  },
  {
    title: "Languages",
    subjects: [...new Set(LANGUAGE_NAMES)].flatMap((language) => [
      `${language} Home Language`,
      `${language} First Additional Language`,
      `${language} Second Additional Language`,
    ]),
  },
  {
    title: "Sciences and technology",
    subjects: [
      "Agricultural Sciences",
      "Computer Applications Technology",
      "Information Technology",
      "Life Sciences",
      "Physical Sciences",
      "Technical Sciences",
    ],
  },
  {
    title: "Business and social sciences",
    subjects: [
      "Accounting",
      "Business Studies",
      "Economics",
      "Geography",
      "History",
      "Religion Studies",
    ],
  },
  {
    title: "Arts and services",
    subjects: [
      "Consumer Studies",
      "Dance Studies",
      "Design",
      "Dramatic Arts",
      "Hospitality Studies",
      "Music",
      "Tourism",
      "Visual Arts",
    ],
  },
  {
    title: "Technical and agricultural",
    subjects: [
      "Agricultural Management Practices",
      "Agricultural Technology",
      "Civil Technology",
      "Electrical Technology",
      "Engineering Graphics and Design",
      "Mechanical Technology",
    ],
  },
];

function getAchievementLevel(mark) {
  if (mark === "" || Number.isNaN(Number(mark))) return null;
  const percentage = Number(mark);
  if (percentage >= 80) return 7;
  if (percentage >= 70) return 6;
  if (percentage >= 60) return 5;
  if (percentage >= 50) return 4;
  if (percentage >= 40) return 3;
  if (percentage >= 30) return 2;
  return 1;
}

function SubjectPicker({ visible, selectedSubjects, onSelect, onClose }) {
  const [query, setQuery] = useState("");
  const filteredGroups = useMemo(() => {
    const search = query.trim().toLowerCase();
    return SUBJECT_GROUPS.map((group) => ({
      ...group,
      subjects: group.subjects.filter(
        (subject) =>
          !selectedSubjects.includes(subject) &&
          (!search || subject.toLowerCase().includes(search)),
      ),
    })).filter((group) => group.subjects.length > 0);
  }, [query, selectedSubjects]);

  const closePicker = () => {
    setQuery("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={closePicker}
    >
      <KeyboardAvoidingView
        style={styles.modalRoot}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable style={styles.backdrop} onPress={closePicker} />
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Add Subject</Text>
            <Pressable
              onPress={closePicker}
              accessibilityRole="button"
              accessibilityLabel="Close subject list"
              hitSlop={10}
            >
              <Ionicons name="close" size={25} color={COLORS.secondary} />
            </Pressable>
          </View>
          <View style={styles.searchShell}>
            <Ionicons name="search-outline" size={19} color={COLORS.muted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search NSC subjects..."
              placeholderTextColor={COLORS.muted}
              autoCorrect={false}
              style={styles.searchInput}
            />
          </View>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {filteredGroups.map((group) => (
              <View key={group.title}>
                <View style={styles.groupHeader}>
                  <Text style={styles.groupHeaderText}>{group.title}</Text>
                </View>
                {group.subjects.map((subject) => (
                  <Pressable
                    key={subject}
                    onPress={() => {
                      onSelect(subject);
                      closePicker();
                    }}
                    style={({ pressed }) => [
                      styles.subjectOption,
                      pressed && styles.optionPressed,
                    ]}
                  >
                    <Text style={styles.subjectOptionText}>{subject}</Text>
                    <Ionicons name="add" size={23} color={COLORS.primary} />
                  </Pressable>
                ))}
              </View>
            ))}
            {filteredGroups.length === 0 && (
              <Text style={styles.noSubjects}>
                No matching subjects available.
              </Text>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function MarkRow({ item, onMarkChange, onRemove }) {
  const level = getAchievementLevel(item.mark);

  const handleChange = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 3);
    if (digits && Number(digits) > 100) {
      onMarkChange("100");
      return;
    }
    onMarkChange(digits);
  };

  return (
    <View style={styles.markRow}>
      <Text style={styles.markSubject} numberOfLines={2}>
        {item.subject}
      </Text>
      <View style={[styles.levelBadge, !level && styles.levelBadgeEmpty]}>
        <Text style={[styles.levelText, !level && styles.levelTextEmpty]}>
          {level ? `Lvl ${level}` : "Lvl —"}
        </Text>
      </View>
      <View style={styles.markInputShell}>
        <TextInput
          value={item.mark}
          onChangeText={handleChange}
          keyboardType="number-pad"
          maxLength={3}
          placeholder="0"
          placeholderTextColor={COLORS.muted}
          accessibilityLabel={`${item.subject} percentage`}
          style={styles.markInput}
        />
        <Text style={styles.percent}>%</Text>
      </View>
      <Pressable
        onPress={onRemove}
        accessibilityRole="button"
        accessibilityLabel={`Remove ${item.subject}`}
        hitSlop={8}
        style={({ pressed }) => pressed && styles.pressed}
      >
        <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
      </Pressable>
    </View>
  );
}

function ApsResultModal({ result, onClose }) {
  return (
    <Modal
      visible={Boolean(result)}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.resultModalRoot}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.resultCard}>
          <View style={styles.resultIcon}>
            <Ionicons name="school-outline" size={32} color={COLORS.primary} />
          </View>
          <Text style={styles.resultEyebrow}>GENERAL APS RESULT</Text>
          <Text style={styles.resultValue}>{result?.totalAps}</Text>
          <Text style={styles.resultUnit}>Total APS</Text>
          <Text style={styles.resultDescription}>
            Calculated from {result?.subjectCount} eligible{" "}
            {result?.subjectCount === 1 ? "subject" : "subjects"} in{" "}
            {result?.period}. Life Orientation is not included.
          </Text>
          <View style={styles.resultNotice}>
            <Ionicons
              name="information-circle-outline"
              size={19}
              color={COLORS.primary}
            />
            <Text style={styles.resultNoticeText}>
              This is a general estimate using Level 1 = 1 APS through Level 7 =
              7 APS.
            </Text>
          </View>
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.resultButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.resultButtonText}>Done</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export default function ApsCalculatorScreen({ navigation }) {
  const [selectedPeriod, setSelectedPeriod] = useState(PERIODS[0]);
  const [marksByPeriod, setMarksByPeriod] = useState(() =>
    Object.fromEntries(PERIODS.map((period) => [period, []])),
  );
  const [savedPeriods, setSavedPeriods] = useState([]);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [apsResult, setApsResult] = useState(null);
  const currentMarks = marksByPeriod[selectedPeriod];

  const addSubject = (subject) => {
    setMarksByPeriod((current) => ({
      ...current,
      [selectedPeriod]: [...current[selectedPeriod], { subject, mark: "" }],
    }));
    setSavedPeriods((current) =>
      current.filter((period) => period !== selectedPeriod),
    );
  };

  const updateMark = (subject, mark) => {
    setMarksByPeriod((current) => ({
      ...current,
      [selectedPeriod]: current[selectedPeriod].map((item) =>
        item.subject === subject ? { ...item, mark } : item,
      ),
    }));
    setSavedPeriods((current) =>
      current.filter((period) => period !== selectedPeriod),
    );
  };

  const removeSubject = (subject) => {
    setMarksByPeriod((current) => ({
      ...current,
      [selectedPeriod]: current[selectedPeriod].filter(
        (item) => item.subject !== subject,
      ),
    }));
    setSavedPeriods((current) =>
      current.filter((period) => period !== selectedPeriod),
    );
  };

  const saveMarks = () => {
    if (currentMarks.length === 0) {
      Alert.alert(
        "Add subjects",
        "Add at least one subject before saving your marks.",
      );
      return;
    }
    if (currentMarks.some(({ mark }) => mark === "")) {
      Alert.alert(
        "Marks required",
        "Enter a percentage for every added subject.",
      );
      return;
    }
    setSavedPeriods((current) =>
      current.includes(selectedPeriod) ? current : [...current, selectedPeriod],
    );

    const eligibleMarks = currentMarks.filter(
      ({ subject }) => subject.toLowerCase() !== "life orientation",
    );
    const totalAps = eligibleMarks.reduce(
      (total, { mark }) => total + getAchievementLevel(mark),
      0,
    );
    setApsResult({
      totalAps,
      subjectCount: eligibleMarks.length,
      period: selectedPeriod,
    });
  };

  const isSaved = savedPeriods.includes(selectedPeriod);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={8}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <Ionicons name="arrow-back" size={25} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.title}>My Marks</Text>
        <Text style={styles.subtitle}>
          Manage your Matric subjects and marks
        </Text>
      </View>

      <View style={styles.periodSection}>
        <Text style={styles.periodLabel}>SAVING MARKS FOR</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.periodList}
        >
          {PERIODS.map((period) => {
            const selected = period === selectedPeriod;
            return (
              <Pressable
                key={period}
                onPress={() => setSelectedPeriod(period)}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                style={[
                  styles.periodChip,
                  selected && styles.periodChipSelected,
                ]}
              >
                <Text
                  style={[
                    styles.periodChipText,
                    selected && styles.periodChipTextSelected,
                  ]}
                >
                  {period}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={currentMarks}
        keyExtractor={({ subject }) => subject}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.marksList}
        renderItem={({ item }) => (
          <MarkRow
            item={item}
            onMarkChange={(mark) => updateMark(item.subject, mark)}
            onRemove={() => removeSubject(item.subject)}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.rowSeparator} />}
        ListFooterComponent={
          <Pressable
            onPress={() => setPickerVisible(true)}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.addSubjectButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="add" size={21} color={COLORS.primary} />
            <Text style={styles.addSubjectText}>Add Subject</Text>
          </Pressable>
        }
      />

      <View style={styles.footer}>
        <Pressable
          onPress={saveMarks}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.saveButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name={isSaved ? "checkmark-circle-outline" : "save-outline"}
            size={20}
            color="#FFFFFF"
          />
          <Text style={styles.saveButtonText}>
            {isSaved ? "Update" : "Save"} {selectedPeriod} marks
          </Text>
        </Pressable>
      </View>

      <SubjectPicker
        visible={pickerVisible}
        selectedSubjects={currentMarks.map(({ subject }) => subject)}
        onSelect={addSubject}
        onClose={() => setPickerVisible(false)}
      />
      <ApsResultModal result={apsResult} onClose={() => setApsResult(null)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 20,
    backgroundColor: COLORS.primary,
  },
  title: {
    marginTop: 10,
    color: "#FFFFFF",
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "900",
  },
  subtitle: { marginTop: 3, color: "#D8F3EF", fontSize: 14, fontWeight: "600" },
  periodSection: { paddingTop: 18, backgroundColor: COLORS.background },
  periodLabel: {
    paddingHorizontal: 22,
    color: COLORS.secondary,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.1,
  },
  periodList: {
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 14,
    gap: 8,
  },
  periodChip: {
    minHeight: 38,
    paddingHorizontal: 14,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surface,
  },
  periodChipSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  periodChipText: { color: COLORS.secondary, fontSize: 12, fontWeight: "700" },
  periodChipTextSelected: { color: "#FFFFFF" },
  marksList: { flexGrow: 1, paddingHorizontal: 22, paddingBottom: 22 },
  rowSeparator: { height: 10 },
  markRow: {
    minHeight: 68,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
  },
  markSubject: {
    flex: 1,
    marginRight: 9,
    color: COLORS.text,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: COLORS.primarySoft,
  },
  levelBadgeEmpty: { backgroundColor: COLORS.input },
  levelText: { color: COLORS.primary, fontSize: 10, fontWeight: "900" },
  levelTextEmpty: { color: COLORS.muted },
  markInputShell: {
    width: 76,
    minHeight: 42,
    marginHorizontal: 9,
    paddingHorizontal: 7,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.input,
  },
  markInput: {
    flex: 1,
    minHeight: 40,
    padding: 0,
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center",
  },
  percent: { color: COLORS.muted, fontSize: 12 },
  addSubjectButton: {
    minHeight: 50,
    marginTop: 14,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surface,
  },
  addSubjectText: {
    marginLeft: 5,
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "800",
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  saveButton: {
    minHeight: 54,
    borderRadius: 27,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
  },
  saveButtonText: {
    marginLeft: 8,
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  pressed: { opacity: 0.68 },
  modalRoot: { flex: 1, justifyContent: "flex-end" },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.48)",
  },
  sheet: {
    height: "80%",
    overflow: "hidden",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: COLORS.surface,
  },
  sheetHandle: {
    width: 42,
    height: 4,
    marginTop: 10,
    alignSelf: "center",
    borderRadius: 2,
    backgroundColor: "#CBD5E1",
  },
  sheetHeader: {
    minHeight: 58,
    paddingHorizontal: 22,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sheetTitle: { color: COLORS.text, fontSize: 19, fontWeight: "900" },
  searchShell: {
    minHeight: 52,
    margin: 18,
    marginBottom: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.input,
  },
  searchInput: {
    flex: 1,
    minHeight: 50,
    marginLeft: 9,
    color: COLORS.text,
    fontSize: 14,
  },
  groupHeader: {
    paddingHorizontal: 21,
    paddingVertical: 10,
    backgroundColor: COLORS.background,
  },
  groupHeaderText: {
    color: COLORS.secondary,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.9,
    textTransform: "uppercase",
  },
  subjectOption: {
    minHeight: 52,
    paddingHorizontal: 21,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
  },
  subjectOptionText: {
    flex: 1,
    marginRight: 10,
    color: COLORS.text,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
  },
  optionPressed: { backgroundColor: COLORS.primarySoft },
  noSubjects: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    color: COLORS.muted,
    fontSize: 14,
    textAlign: "center",
  },
  resultModalRoot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 22,
  },
  resultCard: {
    width: "100%",
    maxWidth: 390,
    padding: 24,
    borderRadius: 26,
    alignItems: "center",
    backgroundColor: COLORS.surface,
    shadowColor: "#172033",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  resultIcon: {
    width: 66,
    height: 66,
    borderRadius: 33,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primarySoft,
  },
  resultEyebrow: {
    marginTop: 18,
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.1,
  },
  resultValue: {
    marginTop: 5,
    color: COLORS.text,
    fontSize: 54,
    lineHeight: 62,
    fontWeight: "900",
  },
  resultUnit: { color: COLORS.secondary, fontSize: 16, fontWeight: "800" },
  resultDescription: {
    marginTop: 13,
    color: COLORS.secondary,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
  },
  resultNotice: {
    width: "100%",
    marginTop: 18,
    padding: 13,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: COLORS.primarySoft,
  },
  resultNoticeText: {
    flex: 1,
    marginLeft: 8,
    color: COLORS.primaryDark,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
  },
  resultButton: {
    width: "100%",
    minHeight: 52,
    marginTop: 20,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
  },
  resultButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
});
