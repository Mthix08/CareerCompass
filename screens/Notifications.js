import React, { useEffect, useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { FlatList, Pressable, ScrollView, StyleSheet,  View } from "react-native";
import Text from '../components/TranslatedText';
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";

import { loadCollection } from "../data/firestoreContent";
import { universities } from "../data/universities";
import { useProfile } from "../context/ProfileContext";

const FILTERS = ["All", "Bursaries", "Universities", "New Content", "Announcements"];

// NEW: turns the Firestore createdAt timestamp into "Today", "2d ago", "1w ago"
function formatTimeAgo(createdAt) {
  const date = createdAt?.toDate
    ? createdAt.toDate()
    : typeof createdAt?.seconds === "number"
      ? new Date(createdAt.seconds * 1000)
      : null;
  if (!date) return "";
  const days = Math.floor((Date.now() - date.getTime()) / (24 * 60 * 60 * 1000));
  if (days < 1) return "Today";
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

export default function Notifications({ navigation }) {
  const { colors, resolvedTheme } = useProfile();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [activeFilter, setActiveFilter] = useState("All");
  // CHANGED: notifications now come from the Firestore "notifications" collection
  // (with an AsyncStorage copy for offline) instead of a hardcoded array.
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    let active = true;
    loadCollection("notifications", { sortBy: "createdAt", descending: true }).then(
      (items) => {
        if (active) setNotifications(items);
      },
    );
    return () => {
      active = false;
    };
  }, []);

  const filteredNotifications = useMemo(
    () => activeFilter === "All"
      ? notifications
      : notifications.filter(({ category }) => category === activeFilter),
    [activeFilter, notifications],
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

    if (notification.routeName) navigation.navigate(notification.routeName, notification.fundingId ? { fundingId: notification.fundingId } : undefined);
  };

  const renderNotification = ({ item }) => (
    <View style={styles.notificationCard}>
      <View style={styles.notificationTopRow}>
        <View style={styles.notificationIcon}>
          <Ionicons name={item.icon} size={21} color={colors.primary} />
        </View>
        <View style={styles.titleWrap}>
          <Text style={styles.eyebrow}>{item.eyebrow}</Text>
          <Text style={styles.notificationTitle}>{item.title}</Text>
        </View>
        <Text style={styles.time}>{formatTimeAgo(item.createdAt)}</Text>
      </View>
      <Text style={styles.description}>{item.description}</Text>
      <Pressable
        onPress={() => openNotification(item)}
        accessibilityRole="button"
        accessibilityLabel={`View details for ${item.title}`}
        style={({ pressed }) => [styles.detailsButton, pressed && styles.pressed]}
      >
        <Text style={styles.detailsButtonText}>View details</Text>
        <Ionicons name="arrow-forward" size={16} color={colors.primary} />
      </Pressable>
    </View>
  );

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
            <Ionicons name="notifications-off-outline" size={34} color={colors.mutedText} />
            <Text style={styles.emptyTitle}>No notifications here</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: {
    minHeight: 70,
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
  headerCopy: { flex: 1, minWidth: 0, marginLeft: 12 },
  headerTitle: { color: "#FFFFFF", fontSize: 20, fontWeight: "900" },
  headerSubtitle: { marginTop: 2, color: "rgba(255,255,255,0.90)", fontSize: 12 },
  list: { flex: 1, backgroundColor: colors.background },
  listContent: { paddingHorizontal: 15, paddingBottom: 38 },
  filters: { paddingTop: 10, paddingBottom: 12, gap: 8 },
  filterChip: {
    minHeight: 34,
    paddingHorizontal: 15,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  filterChipSelected: { borderColor: colors.primary, backgroundColor: colors.primary },
  filterText: { color: colors.text, fontSize: 13, fontWeight: "800" },
  filterTextSelected: { color: "#FFFFFF" },
  notificationCard: {
    padding: 15,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  notificationTopRow: { flexDirection: "row", alignItems: "flex-start" },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primarySoft,
  },
  titleWrap: { flex: 1, minWidth: 0, marginHorizontal: 11 },
  eyebrow: { color: colors.mutedText, fontSize: 9, fontWeight: "800", letterSpacing: 0.7 },
  notificationTitle: { marginTop: 4, color: colors.text, fontSize: 15, lineHeight: 20, fontWeight: "900" },
  time: { color: colors.mutedText, fontSize: 10 },
  description: { marginTop: 13, color: colors.secondaryText, fontSize: 13, lineHeight: 20 },
  detailsButton: {
    alignSelf: "flex-end",
    minHeight: 36,
    marginTop: 12,
    paddingHorizontal: 12,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.primarySoft,
  },
  detailsButtonText: { color: colors.primary, fontSize: 12, fontWeight: "800" },
  separator: { height: 11 },
  emptyState: { paddingVertical: 70, alignItems: "center" },
  emptyTitle: { marginTop: 12, color: colors.secondaryText, fontSize: 15, fontWeight: "700" },
  pressed: { opacity: 0.68 },
  });
}