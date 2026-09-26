import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

import { getUniversityTheme } from "../data/universityTheme";

export default function ProspectusScreen({ navigation, route }) {
  const university = route.params?.university;
  const url = route.params?.url;
  const theme = getUniversityTheme(university);
  const [hasError, setHasError] = useState(false);

  const openInBrowser = async () => {
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert("Could not open link", "Please try again in a moment.");
    }
  };

  if (!university || !url || !/^https?:\/\//i.test(url)) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={8}
            style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.headerTitle}>Prospectus</Text>
          <View style={styles.iconButton} />
        </View>
        <View style={styles.messageContainer}>
          <Ionicons name="document-text-outline" size={54} color="#687384" />
          <Text style={styles.messageTitle}>Prospectus unavailable</Text>
          <Text style={styles.messageText}>
            This university does not have a valid prospectus link yet.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={8}
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>
        <View style={styles.titleWrap}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {university.shortName} Prospectus
          </Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            Viewing inside CareerCompass
          </Text>
        </View>
        <Pressable
          onPress={openInBrowser}
          accessibilityRole="button"
          accessibilityLabel="Open prospectus in browser"
          hitSlop={8}
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
        >
          <Ionicons name="open-outline" size={22} color="#FFFFFF" />
        </Pressable>
      </View>

      {hasError ? (
        <View style={styles.messageContainer}>
          <Ionicons name="cloud-offline-outline" size={54} color="#687384" />
          <Text style={styles.messageTitle}>Could not display this prospectus</Text>
          <Text style={styles.messageText}>
            The university may not allow its page to be embedded. You can still open it in your browser.
          </Text>
          <Pressable
            onPress={openInBrowser}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.fallbackButton,
              { backgroundColor: theme.accent },
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.fallbackButtonText}>Open in browser</Text>
            <Ionicons name="open-outline" size={19} color="#FFFFFF" />
          </Pressable>
        </View>
      ) : (
        <WebView
          source={{ uri: url }}
          style={styles.webView}
          startInLoadingState
          javaScriptEnabled
          domStorageEnabled
          setSupportMultipleWindows={false}
          onError={() => setHasError(true)}
          onHttpError={({ nativeEvent }) => {
            if (nativeEvent.statusCode >= 400) setHasError(true);
          }}
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.accent} />
              <Text style={styles.loadingText}>Loading prospectus…</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#05080D" },
  header: {
    minHeight: 68,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2A313D",
    backgroundColor: "#0D121A",
  },
  iconButton: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  titleWrap: { flex: 1, paddingHorizontal: 8, alignItems: "center" },
  headerTitle: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  headerSubtitle: { marginTop: 3, color: "#909AAA", fontSize: 11 },
  webView: { flex: 1, backgroundColor: "#FFFFFF" },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: "#05080D",
  },
  loadingText: { color: "#B8C0CC", fontSize: 14, fontWeight: "600" },
  messageContainer: {
    flex: 1,
    paddingHorizontal: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  messageTitle: {
    marginTop: 18,
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
  },
  messageText: {
    marginTop: 10,
    color: "#9DA6B4",
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },
  fallbackButton: {
    minHeight: 52,
    marginTop: 24,
    paddingHorizontal: 22,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  fallbackButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  pressed: { opacity: 0.7 },
});
