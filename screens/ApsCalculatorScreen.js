import React, { useEffect, useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import Text from '../components/TranslatedText';
import { SafeAreaView } from "react-native-safe-area-context";
import { useProfile } from "../context/ProfileContext";
import { loadCollection } from "../data/firestoreContent";
import { getApsUniversityMatches } from "../data/apsMatching";
import { universities } from "../data/universities";
import { calculateUniversityScores } from "../services/apsScoring";

const getThemeColors = (colors, resolvedTheme) => ({
  ...colors,
  primaryDark: resolvedTheme === "dark" ? "#46C8BB" : "#0B665E",
  secondary: colors.secondaryText,
  muted: colors.mutedText,
});

const PERIODS = [
  "Grade 11 Final",
  "Grade 12 Term 1",
  "Grade 12 Term 2",
  "Grade 12 Term 3",
  "Grade 12 Term 4",
];

// REMOVED: the hardcoded LANGUAGE_NAMES and SUBJECT_GROUPS lists.
// The subject groups now come from the Firestore "subjects" collection (one document per group).

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

function SubjectPicker({ visible, groups, selectedSubjects, onSelect, onClose }) {
  const { colors, resolvedTheme } = useProfile();
  const COLORS = useMemo(() => getThemeColors(colors, resolvedTheme), [colors, resolvedTheme]);
  const styles = useMemo(() => makeStyles(COLORS), [COLORS]);
  const [query, setQuery] = useState("");
  const filteredGroups = useMemo(() => {
    const search = query.trim().toLowerCase();
    return groups.map((group) => ({
      ...group,
      subjects: (group.subjects || []).filter(
        (subject) =>
          !selectedSubjects.includes(subject) &&
          (!search || subject.toLowerCase().includes(search)),
      ),
    })).filter((group) => group.subjects.length > 0);
  }, [groups, query, selectedSubjects]);

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
  const { colors, resolvedTheme } = useProfile();
  const COLORS = useMemo(() => getThemeColors(colors, resolvedTheme), [colors, resolvedTheme]);
  const styles = useMemo(() => makeStyles(COLORS), [COLORS]);
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

function ApsResultModal({ result, onClose, onViewMatches }) {
  const { colors, resolvedTheme } = useProfile();
  const COLORS = useMemo(() => getThemeColors(colors, resolvedTheme), [colors, resolvedTheme]);
  const styles = useMemo(() => makeStyles(COLORS), [COLORS]);
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
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close APS results"
            hitSlop={10}
            style={({ pressed }) => [styles.resultCloseButton, pressed && styles.pressed]}
          >
            <Ionicons name="close" size={22} color={COLORS.secondary} />
          </Pressable>
          <FlatList
            data={result?.universityScores || []}
            keyExtractor={(item) => item.id}
            style={styles.universityResultsList}
            contentContainerStyle={styles.universityResultsContent}
            showsVerticalScrollIndicator
            ListHeaderComponent={(
              <View>
                <View style={styles.genericApsCard}>
                  <View style={styles.resultIcon}>
                    <Ionicons name="school-outline" size={30} color={COLORS.primary} />
                  </View>
                  <Text style={styles.resultEyebrow}>GENERIC APS SCORE</Text>
                  <Text style={styles.resultValue}>{result?.totalAps}</Text>
                  <Text style={styles.resultUnit}>Overall APS estimate</Text>
                </View>
                <Text style={styles.resultEyebrow}>INSTITUTION SCORES</Text>
                <Text style={styles.resultDescription}>
                  Institution scores are separate from the generic APS above. They use {result?.subjectCount} entered eligible{" "}
                  {result?.subjectCount === 1 ? "subject" : "subjects"} from {result?.period}. The generic APS above excludes Life Orientation; institution rules may treat it differently.
                </Text>
                <Text style={styles.resultDescription}>
                  Based on your generic APS, {result?.matchedUniversities} {result?.matchedUniversities === 1 ? "university has" : "universities have"} courses at or below the listed minimum. This is a broad score comparison, not an eligibility result.
                </Text>
                {result?.collegeCount > 0 && (
                  <Text style={styles.resultDescription}>
                    {result.collegesUseAps
                      ? `${result.matchedColleges} ${result.matchedColleges === 1 ? "college meets" : "colleges meet"} the generic APS comparison.`
                      : `${result.collegeCount} public TVET colleges are listed. Check each college's subject and grade requirements.`}
                  </Text>
                )}
                <View style={styles.resultNotice}>
                  <Ionicons name="information-circle-outline" size={19} color={COLORS.primary} />
                  <Text style={styles.resultNoticeText}>
                    Scores are guidance estimates. Admissions requirements can change, methods may differ by qualification, and a score does not guarantee admission. Verified methods are labelled; unsupported methods show Needs verification.
                  </Text>
                </View>
              </View>
            )}
            renderItem={({ item }) => (
              <View style={styles.universityResultRow}>
                <View style={styles.universityLogoWrap}>
                  {item.logo ? (
                    <Image
                      source={item.logo}
                      resizeMode="contain"
                      accessibilityLabel={`${item.shortName} logo`}
                      style={styles.universityLogo}
                    />
                  ) : (
                    <Ionicons name="school-outline" size={23} color={COLORS.primary} />
                  )}
                </View>
                <View style={styles.universityResultNameWrap}>
                  <Text style={styles.universityResultName}>{item.name}</Text>
                  <Text style={styles.universityResultCaption} numberOfLines={item.id === "stellenbosch" ? 1 : undefined}>
                    {item.methodLabel}
                  </Text>
                  <Text style={[
                    styles.universityResultStatus,
                    item.status === "verified"
                      ? (item.score == null ? styles.inputStatus : styles.verifiedStatus)
                      : styles.unverifiedStatus,
                  ]}>
                    {item.status === "verified"
                      ? (item.score == null ? "More marks needed" : `Verified · ${item.admissionsYear}`)
                      : (item.score == null
                        ? "Needs verification"
                        : `Needs verification · ${item.admissionsYear}`)}
                  </Text>
                  {item.note && item.id !== "stellenbosch" ? (
                    <Text style={styles.universityResultNote}>{item.note}</Text>
                  ) : null}
                </View>
                <View style={styles.universityScoreWrap}>
                  <Text style={[
                    styles.universityResultScore,
                    item.score == null && styles.unavailableScore,
                  ]}>
                    {item.score == null ? "—" : item.id === "stellenbosch" ? Number(item.score).toFixed(2) : item.score}
                  </Text>
                  {item.score != null && item.maximumScore != null ? (
                    <Text style={styles.universityResultScoreDetails}>
                      /{item.maximumScore}{item.maximumBonusScore ? ` +${item.maximumBonusScore}` : ""}
                    </Text>
                  ) : null}
                </View>
              </View>
            )}
            ListFooterComponent={(
              <View>
                <Pressable
                  onPress={onViewMatches}
                  accessibilityRole="button"
                  style={({ pressed }) => [styles.resultButton, pressed && styles.pressed]}
                >
                  <Text style={styles.resultButtonText}>View matching courses</Text>
                </Pressable>
                <Pressable
                  onPress={onClose}
                  accessibilityRole="button"
                  style={({ pressed }) => [styles.resultDoneButton, pressed && styles.pressed]}
                >
                  <Text style={styles.resultDoneButtonText}>Done</Text>
                </Pressable>
              </View>
            )}
          />
        </View>
      </View>
    </Modal>
  );
}

const getMarksByPeriodFromProfile = (apsRecords = {}) => {
  const records = apsRecords || {};
  return Object.fromEntries(
    PERIODS.map((period) => [period, records[period]?.marks || []]),
  );
};

const getSavedPeriodsFromProfile = (apsRecords = {}) => {
  const records = apsRecords || {};
  return PERIODS.filter((period) => Array.isArray(records[period]?.marks));
};

function calculateGenericAps(marks, period) {
  const eligibleMarks = marks.filter(
    ({ subject }) => subject.toLowerCase() !== "life orientation",
  );
  return {
    totalAps: eligibleMarks.reduce(
      (total, { mark }) => total + getAchievementLevel(mark),
      0,
    ),
    subjectCount: eligibleMarks.length,
    period,
    marks,
  };
}

function createApsDisplayResult(result, colleges) {
  const collegesWithAps = colleges.filter(
    (college) => typeof college.minimumAps === "number",
  );
  return {
    ...result,
    universityScores: calculateUniversityScores(universities, result.marks),
    matchedUniversities: getApsUniversityMatches(result.totalAps).length,
    collegeCount: colleges.length,
    collegesUseAps: collegesWithAps.length > 0,
    matchedColleges: collegesWithAps.filter(
      (college) => college.minimumAps <= result.totalAps,
    ).length,
  };
}

export default function ApsCalculatorScreen({ navigation }) {
  const { profile, saveApsRecord, colors, resolvedTheme, isGuest, clearSession } = useProfile();
  const COLORS = useMemo(() => getThemeColors(colors, resolvedTheme), [colors, resolvedTheme]);
  const styles = useMemo(() => makeStyles(COLORS), [COLORS]);
  const [selectedPeriod, setSelectedPeriod] = useState(PERIODS[0]);
  const [marksByPeriod, setMarksByPeriod] = useState({});
  const [editedPeriods, setEditedPeriods] = useState([]);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [apsResult, setApsResult] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  // NEW: subject groups come from the Firestore "subjects" collection (cached for offline)
  const [subjectGroups, setSubjectGroups] = useState([]);
  const [colleges, setColleges] = useState([]);
  const currentMarks =
    marksByPeriod[selectedPeriod] ??
    profile.apsRecords?.[selectedPeriod]?.marks ??
    [];

  useEffect(() => {
    if (isGuest) return undefined;
    let active = true;
    loadCollection("subjects", { sortBy: "order" }).then((items) => {
      if (active) setSubjectGroups(items);
    });
    return () => {
      active = false;
    };
  }, [isGuest]);

  useEffect(() => {
    if (isGuest) return undefined;
    let active = true;
    loadCollection("colleges").then((items) => {
      if (active) setColleges(items);
    });
    return () => {
      active = false;
    };
  }, [isGuest]);

  const markPeriodEdited = () => {
    setEditedPeriods((current) =>
      current.includes(selectedPeriod) ? current : [...current, selectedPeriod],
    );
  };

  const addSubject = (subject) => {
    setMarksByPeriod((current) => ({
      ...current,
      [selectedPeriod]: [
        ...(current[selectedPeriod] ??
          profile.apsRecords?.[selectedPeriod]?.marks ??
          []),
        { subject, mark: "" },
      ],
    }));
    markPeriodEdited();
  };

  const updateMark = (subject, mark) => {
    setMarksByPeriod((current) => ({
      ...current,
      [selectedPeriod]: (
        current[selectedPeriod] ??
        profile.apsRecords?.[selectedPeriod]?.marks ??
        []
      ).map((item) => item.subject === subject ? { ...item, mark } : item),
    }));
    markPeriodEdited();
  };

  const removeSubject = (subject) => {
    setMarksByPeriod((current) => ({
      ...current,
      [selectedPeriod]: (
        current[selectedPeriod] ??
        profile.apsRecords?.[selectedPeriod]?.marks ??
        []
      ).filter((item) => item.subject !== subject),
    }));
    markPeriodEdited();
  };

  const isSaved =
    !editedPeriods.includes(selectedPeriod) &&
    Array.isArray(profile.apsRecords?.[selectedPeriod]?.marks);

  const saveMarks = async () => {
    if (isSaving) return;
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
    const eligibleMarks = currentMarks.filter(
      ({ subject }) => subject.toLowerCase() !== "life orientation",
    );
    if (eligibleMarks.length === 0) {
      Alert.alert(
        "Add an APS subject",
        "Life Orientation is not included in this estimate. Add at least one other subject before saving.",
      );
      return;
    }
    const result = calculateGenericAps(currentMarks, selectedPeriod);

    try {
      setIsSaving(true);
      await saveApsRecord(selectedPeriod, result);
      setMarksByPeriod((current) => {
        const { [selectedPeriod]: _savedMarks, ...remainingMarks } = current;
        return remainingMarks;
      });
      setEditedPeriods((current) =>
        current.filter((period) => period !== selectedPeriod),
      );
      // CHANGED: the popup needs the number of matching universities (it showed "undefined" before)
      setApsResult({
        ...createApsDisplayResult(result, colleges),
      });
    } catch (error) {
      Alert.alert(
        "Could not save APS",
        error.message || "Check your connection and try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const viewAps = () => {
    if (currentMarks.length === 0) {
      Alert.alert("No marks to view", "Add subjects and marks before viewing your APS.");
      return;
    }
    if (currentMarks.some(({ mark }) => mark === "")) {
      Alert.alert("Marks required", "Enter a percentage for every added subject before viewing your APS.");
      return;
    }
    const eligibleMarks = currentMarks.filter(
      ({ subject }) => subject.toLowerCase() !== "life orientation",
    );
    if (eligibleMarks.length === 0) {
      Alert.alert("Add an APS subject", "Life Orientation is not included in the generic APS. Add at least one other subject.");
      return;
    }

    const savedRecord = profile.apsRecords?.[selectedPeriod];
    const result = isSaved && Number.isFinite(savedRecord?.totalAps)
      ? { ...savedRecord, period: selectedPeriod }
      : calculateGenericAps(currentMarks, selectedPeriod);
    setApsResult(createApsDisplayResult(result, colleges));
  };

  if (isGuest) {
    const openAccount = (routeName) => {
      clearSession();
      navigation.reset({ index: 0, routes: [{ name: routeName }] });
    };
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.guestGate}>
          <View style={styles.guestGateIcon}>
            <Ionicons name="lock-closed-outline" size={28} color={COLORS.primary} />
          </View>
          <Text style={styles.guestGateTitle}>Sign in to use the APS calculator</Text>
          <Text style={styles.guestGateText}>
            Create a free student account to enter your marks, calculate APS, and keep your results safe.
          </Text>
          <Pressable onPress={() => openAccount("Login")} accessibilityRole="button" style={styles.guestGateButton}>
            <Text style={styles.guestGateButtonText}>Sign in</Text>
          </Pressable>
          <Pressable onPress={() => openAccount("SignUp")} accessibilityRole="button" style={styles.guestGateSecondaryButton}>
            <Text style={styles.guestGateSecondaryText}>Create an account</Text>
          </Pressable>
          <Pressable onPress={() => navigation.goBack()} accessibilityRole="button" style={styles.guestGateBack}>
            <Text style={styles.guestGateBackText}>Back to exploring</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={resolvedTheme === "dark" ? "light-content" : "dark-content"} backgroundColor={COLORS.primary} />
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={8}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <Ionicons name="arrow-back" size={25} color={COLORS.onPrimary} />
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
          disabled={isSaving}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.saveButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name={isSaved ? "checkmark-circle-outline" : "save-outline"}
            size={20}
            color={COLORS.onPrimary}
          />
          <Text style={styles.saveButtonText}>
            {isSaving ? "Saving" : isSaved ? "Update" : "Save"} {selectedPeriod} marks
          </Text>
        </Pressable>
        <Pressable
          onPress={viewAps}
          accessibilityRole="button"
          accessibilityLabel={`View ${selectedPeriod} APS`}
          style={({ pressed }) => [styles.viewApsButton, pressed && styles.pressed]}
        >
          <Ionicons name="eye-outline" size={19} color={COLORS.primary} />
          <Text style={styles.viewApsButtonText}>View APS</Text>
        </Pressable>
      </View>

      <SubjectPicker
        visible={pickerVisible}
        groups={subjectGroups}
        selectedSubjects={currentMarks.map(({ subject }) => subject)}
        onSelect={addSubject}
        onClose={() => setPickerVisible(false)}
      />
      <ApsResultModal
        result={apsResult}
        onClose={() => setApsResult(null)}
        onViewMatches={() => {
          setApsResult(null);
          navigation.navigate("Home", {
            screen: "Courses",
            params: {
              matchedOnly: true,
              apsScore: apsResult?.totalAps,
              apsByUniversity: apsResult?.apsByUniversity,
              filterRequestId: Date.now(),
            },
          });
        }}
      />
    </SafeAreaView>
  );
}

function makeStyles(COLORS) {
 return StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  guestGate: { flex: 1, justifyContent: "center", padding: 26 },
  guestGateIcon: { width: 60, height: 60, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: COLORS.primarySoft },
  guestGateTitle: { color: COLORS.text, fontSize: 25, lineHeight: 31, fontWeight: "900", marginTop: 20 },
  guestGateText: { color: COLORS.secondary, fontSize: 15, lineHeight: 23, marginTop: 9 },
  guestGateButton: { minHeight: 52, borderRadius: 15, marginTop: 24, alignItems: "center", justifyContent: "center", backgroundColor: COLORS.primary },
  guestGateButtonText: { color: COLORS.onPrimary, fontSize: 15, fontWeight: "800" },
  guestGateSecondaryButton: { minHeight: 52, borderRadius: 15, marginTop: 10, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: COLORS.primary },
  guestGateSecondaryText: { color: COLORS.primary, fontSize: 15, fontWeight: "800" },
  guestGateBack: { alignSelf: "center", padding: 14, marginTop: 10 },
  guestGateBackText: { color: COLORS.secondary, fontSize: 14, fontWeight: "700" },
  header: {
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 20,
    backgroundColor: COLORS.primary,
  },
  title: {
    marginTop: 10,
    color: COLORS.onPrimary,
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
  periodChipTextSelected: { color: COLORS.onPrimary },
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
    minWidth: 0,
    minHeight: 40,
    padding: 0,
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center",
  },
  percent: { flexShrink: 0, color: COLORS.muted, fontSize: 12 },
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
    color: COLORS.onPrimary,
    fontSize: 14,
    fontWeight: "800",
  },
  viewApsButton: {
    minHeight: 48,
    marginTop: 9,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surface,
  },
  viewApsButtonText: { marginLeft: 7, color: COLORS.primary, fontSize: 14, fontWeight: "800" },
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
    paddingVertical: 28,
  },
  resultCard: {
    width: "100%",
    maxWidth: 390,
    height: "92%",
    maxHeight: "92%",
    padding: 20,
    borderRadius: 26,
    alignItems: "center",
    flexDirection: "column",
    backgroundColor: COLORS.surface,
    shadowColor: "#172033",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  resultCloseButton: {
    width: 34,
    height: 34,
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
  },
  resultIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
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
  genericApsCard: {
    width: "100%",
    padding: 15,
    borderRadius: 18,
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  resultDescription: {
    marginTop: 10,
    color: COLORS.secondary,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
  },
  resultNotice: {
    width: "100%",
    marginTop: 12,
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
  universityResultsList: {
    width: "100%",
    flex: 1,
    minHeight: 0,
    marginTop: 14,
  },
  universityResultsContent: { gap: 7, paddingBottom: 2 },
  universityResultRow: {
    minHeight: 58,
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  universityLogoWrap: {
    width: 42,
    height: 42,
    marginRight: 11,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surface,
  },
  universityLogo: { width: 30, height: 30 },
  universityResultNameWrap: { flex: 1, minWidth: 0, marginRight: 12 },
  universityResultName: { color: COLORS.text, fontSize: 13, lineHeight: 18, fontWeight: "800" },
  universityResultCaption: { marginTop: 2, color: COLORS.muted, fontSize: 10, fontWeight: "600" },
  universityResultStatus: { marginTop: 3, fontSize: 9, fontWeight: "800" },
  verifiedStatus: { color: COLORS.primary },
  inputStatus: { color: COLORS.secondary },
  unverifiedStatus: { color: COLORS.danger },
  universityResultNote: { marginTop: 2, color: COLORS.muted, fontSize: 9, lineHeight: 12 },
  universityScoreWrap: { minWidth: 38, alignItems: "flex-end", justifyContent: "center" },
  universityResultScore: { color: COLORS.primary, fontSize: 23, fontWeight: "900", textAlign: "right" },
  universityResultScoreDetails: { color: COLORS.muted, fontSize: 9, fontWeight: "700", textAlign: "right" },
  unavailableScore: { color: COLORS.muted, fontSize: 18 },
  resultButton: {
    width: "100%",
    minHeight: 52,
    marginTop: 20,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
  },
  resultButtonText: { color: COLORS.onPrimary, fontSize: 15, fontWeight: "800" },
  resultDoneButton: { width: "100%", minHeight: 46, marginTop: 10, alignItems: "center", justifyContent: "center" },
  resultDoneButtonText: { color: COLORS.primary, fontSize: 14, fontWeight: "800" },
 });
}
