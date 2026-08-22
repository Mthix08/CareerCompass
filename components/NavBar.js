import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export default function NavBar({ navigation }) {
  return (
    <View style={styles.navBar}>
      <View style={styles.notch} />
      <TouchableOpacity
        style={styles.homeButton}
        activeOpacity={0.8}
        onPress={() => navigation?.navigate("Home")}
        accessibilityLabel="Home"
        accessibilityRole="button"
      >
        <Ionicons name="home" size={25} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  navBar: {
    position: "absolute",
    right: 0,
    bottom: 0,
    left: 0,
    height: 82,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    alignItems: "center",
  },
  notch: {
    position: "absolute",
    top: -24,
    width: 92,
    height: 48,
    borderRadius: 46,
    backgroundColor: "#F6F8FC",
  },
  homeButton: {
    position: "absolute",
    top: -16,
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
});
