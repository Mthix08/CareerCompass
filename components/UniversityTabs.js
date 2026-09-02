import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const TABS = ["About", "Courses", "Apply"];

export default function UniversityTabs({ activeTab, onTabChange }) {
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
              selected && styles.selectedTab,
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

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 6,
    padding: 5,
    borderRadius: 16,
    backgroundColor: "#151A22",
  },
  tab: {
    flex: 1,
    minHeight: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedTab: { backgroundColor: "#F26522" },
  pressedTab: { opacity: 0.75 },
  label: { color: "#9CA6B5", fontSize: 14, fontWeight: "700" },
  selectedLabel: { color: "#FFFFFF" },
});
