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
  danger: "#D64545",
};

const STATUSES = [
  { label: "Applied", color: "#3478F6" },
  { label: "Waiting for documents", color: "#F59E0B" },
  { label: "Documents submitted", color: "#8B5CF6" },
  { label: "Waitlisted", color: "#F97316" },
  { label: "Offer received", color: "#16A34A" },
  { label: "Rejected", color: "#D64545" },
];

const initialForm = {
  university: "",
  course: "",
  dateApplied: "",
  status: STATUSES[0],
  notes: "",
};

function ApplicationForm({ visible, onClose, onSubmit }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [universityMenuVisible, setUniversityMenuVisible] = useState(false);
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);

  const universityOptions = useMemo(() => {
    const query = form.university.trim().toLowerCase();
    if (!query) return universities;
    return universities.filter(
      ({ name, shortName }) =>
        name.toLowerCase().includes(query) ||
        shortName.toLowerCase().includes(query),
    );
  }, [form.university]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }
  };

  const closeForm = () => {
    setForm(initialForm);
    setErrors({});
    setUniversityMenuVisible(false);
    setStatusMenuVisible(false);
    onClose();
  };

  const saveApplication = () => {
    const nextErrors = {};
    if (!form.university.trim()) nextErrors.university = "Select a university.";
    if (!form.course.trim()) nextErrors.course = "Enter a course or qualification.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit({
      id: `${Date.now()}`,
      university: form.university.trim(),
      course: form.course.trim(),
      dateApplied: form.dateApplied.trim(),
      status: form.status,
      notes: form.notes.trim(),
    });
    closeForm();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={closeForm}
    >
      <KeyboardAvoidingView
        style={styles.modalRoot}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable
          style={styles.backdrop}
          onPress={closeForm}
          accessibilityLabel="Close application form"
        />
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Track Application</Text>
            <Pressable
              onPress={closeForm}
              accessibilityRole="button"
              accessibilityLabel="Close application form"
              hitSlop={10}
              style={({ pressed }) => pressed && styles.pressed}
            >
              <Ionicons name="close" size={25} color={COLORS.secondary} />
            </Pressable>
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.formContent}
          >
            <Text style={styles.label}>University *</Text>
            <View style={[styles.inputShell, errors.university && styles.inputError]}>
              <Ionicons name="search-outline" size={19} color={COLORS.muted} />
              <TextInput
                value={form.university}
                onChangeText={(value) => {
                  updateField("university", value);
                  setUniversityMenuVisible(true);
                }}
                onFocus={() => setUniversityMenuVisible(true)}
                placeholder="Search universities..."
                placeholderTextColor={COLORS.muted}
                style={styles.input}
              />
            </View>
            {errors.university && <Text style={styles.errorText}>{errors.university}</Text>}
            {universityMenuVisible && (
              <View style={styles.optionMenu}>
                <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled" style={styles.universityOptions}>
                  {universityOptions.length > 0 ? (
                    universityOptions.map((university) => (
                      <Pressable
                        key={university.id}
                        onPress={() => {
                          updateField("university", university.name);
                          setUniversityMenuVisible(false);
                        }}
                        style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
                      >
                        <Text style={styles.optionText}>{university.name}</Text>
                        <Text style={styles.optionMeta}>{university.shortName}</Text>
                      </Pressable>
                    ))
                  ) : (
                    <Text style={styles.noOptions}>No matching universities</Text>
                  )}
                </ScrollView>
              </View>
            )}

            <Text style={styles.label}>Course / qualification *</Text>
            <View style={[styles.inputShell, errors.course && styles.inputError]}>
              <Ionicons name="book-outline" size={19} color={COLORS.muted} />
              <TextInput
                value={form.course}
                onChangeText={(value) => updateField("course", value)}
                placeholder="e.g. BSc Computer Science"
                placeholderTextColor={COLORS.muted}
                style={styles.input}
              />
            </View>
            {errors.course && <Text style={styles.errorText}>{errors.course}</Text>}

            <Text style={styles.label}>Date applied (optional)</Text>
            <View style={styles.inputShell}>
              <Ionicons name="calendar-outline" size={19} color={COLORS.muted} />
              <TextInput
                value={form.dateApplied}
                onChangeText={(value) => updateField("dateApplied", value)}
                placeholder="e.g. 05 September 2026"
                placeholderTextColor={COLORS.muted}
                style={styles.input}
              />
            </View>

            <Text style={styles.label}>Status</Text>
            <Pressable
              onPress={() => {
                setStatusMenuVisible((current) => !current);
                setUniversityMenuVisible(false);
              }}
              accessibilityRole="button"
              accessibilityState={{ expanded: statusMenuVisible }}
              style={styles.inputShell}
            >
              <View style={[styles.statusDot, { backgroundColor: form.status.color }]} />
              <Text style={styles.selectText}>{form.status.label}</Text>
              <Ionicons
                name={statusMenuVisible ? "chevron-up" : "chevron-down"}
                size={19}
                color={COLORS.secondary}
              />
            </Pressable>
            {statusMenuVisible && (
              <View style={styles.optionMenu}>
                {STATUSES.map((status) => (
                  <Pressable
                    key={status.label}
                    onPress={() => {
                      updateField("status", status);
                      setStatusMenuVisible(false);
                    }}
                    style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
                  >
                    <View style={[styles.statusDot, { backgroundColor: status.color }]} />
                    <Text style={styles.statusOptionText}>{status.label}</Text>
                    {status.label === form.status.label && (
                      <Ionicons name="checkmark" size={19} color={COLORS.primary} />
                    )}
                  </Pressable>
                ))}
              </View>
            )}

            <Text style={styles.label}>Notes (optional)</Text>
            <View style={[styles.inputShell, styles.notesShell]}>
              <TextInput
                value={form.notes}
                onChangeText={(value) => updateField("notes", value)}
                placeholder="Any notes about this application..."
                placeholderTextColor={COLORS.muted}
                multiline
                textAlignVertical="top"
                style={[styles.input, styles.notesInput]}
              />
            </View>

            <Pressable
              onPress={saveApplication}
              accessibilityRole="button"
              style={({ pressed }) => [styles.submitButton, pressed && styles.pressed]}
            >
              <Text style={styles.submitButtonText}>Track Application</Text>
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function ApplicationCard({ application }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTopRow}>
        <View style={styles.cardIcon}>
          <Ionicons name="school-outline" size={22} color={COLORS.primary} />
        </View>
        <View style={styles.cardHeading}>
          <Text style={styles.cardUniversity}>{application.university}</Text>
          <Text style={styles.cardCourse}>{application.course}</Text>
        </View>
      </View>
      <View style={styles.cardDivider} />
      <View style={styles.cardDetailsRow}>
        <View style={styles.statusBadge}>
          <View style={[styles.statusDot, { backgroundColor: application.status.color }]} />
          <Text style={styles.statusBadgeText}>{application.status.label}</Text>
        </View>
        {!!application.dateApplied && (
          <View style={styles.dateRow}>
            <Ionicons name="calendar-outline" size={15} color={COLORS.muted} />
            <Text style={styles.dateText}>{application.dateApplied}</Text>
          </View>
        )}
      </View>
      {!!application.notes && <Text style={styles.cardNotes}>{application.notes}</Text>}
    </View>
  );
}

export default function Applications({ navigation }) {
  const [applications, setApplications] = useState([]);
  const [formVisible, setFormVisible] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={({ pressed }) => [styles.headerIconButton, pressed && styles.pressed]}
        >
          <Ionicons name="chevron-back" size={25} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle}>My Applications</Text>
        <Pressable
          onPress={() => setFormVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Add application"
          style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add</Text>
        </Pressable>
      </View>

      <FlatList
        data={applications}
        keyExtractor={({ id }) => id}
        renderItem={({ item }) => <ApplicationCard application={item} />}
        ItemSeparatorComponent={() => <View style={styles.cardSeparator} />}
        contentContainerStyle={[
          styles.listContent,
          applications.length === 0 && styles.emptyListContent,
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="clipboard-outline" size={42} color={COLORS.primary} />
            </View>
            <Text style={styles.emptyTitle}>No applications tracked yet</Text>
            <Text style={styles.emptyDescription}>
              Keep track of every university you apply to, what documents you’ve
              submitted, and whether you’ve received an offer.
            </Text>
            <Pressable
              onPress={() => setFormVisible(true)}
              accessibilityRole="button"
              style={({ pressed }) => [styles.emptyButton, pressed && styles.pressed]}
            >
              <Ionicons name="add" size={21} color="#FFFFFF" />
              <Text style={styles.emptyButtonText}>Track your first application</Text>
            </Pressable>
          </View>
        }
      />

      <ApplicationForm
        visible={formVisible}
        onClose={() => setFormVisible(false)}
        onSubmit={(application) =>
          setApplications((current) => [application, ...current])
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    minHeight: 66,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
  },
  headerIconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  headerTitle: { flex: 1, marginLeft: 12, color: "#FFFFFF", fontSize: 19, fontWeight: "800" },
  addButton: {
    minHeight: 42,
    paddingHorizontal: 14,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.48)",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  addButtonText: { marginLeft: 4, color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  listContent: { padding: 20, paddingBottom: 38 },
  emptyListContent: { flexGrow: 1 },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", paddingBottom: 64 },
  emptyIcon: {
    width: 82,
    height: 82,
    borderRadius: 41,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primarySoft,
  },
  emptyTitle: { marginTop: 20, color: COLORS.text, fontSize: 19, fontWeight: "800", textAlign: "center" },
  emptyDescription: {
    maxWidth: 390,
    marginTop: 9,
    color: COLORS.secondary,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },
  emptyButton: {
    minHeight: 54,
    marginTop: 25,
    paddingHorizontal: 22,
    borderRadius: 27,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
  },
  emptyButtonText: { marginLeft: 7, color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  cardSeparator: { height: 14 },
  card: {
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    shadowColor: "#172033",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 2,
  },
  cardTopRow: { flexDirection: "row", alignItems: "flex-start" },
  cardIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primarySoft,
  },
  cardHeading: { flex: 1, marginLeft: 13 },
  cardUniversity: { color: COLORS.text, fontSize: 16, lineHeight: 22, fontWeight: "800" },
  cardCourse: { marginTop: 3, color: COLORS.secondary, fontSize: 13, lineHeight: 19 },
  cardDivider: { height: 1, marginVertical: 15, backgroundColor: COLORS.border },
  cardDetailsRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  statusBadge: { flexShrink: 1, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 999, flexDirection: "row", alignItems: "center", backgroundColor: COLORS.input },
  statusBadgeText: { marginLeft: 7, color: COLORS.text, fontSize: 12, fontWeight: "700" },
  dateRow: { flexDirection: "row", alignItems: "center" },
  dateText: { marginLeft: 5, color: COLORS.secondary, fontSize: 12 },
  cardNotes: { marginTop: 13, color: COLORS.secondary, fontSize: 13, lineHeight: 19 },
  pressed: { opacity: 0.7 },
  modalRoot: { flex: 1, justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(15, 23, 42, 0.48)" },
  sheet: {
    maxHeight: "91%",
    overflow: "hidden",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: COLORS.surface,
  },
  sheetHandle: { width: 42, height: 4, marginTop: 10, alignSelf: "center", borderRadius: 2, backgroundColor: "#CBD5E1" },
  sheetHeader: {
    minHeight: 58,
    paddingHorizontal: 22,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sheetTitle: { color: COLORS.text, fontSize: 19, fontWeight: "800" },
  formContent: { paddingHorizontal: 22, paddingTop: 4, paddingBottom: 34 },
  label: { marginTop: 18, marginBottom: 8, color: COLORS.text, fontSize: 13, fontWeight: "700" },
  inputShell: {
    minHeight: 54,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.input,
  },
  inputError: { borderColor: COLORS.danger },
  input: { flex: 1, minHeight: 52, marginLeft: 9, color: COLORS.text, fontSize: 14 },
  errorText: { marginTop: 6, color: COLORS.danger, fontSize: 12 },
  selectText: { flex: 1, marginLeft: 9, color: COLORS.text, fontSize: 14, fontWeight: "600" },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  optionMenu: { marginTop: 7, overflow: "hidden", borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface },
  universityOptions: { maxHeight: 190 },
  option: { minHeight: 48, paddingHorizontal: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: COLORS.border, flexDirection: "row", alignItems: "center" },
  optionPressed: { backgroundColor: COLORS.primarySoft },
  optionText: { flex: 1, color: COLORS.text, fontSize: 13, fontWeight: "600" },
  optionMeta: { marginLeft: 8, color: COLORS.muted, fontSize: 11, fontWeight: "700" },
  statusOptionText: { flex: 1, marginLeft: 9, color: COLORS.text, fontSize: 13, fontWeight: "600" },
  noOptions: { padding: 15, color: COLORS.muted, fontSize: 13, textAlign: "center" },
  notesShell: { minHeight: 92, alignItems: "flex-start" },
  notesInput: { minHeight: 88, marginLeft: 0, paddingTop: 14 },
  submitButton: { minHeight: 56, marginTop: 24, borderRadius: 28, alignItems: "center", justifyContent: "center", backgroundColor: COLORS.primary },
  submitButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
});
