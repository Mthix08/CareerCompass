import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { sendPasswordResetEmail } from "firebase/auth";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "./firebaseConfig";
import { useProfile } from "../context/ProfileContext";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESET_COOLDOWN_STEPS_SECONDS = [30, 60, 120, 240, 300];

export default function PassRecoveryScreen({ navigation }) {
  const { publicColors: colors } = useProfile();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [cooldownLevel, setCooldownLevel] = useState(0);
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

  const handleEmailChange = (value) => {
    setEmail(value);
    setError("");
    setSent(false);
  };

  const handleSubmit = async () => {
    if (loading || cooldownSeconds > 0) return;
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setError("Email address is required.");
      return;
    }
    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await sendPasswordResetEmail(auth, normalizedEmail);
      setEmail(normalizedEmail);
      setSent(true);
      const cooldown = RESET_COOLDOWN_STEPS_SECONDS[
        Math.min(cooldownLevel, RESET_COOLDOWN_STEPS_SECONDS.length - 1)
      ];
      setCooldownLevel((level) => Math.min(level + 1, RESET_COOLDOWN_STEPS_SECONDS.length - 1));
      setCooldownSeconds(cooldown);
    } catch (firebaseError) {
      if (firebaseError.code === "auth/invalid-email") {
        setError("Enter a valid email address.");
      } else if (firebaseError.code === "auth/user-not-found") {
        setError("No account was found for this email address.");
      } else if (firebaseError.code === "auth/too-many-requests") {
        setError("Too many attempts. Please wait a while and try again.");
      } else {
        setError("We couldn’t send the reset email. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.screenContent}>
            <Pressable
              onPress={() => navigation.navigate("Login")}
              accessibilityRole="button"
              accessibilityLabel="Back to login"
              hitSlop={8}
              style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            >
              <Ionicons name="arrow-back" size={23} color={colors.text} />
            </Pressable>
            <Image
              source={require("../assets/CC_Logo.png")}
              resizeMode="contain"
              accessibilityLabel="CareerCompass"
              style={styles.logo}
            />
            <Text style={styles.title}>Forgot password?</Text>
            <Text style={styles.subtitle}>
              Enter the email linked to your account and we’ll send you a secure password reset link.
            </Text>

            <View style={styles.formCard}>
              {sent ? (
                <View style={styles.successContent}>
                  <View style={styles.successIcon}>
                    <Ionicons name="mail" size={34} color={colors.onPrimary} />
                  </View>
                  <Text style={styles.cardTitle}>Check your email</Text>
                  <Text style={styles.cardIntro}>
                    If an account exists for this email, we’ve sent a password reset link. Follow the instructions in that email to choose a new password.
                  </Text>
                  {cooldownSeconds > 0 && (
                    <Text style={styles.cooldownMessage} accessibilityRole="alert">
                      You can request another email in {cooldownSeconds} seconds.
                    </Text>
                  )}
                  <Pressable
                    onPress={() => setSent(false)}
                    disabled={cooldownSeconds > 0}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: cooldownSeconds > 0 }}
                    style={({ pressed }) => [styles.secondaryButton, cooldownSeconds > 0 && styles.buttonDisabled, pressed && styles.pressed]}
                  >
                    <Text style={styles.secondaryButtonText}>
                      {cooldownSeconds > 0 ? `Resend email (${cooldownSeconds}s)` : "Resend reset email"}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => navigation.navigate("Login")}
                    accessibilityRole="button"
                    style={({ pressed }) => [styles.textLinkButton, pressed && styles.pressed]}
                  >
                    <Text style={styles.textLink}>Back to login</Text>
                  </Pressable>
                </View>
              ) : (
                <>
                  <Text style={styles.cardTitle}>Reset your password</Text>
                  <Text style={styles.cardIntro}>
                    We’ll email you a link to securely create a new password.
                  </Text>
                  <Text style={styles.inputLabel}>Email address</Text>
                  <View style={[styles.inputShell, error && styles.inputShellError]}>
                    <Ionicons name="mail-outline" size={20} color={colors.mutedText} />
                    <TextInput
                      value={email}
                      onChangeText={handleEmailChange}
                      onSubmitEditing={handleSubmit}
                      placeholder="your.email@example.com"
                      placeholderTextColor={colors.mutedText}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="email"
                      returnKeyType="send"
                      accessibilityLabel="Email address"
                      style={styles.textInput}
                    />
                  </View>
                  {!!error && (
                    <View style={styles.errorRow} accessibilityRole="alert">
                      <Ionicons name="alert-circle-outline" size={16} color={colors.danger} />
                      <Text style={styles.errorText}>{error}</Text>
                    </View>
                  )}
                  <Pressable
                    onPress={handleSubmit}
                    disabled={loading || cooldownSeconds > 0}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: loading || cooldownSeconds > 0, busy: loading }}
                    style={({ pressed }) => [styles.primaryButton, (loading || cooldownSeconds > 0) && styles.buttonDisabled, pressed && !loading && styles.pressed]}
                  >
                    {loading ? (
                      <ActivityIndicator color={colors.onPrimary} />
                    ) : (
                      <Text style={styles.primaryButtonText}>
                        {cooldownSeconds > 0 ? `Send reset link (${cooldownSeconds}s)` : "Send reset link"}
                      </Text>
                    )}
                  </Pressable>
                  <View style={styles.centeredLink}>
                    <Pressable
                      onPress={() => navigation.navigate("Login")}
                      accessibilityRole="button"
                      style={({ pressed }) => [styles.textLinkButton, pressed && styles.pressed]}
                    >
                      <Text style={styles.textLink}>Back to login</Text>
                    </Pressable>
                  </View>
                </>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  keyboardAvoidingView: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 46 },
  screenContent: {
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  logo: { width: 92, height: 72, alignSelf: "center", marginTop: 2 },
  title: {
    marginTop: 4,
    color: colors.text,
    fontSize: 30,
    fontWeight: "800",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 8,
    paddingHorizontal: 12,
    color: colors.secondaryText,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },
  formCard: {
    width: "100%",
    marginTop: 22,
    padding: 22,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    elevation: 8,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
  },
  cardTitle: { color: colors.text, fontSize: 21, fontWeight: "800", textAlign: "center" },
  cardIntro: {
    marginTop: 9,
    color: colors.secondaryText,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },
  inputLabel: {
    marginTop: 22,
    marginBottom: 9,
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  inputShell: {
    minHeight: 58,
    paddingHorizontal: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.input,
  },
  inputShellError: { borderColor: colors.danger },
  textInput: { flex: 1, minHeight: 56, marginLeft: 10, color: colors.text, fontSize: 15 },
  errorRow: { marginTop: 8, flexDirection: "row", alignItems: "flex-start" },
  errorText: { flex: 1, marginLeft: 6, color: colors.danger, fontSize: 12, lineHeight: 18 },
  primaryButton: {
    minHeight: 58,
    marginTop: 25,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },
  buttonDisabled: { opacity: 0.65 },
  primaryButtonText: { color: colors.onPrimary, fontSize: 16, fontWeight: "800", textAlign: "center" },
  centeredLink: { alignItems: "center", marginTop: 13 },
  textLinkButton: { minHeight: 44, justifyContent: "center", alignItems: "center" },
  textLink: { color: colors.primary, fontSize: 14, fontWeight: "700", textDecorationLine: "underline" },
  secondaryButton: {
    minHeight: 50,
    width: "100%",
    marginTop: 23,
    paddingHorizontal: 16,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: { color: colors.text, fontSize: 15, fontWeight: "700" },
  cooldownMessage: {
    marginTop: 13,
    color: colors.secondaryText,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },
  successContent: { alignItems: "center", paddingTop: 5 },
  successIcon: {
    width: 68,
    height: 68,
    marginBottom: 18,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },
  pressed: { opacity: 0.68 },
  });
}
