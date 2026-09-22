import React from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useProfile } from "../context/ProfileContext";

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

const TAB_BACKGROUNDS = {
  Universities: "#05080D",
};

export default function NavBar({ state, descriptors, navigation, insets }) {
  const { colors } = useProfile();
  const { width: screenWidth } = useWindowDimensions();
  const safeBottom = insets?.bottom || 0;
  const barWidth = Math.min(screenWidth - BAR_MARGIN * 2, BAR_MAX_WIDTH);
  const activeRoute = state.routes[state.index];
  const screenBackground =
    activeRoute.name === "Profile" || activeRoute.name === "Home"
      ? colors.background
      : TAB_BACKGROUNDS[activeRoute.name] || "#F6F8FC";

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
    navigation.emit({ type: "tabLongPress", target: route.key });
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: screenBackground, paddingBottom: safeBottom + 10 },
      ]}
    >
      <View style={[styles.card, { width: barWidth }]}>
        {state.routes.map((route, index) => {
          const options = descriptors[route.key].options;
          const label = options.tabBarLabel || options.title || route.name;
          const isFocused = state.index === index;
          const itemColor = isFocused ? ACTIVE_COLOR : INACTIVE_COLOR;

          return (
            <Pressable
              key={route.key}
              onPress={() => handlePress(route, isFocused)}
              onLongPress={() => handleLongPress(route)}
              accessibilityRole="tab"
              accessibilityLabel={options.tabBarAccessibilityLabel || label}
              accessibilityState={{ selected: isFocused }}
              style={({ pressed }) => [
                styles.tab,
                pressed && styles.tabPressed,
              ]}
            >
              <Ionicons
                name={TAB_ICONS[route.name] || "ellipse-outline"}
                size={23}
                color={itemColor}
              />
              <Text
                numberOfLines={1}
                style={[
                  styles.label,
                  { color: itemColor },
                  isFocused && styles.activeLabel,
                ]}
              >
                {label}
              </Text>
              <View
                style={[styles.indicator, isFocused && styles.activeIndicator]}
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
    shadowOffset: { width: 0, height: 5 },
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
  label: {
    maxWidth: "100%",
    marginTop: 4,
    fontSize: 10,
    fontWeight: "600",
    textAlign: "center",
  },
  activeLabel: { fontWeight: "800" },
  indicator: {
    width: 24,
    height: 3,
    marginTop: 6,
    borderRadius: 2,
    backgroundColor: "transparent",
  },
  activeIndicator: { backgroundColor: ACTIVE_COLOR },
});
