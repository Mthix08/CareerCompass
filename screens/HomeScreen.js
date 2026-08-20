import { StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to CareerCompass</Text>
      <Text style={styles.subtitle}>Your career journey starts here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#F6F8FC",
  },
  title: {
    color: "#172033",
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 12,
    color: "#526078",
    fontSize: 16,
    textAlign: "center",
  },
});
