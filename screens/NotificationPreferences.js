import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";

const GREEN = "rgba(8, 76, 70, 0.88)";

const PREFERENCE_OPTIONS = [
  {
    id: "bursaries",
    title: "Bursaries",
    description: "Deadline reminders and new bursary alerts",
  },
  {
    id: "applications",
    title: "University Applications",
    description: "Application opening and closing reminders",
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
  const [preferences, setPreferences] = useState(() =>
    Object.fromEntries(PREFERENCE_OPTIONS.map(({ id }) => [id, true])),
  );

  const togglePreference = (id) => {
    setPreferences((current) => ({ ...current, [id]: !current[id] }));
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar style="light" />

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
          <Ionicons name="notifications-outline" size={22} color={GREEN} />
          <Text style={styles.infoText}>
            Stay on top of bursary deadlines and application dates. We only
            send notifications that matter.
          </Text>
        </View>

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
                <Ionicons name="notifications-outline" size={21} color={GREEN} />
              </View>
              <View style={styles.preferenceCopy}>
                <Text style={styles.preferenceTitle}>{option.title}</Text>
                <Text style={styles.preferenceDescription}>{option.description}</Text>
              </View>
              <Switch
                value={preferences[option.id]}
                onValueChange={() => togglePreference(option.id)}
                accessibilityLabel={`${option.title} notifications`}
                trackColor={{ false: "#38414E", true: GREEN }}
                thumbColor={preferences[option.id] ? "#0B8F98" : "#AAB2BE"}
                ios_backgroundColor="#38414E"
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: GREEN },
  header: {
    minHeight: 64,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: GREEN,
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
  scrollView: { flex: 1, backgroundColor: "#c7c9cc" },
  content: { padding: 20, paddingBottom: 42 },
  infoCard: {
    padding: 17,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#078D3B",
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: GREEN,
  },
  infoText: { flex: 1, marginLeft: 14, color: "#D7DFE8", fontSize: 14, lineHeight: 21 },
  preferencesCard: {
    overflow: "hidden",
    marginTop: 20,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "#078D3B",
    backgroundColor: GREEN,
  },
  preferenceRow: {
    minHeight: 76,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  rowDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#313945" },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#dee4e1",
  },
  preferenceCopy: { flex: 1, minWidth: 0, marginHorizontal: 14 },
  preferenceTitle: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  preferenceDescription: { marginTop: 4, color: "#ffffff", fontSize: 12, lineHeight: 17 },
  pressed: { opacity: 0.65 },
});
