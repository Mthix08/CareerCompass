import {
  StyleSheet,
  Text,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";

export default function SignUpScreen({ navigation }) {
  return (
    <ImageBackground
      source={require("../assets/background.jpg")}
      imageStyle={styles.backgroundImage}
      style={styles.container}
    >
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Welcome to CareerCompass</Text>
          <TextInput style={styles.input} placeholder="Name" />
          <TextInput style={styles.input} placeholder="Email" />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
          />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("Home")}
          >
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.secondaryLink}>Already have an account?</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  backgroundImage: {
    opacity: 0.35,
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
});
