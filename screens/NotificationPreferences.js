import React, { useEffect, useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Alert, Pressable, ScrollView, StyleSheet, Switch, View } from "react-native";
import Text from '../components/TranslatedText';
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { useProfile } from "../context/ProfileContext";
import { loadCollection } from "../data/firestoreContent";
import {
  getDeadlineNotificationPermission,
  requestDeadlineNotificationPermission,
  syncDeadlineReminders,
} from "../services/deadlineNotifications";

const PREFERENCE_OPTIONS = [
  {
    id: "bursaries",
    title: "Bursaries",
    description: "Deadline reminders and new bursary alerts",
  },
  {
    id: "applications",
    title: "University Applications",
    description: "Phone reminders five days before confirmed closing dates",
  },
  {
    id: "content",
    title: "New Content",
    description: "New qualifications and bursaries added",
  },
  {
    id: "announcements",
    title: "Announcements",
    description: "General updates from CareerCompass",
  },
];

export default function NotificationPreferences({ navigation }) {
  const { profile, updateProfile, colors, resolvedTheme } = useProfile();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [preferences, setPreferences] = useState(() =>
    Object.fromEntries(PREFERENCE_OPTIONS.map(({ id }) => [id, true])),
  );
  const [phonePermission, setPhonePermission] = useState(false);
  const [requestingPermission, setRequestingPermission] = useState(false);

  useEffect(() => {
    if (profile?.notificationPreferences) {
      setPreferences((current) => ({
        ...current,
        ...profile.notificationPreferences,
      }));
    }
  }, [profile?.notificationPreferences]);

  useEffect(() => {
    getDeadlineNotificationPermission().then(setPhonePermission).catch(() => setPhonePermission(false));
  }, []);

  const enablePhoneNotifications = async () => {
    if (requestingPermission) return;
    setRequestingPermission(true);
    try {
      const granted = await requestDeadlineNotificationPermission();
      setPhonePermission(granted);
      if (!granted) {
        Alert.alert("Notifications are off", "Allow notifications in your device settings to receive deadline reminders.");
        return;
      }
      const deadlines = await loadCollection("applicationDeadlines");
      const count = await syncDeadlineReminders(deadlines, preferences.applications !== false);
      Alert.alert("Phone reminders enabled", count
        ? `We’ll remind you five days before ${count} upcoming application deadline${count === 1 ? "" : "s"}.`
        : "Notifications are enabled. Reminders will be scheduled when upcoming confirmed deadlines are available.");
    } catch (error) {
      Alert.alert("Could not enable reminders", error.message || "Please try again from notification settings.");
    } finally {
      setRequestingPermission(false);
    }
  };

  const togglePreference = (id) => {
    setPreferences((current) => {
      const next = { ...current, [id]: !current[id] };
      updateProfile({ ...profile, notificationPreferences: next }).catch(() => {});
      if (id === "applications" && phonePermission) {
        loadCollection("applicationDeadlines")
          .then((deadlines) => syncDeadlineReminders(deadlines, next.applications))
          .catch((error) => console.warn("Unable to update deadline reminders.", error));
      }
      return next;
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar style={resolvedTheme === "dark" ? "light" : "dark"} />

      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={8}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <Ionicons name="chevron-back" size={25} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle}>Notification Settings</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.infoCard}>
          <Ionicons name="notifications-outline" size={22} color={colors.primary} />
          <Text style={styles.infoText}>
            Stay on top of bursary deadlines and application dates. We only
            send notifications that matter.
          </Text>
        </View>

        <Pressable
          onPress={enablePhoneNotifications}
          disabled={requestingPermission || phonePermission}
          accessibilityRole="button"
          style={({ pressed }) => [styles.phoneButton, (requestingPermission || phonePermission) && styles.phoneButtonDisabled, pressed && styles.pressed]}
        >
          <Ionicons name={phonePermission ? "notifications" : "notifications-outline"} size={20} color={phonePermission ? colors.primary : "#FFFFFF"} />
          <Text style={[styles.phoneButtonText, phonePermission && styles.phoneButtonTextEnabled]}>
            {requestingPermission ? "Enabling phone reminders…" : phonePermission ? "Phone reminders are enabled" : "Enable phone reminders"}
          </Text>
          {!phonePermission && <Ionicons name="arrow-forward" size={17} color="#FFFFFF" />}
        </Pressable>

        <View style={styles.preferencesCard}>
          {PREFERENCE_OPTIONS.map((option, index) => (
            <View
              key={option.id}
              style={[
                styles.preferenceRow,
                index < PREFERENCE_OPTIONS.length - 1 && styles.rowDivider,
              ]}
            >
              <View style={styles.iconWrap}>
                <Ionicons name="notifications-outline" size={21} color={colors.primary} />
              </View>
              <View style={styles.preferenceCopy}>
                <Text style={styles.preferenceTitle}>{option.title}</Text>
                <Text style={styles.preferenceDescription}>{option.description}</Text>
              </View>
              <Switch
                value={preferences[option.id]}
                onValueChange={() => togglePreference(option.id)}
                accessibilityLabel={`${option.title} notifications`}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={preferences[option.id] ? colors.surface : colors.mutedText}
                ios_backgroundColor={colors.border}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: {
    minHeight: 64,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.20)",
  },
  headerTitle: { marginLeft: 12, color: "#FFFFFF", fontSize: 20, fontWeight: "900" },
  scrollView: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 42 },
  infoCard: {
    padding: 17,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.surface,
  },
  infoText: { flex: 1, marginLeft: 14, color: "#D7DFE8", fontSize: 14, lineHeight: 21 },
  phoneButton: { minHeight: 50, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9, marginTop: 14, paddingHorizontal: 14, borderRadius: 14, backgroundColor: colors.primary },
  phoneButtonDisabled: { backgroundColor: colors.primarySoft },
  phoneButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  phoneButtonTextEnabled: { color: colors.primary },
  preferencesCard: {
    overflow: "hidden",
    marginTop: 20,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  preferenceRow: {
    minHeight: 76,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  rowDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primarySoft,
  },
  preferenceCopy: { flex: 1, minWidth: 0, marginHorizontal: 14 },
  preferenceTitle: { color: colors.text, fontSize: 15, fontWeight: "800" },
  preferenceDescription: { marginTop: 4, color: colors.secondaryText, fontSize: 12, lineHeight: 17 },
  pressed: { opacity: 0.65 },
  });
}
