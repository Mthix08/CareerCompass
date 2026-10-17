import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

export default function CollegeCard({ college, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open ${college.name}`}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.8 }]}
    >
      {!!college.imageUrl && (
        <Image source={{ uri: college.imageUrl }} style={styles.image} />
      )}
      <View style={styles.body}>
        <Text style={styles.name}>{college.name}</Text>
        <Text style={styles.province}>{college.province}</Text>
        {!!college.type && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{college.type}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { overflow: "hidden", borderRadius: 18, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#DDE4ED" },
  image: { width: "100%", height: 170 },
  body: { padding: 16 },
  name: { fontSize: 17, fontWeight: "800", color: "#172033" },
  province: { marginTop: 3, fontSize: 13, color: "#667085" },
  badge: { alignSelf: "flex-start", marginTop: 10, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: "#E7F3F1" },
  badgeText: { fontSize: 11, fontWeight: "800", color: "#117C72" },
});