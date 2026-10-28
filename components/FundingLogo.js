import React, { useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Text from "./TranslatedText";

function FundingLogoImage({ logoUrl, label, size, fallback }) {
  const [failed, setFailed] = useState(false);
  if (failed) return fallback;
  return (
    <Image
      source={{ uri: logoUrl }}
      resizeMode="contain"
      onError={() => setFailed(true)}
      style={{ width: size * 0.76, height: size * 0.76 }}
      accessibilityLabel={label}
    />
  );
}

function getInitials(name = "") {
  const words = String(name)
    .replace(/\b(20\d{2}|bursary|scholarship|fund)\b/gi, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!words.length) return "";
  return words.slice(0, 2).map((word) => word[0]).join("").toUpperCase();
}

export default function FundingLogo({ option, colors, size = 46, featured = false }) {
  const logoUrl = option?.logoUrl;
  const initials = getInitials(option?.name);
  const fallback = initials ? (
    <Text style={[styles.initials, { color: colors.primary, fontSize: Math.max(13, size * 0.3) }]}>{initials}</Text>
  ) : (
    <Ionicons name="wallet-outline" size={size * 0.48} color={colors.primary} />
  );

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size * 0.28,
          backgroundColor: colors.primarySoft,
          borderColor: featured ? colors.primary : colors.border,
        },
      ]}
      accessibilityLabel={`${option?.name || "Funding provider"} logo`}
    >
      {logoUrl ? (
        <FundingLogoImage
          key={`${option?.id}-${logoUrl}`}
          logoUrl={logoUrl}
          label={`${option?.name || "Funding provider"} logo`}
          size={size}
          fallback={fallback}
        />
      ) : fallback}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderWidth: 1, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  initials: { fontWeight: "900", letterSpacing: 0.4 },
});
