import React, { useEffect, useMemo, useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  AccessibilityInfo,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { useProfile } from "../context/ProfileContext";

const BAR_MARGIN = 16;
const BAR_MAX_WIDTH = 520;
const BAR_HEIGHT = 76;
const FLOATING_SPACE = 28;
const ACTIVE_SIZE = 60;
const ACTIVE_WRAP_HEIGHT = 84;
const NOTCH_WIDTH = 74;
const NOTCH_DEPTH = 38;
const OUTER_RADIUS = 24;
const EDGE_PADDING = 34;
const NAVBAR_PRIMARY = "#117C72";
const ACTIVE_SURFACE = "#E8F3F1";
const ACTIVE_ACCENT = "#C39A45";
const INACTIVE_COLOR = "#D8F0EC";

const TAB_ICONS = {
  Home: { active: "home", inactive: "home-outline" },
  Universities: { active: "business", inactive: "business-outline" },
  Courses: { active: "book", inactive: "book-outline" },
  Profile: { active: "person", inactive: "person-outline" },
};

const TAB_BACKGROUNDS = {
  Universities: "#05080D",
};

function createBarPath(width, notchCenter) {
  const notchStart = notchCenter - NOTCH_WIDTH / 2;
  const notchEnd = notchCenter + NOTCH_WIDTH / 2;
  const bottom = BAR_HEIGHT;
  const corner = OUTER_RADIUS;

  return [
    `M ${corner} 0`,
    `H ${notchStart}`,
    `C ${notchStart + 18} 0 ${notchStart + 20} ${NOTCH_DEPTH} ${notchCenter} ${NOTCH_DEPTH}`,
    `C ${notchEnd - 20} ${NOTCH_DEPTH} ${notchEnd - 18} 0 ${notchEnd} 0`,
    `H ${width - corner}`,
    `Q ${width} 0 ${width} ${corner}`,
    `V ${bottom - corner}`,
    `Q ${width} ${bottom} ${width - corner} ${bottom}`,
    `H ${corner}`,
    `Q 0 ${bottom} 0 ${bottom - corner}`,
    `V ${corner}`,
    `Q 0 0 ${corner} 0`,
    "Z",
  ].join(" ");
}

export default function NavBar({ state, descriptors, navigation, insets }) {
  const { colors } = useProfile();
  const { width: screenWidth } = useWindowDimensions();
  const [reduceMotion, setReduceMotion] = useState(false);
  const safeBottom = insets?.bottom || 0;
  const routeCount = state.routes.length;
  const barWidth = Math.min(screenWidth - BAR_MARGIN * 2, BAR_MAX_WIDTH);
  const barLeft = (screenWidth - barWidth) / 2;
  const availableWidth = barWidth - EDGE_PADDING * 2;
  const tabWidth = availableWidth / routeCount;

  const getTabCenter = (index) => {
    const calculatedCenter = EDGE_PADDING + tabWidth * index + tabWidth / 2;
    const minimumCenter = OUTER_RADIUS + NOTCH_WIDTH / 2;
    const maximumCenter = barWidth - minimumCenter;
    return Math.max(minimumCenter, Math.min(calculatedCenter, maximumCenter));
  };

  const activeCenter = getTabCenter(state.index);
  const animatedCenter = useRef(new Animated.Value(activeCenter)).current;
  const iconOpacity = useRef(new Animated.Value(1)).current;
  const iconScale = useRef(new Animated.Value(1)).current;
  const [notchCenter, setNotchCenter] = useState(activeCenter);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduceMotion,
    );
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    const listenerId = animatedCenter.addListener(({ value }) => {
      setNotchCenter(value);
    });
    return () => animatedCenter.removeListener(listenerId);
  }, [animatedCenter]);

  useEffect(() => {
    if (reduceMotion) {
      animatedCenter.setValue(activeCenter);
      iconOpacity.setValue(1);
      iconScale.setValue(1);
      return undefined;
    }

    iconOpacity.setValue(0.35);
    iconScale.setValue(0.88);
    const centerAnimation = Animated.timing(animatedCenter, {
      toValue: activeCenter,
      duration: 300,
      useNativeDriver: false,
    });
    const iconAnimation = Animated.parallel([
      Animated.timing(iconOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(iconScale, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]);
    Animated.parallel([centerAnimation, iconAnimation]).start();
    return () => {
      centerAnimation.stop();
      iconAnimation.stop();
    };
  }, [
    activeCenter,
    animatedCenter,
    iconOpacity,
    iconScale,
    reduceMotion,
  ]);

  const barPath = useMemo(
    () => createBarPath(barWidth, notchCenter),
    [barWidth, notchCenter],
  );
  const activeRoute = state.routes[state.index];
  const activeOptions = descriptors[activeRoute.key].options;
  const activeLabel = activeOptions.title || activeRoute.name;
  const activeIcons = TAB_ICONS[activeRoute.name] || TAB_ICONS.Home;
  const screenBackground =
    activeRoute.name === "Profile"
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
        {
          height: FLOATING_SPACE + BAR_HEIGHT + safeBottom,
          backgroundColor: screenBackground,
        },
      ]}
      pointerEvents="box-none"
    >
      <View
        pointerEvents="none"
        style={[
          styles.svgShadow,
          { left: barLeft, width: barWidth, bottom: safeBottom },
        ]}
      >
        <Svg width={barWidth} height={BAR_HEIGHT}>
          <Path d={barPath} fill={NAVBAR_PRIMARY} />
        </Svg>
      </View>

      {state.routes.map((route, index) => {
        if (index === state.index) return null;
        const options = descriptors[route.key].options;
        const label = options.title || route.name;
        const icons = TAB_ICONS[route.name] || TAB_ICONS.Home;
        return (
          <Pressable
            key={route.key}
            onPress={() => handlePress(route, false)}
            onLongPress={() => handleLongPress(route)}
            accessibilityRole="tab"
            accessibilityLabel={options.tabBarAccessibilityLabel || label}
            accessibilityState={{ selected: false }}
            style={({ pressed }) => [
              styles.inactiveTab,
              {
                left: barLeft + EDGE_PADDING + tabWidth * index,
                width: tabWidth,
                bottom: safeBottom + 5,
              },
              pressed && styles.tabPressed,
            ]}
          >
            <Ionicons name={icons.inactive} size={23} color={INACTIVE_COLOR} />
            <Text numberOfLines={1} style={styles.inactiveLabel}>
              {label}
            </Text>
          </Pressable>
        );
      })}

      <Animated.View
        style={[
          styles.activeTabWrap,
          {
            left: barLeft,
            bottom:
              safeBottom + FLOATING_SPACE + BAR_HEIGHT - ACTIVE_WRAP_HEIGHT,
            transform: [
              { translateX: Animated.subtract(animatedCenter, ACTIVE_SIZE / 2) },
            ],
          },
        ]}
      >
        <Pressable
          onPress={() => handlePress(activeRoute, true)}
          onLongPress={() => handleLongPress(activeRoute)}
          accessibilityRole="tab"
          accessibilityLabel={
            activeOptions.tabBarAccessibilityLabel || activeLabel
          }
          accessibilityState={{ selected: true }}
          style={({ pressed }) => [
            styles.activeButton,
            pressed && styles.activeButtonPressed,
          ]}
        >
          <Animated.View
            style={{
              opacity: iconOpacity,
              transform: [{ scale: iconScale }],
            }}
          >
            <Ionicons
              name={activeIcons.active}
              size={27}
              color={ACTIVE_ACCENT}
            />
          </Animated.View>
        </Pressable>
        <Text numberOfLines={1} style={styles.activeLabel}>
          {activeLabel}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%", backgroundColor: "transparent" },
  svgShadow: {
    position: "absolute",
    height: BAR_HEIGHT,
    shadowColor: "#0B4E49",
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 9,
  },
  inactiveTab: {
    position: "absolute",
    height: 66,
    alignItems: "center",
    justifyContent: "center",
  },
  inactiveLabel: {
    maxWidth: "94%",
    marginTop: 4,
    color: INACTIVE_COLOR,
    fontSize: 10,
    fontWeight: "700",
    textAlign: "center",
  },
  tabPressed: { opacity: 0.58 },
  activeTabWrap: {
    position: "absolute",
    width: ACTIVE_SIZE,
    height: ACTIVE_WRAP_HEIGHT,
    alignItems: "center",
  },
  activeButton: {
    width: ACTIVE_SIZE,
    height: ACTIVE_SIZE,
    borderRadius: ACTIVE_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: ACTIVE_SURFACE,
    shadowColor: "#0B4E49",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.24,
    shadowRadius: 7,
    elevation: 8,
  },
  activeButtonPressed: { opacity: 0.76 },
  activeLabel: {
    width: 84,
    marginTop: 6,
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
    textAlign: "center",
  },
});
