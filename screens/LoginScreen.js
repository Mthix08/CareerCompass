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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    console.log("Login:", email, password);
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
        {/* ================= BRAND ================= */}
        <View style={styles.brandContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>C</Text>
          </View>

          <Text style={styles.brandName}>CareerCompass</Text>
        </View>

        {/* ================= HEADER ================= */}
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Welcome back</Text>

          <Text style={styles.subtitle}>
            Log in to keep planning your future.
          </Text>
        </View>

        {/* ================= FORM ================= */}
        <View style={styles.formContainer}>
          {/* EMAIL */}
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
              placeholder="Enter your email"
              placeholderTextColor="#A3A3A3"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* PASSWORD */}
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

          {/* FORGOT PASSWORD */}
          <TouchableOpacity
            style={styles.forgotContainer}
            activeOpacity={0.7}
            onPress={() => console.log("Forgot password")}
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          {/* LOGIN BUTTON */}
          <TouchableOpacity
            style={styles.loginButton}
            activeOpacity={0.8}
            onPress={handleLogin}
          >
            <Text style={styles.loginButtonText}>Log In</Text>
          </TouchableOpacity>

          {/* ================= DIVIDER ================= */}
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />

            <Text style={styles.orText}>or</Text>

            <View style={styles.divider} />
          </View>

          {/* CREATE ACCOUNT */}
          <TouchableOpacity
            style={styles.createButton}
            activeOpacity={0.8}
            onPress={() => navigation?.navigate("SignUp")}
          >
            <Text style={styles.createButtonText}>Create an account</Text>
          </TouchableOpacity>

          {/* BACK TO WELCOME */}
          <View style={styles.bottomTextContainer}>
            <Text style={styles.bottomText}>Just exploring? </Text>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation?.navigate("Welcome")}
            >
              <Text style={styles.backText}>Back to welcome</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  /* ================= MAIN ================= */

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

  /* ================= BRAND ================= */

  brandContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 38,
  },

  logo: {
    width: 38,
    height: 38,
    borderRadius: 9,
    backgroundColor: "#117C72",
    alignItems: "center",
    justifyContent: "center",
  },

  logoText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
  },

  brandName: {
    marginLeft: 12,
    fontSize: 20,
    fontWeight: "700",
    color: "#176F68",
  },

  /* ================= HEADER ================= */

  headerContainer: {
    marginBottom: 42,
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

  /* ================= FORM ================= */

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

  /* ================= FORGOT PASSWORD ================= */

  forgotContainer: {
    alignSelf: "flex-end",
    marginTop: 27,
  },

  forgotText: {
    fontSize: 14.5,
    fontWeight: "500",
    color: "#176F68",
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

  /* ================= DIVIDER ================= */

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

  /* ================= CREATE ACCOUNT ================= */

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

  /* ================= BOTTOM ================= */

  bottomTextContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",

    marginTop: 32,
  },

  bottomText: {
    fontSize: 14,
    color: "#858585",
  },

  backText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#C39A45",
  },
});
