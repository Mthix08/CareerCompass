import React, { useEffect, useMemo, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  Alert,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useBookmarks } from "../context/BookmarksContext";
import { useProfile } from "../context/ProfileContext";

const THEMES = ["Light", "Dark", "System"];

function IconButton({ icon, label, onPress, styles }) {
  const { colors } = useProfile();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
    >
      <Ionicons name={icon} size={22} color={colors.text} />
    </Pressable>
  );
}

function ReadOnlyDetail({ icon, label, value, styles }) {
  const { colors } = useProfile();
  return (
    <View
      style={styles.detailRow}
      accessible
      accessibilityLabel={`${label}: ${value}`}
    >
      <View style={styles.detailIcon}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <View style={styles.detailTextWrap}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value || "Not provided"}</Text>
      </View>
    </View>
  );
}

function QuickLink({ icon, label, badge, onPress, styles }) {
  const { colors } = useProfile();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}${badge ? `, ${badge}` : ""}`}
      style={({ pressed }) => [styles.quickLink, pressed && styles.pressed]}
    >
      <View style={styles.quickLinkIcon}>
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>
      <Text style={styles.quickLinkText}>{label}</Text>
      {!!badge && (
        <View style={styles.quickLinkBadge}>
          <Text style={styles.quickLinkBadgeText}>{badge}</Text>
        </View>
      )}
      <Ionicons name="chevron-forward" size={19} color={colors.mutedText} />
    </Pressable>
  );
}

export default function ProfileScreen({ navigation }) {
  const { bookmarkedIds } = useBookmarks();
  const {
    profile,
    themePreference,
    setThemePreference,
    resolvedTheme,
    colors,
    successMessage,
    clearSuccessMessage,
  } = useProfile();
  const savedItemsLabel = `${bookmarkedIds.length} saved`;
  const styles = useMemo(() => createStyles(colors), [colors]);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!successMessage) return undefined;
    const timer = setTimeout(clearSuccessMessage, 2600);
    return () => clearTimeout(timer);
  }, [clearSuccessMessage, successMessage]);

  const handleAvatarPress = () => {
    // TODO: Connect an image picker and profile-image upload later.
    Alert.alert(
      "Change profile photo",
      "Photo selection will be added when profile uploads are connected.",
    );
  };

  const handleSignOut = () => {
    Alert.alert("Sign out?", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => {
          // TODO: Connect the real authentication sign-out action later.
          navigation.getParent()?.navigate("Login");
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete account?",
      "Deleting your account is permanent and will remove your profile and academic progress. This cannot be undone.",
      [
        { text: "Keep Account", style: "cancel" },
        {
          text: "Continue",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Final confirmation",
              "Your account is not recoverable after deletion. Do you want to continue?",
              [
                { text: "Keep Account", style: "cancel" },
                {
                  text: "Delete Permanently",
                  style: "destructive",
                  onPress: () => {
                    // TODO: Connect secure server-side account deletion later.
                    Alert.alert(
                      "Backend required",
                      "No account was deleted. Secure account deletion has not been connected yet.",
                    );
                  },
                },
              ],
            );
          },
        },
      ],
    );
  };

  const initials = `${profile.firstName?.[0] || ""}${profile.surname?.[0] || ""}`;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={resolvedTheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      <View style={styles.fixedHeader}>
        <IconButton
          icon="arrow-back"
          label="Back to Home"
          onPress={() => navigation.navigate("Home")}
          styles={styles}
        />
        <Text style={styles.headerTitle}>My Profile</Text>
        <IconButton
          icon="settings-outline"
          label="Go to theme settings"
          onPress={() => scrollRef.current?.scrollToEnd({ animated: true })}
          styles={styles}
        />
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {!!successMessage && (
          <View style={styles.successBanner} accessibilityRole="alert">
            <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
            <Text style={styles.successBannerText}>{successMessage}</Text>
          </View>
        )}

        <View style={styles.identityCard}>
          <Pressable
            onPress={handleAvatarPress}
            accessibilityRole="button"
            accessibilityLabel="Change profile photo"
            style={({ pressed }) => [
              styles.avatarWrap,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials || "CC"}</Text>
            </View>
            <View style={styles.cameraButton}>
              <Ionicons name="camera" size={15} color="#FFFFFF" />
            </View>
          </Pressable>
          {/* <View style={styles.learnerBadge}>
            <Text style={styles.learnerBadgeText}>{profile.learnerInfo}</Text>
          </View> */}
          <Text style={styles.profileName}>
            {profile.firstName} {profile.surname}
          </Text>
          <View style={styles.locationRow}>
            <Ionicons
              name="location-outline"
              size={16}
              color={colors.secondaryText}
            />
            <Text style={styles.locationText}>{profile.location}</Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Personal Details</Text>
          <Text style={styles.sectionIntro}>
            Your saved account information is shown below.
          </Text>
          <View style={styles.detailsList}>
            <ReadOnlyDetail
              icon="mail-outline"
              label="Email Address"
              value={profile.email}
              styles={styles}
            />
            <ReadOnlyDetail
              icon="person-outline"
              label="First Name"
              value={profile.firstName}
              styles={styles}
            />
            <ReadOnlyDetail
              icon="person-outline"
              label="Surname"
              value={profile.surname}
              styles={styles}
            />
            <ReadOnlyDetail
              icon="call-outline"
              label="Phone Number"
              value={profile.phone}
              styles={styles}
            />
            <ReadOnlyDetail
              icon="school-outline"
              label="Category"
              value={profile.category}
              styles={styles}
            />
          </View>
          <Pressable
            onPress={() => navigation.navigate("EditProfile")}
            accessibilityRole="button"
            accessibilityLabel="Edit Personal Details"
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="create-outline" size={20} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Edit Personal Details</Text>
          </Pressable>
        </View>

        <Text style={styles.groupTitle}>Quick Links</Text>
        <View style={styles.quickLinksCard}>
          <QuickLink
            icon="bookmark-outline"
            label="Saved Universities & Courses"
            badge={savedItemsLabel}
            onPress={() => navigation.navigate("Bookmarks")}
            styles={styles}
          />
          <QuickLink
            icon="briefcase-outline"
            label="My Applications"
            badge="0"
            onPress={() => navigation.navigate("Applications")}
            styles={styles}
          />
          <QuickLink
            icon="calculator-outline"
            label="APS Calculator"
            badge="Score: 15"
            onPress={() => navigation.navigate("ApsCalculator")}
            styles={styles}
          />
          <QuickLink
            icon="school-outline"
            label="Browse Universities"
            onPress={() => navigation.navigate("Universities")}
            styles={styles}
          />
          <QuickLink
            icon="book-outline"
            label="Browse Courses"
            onPress={() => navigation.navigate("Courses")}
            styles={styles}
          />
          <QuickLink
            icon="options-outline"
            label="Notification Preferences"
            onPress={() => navigation.navigate("NotificationPreferences")}
            styles={styles}
          />
          <QuickLink
            icon="notifications-outline"
            label="Notifications"
            onPress={() => navigation.navigate("Notifications")}
            styles={styles}
          />
          <QuickLink
            icon="language-outline"
            label="Language"
            badge="English"
            onPress={() => navigation.navigate("Language")}
            styles={styles}
          />
          <QuickLink
            icon="help-circle-outline"
            label="FAQs"
            onPress={() => navigation.navigate("Faqs")}
            styles={styles}
          />
        </View>

        <View style={styles.themeCard}>
          <View style={styles.themeHeadingRow}>
            <Ionicons name="sunny-outline" size={21} color={colors.text} />
            <Text style={styles.themeTitle}>Theme Mode</Text>
            <Text style={styles.currentTheme}>{themePreference} Mode</Text>
          </View>
          <View style={styles.themeOptions}>
            {THEMES.map((theme) => {
              const selected = themePreference === theme;
              return (
                <Pressable
                  key={theme}
                  onPress={() => setThemePreference(theme)}
                  accessibilityRole="radio"
                  accessibilityLabel={`${theme} theme`}
                  accessibilityState={{ checked: selected }}
                  style={({ pressed }) => [
                    styles.themeOption,
                    selected && styles.themeOptionSelected,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.themeOptionText,
                      selected && styles.themeOptionTextSelected,
                    ]}
                  >
                    {theme}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Pressable
          onPress={handleSignOut}
          accessibilityRole="button"
          accessibilityLabel="Sign Out"
          style={({ pressed }) => [
            styles.signOutButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.text} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>

        <Pressable
          onPress={handleDeleteAccount}
          accessibilityRole="button"
          accessibilityLabel="Delete Account"
          style={({ pressed }) => [
            styles.deleteButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons name="trash-outline" size={19} color={colors.danger} />
          <Text style={styles.deleteText}>Delete Account</Text>
        </Pressable>
        <Text style={styles.deleteExplanation}>
          This action is permanent and deletes your profile and academic
          progression.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    fixedHeader: {
      minHeight: 66,
      paddingHorizontal: 20,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.background,
      zIndex: 2,
    },
    headerButton: {
      width: 46,
      height: 46,
      borderRadius: 23,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surface,
    },
    headerTitle: { color: colors.text, fontSize: 19, fontWeight: "800" },
    scrollView: { flex: 1 },
    scrollContent: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 40 },
    successBanner: {
      minHeight: 48,
      marginBottom: 14,
      paddingHorizontal: 15,
      borderRadius: 14,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.primary,
    },
    successBannerText: {
      flex: 1,
      marginLeft: 9,
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "700",
    },
    identityCard: {
      padding: 22,
      borderRadius: 24,
      alignItems: "center",
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    avatarWrap: { width: 92, height: 92 },
    avatar: {
      width: 88,
      height: 88,
      borderRadius: 44,
      borderWidth: 4,
      borderColor: colors.primarySoft,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary,
    },
    avatarText: { color: "#FFFFFF", fontSize: 28, fontWeight: "900" },
    cameraButton: {
      position: "absolute",
      right: 0,
      bottom: 0,
      width: 32,
      height: 32,
      borderRadius: 16,
      borderWidth: 3,
      borderColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.accent,
    },
    learnerBadge: {
      marginTop: 10,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 999,
      backgroundColor: colors.accent,
    },
    learnerBadgeText: {
      color: "#FFFFFF",
      fontSize: 10,
      fontWeight: "900",
      textTransform: "uppercase",
    },
    profileName: {
      marginTop: 13,
      color: colors.text,
      fontSize: 24,
      lineHeight: 30,
      fontWeight: "900",
      textAlign: "center",
    },
    locationRow: { marginTop: 5, flexDirection: "row", alignItems: "center" },
    locationText: {
      flexShrink: 1,
      marginLeft: 4,
      color: colors.secondaryText,
      fontSize: 13,
      textAlign: "center",
    },
    sectionCard: {
      marginTop: 18,
      padding: 20,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    sectionTitle: { color: colors.text, fontSize: 19, fontWeight: "800" },
    sectionIntro: {
      marginTop: 5,
      color: colors.secondaryText,
      fontSize: 13,
      lineHeight: 19,
    },
    detailsList: { marginTop: 15, gap: 10 },
    detailRow: {
      minHeight: 68,
      paddingHorizontal: 14,
      paddingVertical: 11,
      borderRadius: 15,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.input,
    },
    detailIcon: {
      width: 36,
      height: 36,
      borderRadius: 11,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primarySoft,
    },
    detailTextWrap: { flex: 1, marginLeft: 12 },
    detailLabel: {
      color: colors.secondaryText,
      fontSize: 11,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.4,
    },
    detailValue: {
      marginTop: 4,
      color: colors.text,
      fontSize: 15,
      lineHeight: 20,
      fontWeight: "600",
    },
    primaryButton: {
      minHeight: 56,
      marginTop: 19,
      paddingHorizontal: 18,
      borderRadius: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: colors.primary,
    },
    primaryButtonText: {
      flexShrink: 1,
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "800",
      textAlign: "center",
    },
    groupTitle: {
      marginTop: 25,
      marginBottom: 10,
      color: colors.text,
      fontSize: 18,
      fontWeight: "800",
    },
    quickLinksCard: {
      overflow: "hidden",
      borderRadius: 22,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    quickLink: {
      minHeight: 66,
      paddingHorizontal: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
      flexDirection: "row",
      alignItems: "center",
    },
    quickLinkIcon: {
      width: 38,
      height: 38,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primarySoft,
    },
    quickLinkText: {
      flex: 1,
      marginHorizontal: 11,
      color: colors.text,
      fontSize: 14,
      lineHeight: 19,
      fontWeight: "700",
    },
    quickLinkBadge: {
      maxWidth: 82,
      marginRight: 7,
      paddingHorizontal: 8,
      paddingVertical: 5,
      borderRadius: 999,
      backgroundColor: colors.primarySoft,
    },
    quickLinkBadgeText: {
      color: colors.primary,
      fontSize: 9,
      fontWeight: "900",
      textTransform: "uppercase",
    },
    themeCard: {
      marginTop: 24,
      padding: 19,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    themeHeadingRow: { flexDirection: "row", alignItems: "center" },
    themeTitle: {
      marginLeft: 9,
      color: colors.text,
      fontSize: 15,
      fontWeight: "800",
    },
    currentTheme: {
      flex: 1,
      marginLeft: 10,
      color: colors.secondaryText,
      fontSize: 13,
      textAlign: "right",
    },
    themeOptions: {
      marginTop: 15,
      padding: 4,
      borderRadius: 13,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: "row",
      backgroundColor: colors.input,
    },
    themeOption: {
      flex: 1,
      minHeight: 42,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    themeOptionSelected: {
      backgroundColor: colors.surface,
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.09,
      shadowRadius: 5,
      elevation: 2,
    },
    themeOptionText: {
      color: colors.secondaryText,
      fontSize: 13,
      fontWeight: "600",
    },
    themeOptionTextSelected: { color: colors.text, fontWeight: "800" },
    signOutButton: {
      minHeight: 54,
      marginTop: 20,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 7,
      backgroundColor: colors.surface,
    },
    signOutText: { color: colors.text, fontSize: 15, fontWeight: "800" },
    deleteButton: {
      minHeight: 50,
      alignSelf: "center",
      marginTop: 25,
      paddingHorizontal: 20,
      borderRadius: 13,
      borderWidth: 1,
      borderColor: colors.danger,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      backgroundColor: colors.dangerSoft,
    },
    deleteText: { color: colors.danger, fontSize: 14, fontWeight: "800" },
    deleteExplanation: {
      marginTop: 8,
      paddingHorizontal: 12,
      color: colors.secondaryText,
      fontSize: 12,
      lineHeight: 18,
      textAlign: "center",
    },
    pressed: { opacity: 0.65 },
  });
}
