import React, { useEffect, useState } from "react";
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
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "./firebaseConfig";

export default function SignUpScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const nextErrors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

    if (!name.trim()) {
      nextErrors.name = "Full name is required.";
    }

    if (!email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!emailPattern.test(email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!password) {
      nextErrors.password = "Password is required.";
    } else if (!passwordPattern.test(password)) {
      nextErrors.password =
        "Use at least 6 characters, including uppercase, lowercase, and a number.";
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = "Please confirm your password.";
    } else if (confirmPassword !== password) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSignUp = async () => {
    setHasSubmitted(true);
    if (!validateForm() || isLoading) return;

    try {
      setIsLoading(true);
      const credential = await createUserWithEmailAndPassword(
        auth,
        email.trim().toLowerCase(),
        password,
      );

      await setDoc(doc(db, "users", credential.user.uid), {
        name: name.trim(),
        email: credential.user.email,
        createdAt: serverTimestamp(),
      });

      await signOut(auth);
      navigation?.navigate("Login");
    } catch (error) {
      const emailAlreadyExists =
        error.code === "auth/email-already-in-use" ||
        error.code === "auth/credential-already-in-use";
      const message =
        emailAlreadyExists
          ? "An account with this email already exists. Log in instead or use a different email address."
          : error.code === "auth/invalid-email"
            ? "Enter a valid email address."
            : error.code === "auth/weak-password"
              ? "Choose a stronger password."
              : error.code === "auth/network-request-failed"
                ? "Check your internet connection and try again."
                : "We could not create your account. Please try again.";

      if (emailAlreadyExists) {
        setErrors((currentErrors) => ({
          ...currentErrors,
          email: message,
        }));
      }

      Alert.alert("Sign-up failed", message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (hasSubmitted) {
      validateForm();
    }
  }, [name, email, password, confirmPassword, hasSubmitted]);

  const updateField = (field, value, setter) => {
    setter(value);
    if (!hasSubmitted && errors[field]) {
      setErrors((currentErrors) => ({ ...currentErrors, [field]: undefined }));
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
          <View
            style={[styles.inputContainer, errors.name && styles.inputError]}
          >
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
              onChangeText={(value) => updateField("name", value, setName)}
              autoCapitalize="words"
            />
          </View>
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

          <Text style={[styles.label, styles.fieldLabel]}>Email address</Text>
          <View
            style={[styles.inputContainer, errors.email && styles.inputError]}
          >
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
              onChangeText={(value) => updateField("email", value, setEmail)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          <Text style={[styles.label, styles.fieldLabel]}>Password</Text>
          <View
            style={[
              styles.inputContainer,
              errors.password && styles.inputError,
            ]}
          >
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
              onChangeText={(value) =>
                updateField("password", value, setPassword)
              }
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
          {errors.password && (
            <Text style={styles.errorText}>{errors.password}</Text>
          )}

          <Text style={[styles.label, styles.fieldLabel]}>
            Confirm password
          </Text>
          <View
            style={[
              styles.inputContainer,
              errors.confirmPassword && styles.inputError,
            ]}
          >
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
              onChangeText={(value) =>
                updateField("confirmPassword", value, setConfirmPassword)
              }
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
          {errors.confirmPassword && (
            <Text style={styles.errorText}>{errors.confirmPassword}</Text>
          )}

          <TouchableOpacity
            style={[styles.signUpButton, isLoading && styles.buttonDisabled]}
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
    marginBottom: 34,
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
  fieldLabel: {
    marginTop: 18,
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
  inputError: {
    borderColor: "#D64545",
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
  errorText: {
    marginTop: 7,
    color: "#D64545",
    fontSize: 13,
    lineHeight: 18,
  },
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
  signUpButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
  buttonDisabled: {
    opacity: 0.65,
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
  loginText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#C39A45",
  },
});
