import React, { useEffect, useMemo, useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
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
  TextInput,
  View,
} from "react-native";
import Text from '../components/TranslatedText';
import { SafeAreaView } from "react-native-safe-area-context";

import { universities } from "../data/universities";
import { useProfile } from "../context/ProfileContext";
import { db } from "./firebaseConfig";

const APPLICATIONS_STORAGE_KEY = "@careercompass:applications:";
// NEW: changes made while offline wait here until they reach Firestore
const APPLICATIONS_PENDING_KEY = "@careercompass:applicationsPending:";

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

function ApplicationForm({ visible, application, onClose, onSubmit, onDelete }) {
  const { colors } = useProfile();
  const COLORS = useMemo(() => getThemeColors(colors), [colors]);
  const styles = useMemo(() => makeStyles(COLORS), [COLORS]);
  const [form, setForm] = useState(() =>
    application ? { ...initialForm, ...application } : initialForm,
  );
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
      id: application?.id || `${Date.now()}`,
      university: form.university.trim(),
      course: form.course.trim(),
      dateApplied: form.dateApplied.trim(),
      status: form.status,
      notes: form.notes.trim(),
    });
    closeForm();
  };

  // NEW: delete (the D in CRUD), with a confirmation
  const confirmDelete = () => {
    Alert.alert(
      "Delete application?",
      `Remove your application to ${application.university}? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            onDelete(application.id);
            closeForm();
          },
        },
      ],
    );
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
          <Text style={styles.sheetTitle}>
            {application ? "Edit Application" : "Track Application"}
          </Text>
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
              <Text style={styles.submitButtonText}>
                {application ? "Save Changes" : "Track Application"}
              </Text>
            </Pressable>

            {!!application && (
              <Pressable
                onPress={confirmDelete}
                accessibilityRole="button"
                accessibilityLabel="Delete application"
                style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}
              >
                <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
                <Text style={styles.deleteButtonText}>Delete application</Text>
              </Pressable>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function ApplicationCard({ application, onPress }) {
  const { colors } = useProfile();
  const COLORS = useMemo(() => getThemeColors(colors), [colors]);
  const styles = useMemo(() => makeStyles(COLORS), [COLORS]);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${application.university}, ${application.course}, status ${application.status.label}. Edit application`}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
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
    </Pressable>
  );
}

export default function Applications({ navigation }) {
  const [applications, setApplications] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [editingApplication, setEditingApplication] = useState(null);
  const [formSession, setFormSession] = useState(0);
  const [loadedScope, setLoadedScope] = useState(null);
  const { firebaseUser, setApplicationCount, colors, resolvedTheme } = useProfile();
  const COLORS = useMemo(() => getThemeColors(colors), [colors]);
  const styles = useMemo(() => makeStyles(COLORS), [COLORS]);
  const userId = firebaseUser?.uid ?? null;
  const storageScope = userId ?? "guest";
  // NEW: changes that have not reached Firestore yet (added/edited/deleted while offline)
  const pendingRef = useRef({ upserts: {}, deletes: [] });

  const savePending = () =>
    AsyncStorage.setItem(
      `${APPLICATIONS_PENDING_KEY}${storageScope}`,
      JSON.stringify(pendingRef.current),
    ).catch((error) => console.warn("Unable to save pending changes locally.", error));

  useEffect(() => {
    let isActive = true;
    let unsubscribe;

    // Sends anything saved while offline to Firestore. Nothing is awaited on purpose:
    // when the phone is offline the write simply waits until it is online again.
    const flushPending = () => {
      if (!userId) return;
      const { upserts, deletes } = pendingRef.current;
      Object.values(upserts).forEach((application) => {
        setDoc(doc(db, "users", userId, "applications", application.id), application)
          .then(() => {
            delete pendingRef.current.upserts[application.id];
            savePending();
          })
          .catch((error) => console.warn("Unable to sync application to Firestore.", error));
      });
      deletes.forEach((id) => {
        deleteDoc(doc(db, "users", userId, "applications", id))
          .then(() => {
            pendingRef.current.deletes = pendingRef.current.deletes.filter((item) => item !== id);
            savePending();
          })
          .catch((error) => console.warn("Unable to delete application in Firestore.", error));
      });
    };

    const loadApplications = async () => {
      let cachedApplications = [];
      try {
        const storedApplications = await AsyncStorage.getItem(
          `${APPLICATIONS_STORAGE_KEY}${storageScope}`,
        );
        cachedApplications = storedApplications ? JSON.parse(storedApplications) : [];
        if (isActive) setApplications(cachedApplications);
      } catch (error) {
        console.warn("Unable to load applications from local storage.", error);
      }

      try {
        const storedPending = await AsyncStorage.getItem(
          `${APPLICATIONS_PENDING_KEY}${storageScope}`,
        );
        pendingRef.current = storedPending
          ? JSON.parse(storedPending)
          : { upserts: {}, deletes: [] };
      } catch (error) {
        pendingRef.current = { upserts: {}, deletes: [] };
      }

      if (!isActive) return;
      setLoadedScope(storageScope);
      if (!userId) return;

      const applicationsRef = collection(db, "users", userId, "applications");
      try {
        const snapshot = await getDocs(applicationsRef);
        if (!isActive) return;
        if (snapshot.empty && cachedApplications.length) {
          await Promise.all(
            cachedApplications.map((application) =>
              setDoc(doc(db, "users", userId, "applications", application.id), application),
            ),
          );
        }
      } catch (error) {
        console.warn("Unable to load applications from Firestore.", error);
      }
      if (!isActive) return;

      // CHANGED: the live listener is attached even if the first read failed (offline),
      // so the list syncs by itself as soon as the phone is back online.
      unsubscribe = onSnapshot(
        applicationsRef,
        (nextSnapshot) => {
          if (!isActive) return;
          const merged = new Map(
            nextSnapshot.docs.map((application) => [application.id, application.data()]),
          );
          // changes made offline win over the older cloud copy
          pendingRef.current.deletes.forEach((id) => merged.delete(id));
          Object.values(pendingRef.current.upserts).forEach((application) =>
            merged.set(application.id, application),
          );
          const nextApplications = [...merged.values()];
          if (nextApplications.length || cachedApplications.length === 0) {
            setApplications(nextApplications);
          }
        },
        (error) => console.warn("Unable to sync applications from Firestore.", error),
      );
      flushPending();
    };

    loadApplications();

    return () => {
      isActive = false;
      unsubscribe?.();
    };
    // loadedScope is no longer a dependency: it made this whole effect run twice on every open
  }, [storageScope, userId]);

  useEffect(() => {
    if (loadedScope !== storageScope) return;
    AsyncStorage.setItem(
      `${APPLICATIONS_STORAGE_KEY}${storageScope}`,
      JSON.stringify(applications),
    ).catch((error) => console.warn("Unable to save applications locally.", error));
  }, [applications, loadedScope, storageScope]);

  useEffect(() => {
    if (loadedScope !== storageScope) return;
    setApplicationCount(applications.length).catch((error) =>
      console.warn("Unable to save application count to Firestore.", error),
    );
  }, [applications.length, loadedScope, setApplicationCount, storageScope]);

  const openNewApplication = () => {
    setEditingApplication(null);
    setFormVisible(true);
    setFormSession((current) => current + 1);
  };

  const openApplicationForEdit = (application) => {
    setEditingApplication(application);
    setFormVisible(true);
    setFormSession((current) => current + 1);
  };

  const saveApplication = (application) => {
    setApplications((current) =>
      editingApplication
        ? current.map((item) => item.id === application.id ? application : item)
        : [application, ...current],
    );
    if (userId) {
      // remembered as "pending" until Firestore confirms it, so an offline save is never lost
      pendingRef.current.upserts[application.id] = application;
      pendingRef.current.deletes = pendingRef.current.deletes.filter((id) => id !== application.id);
      savePending();
      setDoc(
        doc(db, "users", userId, "applications", application.id),
        application,
      )
        .then(() => {
          delete pendingRef.current.upserts[application.id];
          savePending();
        })
        .catch((error) => console.warn("Unable to sync application to Firestore.", error));
    }
  };

  // NEW: delete an application (local list + Firestore, also safe offline)
  const deleteApplication = (id) => {
    setApplications((current) => current.filter((item) => item.id !== id));
    if (userId) {
      delete pendingRef.current.upserts[id];
      if (!pendingRef.current.deletes.includes(id)) pendingRef.current.deletes.push(id);
      savePending();
      deleteDoc(doc(db, "users", userId, "applications", id))
        .then(() => {
          pendingRef.current.deletes = pendingRef.current.deletes.filter((item) => item !== id);
          savePending();
        })
        .catch((error) => console.warn("Unable to delete application in Firestore.", error));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={resolvedTheme === "dark" ? "light-content" : "dark-content"} backgroundColor={COLORS.primary} />
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={({ pressed }) => [styles.headerIconButton, pressed && styles.pressed]}
        >
          <Ionicons name="chevron-back" size={25} color={COLORS.onPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>My Applications</Text>
        <Pressable
          onPress={openNewApplication}
          accessibilityRole="button"
          accessibilityLabel="Add application"
          style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
        >
          <Ionicons name="add" size={20} color={COLORS.onPrimary} />
          <Text style={styles.addButtonText}>Add</Text>
        </Pressable>
      </View>

      <FlatList
        data={applications}
        keyExtractor={({ id }) => id}
        renderItem={({ item }) => (
          <ApplicationCard
            application={item}
            onPress={() => openApplicationForEdit(item)}
          />
        )}
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
              onPress={openNewApplication}
              accessibilityRole="button"
              style={({ pressed }) => [styles.emptyButton, pressed && styles.pressed]}
            >
              <Ionicons name="add" size={21} color={COLORS.onPrimary} />
              <Text style={styles.emptyButtonText}>Track your first application</Text>
            </Pressable>
          </View>
        }
      />

      <ApplicationForm
        key={formSession}
        visible={formVisible}
        application={editingApplication}
        onClose={() => {
          setFormVisible(false);
          setEditingApplication(null);
        }}
        onSubmit={saveApplication}
        onDelete={deleteApplication}
      />
    </SafeAreaView>
  );
}

function getThemeColors(colors) {
  return {
    ...colors,
    primaryDark: colors.primary,
    secondary: colors.secondaryText,
    muted: colors.mutedText,
  };
}

function makeStyles(COLORS) {
  return StyleSheet.create({
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
  headerTitle: { flex: 1, marginLeft: 12, color: COLORS.onPrimary, fontSize: 19, fontWeight: "800" },
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
  addButtonText: { marginLeft: 4, color: COLORS.onPrimary, fontSize: 14, fontWeight: "800" },
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
  emptyButtonText: { marginLeft: 7, color: COLORS.onPrimary, fontSize: 14, fontWeight: "800" },
  cardSeparator: { height: 14 },
  card: {
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    shadowColor: COLORS.text,
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
  sheetHandle: { width: 42, height: 4, marginTop: 10, alignSelf: "center", borderRadius: 2, backgroundColor: COLORS.border },
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
  submitButtonText: { color: COLORS.onPrimary, fontSize: 15, fontWeight: "800" },
  deleteButton: { minHeight: 52, marginTop: 14, borderRadius: 26, borderWidth: 1, borderColor: COLORS.danger, flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: COLORS.dangerSoft },
  deleteButtonText: { marginLeft: 7, color: COLORS.danger, fontSize: 14, fontWeight: "800" },
  });
}