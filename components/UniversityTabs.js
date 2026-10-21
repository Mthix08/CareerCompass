import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useProfile } from "../context/ProfileContext";

const TABS = ["About", "Courses", "Apply"];

export default function UniversityTabs({ activeTab, onTabChange, accentColor = "#F26522" }) {
  const { colors } = useProfile();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.container} accessibilityRole="tablist">
      {TABS.map((tab) => {
        const selected = activeTab === tab;
        return (
          <Pressable
            key={tab}
            onPress={() => onTabChange(tab)}
            accessibilityRole="tab"
            accessibilityLabel={`${tab} university information`}
            accessibilityState={{ selected }}
            style={({ pressed }) => [
              styles.tab,
              selected && [styles.selectedTab, { backgroundColor: accentColor }],
              pressed && styles.pressedTab,
            ]}
          >
            <Text style={[styles.label, selected && styles.selectedLabel]}>
              {tab}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 6,
    padding: 5,
    borderRadius: 16,
    backgroundColor: colors.elevatedSurface,
  },
  tab: {
    flex: 1,
    minHeight: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedTab: {},
  pressedTab: { opacity: 0.75 },
  label: { color: colors.mutedText, fontSize: 14, fontWeight: "700" },
  selectedLabel: { color: "#FFFFFF" },
  });
}
