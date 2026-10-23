import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useProfile } from "../context/ProfileContext";
import { auth, db } from "./firebaseConfig";
import { signInWithGoogle } from "./googleAuth";
// Testing mode: every explicit sign-in starts at the general assessment.
async function getLandingRoute(_user) { return "CareerAssessmentWelcome"; }

const LOGIN_FAILURE_LIMIT = 3;
const LOGIN_COOLDOWN_SECONDS = 30;

function isCredentialFailure(error) {
  return [
    "auth/invalid-credential",
    "auth/wrong-password",
    "auth/user-not-found",
  ].includes(error.code);
}

async function isAccountRestricted(user) {
  const snapshot = await getDoc(doc(db, "users", user.uid));
  return snapshot.data()?.appRestricted === true;
}

export default function LoginScreen({ navigation }) {
  const { enterGuestMode, publicColors: colors, accessRestricted } = useProfile();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const isCoolingDown = cooldownSeconds > 0;
  const cooldownTimer = useRef(null);

  useEffect(() => () => clearInterval(cooldownTimer.current), []);

  useEffect(() => {
    if (!isCoolingDown) {
      clearInterval(cooldownTimer.current);
      cooldownTimer.current = null;
      return undefined;
    }
    cooldownTimer.current = setInterval(() => {
      setCooldownSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => {
      clearInterval(cooldownTimer.current);
      cooldownTimer.current = null;
    };
  }, [isCoolingDown]);

  const startCooldown = () => {
    setFailedAttempts(0);
    setCooldownSeconds(LOGIN_COOLDOWN_SECONDS);
  };

  const handleGoogleLogin = async () => {
    if (isLoading || isGoogleLoading) return;

    try {
      setIsGoogleLoading(true);
      const credential = await signInWithGoogle();
      if (await isAccountRestricted(credential.user)) {
        await signOut(auth);
        setErrors({ email: "", password: "This account is restricted. Contact support." });
        return;
      }
      navigation.reset({ index: 0, routes: [{ name: await getLandingRoute(credential.user) }] });
    } catch (error) {
      if (error.code !== "auth/popup-closed-by-user") {
        Alert.alert(
          "Google sign-in unavailable",
          error.code === "auth/google-client-id-missing"
            ? "Add the Google OAuth client ID before using Google sign-in on mobile."
            : "We could not sign you in with Google. Please try again.",
        );
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleLogin = async () => {
    if (isLoading || cooldownSeconds > 0) return;
    const nextErrors = {
      email: !email.trim() ? "Enter your email address." : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ? "Enter a valid email address." : "",
      password: !password ? "Enter your password." : "",
    };
    setErrors(nextErrors);
    if (nextErrors.email || nextErrors.password) {
      return;
    }

    try {
      setIsLoading(true);
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      if (await isAccountRestricted(credential.user)) {
        await signOut(auth);
        setErrors({ email: "", password: "This account is restricted. Contact support." });
        return;
      }
      setFailedAttempts(0);
      navigation.reset({ index: 0, routes: [{ name: await getLandingRoute(credential.user) }] });
    } catch (error) {
      if (isCredentialFailure(error)) {
        const nextFailedAttempts = failedAttempts + 1;
        if (nextFailedAttempts >= LOGIN_FAILURE_LIMIT) {
          startCooldown();
        } else {
          setFailedAttempts(nextFailedAttempts);
        }
      }
      if (error.code === "auth/invalid-email") {
        setErrors({ email: "Enter a valid email address.", password: "" });
      } else {
        setErrors({
          email: "",
          password: error.code === "auth/invalid-credential" || error.code === "auth/wrong-password"
            ? "That email address or password is incorrect."
            : "We could not log you in. Please try again.",
        });
      }
    } finally {
      setIsLoading(false);
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
          <Text style={styles.title}>Welcome back</Text>

          <Text style={styles.subtitle}>
            Log in to keep planning your future.
          </Text>
        </View>

        {accessRestricted && (
          <Text style={styles.restrictedNotice} accessibilityRole="alert">
            This account has been restricted. Contact support for assistance.
          </Text>
        )}

        <View style={styles.formContainer}>
          {}
          <Text style={styles.label}>Email address</Text>

          <View style={[styles.inputContainer, errors.email && styles.inputError]}>
            <Ionicons
              name="mail-outline"
              size={20}
              color={colors.mutedText}
              style={styles.inputIcon}
            />

            <TextInput
              style={styles.input}
              placeholder="your.email@example.com"
              placeholderTextColor={colors.mutedText}
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                setErrors((current) => ({ ...current, email: "", password: "" }));
              }}
              accessibilityLabel="Email address"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          {!!errors.email && <Text style={styles.errorText} accessibilityRole="alert">{errors.email}</Text>}

          <Text style={[styles.label, styles.passwordLabel]}>Password</Text>

          <View style={[styles.inputContainer, errors.password && styles.inputError]}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={colors.mutedText}
              style={styles.inputIcon}
            />

            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor={colors.mutedText}
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                setErrors((current) => ({ ...current, password: "" }));
              }}
              accessibilityLabel="Password"
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
          {!!errors.password && <Text style={styles.errorText} accessibilityRole="alert">{errors.password}</Text>}

          <TouchableOpacity
            style={styles.forgotContainer}
            activeOpacity={0.8}
            onPress={() => navigation?.navigate("PassRecovery")}
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginButton, (isLoading || cooldownSeconds > 0) && styles.loginButtonDisabled]}
            activeOpacity={0.8}
            onPress={handleLogin}
            disabled={isLoading || cooldownSeconds > 0}
            accessibilityState={{ disabled: isLoading || cooldownSeconds > 0, busy: isLoading }}
          >
            <Text style={styles.loginButtonText}>
              {isLoading
                ? "Logging in..."
                : cooldownSeconds > 0
                  ? `Try again in ${cooldownSeconds}s`
                  : "Log In"}
            </Text>
          </TouchableOpacity>
          {cooldownSeconds > 0 && (
            <Text style={styles.cooldownText} accessibilityRole="alert">
              Too many unsuccessful attempts. Please try again in {cooldownSeconds} seconds.
            </Text>
          )}

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />

            <Text style={styles.orText}>or</Text>

            <View style={styles.divider} />
          </View>

          <TouchableOpacity
            style={[styles.googleButton, isGoogleLoading && styles.buttonDisabled]}
            activeOpacity={0.8}
            onPress={handleGoogleLogin}
            disabled={isLoading || isGoogleLoading}
          >
            <Ionicons name="logo-google" size={19} color="#4285F4" />
            <Text style={styles.googleButtonText}>
              {isGoogleLoading ? "Connecting..." : "Continue with Google"}
            </Text>
          </TouchableOpacity>

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
              onPress={() => {
                enterGuestMode();
                navigation?.navigate("Home", { guest: true });
              }}
            >
              <Text style={styles.backText}>Login As A Guest</Text>
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
    marginBottom: 30,
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

  passwordLabel: {
    marginTop: 24,
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
  inputError: { borderColor: colors.danger },
  errorText: { marginTop: 7, color: colors.danger, fontSize: 13, lineHeight: 18 },
  restrictedNotice: { marginBottom: 16, padding: 12, borderRadius: 10, backgroundColor: colors.dangerSoft, color: colors.danger, fontSize: 13, lineHeight: 19 },

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

  forgotContainer: {
    alignSelf: "flex-end",
    marginTop: 27,
  },

  forgotText: {
    fontSize: 14.5,
    fontWeight: "500",
    color: colors.primary,
    textDecorationLine: "underline",
  },
  loginButton: {
    height: 65,
    borderRadius: 16,
    backgroundColor: colors.primary,

    alignItems: "center",
    justifyContent: "center",

    marginTop: 26,

    elevation: 3,

    shadowColor: colors.text,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.12,
    shadowRadius: 5,
  },
  loginButtonDisabled: { opacity: 0.55 },
  cooldownText: {
    marginTop: 9,
    color: colors.danger,
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
  },

  loginButtonText: {
    color: colors.onPrimary,
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
    backgroundColor: colors.border,
  },

  orText: {
    marginHorizontal: 14,
    fontSize: 14,
    color: colors.secondaryText,
  },

  createButton: {
    height: 67,
    borderRadius: 16,

    borderWidth: 1.3,
    borderColor: colors.primary,

    alignItems: "center",
    justifyContent: "center",
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
    marginBottom: 12,
  },

  googleButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
  },

  createButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.primary,
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

  backText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.accent,
    textDecorationLine: "underline",
  },
  });
}
