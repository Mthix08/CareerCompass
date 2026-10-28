import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StatusBar,
  Alert,
} from "react-native";
import Text from '../components/TranslatedText';
import { Ionicons } from "@expo/vector-icons";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "./firebaseConfig";
import { getGoogleAuthErrorMessage, signInWithGoogle } from "./googleAuth";
import { useProfile } from "../context/ProfileContext";
import { getCareerAssessmentStatus } from "../services/careerAssessmentService";

export default function SignUpScreen({ navigation }) {
  const { publicColors: colors } = useProfile();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleSignUp = async () => {
    if (isLoading || isGoogleLoading) return;

    try {
      setIsGoogleLoading(true);
      const credential = await signInWithGoogle();
      const googleName = credential.user.displayName?.trim() || "Student";

      await setDoc(
        doc(db, "users", credential.user.uid),
        {
          name: googleName,
          email: credential.user.email,
          photoURL: credential.user.photoURL || "",
          createdAt: serverTimestamp(),
        },
        { merge: true },
      );

      let route = "Home";
      try {
        const status = await getCareerAssessmentStatus(credential.user.uid);
        if (status === "not_started") route = "CareerAssessmentWelcome";
      } catch (error) {
        // An unavailable status read is not proof this is a first-time user.
        console.warn("Could not load assessment status after sign-up; opening Home.", error);
      }
      navigation?.reset({ index: 0, routes: [{ name: route }] });
    } catch (error) {
      if (error.code !== "auth/popup-closed-by-user") {
        Alert.alert(
          "Google sign-up unavailable",
          getGoogleAuthErrorMessage(error),
        );
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

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

    let accountCreated = false;
    try {
      setIsLoading(true);
      const credential = await createUserWithEmailAndPassword(
        auth,
        email.trim().toLowerCase(),
        password,
      );
      accountCreated = true;

      const normalizedEmail = credential.user.email?.trim().toLowerCase();
      if (!normalizedEmail) {
        throw new Error("The new account does not have an email address.");
      }
      await setDoc(doc(db, "users", credential.user.uid), {
        name: name.trim(),
        email: normalizedEmail,
        createdAt: serverTimestamp(),
      });
      await signOut(auth);
      navigation?.navigate("Login");
    } catch (error) {
      const emailAlreadyExists =
        error.code === "auth/email-already-in-use" ||
        error.code === "auth/credential-already-in-use";
      const message = emailAlreadyExists
        ? "An account with this email already exists. Log in instead or use a different email address."
        : error.code === "permission-denied" ||
            error.code === "firestore/permission-denied"
          ? accountCreated
            ? "Your account was created, but Firestore rules blocked saving your profile. Check your Firebase permissions and try again."
            : "Firestore rules prevented this request. Check your Firebase permissions and try again."
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

      if (accountCreated && auth.currentUser) {
        await signOut(auth).catch((signOutError) => {
          console.warn("Unable to sign out after incomplete sign-up.", signOutError);
        });
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
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brandContainer}>
          <Image
            source={require("../assets/CC.png")}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="CareerCompass logo"
          />
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
              color={colors.mutedText}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor={colors.mutedText}
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
              color={colors.mutedText}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor={colors.mutedText}
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
              color={colors.mutedText}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Create a password"
              placeholderTextColor={colors.mutedText}
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
              color={colors.mutedText}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Re-enter your password"
              placeholderTextColor={colors.mutedText}
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
            style={[
              styles.signUpButton,
              (isLoading || isGoogleLoading) && styles.buttonDisabled,
            ]}
            activeOpacity={0.8}
            onPress={handleSignUp}
            disabled={isLoading || isGoogleLoading}
          >
            <Text style={styles.signUpButtonText}>
              {isLoading ? "Creating account..." : "Create account"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.googleButton, isGoogleLoading && styles.buttonDisabled]}
            activeOpacity={0.8}
            onPress={handleGoogleSignUp}
            disabled={isLoading || isGoogleLoading}
          >
            <Ionicons name="logo-google" size={19} color="#4285F4" />
            <Text style={styles.googleButtonText}>
              {isGoogleLoading ? "Connecting..." : "Continue with Google"}
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

function makeStyles(colors) {
  return StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 68,
    paddingBottom: 30,
  },
  brandContainer: {
    alignItems: "center",
    marginBottom: 50,
    marginTop: -50,
  },
  logo: {
    width: 210,
    height: 120,
  },
  headerContainer: {
    marginTop: -35,
    marginBottom: 34,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15.5,
    color: colors.secondaryText,
    lineHeight: 22,
  },
  formContainer: {
    width: "100%",
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 10,
  },
  fieldLabel: {
    marginTop: 18,
  },
  inputContainer: {
    height: 66,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 15,
    backgroundColor: colors.input,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  inputError: {
    borderColor: colors.danger,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    color: colors.text,
  },
  showText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
  errorText: {
    marginTop: 7,
    color: colors.danger,
    fontSize: 13,
    lineHeight: 18,
  },
  signUpButton: {
    height: 65,
    borderRadius: 16,
    backgroundColor: colors.primary,
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
    color: colors.onPrimary,
    fontSize: 17,
    fontWeight: "700",
  },
  buttonDisabled: {
    opacity: 0.65,
  },

  googleButton: {
    height: 67,
    borderRadius: 16,
    borderWidth: 1.3,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 12,
  },

  googleButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
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
    color: colors.secondaryText,
  },
  loginText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.accent,
  },
  });
}
