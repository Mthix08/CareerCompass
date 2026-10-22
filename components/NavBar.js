import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import Text from './TranslatedText';

import { useProfile } from "../context/ProfileContext";
import { useLanguage } from "../context/LanguageContext";
import { translateTexts } from "../services/translate";

const BAR_MARGIN = 16;
const BAR_MAX_WIDTH = 520;
const BAR_HEIGHT = 72;

const ACTIVE_COLOR = "#117C72";
const INACTIVE_COLOR = "#84919D";

const TAB_ICONS = {
  Home: "home-outline",
  Funding: "wallet-outline",
  Universities: "business-outline",
  Courses: "book-outline",
  Profile: "person-outline",
};

// English label for each navigation tab
const ENGLISH_LABELS = {
  Home: "Home",
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
  const { width: screenWidth } = useWindowDimensions();

  const safeBottom = insets?.bottom || 0;

  const barWidth = Math.min(
    screenWidth - BAR_MARGIN * 2,
    BAR_MAX_WIDTH
  );

  const activeRoute = state.routes[state.index];

  const screenBackground =
    activeRoute.name === "Profile" ||
    activeRoute.name === "Home"
      ? colors.background
      : "#F6F8FC";

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

          const itemColor = isFocused
            ? ACTIVE_COLOR
            : INACTIVE_COLOR;

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
              <Ionicons
                name={
                  TAB_ICONS[route.name] ||
                  "ellipse-outline"
                }
                size={23}
                color={itemColor}
              />

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

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingTop: 8,
    alignItems: "center",
  },

  languageContainer: {
    width: "100%",
    alignItems: "flex-end",
    paddingRight: 20,
    marginBottom: 5,
  },

  languageButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5ECEF",
    backgroundColor: "#FFFFFF",
  },

  languageButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: ACTIVE_COLOR,
  },

  card: {
    height: BAR_HEIGHT,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E5ECEF",
    backgroundColor: "#FFFFFF",
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

  tabPressed: {
    opacity: 0.6,
  },

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
    backgroundColor: ACTIVE_COLOR,
  },
});