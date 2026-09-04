import React, { useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";

import { universities } from "../data/universities";

const GREEN = "rgba(8, 76, 70, 0.88)";
const FILTERS = ["All", "Bursaries", "Universities", "New Content", "Announcements"];

const MOCK_NOTIFICATIONS = [
  {
    id: "wits-closing-30-days",
    category: "Universities",
    eyebrow: "UNIVERSITY APPLICATION",
    title: "Wits applications close in 30 days",
    description: "Complete your application and upload the required documents before the deadline.",
    time: "Today",
    icon: "business",
    universityId: "wits",
  },
  {
    id: "nsfas-reminder",
    category: "Bursaries",
    eyebrow: "BURSARY",
    title: "Remember to check your NSFAS application",
    description: "Review your application status and make sure all supporting documents are submitted.",
    time: "2d ago",
    icon: "wallet",
    routeName: "NsfasDetails",
  },
  {
    id: "new-university-guides",
    category: "New Content",
    eyebrow: "NEW CONTENT",
    title: "University profiles have been updated",
    description: "Explore campus information, representative courses and application guidance.",
    time: "4d ago",
    icon: "sparkles",
    routeName: "Home",
    screen: "Universities",
  },
  {
    id: "preferences-tip",
    category: "Announcements",
    eyebrow: "ANNOUNCEMENT",
    title: "Choose the alerts you want to receive",
    description: "You can update your notification preferences at any time.",
    time: "1w ago",
    icon: "notifications",
    routeName: "NotificationPreferences",
  },
];

export default function Notifications({ navigation }) {
  const [activeFilter, setActiveFilter] = useState("All");
  const filteredNotifications = useMemo(
    () => activeFilter === "All"
      ? MOCK_NOTIFICATIONS
      : MOCK_NOTIFICATIONS.filter(({ category }) => category === activeFilter),
    [activeFilter],
  );

  const openNotification = (notification) => {
    if (notification.universityId) {
      const selectedUniversity = universities.find(
        ({ id }) => id === notification.universityId,
      );
      if (selectedUniversity) {
        navigation.navigate("UniversityDetails", { university: selectedUniversity });
      }
      return;
    }

    if (notification.screen) {
      navigation.navigate(notification.routeName, { screen: notification.screen });
      return;
    }

    if (notification.routeName) navigation.navigate(notification.routeName);
  };

  const renderNotification = ({ item }) => (
    <View style={styles.notificationCard}>
      <View style={styles.notificationTopRow}>
        <View style={styles.notificationIcon}>
          <Ionicons name={item.icon} size={21} color={GREEN} />
        </View>
        <View style={styles.titleWrap}>
          <Text style={styles.eyebrow}>{item.eyebrow}</Text>
          <Text style={styles.notificationTitle}>{item.title}</Text>
        </View>
        <Text style={styles.time}>{item.time}</Text>
      </View>
      <Text style={styles.description}>{item.description}</Text>
      <Pressable
        onPress={() => openNotification(item)}
        accessibilityRole="button"
        accessibilityLabel={`View details for ${item.title}`}
        style={({ pressed }) => [styles.detailsButton, pressed && styles.pressed]}
      >
        <Text style={styles.detailsButtonText}>View details</Text>
        <Ionicons name="arrow-forward" size={16} color={GREEN} />
      </Pressable>
    </View>
  );

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
        <View style={styles.headerCopy}>
          <Text style={styles.headerTitle}>Notifications</Text>
          <Text style={styles.headerSubtitle}>Your recent notifications</Text>
        </View>
      </View>

      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotification}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filters}
          >
            {FILTERS.map((filter) => {
              const selected = filter === activeFilter;
              return (
                <Pressable
                  key={filter}
                  onPress={() => setActiveFilter(filter)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  style={({ pressed }) => [
                    styles.filterChip,
                    selected && styles.filterChipSelected,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={[styles.filterText, selected && styles.filterTextSelected]}>
                    {filter}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={34} color="#6F7B8D" />
            <Text style={styles.emptyTitle}>No notifications here</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: GREEN },
  header: {
    minHeight: 70,
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
  headerCopy: { flex: 1, minWidth: 0, marginLeft: 12 },
  headerTitle: { color: "#FFFFFF", fontSize: 20, fontWeight: "900" },
  headerSubtitle: { marginTop: 2, color: "rgba(255,255,255,0.90)", fontSize: 12 },
  list: { flex: 1, backgroundColor: "#b7bbbe" },
  listContent: { paddingHorizontal: 15, paddingBottom: 38 },
  filters: { paddingTop: 10, paddingBottom: 12, gap: 8 },
  filterChip: {
    minHeight: 34,
    paddingHorizontal: 15,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#078D3B",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GREEN,
  },
  filterChipSelected: { borderColor: GREEN, backgroundColor: GREEN },
  filterText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
  filterTextSelected: { color: "#FFFFFF" },
  notificationCard: {
    padding: 15,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#078D3B",
    backgroundColor: GREEN,
  },
  notificationTopRow: { flexDirection: "row", alignItems: "flex-start" },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  titleWrap: { flex: 1, minWidth: 0, marginHorizontal: 11 },
  eyebrow: { color: "#f3f6fa", fontSize: 9, fontWeight: "800", letterSpacing: 0.7 },
  notificationTitle: { marginTop: 4, color: "#FFFFFF", fontSize: 15, lineHeight: 20, fontWeight: "900" },
  time: { color: "#f6f7f8", fontSize: 10 },
  description: { marginTop: 13, color: "#ffffff", fontSize: 13, lineHeight: 20 },
  detailsButton: {
    alignSelf: "flex-end",
    minHeight: 36,
    marginTop: 12,
    paddingHorizontal: 12,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#078D3B",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#f5f8f7",
  },
  detailsButtonText: { color: GREEN, fontSize: 12, fontWeight: "800" },
  separator: { height: 11 },
  emptyState: { paddingVertical: 70, alignItems: "center" },
  emptyTitle: { marginTop: 12, color: "#96A1B0", fontSize: 15, fontWeight: "700" },
  pressed: { opacity: 0.68 },
});
