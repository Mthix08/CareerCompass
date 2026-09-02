import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  AccessibilityInfo,
  ActivityIndicator,
  Animated,
  BackHandler,
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
import { SafeAreaView } from "react-native-safe-area-context";

const DEVELOPMENT_PREVIEW_OTP = "123456";
const RESEND_WAIT_SECONDS = 30;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const wait = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

const requestPasswordResetOtp = async (email) => {
  // TODO: Replace with backend API call. No email is sent in this preview.
  void email;
  await wait(650);
};

const verifyPasswordResetOtp = async (email, otp) => {
  // TODO: Replace with secure backend verification.
  void email;
  void otp;
  await wait(550);
};

const resendPasswordResetOtp = async (email) => {
  // TODO: Replace with backend API call.
  void email;
  await wait(500);
};

const resetPassword = async ({ email, otp, newPassword }) => {
  // TODO: Replace with secure backend API call.
  void email;
  void otp;
  void newPassword;
  await wait(650);
};

/*
 * Backend security TODO:
 * Generate OTPs securely, store only hashed OTPs with short expirations, limit
 * verification/resend attempts, verify accounts server-side, issue a short-lived
 * reset token after verification, and reset passwords only on the server. Never
 * trust frontend OTP validation. Remove DEVELOPMENT_PREVIEW_OTP at integration.
 */

const STEP_CONTENT = {
  email: "Enter the email linked to your CareerCompass account.",
  otp: "Enter the six-digit verification code associated with your email.",
  newPassword: "Create a strong new password for your account.",
  success: "Your frontend recovery journey is ready for backend integration.",
};
const STEP_INDEX = { email: 0, otp: 1, newPassword: 2, success: 3 };

function validateEmail(value) {
  const normalizedEmail = value.trim().toLowerCase();
  if (!normalizedEmail) return "Email address is required.";
  if (!EMAIL_PATTERN.test(normalizedEmail)) return "Enter a valid email address.";
  return "";
}

function maskEmail(value) {
  const [name = "", domain = ""] = value.split("@");
  if (!domain) return value;
  const visible = name.slice(0, Math.min(2, name.length));
  return `${visible}${"*".repeat(Math.max(3, name.length - visible.length))}@${domain}`;
}

function PasswordResetProgress({ currentStep }) {
  const visibleIndex = Math.min(STEP_INDEX[currentStep], 2);
  const steps = ["Email", "Verify", "Reset"];

  return (
    <View
      style={styles.progress}
      accessibilityLabel={`Password recovery step ${visibleIndex + 1} of 3`}
    >
      {steps.map((label, index) => {
        const completed = index < visibleIndex || currentStep === "success";
        const active = index === visibleIndex && currentStep !== "success";
        const highlighted = completed || active;
        return (
          <React.Fragment key={label}>
            {index > 0 && (
              <View
                style={[
                  styles.progressLine,
                  completed && styles.progressLineComplete,
                ]}
              />
            )}
            <View style={styles.progressItem}>
              <View
                style={[
                  styles.progressCircle,
                  highlighted && styles.progressCircleHighlighted,
                ]}
              >
                {completed ? (
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                ) : (
                  <Text
                    style={[
                      styles.progressNumber,
                      active && styles.progressNumberActive,
                    ]}
                  >
                    {index + 1}
                  </Text>
                )}
              </View>
              <Text
                style={[
                  styles.progressLabel,
                  highlighted && styles.progressLabelHighlighted,
                ]}
              >
                {label}
              </Text>
            </View>
          </React.Fragment>
        );
      })}
    </View>
  );
}

function FieldError({ message }) {
  if (!message) return null;
  return (
    <View style={styles.errorRow} accessibilityRole="alert">
      <Ionicons name="alert-circle-outline" size={16} color="#FF7A7A" />
      <Text style={styles.errorText}>{message}</Text>
    </View>
  );
}

function PrimaryButton({ label, onPress, loading = false, disabled = false }) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        styles.primaryButton,
        isDisabled && styles.primaryButtonDisabled,
        pressed && !isDisabled && styles.buttonPressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text style={styles.primaryButtonText}>{label}</Text>
      )}
    </Pressable>
  );
}

function TextLink({ label, onPress, disabled = false }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      hitSlop={8}
      style={({ pressed }) => [
        styles.textLinkButton,
        pressed && styles.linkPressed,
      ]}
    >
      <Text style={[styles.textLink, disabled && styles.textLinkDisabled]}>
        {label}
      </Text>
    </Pressable>
  );
}

function EmailStep({ email, error, loading, onEmailChange, onSubmit, onBack }) {
  return (
    <View>
      <Text style={styles.cardTitle}>Find your account</Text>
      <Text style={styles.cardIntro}>
        We’ll use your email to start the password recovery preview.
      </Text>
      <Text style={styles.inputLabel}>Email address</Text>
      <View style={[styles.inputShell, error && styles.inputShellError]}>
        <Ionicons name="mail-outline" size={20} color="#8D98A8" />
        <TextInput
          value={email}
          onChangeText={onEmailChange}
          onSubmitEditing={onSubmit}
          placeholder="your.email@example.com"
          placeholderTextColor="#6F7988"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          returnKeyType="send"
          accessibilityLabel="Email address"
          style={styles.textInput}
        />
      </View>
      <FieldError message={error} />
      <PrimaryButton
        label="Send verification code"
        onPress={onSubmit}
        loading={loading}
      />
      <View style={styles.centeredLink}>
        <TextLink label="Back to login" onPress={onBack} />
      </View>
      <DevelopmentNote>
        Development preview: backend email delivery will be added later.
      </DevelopmentNote>
    </View>
  );
}

function DevelopmentNote({ children }) {
  return (
    <View style={styles.developmentNote}>
      <Ionicons name="code-slash-outline" size={16} color="#65DDB4" />
      <Text style={styles.developmentNoteText}>{children}</Text>
    </View>
  );
}

function OtpStep({
  email,
  otp,
  error,
  loading,
  resendCountdown,
  resendLoading,
  otpInputRef,
  onOtpChange,
  onSubmit,
  onResend,
  onChangeEmail,
}) {
  return (
    <View>
      <Text style={styles.cardTitle}>Verify your code</Text>
      <Text style={styles.cardIntro}>
        Enter the code associated with {maskEmail(email)}.
      </Text>
      <View style={styles.otpInputWrap}>
        <TextInput
          ref={otpInputRef}
          value={otp}
          onChangeText={onOtpChange}
          onSubmitEditing={onSubmit}
          keyboardType="number-pad"
          maxLength={6}
          textContentType="oneTimeCode"
          autoComplete="one-time-code"
          caretHidden
          accessibilityLabel="Six-digit verification code"
          style={styles.otpHiddenInput}
        />
        <View style={styles.otpBoxes} pointerEvents="none">
          {Array.from({ length: 6 }, (_, index) => (
            <View
              key={index}
              style={[
                styles.otpBox,
                index === otp.length && styles.otpBoxActive,
                error && styles.otpBoxError,
              ]}
            >
              <Text style={styles.otpDigit}>{otp[index] || ""}</Text>
            </View>
          ))}
        </View>
      </View>
      <FieldError message={error} />
      <PrimaryButton label="Verify code" onPress={onSubmit} loading={loading} />
      <View style={styles.otpLinksRow}>
        <TextLink
          label={
            resendLoading
              ? "Resending…"
              : resendCountdown > 0
                ? `Resend in ${resendCountdown}s`
                : "Resend code"
          }
          onPress={onResend}
          disabled={resendCountdown > 0 || resendLoading}
        />
        <TextLink label="Change email" onPress={onChangeEmail} />
      </View>
      <DevelopmentNote>Development preview code: 123456</DevelopmentNote>
    </View>
  );
}

function PasswordInput({
  label,
  value,
  visible,
  error,
  returnKeyType,
  onChangeText,
  onBlur,
  onSubmitEditing,
  onToggleVisibility,
}) {
  return (
    <View style={styles.passwordField}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={[styles.inputShell, error && styles.inputShellError]}>
        <Ionicons name="lock-closed-outline" size={20} color="#8D98A8" />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          onSubmitEditing={onSubmitEditing}
          placeholder={label}
          placeholderTextColor="#6F7988"
          secureTextEntry={!visible}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="new-password"
          returnKeyType={returnKeyType}
          accessibilityLabel={label}
          style={styles.textInput}
        />
        <Pressable
          onPress={onToggleVisibility}
          accessibilityRole="button"
          accessibilityLabel={`${visible ? "Hide" : "Show"} ${label.toLowerCase()}`}
          hitSlop={8}
          style={({ pressed }) => [
            styles.eyeButton,
            pressed && styles.linkPressed,
          ]}
        >
          <Ionicons
            name={visible ? "eye-off-outline" : "eye-outline"}
            size={21}
            color="#A8B1BE"
          />
        </Pressable>
      </View>
      <FieldError message={error} />
    </View>
  );
}

function NewPasswordStep({
  password,
  confirmPassword,
  showPassword,
  showConfirmPassword,
  passwordError,
  confirmPasswordError,
  requirements,
  canSubmit,
  loading,
  onPasswordChange,
  onConfirmPasswordChange,
  onPasswordBlur,
  onConfirmPasswordBlur,
  onTogglePassword,
  onToggleConfirmPassword,
  onSubmit,
}) {
  return (
    <View>
      <Text style={styles.cardTitle}>Create a new password</Text>
      <Text style={styles.cardIntro}>
        Use a unique password that you don’t use elsewhere.
      </Text>
      <PasswordInput
        label="New password"
        value={password}
        visible={showPassword}
        error={passwordError}
        returnKeyType="next"
        onChangeText={onPasswordChange}
        onBlur={onPasswordBlur}
        onToggleVisibility={onTogglePassword}
      />
      <View style={styles.requirementsCard}>
        {requirements.map((requirement) => (
          <View key={requirement.label} style={styles.requirementRow}>
            <Ionicons
              name={requirement.valid ? "checkmark-circle" : "ellipse-outline"}
              size={17}
              color={requirement.valid ? "#00C853" : "#687382"}
            />
            <Text
              style={[
                styles.requirementText,
                requirement.valid && styles.requirementTextValid,
              ]}
            >
              {requirement.label}
            </Text>
          </View>
        ))}
      </View>
      <PasswordInput
        label="Confirm new password"
        value={confirmPassword}
        visible={showConfirmPassword}
        error={confirmPasswordError}
        returnKeyType="done"
        onChangeText={onConfirmPasswordChange}
        onBlur={onConfirmPasswordBlur}
        onSubmitEditing={canSubmit ? onSubmit : undefined}
        onToggleVisibility={onToggleConfirmPassword}
      />
      <PrimaryButton
        label="Reset password"
        onPress={onSubmit}
        loading={loading}
        disabled={!canSubmit}
      />
    </View>
  );
}

function PasswordResetSuccess({ onReturnToLogin }) {
  return (
    <View style={styles.successContent}>
      <View style={styles.successIcon}>
        <Ionicons name="checkmark" size={42} color="#FFFFFF" />
      </View>
      <Text style={styles.successTitle}>Password reset preview complete</Text>
      <Text style={styles.successText}>
        The frontend flow worked, but no real account password was changed because
        the secure backend has not been connected yet.
      </Text>
      <PrimaryButton label="Return to login" onPress={onReturnToLogin} />
    </View>
  );
}

export default function ForgotPasswordScreen({ navigation }) {
  const [currentStep, setCurrentStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loadingAction, setLoadingAction] = useState("");
  const [resendCountdown, setResendCountdown] = useState(RESEND_WAIT_SECONDS);
  const [reducedMotion, setReducedMotion] = useState(false);
  const opacity = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const transitionInProgress = useRef(false);
  const otpInputRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setReducedMotion(enabled);
    });
    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReducedMotion,
    );
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (currentStep !== "otp") return undefined;
    const focusTimer = setTimeout(() => otpInputRef.current?.focus(), 180);
    return () => clearTimeout(focusTimer);
  }, [currentStep]);

  useEffect(() => {
    if (currentStep !== "otp" || resendCountdown <= 0) return undefined;
    const countdownTimer = setInterval(() => {
      setResendCountdown((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => clearInterval(countdownTimer);
  }, [currentStep, resendCountdown]);

  const transitionTo = useCallback(
    (nextStep) => {
      if (transitionInProgress.current || nextStep === currentStep) return;
      if (reducedMotion) {
        setCurrentStep(nextStep);
        return;
      }
      transitionInProgress.current = true;
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: -18,
          duration: 120,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (!finished) {
          transitionInProgress.current = false;
          return;
        }
        setCurrentStep(nextStep);
        translateX.setValue(22);
        requestAnimationFrame(() => {
          Animated.parallel([
            Animated.timing(opacity, {
              toValue: 1,
              duration: 180,
              useNativeDriver: true,
            }),
            Animated.timing(translateX, {
              toValue: 0,
              duration: 180,
              useNativeDriver: true,
            }),
          ]).start(() => {
            transitionInProgress.current = false;
          });
        });
      });
    },
    [currentStep, opacity, reducedMotion, translateX],
  );

  const returnToLogin = useCallback(() => {
    navigation.navigate("Login");
  }, [navigation]);

  const handleBack = useCallback(() => {
    if (currentStep === "email" || currentStep === "success") {
      returnToLogin();
    } else if (currentStep === "otp") {
      transitionTo("email");
    } else {
      transitionTo("otp");
    }
    return true;
  }, [currentStep, returnToLogin, transitionTo]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBack,
    );
    return () => subscription.remove();
  }, [handleBack]);

  const passwordRequirements = useMemo(
    () => [
      { label: "At least 8 characters", valid: password.length >= 8 },
      { label: "One uppercase letter", valid: /[A-Z]/.test(password) },
      { label: "One lowercase letter", valid: /[a-z]/.test(password) },
      { label: "One number", valid: /\d/.test(password) },
    ],
    [password],
  );
  const passwordValid = passwordRequirements.every((item) => item.valid);
  const passwordsMatch = Boolean(confirmPassword) && password === confirmPassword;
  const canResetPassword = passwordValid && passwordsMatch && !loadingAction;
  const passwordError =
    passwordTouched && !password
      ? "New password is required."
      : passwordTouched && !passwordValid
        ? "Your password does not meet all the requirements."
        : "";
  const confirmPasswordError =
    confirmPasswordTouched && !confirmPassword
      ? "Please confirm your new password."
      : confirmPasswordTouched && !passwordsMatch
        ? "The passwords do not match."
        : "";

  const handleEmailChange = (value) => {
    setEmail(value);
    if (emailError) setEmailError(validateEmail(value));
  };

  const handleEmailSubmit = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    const nextError = validateEmail(normalizedEmail);
    setEmail(normalizedEmail);
    setEmailError(nextError);
    if (nextError || loadingAction) return;
    setLoadingAction("email");
    await requestPasswordResetOtp(normalizedEmail);
    setLoadingAction("");
    setResendCountdown(RESEND_WAIT_SECONDS);
    transitionTo("otp");
  };

  const handleOtpChange = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 6);
    setOtp(digits);
    if (otpError) {
      setOtpError(digits.length < 6 ? "Enter all six digits." : "");
    }
  };

  const handleOtpSubmit = async () => {
    if (otp.length < 6) {
      setOtpError("Enter all six digits.");
      return;
    }
    if (loadingAction) return;
    setLoadingAction("otp");
    await verifyPasswordResetOtp(email, otp);
    setLoadingAction("");
    if (otp !== DEVELOPMENT_PREVIEW_OTP) {
      setOtpError("That preview code is incorrect. Try again.");
      return;
    }
    setOtpError("");
    transitionTo("newPassword");
  };

  const handleResend = async () => {
    if (resendCountdown > 0 || loadingAction) return;
    setLoadingAction("resend");
    await resendPasswordResetOtp(email);
    setLoadingAction("");
    setOtp("");
    setOtpError("");
    setResendCountdown(RESEND_WAIT_SECONDS);
    otpInputRef.current?.focus();
  };

  const handlePasswordReset = async () => {
    setPasswordTouched(true);
    setConfirmPasswordTouched(true);
    if (!canResetPassword) return;
    setLoadingAction("password");
    await resetPassword({ email, otp, newPassword: password });
    setLoadingAction("");
    transitionTo("success");
  };

  const renderStep = () => {
    if (currentStep === "otp") {
      return (
        <OtpStep
          email={email}
          otp={otp}
          error={otpError}
          loading={loadingAction === "otp"}
          resendCountdown={resendCountdown}
          resendLoading={loadingAction === "resend"}
          otpInputRef={otpInputRef}
          onOtpChange={handleOtpChange}
          onSubmit={handleOtpSubmit}
          onResend={handleResend}
          onChangeEmail={() => transitionTo("email")}
        />
      );
    }
    if (currentStep === "newPassword") {
      return (
        <NewPasswordStep
          password={password}
          confirmPassword={confirmPassword}
          showPassword={showPassword}
          showConfirmPassword={showConfirmPassword}
          passwordError={passwordError}
          confirmPasswordError={confirmPasswordError}
          requirements={passwordRequirements}
          canSubmit={canResetPassword}
          loading={loadingAction === "password"}
          onPasswordChange={setPassword}
          onConfirmPasswordChange={setConfirmPassword}
          onPasswordBlur={() => setPasswordTouched(true)}
          onConfirmPasswordBlur={() => setConfirmPasswordTouched(true)}
          onTogglePassword={() => setShowPassword((visible) => !visible)}
          onToggleConfirmPassword={() =>
            setShowConfirmPassword((visible) => !visible)
          }
          onSubmit={handlePasswordReset}
        />
      );
    }
    if (currentStep === "success") {
      return <PasswordResetSuccess onReturnToLogin={returnToLogin} />;
    }
    return (
      <EmailStep
        email={email}
        error={emailError}
        loading={loadingAction === "email"}
        onEmailChange={handleEmailChange}
        onSubmit={handleEmailSubmit}
        onBack={returnToLogin}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F6F8FC" />
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
              onPress={handleBack}
              accessibilityRole="button"
              accessibilityLabel={
                currentStep === "email"
                  ? "Back to login"
                  : "Previous password recovery step"
              }
              hitSlop={8}
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.backButtonPressed,
              ]}
            >
              <Ionicons name="arrow-back" size={23} color="#172033" />
            </Pressable>
            <Image
              source={require("../assets/CC_Logo.png")}
              resizeMode="contain"
              accessibilityLabel="CareerCompass"
              style={styles.logo}
            />
            <Text style={styles.title}>Forgot password?</Text>
            <Text style={styles.subtitle}>{STEP_CONTENT[currentStep]}</Text>
            <PasswordResetProgress currentStep={currentStep} />
            <Animated.View
              style={[
                styles.formCard,
                { opacity, transform: [{ translateX }] },
              ]}
            >
              {renderStep()}
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F6F8FC" },
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
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E1E5EA",
  },
  backButtonPressed: { opacity: 0.65 },
  logo: { width: 92, height: 72, alignSelf: "center", marginTop: 2 },
  title: {
    marginTop: 4,
    color: "#172033",
    fontSize: 30,
    fontWeight: "800",
    textAlign: "center",
  },
  subtitle: {
    minHeight: 44,
    marginTop: 8,
    paddingHorizontal: 12,
    color: "#68758A",
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },
  progress: {
    minHeight: 62,
    marginTop: 18,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  progressItem: { width: 60, alignItems: "center" },
  progressLine: {
    flex: 1,
    height: 2,
    marginTop: 15,
    marginHorizontal: -5,
    backgroundColor: "#CDD3DC",
  },
  progressLineComplete: { backgroundColor: "#00A878" },
  progressCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DDE2E9",
  },
  progressCircleHighlighted: { backgroundColor: "#00A878" },
  progressNumber: { color: "#737F90", fontSize: 12, fontWeight: "800" },
  progressNumberActive: { color: "#FFFFFF" },
  progressLabel: {
    marginTop: 7,
    color: "#8A95A5",
    fontSize: 11,
    fontWeight: "700",
  },
  progressLabelHighlighted: { color: "#08785E" },
  formCard: {
    width: "100%",
    marginTop: 12,
    padding: 22,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#202936",
    backgroundColor: "#0D1117",
    elevation: 8,
    shadowColor: "#07101B",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
  },
  cardTitle: { color: "#FFFFFF", fontSize: 21, fontWeight: "800" },
  cardIntro: {
    marginTop: 7,
    color: "#9CA6B5",
    fontSize: 14,
    lineHeight: 21,
  },
  inputLabel: {
    marginTop: 22,
    marginBottom: 9,
    color: "#E7EBF0",
    fontSize: 14,
    fontWeight: "700",
  },
  inputShell: {
    minHeight: 58,
    paddingHorizontal: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#303946",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#151A22",
  },
  inputShellError: { borderColor: "#E45D5D" },
  textInput: {
    flex: 1,
    minHeight: 56,
    marginLeft: 10,
    color: "#FFFFFF",
    fontSize: 15,
  },
  errorRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  errorText: {
    flex: 1,
    marginLeft: 6,
    color: "#FF8B8B",
    fontSize: 12,
    lineHeight: 18,
  },
  primaryButton: {
    minHeight: 58,
    marginTop: 25,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#117C72",
  },
  primaryButtonDisabled: { opacity: 0.42 },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
  },
  buttonPressed: { opacity: 0.78 },
  centeredLink: { alignItems: "center", marginTop: 18 },
  textLinkButton: { minHeight: 44, justifyContent: "center" },
  textLink: {
    color: "#65DDB4",
    fontSize: 14,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  textLinkDisabled: { color: "#687382", textDecorationLine: "none" },
  linkPressed: { opacity: 0.58 },
  developmentNote: {
    marginTop: 17,
    padding: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(17, 124, 114, 0.15)",
  },
  developmentNoteText: {
    flex: 1,
    marginLeft: 8,
    color: "#9BDCCB",
    fontSize: 11,
    lineHeight: 17,
  },
  otpInputWrap: { height: 58, marginTop: 24, position: "relative" },
  otpHiddenInput: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.02,
    color: "transparent",
  },
  otpBoxes: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
    gap: 7,
  },
  otpBox: {
    flex: 1,
    minWidth: 0,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#303946",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#151A22",
  },
  otpBoxActive: { borderColor: "#00A878", borderWidth: 2 },
  otpBoxError: { borderColor: "#E45D5D" },
  otpDigit: { color: "#FFFFFF", fontSize: 20, fontWeight: "800" },
  otpLinksRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  passwordField: { width: "100%" },
  eyeButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  requirementsCard: {
    marginTop: 14,
    padding: 13,
    borderRadius: 13,
    backgroundColor: "#151A22",
  },
  requirementRow: {
    minHeight: 26,
    flexDirection: "row",
    alignItems: "center",
  },
  requirementText: { marginLeft: 8, color: "#7F8997", fontSize: 12 },
  requirementTextValid: { color: "#61DC91" },
  successContent: { alignItems: "center", paddingTop: 7 },
  successIcon: {
    width: 78,
    height: 78,
    borderRadius: 39,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#00A878",
  },
  successTitle: {
    marginTop: 21,
    color: "#FFFFFF",
    fontSize: 22,
    lineHeight: 29,
    fontWeight: "800",
    textAlign: "center",
  },
  successText: {
    marginTop: 11,
    color: "#AEB7C4",
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
  },
});
