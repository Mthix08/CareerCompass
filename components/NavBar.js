import React, { useEffect, useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import Text from "./TranslatedText";

import { useProfile } from "../context/ProfileContext";
import { useBookmarks } from "../context/BookmarksContext";
import { useLanguage } from "../context/LanguageContext";
import { translateTexts } from "../services/translate";

const BAR_MARGIN = 16;
const BAR_MAX_WIDTH = 520;
const BAR_HEIGHT = 72;

const TAB_ICONS = {
  HomeTab: "home-outline",
  Funding: "wallet-outline",
  Universities: "business-outline",
  Courses: "book-outline",
  Profile: "person-outline",
};

// English label for each navigation tab
const ENGLISH_LABELS = {
  HomeTab: "Home",
  Funding: "Funding",
  Universities: "Universities",
  Courses: "Courses",
  Profile: "Profile",
};

const TAB_NAMES = Object.keys(ENGLISH_LABELS);
const TAB_TEXTS = Object.values(ENGLISH_LABELS);

export default function NavBar({
  state,
  descriptors,
  navigation,
  insets,
}) {
  const { lang } = useLanguage();
  const [translated, setTranslated] = useState(TAB_TEXTS);

  // Translate the tab labels whenever the language changes
  useEffect(() => {
    let active = true;

    translateTexts(TAB_TEXTS, lang)
      .then((labels) => {
        if (active) {
          setTranslated(labels);
        }
      })
      .catch(() => {
        // The translation service reports each failed request once.
      });

    return () => {
      active = false;
    };
  }, [lang]);

  const { colors } = useProfile();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { bookmarkedIds, bookmarkedCourseIds, bookmarkedFundingIds } = useBookmarks();
  const bookmarkCounts = {
    Funding: bookmarkedFundingIds.length,
    Universities: bookmarkedIds.length,
    Courses: bookmarkedCourseIds.length,
  };
  const { width: screenWidth } = useWindowDimensions();

  const safeBottom = insets?.bottom || 0;

  const barWidth = Math.min(
    screenWidth - BAR_MARGIN * 2,
    BAR_MAX_WIDTH
  );

  const screenBackground = colors.background;

  const handlePress = (route, isFocused) => {
    const event = navigation.emit({
      type: "tabPress",
      target: route.key,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name, route.params);
    }
  };

  const handleLongPress = (route) => {
    navigation.emit({
      type: "tabLongPress",
      target: route.key,
    });
  };

  const openAssistant = () => navigation.getParent()?.navigate("Assistant");
  const openApplicationHelp = () =>
    navigation.getParent()?.navigate("ApplicationHelp");

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: screenBackground,
          paddingBottom: safeBottom + 10,
        },
      ]}
    >
      <Pressable
        onPress={openAssistant}
        accessibilityRole="button"
        accessibilityLabel="Open CareerCompass Assistant"
        style={({ pressed }) => [
          styles.assistantButton,
          pressed && styles.tabPressed,
        ]}
      >
        <Ionicons name="sparkles-outline" size={23} color="#FFFFFF" />
      </Pressable>

      {/* BOTTOM NAVIGATION */}
      <View style={[styles.card, { width: barWidth }]}>
        {state.routes.map((route, index) => {
          const options = descriptors[route.key].options;

          // Original navigation label
          const originalLabel =
            options.tabBarLabel ||
            options.title ||
            route.name;

          // Use the translated label if this tab has one
          const tabIndex = TAB_NAMES.indexOf(route.name);
          const label =
            tabIndex !== -1
              ? translated[tabIndex]
              : originalLabel;

          const isFocused = state.index === index;

          const itemColor = isFocused ? colors.primary : colors.mutedText;

          return (
            <Pressable
              key={route.key}
              onPress={() =>
                handlePress(route, isFocused)
              }
              onLongPress={() =>
                handleLongPress(route)
              }
              accessibilityRole="tab"
              accessibilityLabel={
                options.tabBarAccessibilityLabel ||
                label
              }
              accessibilityState={{
                selected: isFocused,
              }}
              style={({ pressed }) => [
                styles.tab,
                pressed && styles.tabPressed,
              ]}
            >
              <View style={styles.iconWrap}>
                <Ionicons
                  name={TAB_ICONS[route.name] || "ellipse-outline"}
                  size={23}
                  color={itemColor}
                />
                {bookmarkCounts[route.name] > 0 && (
                  <View style={styles.badge} accessibilityLabel={`${bookmarkCounts[route.name]} saved ${route.name.toLowerCase()}`}>
                    <Text style={styles.badgeText}>{bookmarkCounts[route.name] > 9 ? "9+" : bookmarkCounts[route.name]}</Text>
                  </View>
                )}
              </View>
              <Text
                numberOfLines={1}
                style={[
                  styles.label,
                  { color: itemColor },
                  isFocused &&
                    styles.activeLabel,
                ]}
              >
                {label}
              </Text>

              <View
                style={[
                  styles.indicator,
                  isFocused &&
                    styles.activeIndicator,
                ]}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
  container: {
    width: "100%",
    paddingTop: 8,
    alignItems: "center",
    position: "relative",
  },
  assistantButton: {
    position: "absolute",
    right: 24,
    top: -28,
    zIndex: 2,
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    borderWidth: 4,
    borderColor: colors.background,
    elevation: 8,
    shadowColor: "#102D36",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
  },

  card: {
    height: BAR_HEIGHT,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    shadowColor: "#102D36",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 8,
  },

  tab: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  tabPressed: { opacity: 0.6 },
  iconWrap: { position: "relative" },
  badge: { position: "absolute", top: -8, right: -11, minWidth: 17, height: 17, paddingHorizontal: 4, borderRadius: 9, backgroundColor: colors.danger, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: colors.surface },
  badgeText: { color: "#FFFFFF", fontSize: 9, fontWeight: "800", lineHeight: 11 },
  label: {
    maxWidth: "100%",
    marginTop: 4,
    fontSize: 10,
    fontWeight: "600",
    textAlign: "center",
  },

  activeLabel: {
    fontWeight: "800",
  },

  indicator: {
    width: 24,
    height: 3,
    marginTop: 6,
    borderRadius: 2,
    backgroundColor: "transparent",
  },

  activeIndicator: {
    backgroundColor: colors.primary,
  },
  });
}