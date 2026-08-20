import {
  StyleSheet,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";

export default function LoginScreen({ navigation }) {
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Welcome Back</Text>
        <TextInput style={styles.input} placeholder="Email" />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
        />
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Home")}
        >
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
          <Text style={styles.secondaryLink}>Create an account</Text>
        </TouchableOpacity>
        <Text
          style={styles.guestLink}
          onPress={() => navigation.navigate("Home")}
        >
          Login as a guest
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F8FC",
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  title: {
    marginBottom: 24,
    color: "#172033",
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
  },
  input: {
    height: 52,
    marginBottom: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#D6DCE8",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    height: 52,
    marginTop: 8,
    borderRadius: 10,
    backgroundColor: "#2563EB",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryLink: {
    marginTop: 20,
    color: "#2563EB",
    textAlign: "center",
    fontWeight: "600",
  },
  guestLink: {
    marginTop: 16,
    color: "#526078",
    textAlign: "center",
  },
});
