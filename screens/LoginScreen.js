import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StatusBar,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebaseConfig";



export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Missing details", "Enter your email address and password.");
      return;
    }

    try {
      setIsLoading(true);
      await signInWithEmailAndPassword(auth, email.trim(), password);
      navigation.reset({ index: 0, routes: [{ name: "Home" }] });
    } catch (error) {
      const message =
        error.code === "auth/invalid-credential"
          ? "That email address or password is incorrect."
          : error.code === "auth/invalid-email"
            ? "Enter a valid email address."
            : "We could not log you in. Please try again.";
      Alert.alert("Login failed", message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FAF9F6" />

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brandContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoText}></Text>
          </View>

          <Text style={styles.brandName}>CareerCompass</Text>
        </View>

        <View style={styles.headerContainer}>
          <Text style={styles.title}>Welcome back</Text>

          <Text style={styles.subtitle}>
            Log in to keep planning your future.
          </Text>
        </View>

        <View style={styles.formContainer}>
          {}
          <Text style={styles.label}>Email address</Text>

          <View style={styles.inputContainer}>
            <Ionicons
              name="mail-outline"
              size={20}
              color="#777"
              style={styles.inputIcon}
            />

            <TextInput
              style={styles.input}
              placeholder="your.email@example.com"
              placeholderTextColor="#A3A3A3"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <Text style={[styles.label, styles.passwordLabel]}>Password</Text>

          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color="#777"
              style={styles.inputIcon}
            />

            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#A3A3A3"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />

            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              activeOpacity={0.7}
            >
              <Text style={styles.showText}>
                {showPassword ? "Hide" : "Show"}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.forgotContainer}
            activeOpacity={0.7}
            onPress={() => console.log("Forgot password")}
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          
          <TouchableOpacity
            style={styles.loginButton}
            activeOpacity={0.8}
            onPress={() => navigation?.navigate("Home")}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? "Logging in..." : "Log In"}
            </Text>
          </TouchableOpacity>

          
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />

            <Text style={styles.orText}>or</Text>

            <View style={styles.divider} />
          </View>

          
          <TouchableOpacity
            style={styles.createButton}
            activeOpacity={0.8}
            onPress={() => navigation?.navigate("SignUp")}
          >
            <Text style={styles.createButtonText}>Create an account</Text>
          </TouchableOpacity>

          
          <View style={styles.bottomTextContainer}>
            <Text style={styles.bottomText}>Just exploring? </Text>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation?.navigate("Home")}
            >
              <Text style={styles.backText}>Login As A Guest</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({

  keyboardContainer: {
    flex: 1,
    backgroundColor: "#FAF9F6",
  },

  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 68,
    paddingBottom: 30,
  },


  brandContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 38,
  },

  logo: {
    marginTop: -70,
    width: 38,
    height: 38,
    borderRadius: 9,
    backgroundColor: "#117C72",
    alignItems: "center",
    justifyContent: "center",
  },

  logoText: {
    marginTop: -70,
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
  },

  brandName: {
    marginTop: -70,
    marginLeft: 12,
    fontSize: 20,
    fontWeight: "700",
    color: "#176F68",
  },


  headerContainer: {
    marginTop: -35,
    marginBottom: 30,
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#18201F",
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 15.5,
    color: "#858585",
    lineHeight: 22,
  },


  formContainer: {
    width: "100%",
  },

  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#242B2A",
    marginBottom: 10,
  },

  passwordLabel: {
    marginTop: 24,
  },

  inputContainer: {
    height: 66,
    borderWidth: 1,
    borderColor: "#DEDCD7",
    borderRadius: 15,
    backgroundColor: "#F7F6F2",

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 16,
  },

  inputIcon: {
    marginRight: 10,
  },

  input: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    color: "#252B2A",
  },

  showText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#17796F",
  },


  forgotContainer: {
    alignSelf: "flex-end",
    marginTop: 27,
  },

  forgotText: {
    fontSize: 14.5,
    fontWeight: "500",
    color: "#176F68",
    textDecorationLine: "underline",
  },

  loginButton: {
    height: 65,
    borderRadius: 16,
    backgroundColor: "#107D72",

    alignItems: "center",
    justifyContent: "center",

    marginTop: 26,

    elevation: 3,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.12,
    shadowRadius: 5,
  },

  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },


  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 28,
  },

  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#DAD8D3",
  },

  orText: {
    marginHorizontal: 14,
    fontSize: 14,
    color: "#858585",
  },


  createButton: {
    height: 67,
    borderRadius: 16,

    borderWidth: 1.3,
    borderColor: "#147A72",

    alignItems: "center",
    justifyContent: "center",
  },

  createButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#176F68",
  },


  bottomTextContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",

    marginTop: 20,
    marginBottom: 40,
  },

  bottomText: {
    fontSize: 14,
    color: "#858585",
  },

  backText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#C39A45",
    textDecorationLine: "underline",
  },
});
