import React, { useEffect, useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import Text from "../components/TranslatedText";
import { SafeAreaView } from "react-native-safe-area-context";
import Pdf from "../components/ProspectusPdf";
import { WebView } from "react-native-webview";

import { getUniversityTheme } from "../data/universityTheme";
import { useProfile } from "../context/ProfileContext";

function isValidHttpUrl(value) {
  return typeof value === "string" && /^https?:\/\/[^\s]+$/i.test(value);
}

function isPdfFileUrl(value) {
  return /\.pdf(?:[?#]|$)/i.test(value);
}

function getPdfErrorMessage(error) {
  if (error == null) return "The PDF could not be loaded.";
  if (typeof error === "string") return error;

  return [
    error.message || String(error),
    error.status != null ? `HTTP status: ${error.status}` : null,
    error.code ? `Error code: ${error.code}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

export default function ProspectusScreen({ navigation, route }) {
  const { colors } = useProfile();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const university = route.params?.university;
  const url = route.params?.url || university?.prospectusUrl;
  const theme = getUniversityTheme(university);
  const [displayMode, setDisplayMode] = useState("checking");
  const [failure, setFailure] = useState(null);
  const [progress, setProgress] = useState(0);
  const [pageCount, setPageCount] = useState(null);
  const pdfSource = useMemo(() => ({ uri: url, cache: true }), [url]);
  const hasValidUrl = isValidHttpUrl(url);

  useEffect(() => {
    let active = true;

    setFailure(null);
    setProgress(0);
    setPageCount(null);

    if (!hasValidUrl) {
      setDisplayMode("error");
      return () => {
        active = false;
      };
    }

    if (isPdfFileUrl(url)) {
      setDisplayMode("pdf");
      return () => {
        active = false;
      };
    }

    setDisplayMode("checking");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    fetch(url, { method: "HEAD", signal: controller.signal })
      .then((response) => {
        if (!active) return;
        const contentType = response.headers.get("content-type")?.toLowerCase() || "";
        setDisplayMode(
          contentType.includes("text/html") || contentType.includes("application/xhtml+xml")
            ? "web"
            : "pdf",
        );
      })
      .catch(() => {
        // Some official hosts reject HEAD requests. Try the PDF renderer so
        // extensionless PDF URLs still work; the user can switch to the page
        // view if the resource is actually a webpage.
        if (active) setDisplayMode("pdf");
      })
      .finally(() => clearTimeout(timeout));

    return () => {
      active = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [hasValidUrl, url]);

  const openInBrowser = async () => {
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert("Could not open link", "Please try again in a moment.");
    }
  };

  const retry = () => {
    setFailure(null);
    setProgress(0);
    setPageCount(null);
    setDisplayMode(failure?.mode || "pdf");
  };

  const showWebpage = () => {
    setFailure(null);
    setDisplayMode("web");
  };

  const showPdf = () => {
    setFailure(null);
    setProgress(0);
    setPageCount(null);
    setDisplayMode("pdf");
  };

  if (!university || !hasValidUrl) {
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
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Prospectus</Text>
          <View style={styles.iconButton} />
        </View>
        <View style={styles.messageContainer}>
          <Ionicons name="document-text-outline" size={54} color={colors.mutedText} />
          <Text style={styles.messageTitle}>Prospectus unavailable</Text>
          <Text style={styles.messageText}>
            This university does not have a valid prospectus link yet.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const subtitle =
    displayMode === "pdf" && pageCount
      ? `${pageCount} pages`
      : displayMode === "web"
        ? "University prospectus webpage"
        : displayMode === "checking"
          ? "Checking prospectus format…"
          : displayMode === "error"
            ? "Unable to display prospectus"
            : `Loading PDF${progress > 0 ? ` · ${Math.round(progress * 100)}%` : "…"}`;

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
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <View style={styles.titleWrap}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {university.shortName || university.name} Prospectus
          </Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        </View>
        {displayMode === "web" && (
          <Pressable
            onPress={showPdf}
            accessibilityRole="button"
            accessibilityLabel="Try the native PDF viewer"
            hitSlop={8}
            style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          >
            <Ionicons name="document-text-outline" size={22} color={colors.text} />
          </Pressable>
        )}
        <Pressable
          onPress={openInBrowser}
          accessibilityRole="button"
          accessibilityLabel="Open prospectus in browser"
          hitSlop={8}
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
        >
          <Ionicons name="open-outline" size={22} color={colors.text} />
        </Pressable>
      </View>

      {displayMode === "checking" ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.accent} />
          <Text style={styles.loadingText}>Checking the prospectus…</Text>
        </View>
      ) : displayMode === "error" ? (
        <View style={styles.messageContainer}>
          <Ionicons name="cloud-offline-outline" size={54} color={colors.mutedText} />
          <Text style={styles.messageTitle}>Could not display this prospectus</Text>
          <Text style={styles.messageText} selectable>
            {failure?.message || "The prospectus could not be loaded."}
          </Text>
          <Pressable
            onPress={retry}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.fallbackButton,
              { backgroundColor: theme.accent },
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.fallbackButtonText}>Retry</Text>
            <Ionicons name="refresh-outline" size={19} color="#FFFFFF" />
          </Pressable>
          {failure?.mode === "pdf" ? (
            <Pressable
              onPress={showWebpage}
              accessibilityRole="button"
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
            >
              <Text style={[styles.secondaryButtonText, { color: theme.accent }]}>Try the university webpage</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={showPdf}
              accessibilityRole="button"
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
            >
              <Text style={[styles.secondaryButtonText, { color: theme.accent }]}>Try the PDF viewer</Text>
            </Pressable>
          )}
          <Pressable
            onPress={openInBrowser}
            accessibilityRole="link"
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
          >
            <Text style={[styles.secondaryButtonText, { color: theme.accent }]}>Open in browser</Text>
          </Pressable>
        </View>
      ) : displayMode === "pdf" ? (
        <Pdf
          source={pdfSource}
          trustAllCerts={false}
          style={styles.pdf}
          horizontal={false}
          enablePaging={false}
          fitPolicy={0}
          minScale={1}
          maxScale={3}
          enableDoubleTapZoom
          onLoadProgress={setProgress}
          onLoadComplete={(count) => setPageCount(count)}
          onError={(error) => {
            setFailure({ mode: "pdf", message: getPdfErrorMessage(error) });
            setDisplayMode("error");
          }}
          renderActivityIndicator={(downloadProgress) => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.accent} />
              <Text style={styles.loadingText}>
                Loading prospectus… {Math.round((downloadProgress || progress) * 100)}%
              </Text>
            </View>
          )}
        />
      ) : (
        <WebView
          source={{ uri: url }}
          style={styles.webView}
          startInLoadingState
          javaScriptEnabled
          domStorageEnabled
          setSupportMultipleWindows={false}
          onError={({ nativeEvent }) => {
            setFailure({
              mode: "web",
              message: nativeEvent.description || "The university webpage could not be loaded.",
            });
            setDisplayMode("error");
          }}
          onHttpError={({ nativeEvent }) => {
            if (nativeEvent.isForMainFrame === false || nativeEvent.statusCode < 400) return;
            setFailure({
              mode: "web",
              message: `The university server returned HTTP ${nativeEvent.statusCode}.`,
            });
            setDisplayMode("error");
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

function makeStyles(colors) {
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    header: {
      minHeight: 68,
      paddingHorizontal: 12,
      flexDirection: "row",
      alignItems: "center",
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
      backgroundColor: colors.surface,
    },
    iconButton: {
      width: 46,
      height: 46,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
    },
    titleWrap: { flex: 1, paddingHorizontal: 8, alignItems: "center" },
    headerTitle: { color: colors.text, fontSize: 16, fontWeight: "800" },
    headerSubtitle: { marginTop: 3, color: colors.mutedText, fontSize: 11 },
    pdf: { flex: 1, width: "100%", backgroundColor: colors.background },
    webView: { flex: 1, backgroundColor: colors.background },
    loadingContainer: {
      ...StyleSheet.absoluteFillObject,
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      backgroundColor: colors.background,
    },
    loadingText: { color: colors.secondaryText, fontSize: 14, fontWeight: "600" },
    messageContainer: {
      flex: 1,
      paddingHorizontal: 28,
      alignItems: "center",
      justifyContent: "center",
    },
    messageTitle: {
      marginTop: 18,
      color: colors.text,
      fontSize: 20,
      fontWeight: "800",
      textAlign: "center",
    },
    messageText: {
      marginTop: 10,
      color: colors.secondaryText,
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
    secondaryButton: { minHeight: 42, paddingHorizontal: 12, justifyContent: "center" },
    secondaryButtonText: { fontSize: 14, fontWeight: "700" },
    pressed: { opacity: 0.7 },
  });
}
