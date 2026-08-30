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
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "./firebaseConfig";

export default function SignUpScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async () => {
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      Alert.alert("Missing details", "Complete every field to create an account.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Passwords do not match", "Enter the same password twice.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Password too short", "Use at least six characters.");
      return;
    }

    try {
      setIsLoading(true);
      const credential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );

      await setDoc(doc(db, "users", credential.user.uid), {
        name: name.trim(),
        email: credential.user.email,
        createdAt: serverTimestamp(),
      });

      navigation.reset({ index: 0, routes: [{ name: "Home" }] });
    } catch (error) {
      const message =
        error.code === "auth/email-already-in-use"
          ? "An account already exists for that email address."
          : error.code === "auth/invalid-email"
            ? "Enter a valid email address."
            : "We could not create your account. Please try again.";
      Alert.alert("Sign-up failed", message);
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
            <Text style={styles.logoText}>C</Text>
          </View>
          <Text style={styles.brandName}>CareerCompass</Text>
        </View>

        <View style={styles.headerContainer}>
          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>
            Start planning your future with CareerCompass.
          </Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.label}>Full name</Text>
          <View style={styles.inputContainer}>
            <Ionicons
              name="person-outline"
              size={20}
              color="#777"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor="#A3A3A3"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          <Text style={[styles.label, styles.fieldLabel]}>Email address</Text>
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

          <Text style={[styles.label, styles.fieldLabel]}>Password</Text>
          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color="#777"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Create a password"
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

          <Text style={[styles.label, styles.fieldLabel]}>
            Confirm password
          </Text>
          <View style={styles.inputContainer}>
            <Ionicons
              name="shield-checkmark-outline"
              size={20}
              color="#777"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Re-enter your password"
              placeholderTextColor="#A3A3A3"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              activeOpacity={0.7}
            >
              <Text style={styles.showText}>
                {showConfirmPassword ? "Hide" : "Show"}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.signUpButton}
            activeOpacity={0.8}
            onPress={handleSignUp}
            disabled={isLoading}
          >
            <Text style={styles.signUpButtonText}>
              {isLoading ? "Creating account..." : "Create account"}
            </Text>
          </TouchableOpacity>

          <View style={styles.bottomTextContainer}>
            <Text style={styles.bottomText}>Already have an account? </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation?.navigate("Login")}
            >
              <Text style={styles.loginText}>Log in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: { flex: 1, backgroundColor: "#FAF9F6" },
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
    width: 38,
    height: 38,
    borderRadius: 9,
    backgroundColor: "#117C72",
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: { color: "#FFFFFF", fontSize: 20, fontWeight: "700" },
  brandName: {
    marginLeft: 12,
    fontSize: 20,
    fontWeight: "700",
    color: "#176F68",
  },
  headerContainer: { marginBottom: 34 },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#18201F",
    marginBottom: 6,
  },
  subtitle: { fontSize: 15.5, color: "#858585", lineHeight: 22 },
  formContainer: { width: "100%" },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#242B2A",
    marginBottom: 10,
  },
  fieldLabel: { marginTop: 18 },
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
  inputIcon: { marginRight: 10 },
  input: { flex: 1, height: "100%", fontSize: 16, color: "#252B2A" },
  showText: { fontSize: 14, fontWeight: "600", color: "#17796F" },
  signUpButton: {
    height: 65,
    borderRadius: 16,
    backgroundColor: "#107D72",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 28,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
  },
  signUpButtonText: { color: "#FFFFFF", fontSize: 17, fontWeight: "700" },
  bottomTextContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 32,
  },
  bottomText: { fontSize: 14, color: "#858585" },
  loginText: { fontSize: 14, fontWeight: "700", color: "#C39A45" },
});
