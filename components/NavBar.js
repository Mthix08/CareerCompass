import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export default function NavBar({ navigation, dark = false }) {
  return (
    <View style={[styles.navBar, dark && styles.darkNavBar]}>
      <View style={[styles.notch, dark && styles.darkNotch]} />
      <View style={styles.itemsRow}>
        <TouchableOpacity
          style={styles.navButton}
          activeOpacity={0.8}
          onPress={() => navigation?.navigate("Home")}
          accessibilityLabel="Home"
          accessibilityRole="button"
        >
          <Ionicons name="home" size={25} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.navButton,
            styles.secondaryButton,
            dark && styles.darkSecondaryButton,
          ]}
          activeOpacity={0.8}
          onPress={() => navigation?.navigate("Universities")}
          accessibilityLabel="Institutions"
          accessibilityRole="button"
        >
          <Ionicons
            name="business-outline"
            size={25}
            color={dark ? "#F26522" : "#117C72"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navBar: {
    marginBottom: 30,
    position: "absolute",
    right: 0,
    bottom: 0,
    left: 0,
    height: 82,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  darkNavBar: {
    backgroundColor: "#0D1117",
    borderTopWidth: 1,
    borderTopColor: "#202733",
  },
  notch: {
    position: "absolute",
    top: -24,
    width: 92,
    height: 48,
    borderRadius: 46,
    backgroundColor: "#F6F8FC",
  },
  darkNotch: {
    backgroundColor: "#05080D",
  },
  itemsRow: {
    width: 150,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  navButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#117C72",
    elevation: 6,
    shadowColor: "#0B4E49",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.24,
    shadowRadius: 7,
  },
  secondaryButton: {
    backgroundColor: "#E8F3F1",
    elevation: 0,
    shadowOpacity: 0,
  },
  darkSecondaryButton: {
    backgroundColor: "#151A22",
  },
});
