import React, { useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { usePreventRemove } from "@react-navigation/native";
import {
  ActivityIndicator,
  Alert,
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

import { useProfile } from "../context/ProfileContext";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SA_PHONE_PATTERN = /^(?:\+?27|0)\d{9}$/;
const CATEGORIES = [
  "Matric Learner",
  "Grade 11 Learner",
  "Grade 10 Learner",
  "University Student",
  "Graduate",
  "Other",
];

function normalizedValues(values) {
  return {
    email: values.email.trim().toLowerCase(),
    firstName: values.firstName.trim().replace(/\s+/g, " "),
    surname: values.surname.trim().replace(/\s+/g, " "),
    phone: values.phone.trim().replace(/\s+/g, " "),
    category: values.category.trim(),
  };
}

function validate(values) {
  const nextErrors = {};
  const normalized = normalizedValues(values);
  const compactPhone = normalized.phone.replace(/[\s()-]/g, "");

  if (!normalized.email) nextErrors.email = "Email address is required.";
  else if (!EMAIL_PATTERN.test(normalized.email)) {
    nextErrors.email = "Enter a valid email address.";
  }
  if (!normalized.firstName) nextErrors.firstName = "First name is required.";
  if (!normalized.surname) nextErrors.surname = "Surname is required.";
  if (compactPhone && !SA_PHONE_PATTERN.test(compactPhone)) {
    nextErrors.phone = "Enter a valid South African phone number.";
  }
  if (!normalized.category) nextErrors.category = "Select a category.";
  return nextErrors;
}

function FieldError({ message, styles }) {
  if (!message) return null;
  return (
    <View style={styles.errorRow} accessibilityRole="alert">
      <Ionicons name="alert-circle-outline" size={16} color="#FF6B6B" />
      <Text style={styles.errorText}>{message}</Text>
    </View>
  );
}

function EditableField({
  label,
  value,
  error,
  optional,
  icon,
  keyboardType,
  autoComplete,
  returnKeyType,
  onChangeText,
  onBlur,
  styles,
}) {
  const { colors } = useProfile();
  return (
    <View style={styles.fieldBlock}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {optional && <Text style={styles.optional}>Optional</Text>}
      </View>
      <View style={[styles.inputShell, error && styles.inputShellError]}>
        <Ionicons name={icon} size={19} color={colors.mutedText} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          keyboardType={keyboardType}
          autoComplete={autoComplete}
          autoCapitalize={
            keyboardType === "email-address" || keyboardType === "phone-pad"
              ? "none"
              : "words"
          }
          autoCorrect={false}
          returnKeyType={returnKeyType}
          accessibilityLabel={label}
          style={styles.input}
        />
      </View>
      <FieldError message={error} styles={styles} />
    </View>
  );
}

export default function EditProfileScreen({ navigation }) {
  const { profile, updateProfile, colors, resolvedTheme } = useProfile();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [form, setForm] = useState({
    email: profile.email,
    firstName: profile.firstName,
    surname: profile.surname,
    phone: profile.phone,
    category: profile.category,
  });
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [allowNavigation, setAllowNavigation] = useState(false);

  const normalizedForm = normalizedValues(form);
  const normalizedInitial = normalizedValues(profile);
  const errors = validate(form);
  const hasChanges = Object.keys(normalizedForm).some(
    (key) => normalizedForm[key] !== normalizedInitial[key],
  );
  const isValid = Object.keys(errors).length === 0;

  usePreventRemove(hasChanges && !allowNavigation, ({ data }) => {
    Alert.alert(
      "Discard changes?",
      "You have unsaved changes. Are you sure you want to leave?",
      [
        { text: "Keep Editing", style: "cancel" },
        {
          text: "Discard",
          style: "destructive",
          onPress: () => {
            setAllowNavigation(true);
            requestAnimationFrame(() => navigation.dispatch(data.action));
          },
        },
      ],
    );
  });

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const visibleError = (field) =>
    touched[field] || submitted ? errors[field] : "";

  const handleSave = async () => {
    if (saving) return;
    setSubmitted(true);
    if (!hasChanges || !isValid) return;

    setSaving(true);
    // Frontend-only pause; replace with the real profile update request later.
    await new Promise((resolve) => setTimeout(resolve, 450));
    updateProfile({ ...profile, ...normalizedForm });
    setAllowNavigation(true);
    setSaving(false);
    requestAnimationFrame(() => navigation.goBack());
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={resolvedTheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Back to My Profile"
          hitSlop={6}
          style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Personal Details</Text>
            <Text style={styles.formIntro}>
              Keep your information accurate so CareerCompass can personalise your
              experience.
            </Text>

            <EditableField
              label="Email Address"
              value={form.email}
              error={visibleError("email")}
              icon="mail-outline"
              keyboardType="email-address"
              autoComplete="email"
              returnKeyType="next"
              onChangeText={(value) => updateField("email", value)}
              onBlur={() => setTouched((current) => ({ ...current, email: true }))}
              styles={styles}
            />
            <EditableField
              label="First Name"
              value={form.firstName}
              error={visibleError("firstName")}
              icon="person-outline"
              autoComplete="given-name"
              returnKeyType="next"
              onChangeText={(value) => updateField("firstName", value)}
              onBlur={() =>
                setTouched((current) => ({ ...current, firstName: true }))
              }
              styles={styles}
            />
            <EditableField
              label="Surname"
              value={form.surname}
              error={visibleError("surname")}
              icon="person-outline"
              autoComplete="family-name"
              returnKeyType="next"
              onChangeText={(value) => updateField("surname", value)}
              onBlur={() =>
                setTouched((current) => ({ ...current, surname: true }))
              }
              styles={styles}
            />
            <EditableField
              label="Phone Number"
              value={form.phone}
              error={visibleError("phone")}
              optional
              icon="call-outline"
              keyboardType="phone-pad"
              autoComplete="tel"
              returnKeyType="done"
              onChangeText={(value) => updateField("phone", value)}
              onBlur={() => setTouched((current) => ({ ...current, phone: true }))}
              styles={styles}
            />

            <View style={styles.fieldBlock}>
              <Text style={styles.label}>Category</Text>
              <Pressable
                onPress={() => setCategoryOpen(true)}
                accessibilityRole="button"
                accessibilityLabel={`Category, ${form.category || "not selected"}`}
                style={({ pressed }) => [
                  styles.inputShell,
                  visibleError("category") && styles.inputShellError,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons name="school-outline" size={19} color={colors.mutedText} />
                <Text
                  style={[
                    styles.categoryValue,
                    !form.category && styles.categoryPlaceholder,
                  ]}
                >
                  {form.category || "Select a category"}
                </Text>
                <Ionicons name="chevron-down" size={19} color={colors.mutedText} />
              </Pressable>
              <FieldError message={visibleError("category")} styles={styles} />
            </View>

            <Pressable
              onPress={handleSave}
              disabled={!hasChanges || saving}
              accessibilityRole="button"
              accessibilityLabel="Save Changes"
              accessibilityState={{ disabled: !hasChanges || saving, busy: saving }}
              style={({ pressed }) => [
                styles.saveButton,
                (!hasChanges || saving) && styles.saveButtonDisabled,
                pressed && hasChanges && !saving && styles.pressed,
              ]}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </Pressable>
            <Pressable
              onPress={() => navigation.goBack()}
              disabled={saving}
              accessibilityRole="button"
              accessibilityLabel="Cancel editing"
              style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={categoryOpen}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setCategoryOpen(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setCategoryOpen(false)}
          accessibilityLabel="Close category menu"
        >
          <Pressable
            style={styles.categorySheet}
            onPress={(event) => event.stopPropagation()}
          >
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Select your category</Text>
            {CATEGORIES.map((category) => {
              const selected = category === form.category;
              return (
                <Pressable
                  key={category}
                  onPress={() => {
                    updateField("category", category);
                    setTouched((current) => ({ ...current, category: true }));
                    setCategoryOpen(false);
                  }}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  style={({ pressed }) => [
                    styles.categoryOption,
                    selected && styles.categoryOptionSelected,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryOptionText,
                      selected && styles.categoryOptionTextSelected,
                    ]}
                  >
                    {category}
                  </Text>
                  {selected && (
                    <Ionicons name="checkmark-circle" size={21} color={colors.primary} />
                  )}
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    header: { minHeight: 66, paddingHorizontal: 20, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border, flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.background },
    headerButton: { width: 46, height: 46, borderRadius: 23, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center", backgroundColor: colors.surface },
    headerSpacer: { width: 46, height: 46 },
    headerTitle: { color: colors.text, fontSize: 19, fontWeight: "800" },
    keyboardView: { flex: 1 },
    scrollContent: { flexGrow: 1, width: "100%", maxWidth: 560, alignSelf: "center", paddingHorizontal: 20, paddingTop: 20, paddingBottom: 46 },
    formCard: { padding: 20, borderRadius: 22, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
    formTitle: { color: colors.text, fontSize: 21, fontWeight: "800" },
    formIntro: { marginTop: 6, color: colors.secondaryText, fontSize: 13, lineHeight: 20 },
    fieldBlock: { marginTop: 20 },
    labelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    label: { marginBottom: 8, color: colors.secondaryText, fontSize: 13, fontWeight: "700" },
    optional: { marginBottom: 8, color: colors.mutedText, fontSize: 11 },
    inputShell: { minHeight: 58, paddingHorizontal: 14, borderRadius: 15, borderWidth: 1, borderColor: colors.border, flexDirection: "row", alignItems: "center", backgroundColor: colors.input },
    inputShellError: { borderColor: colors.danger, borderWidth: 1.5 },
    input: { flex: 1, minHeight: 56, marginLeft: 10, color: colors.text, fontSize: 15 },
    errorRow: { marginTop: 7, flexDirection: "row", alignItems: "flex-start" },
    errorText: { flex: 1, marginLeft: 6, color: colors.danger, fontSize: 12, lineHeight: 18 },
    categoryValue: { flex: 1, marginHorizontal: 10, color: colors.text, fontSize: 15 },
    categoryPlaceholder: { color: colors.mutedText },
    saveButton: { minHeight: 58, marginTop: 27, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: colors.primary },
    saveButtonDisabled: { opacity: 0.42 },
    saveButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
    cancelButton: { minHeight: 48, marginTop: 8, alignItems: "center", justifyContent: "center" },
    cancelText: { color: colors.primary, fontSize: 14, fontWeight: "800" },
    modalBackdrop: { flex: 1, justifyContent: "flex-end", padding: 16, backgroundColor: "rgba(5, 8, 13, 0.66)" },
    categorySheet: { width: "100%", maxWidth: 560, alignSelf: "center", padding: 18, borderRadius: 24, backgroundColor: colors.surface },
    modalHandle: { width: 42, height: 4, alignSelf: "center", borderRadius: 2, backgroundColor: colors.border },
    modalTitle: { marginTop: 15, marginBottom: 8, color: colors.text, fontSize: 18, fontWeight: "800" },
    categoryOption: { minHeight: 52, paddingHorizontal: 12, borderRadius: 13, flexDirection: "row", alignItems: "center" },
    categoryOptionSelected: { backgroundColor: colors.primarySoft },
    categoryOptionText: { flex: 1, color: colors.text, fontSize: 14, fontWeight: "600" },
    categoryOptionTextSelected: { color: colors.primary, fontWeight: "800" },
    pressed: { opacity: 0.65 },
  });
}
