import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function ProspectusPdfWeb({ style }) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>Open this prospectus in your browser</Text>
      <Text style={styles.message}>
        The built-in PDF viewer is available in the mobile app. Use the open-link button above to view this PDF in a browser tab.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center", padding: 24 },
  title: { color: "#102A43", fontSize: 18, fontWeight: "700", textAlign: "center" },
  message: { color: "#52606D", fontSize: 14, lineHeight: 21, marginTop: 10, textAlign: "center" },
});
