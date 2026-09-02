import { StyleSheet, Text, View } from "react-native";

export default function CoursesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>PLAN YOUR FUTURE</Text>
      <Text style={styles.title}>Courses</Text>
      <Text style={styles.subtitle}>
        Explore courses and find a study path that fits your goals.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#F6F8FC",
  },
  eyebrow: {
    color: "#117C72",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  title: { marginTop: 8, color: "#172033", fontSize: 31, fontWeight: "900" },
  subtitle: { marginTop: 10, color: "#526078", fontSize: 16, lineHeight: 24 },
});
