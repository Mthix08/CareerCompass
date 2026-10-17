import React, { useEffect, useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

import { useProfile } from "../context/ProfileContext";
import { getProspectus } from "../services/prospectusService";

export default function ProspectusScreen({ navigation, route }) {
  const universityId = route.params?.universityId;
  const { colors } = useProfile();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [prospectus, setProspectus] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);
  const [detailsError, setDetailsError] = useState(false);
  const [retryRequest, setRetryRequest] = useState(0);
  const [isLoadingPdf, setIsLoadingPdf] = useState(true);
  const [viewerError, setViewerError] = useState(false);
  const [viewerAttempt, setViewerAttempt] = useState(0);

  useEffect(() => {
    let isCurrent = true;

    const loadProspectus = async () => {
      setIsLoadingDetails(true);
      setDetailsError(false);
      setProspectus(null);
      setViewerError(false);
      setIsLoadingPdf(true);

      if (!universityId) {
        setIsLoadingDetails(false);
        return;
      }

      try {
        const result = await getProspectus(universityId);
        if (isCurrent) setProspectus(result);
      } catch (error) {
        console.error("Unable to load prospectus information.", error);
        if (isCurrent) setDetailsError(true);
      } finally {
        if (isCurrent) setIsLoadingDetails(false);
      }
    };

    loadProspectus();
    return () => {
      isCurrent = false;
    };
  }, [universityId, retryRequest]);

  const pdfUrl = prospectus?.pdfUrl;
  const hasValidPdfUrl = typeof pdfUrl === "string" && /^https?:\/\//i.test(pdfUrl);
  const viewerUrl = hasValidPdfUrl
    ? `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(pdfUrl)}`
    : null;
  const title = prospectus?.universityName || universityId?.toUpperCase() || "University";
  const metadata = [prospectus?.prospectusType, prospectus?.year]
    .filter(Boolean)
    .join(" · ");

  const retryDetails = () => setRetryRequest((attempt) => attempt + 1);
  const retryViewer = () => {
    setViewerError(false);
    setIsLoadingPdf(true);
    setViewerAttempt((attempt) => attempt + 1);
  };

  const renderMessage = (icon, heading, message, onRetry, retryLabel = "Try again") => (
    <View style={styles.messageContainer}>
      <Ionicons name={icon} size={48} color={colors.mutedText} />
      <Text style={styles.messageTitle}>{heading}</Text>
      <Text style={styles.messageText}>{message}</Text>
      {onRetry ? (
        <Pressable
          onPress={onRetry}
          accessibilityRole="button"
          style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
        >
          <Text style={styles.actionButtonText}>{retryLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );

  let content;
  if (isLoadingDetails) {
    content = (
      <View style={styles.messageContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.messageTitle}>Loading prospectus</Text>
        <Text style={styles.messageText}>Retrieving the university’s prospectus information…</Text>
      </View>
    );
  } else if (detailsError) {
    content = renderMessage(
      "cloud-offline-outline",
      "Could not load prospectus",
      "Check your connection and try again.",
      retryDetails,
    );
  } else if (!universityId || !prospectus || !hasValidPdfUrl) {
    content = renderMessage(
      "document-text-outline",
      "Prospectus unavailable",
      "A prospectus is not currently available for this university.",
      !universityId ? null : retryDetails,
    );
  } else if (viewerError) {
    content = renderMessage(
      "cloud-offline-outline",
      "Could not display this prospectus",
      "The document viewer could not load the PDF. Check your connection and try again.",
      retryViewer,
    );
  } else {
    content = (
      <View style={styles.viewerContainer}>
        {isLoadingPdf ? (
          <View style={styles.pdfLoading}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Opening prospectus…</Text>
          </View>
        ) : null}
        <WebView
          key={viewerAttempt}
          source={{ uri: viewerUrl }}
          style={styles.webView}
          javaScriptEnabled
          domStorageEnabled
          setSupportMultipleWindows={false}
          onLoadStart={() => setIsLoadingPdf(true)}
          onLoadEnd={() => setIsLoadingPdf(false)}
          onError={(event) => {
            console.error("Prospectus viewer failed to load.", event.nativeEvent?.description);
            setIsLoadingPdf(false);
            setViewerError(true);
          }}
          onHttpError={({ nativeEvent }) => {
            if (nativeEvent.statusCode >= 400) {
              console.error("Prospectus viewer returned an HTTP error.", nativeEvent.statusCode);
              setIsLoadingPdf(false);
              setViewerError(true);
            }
          }}
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={8}
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
        >
          <Ionicons name="arrow-back" size={23} color={colors.text} />
        </Pressable>
        <View style={styles.titleWrap}>
          <Text style={styles.headerTitle} numberOfLines={1}>{title} Prospectus</Text>
          {metadata ? <Text style={styles.headerSubtitle} numberOfLines={1}>{metadata}</Text> : null}
        </View>
        <View style={styles.iconButton} />
      </View>
      {content}
    </SafeAreaView>
  );
}

const makeStyles = (colors) => StyleSheet.create({
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
  iconButton: { width: 46, height: 46, alignItems: "center", justifyContent: "center" },
  titleWrap: { flex: 1, paddingHorizontal: 8, alignItems: "center" },
  headerTitle: { color: colors.text, fontSize: 16, fontWeight: "800" },
  headerSubtitle: { marginTop: 3, color: colors.secondaryText, fontSize: 12, textTransform: "capitalize" },
  viewerContainer: { flex: 1, backgroundColor: colors.background },
  webView: { flex: 1, backgroundColor: colors.background },
  pdfLoading: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
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
    backgroundColor: colors.background,
  },
  messageTitle: { marginTop: 18, color: colors.text, fontSize: 20, fontWeight: "800", textAlign: "center" },
  messageText: { marginTop: 10, color: colors.secondaryText, fontSize: 14, lineHeight: 21, textAlign: "center" },
  actionButton: {
    minHeight: 48,
    marginTop: 22,
    paddingHorizontal: 22,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },
  actionButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  pressed: { opacity: 0.72 },
});
