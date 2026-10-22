import React, { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, SafeAreaView, StatusBar, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useProfile } from "../context/ProfileContext";
import { beginCareerAssessment, skipCareerAssessment } from "../services/careerAssessmentService";

export default function CareerAssessmentWelcomeScreen({ navigation }) {
  const { firebaseUser, colors, resolvedTheme } = useProfile();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const start = async () => {
    if (!firebaseUser) return;
    try {
      setLoading(true); setError("");
      const answers = await beginCareerAssessment(firebaseUser.uid);
      navigation.replace("CareerAssessment", { initialAnswers: answers });
    } catch (_error) { setError("We could not save your assessment yet. Check your connection and try again."); }
    finally { setLoading(false); }
  };
  const maybeLater = async () => {
    try {
      setLoading(true); setError("");
      await skipCareerAssessment(firebaseUser.uid);
      navigation.reset({ index: 0, routes: [{ name: "Home" }] });
    } catch (_error) { setError("We could not save that choice. Please try again."); }
    finally { setLoading(false); }
  };
  return <SafeAreaView style={styles.safe}>
    <StatusBar barStyle={resolvedTheme === "dark" ? "light-content" : "dark-content"} backgroundColor={colors.background} />
    <View style={styles.content}>
      <View style={styles.iconWrap}><Ionicons name="compass-outline" size={48} color={colors.primary} /></View>
      <Text style={styles.eyebrow}>YOUR NEXT CHAPTER</Text>
      <Text style={styles.title}>Discover Your Future</Text>
      <Text style={styles.description}>Answer a few questions about your interests, strengths, and preferences. CareerCompass will use your answers to help you explore qualifications that may suit you.</Text>
      <View style={styles.infoCard}>
        <Ionicons name="sparkles-outline" size={22} color={colors.accent} />
        <Text style={styles.info}>Explore interests, learning preferences, strengths, and work environments.</Text>
      </View>
      <View style={styles.timeRow}><Ionicons name="time-outline" size={18} color={colors.secondaryText} /><Text style={styles.time}>About 5 minutes · 15 questions</Text></View>
      {!!error && <Text style={styles.error} accessibilityRole="alert">{error}</Text>}
      <Pressable style={styles.primary} onPress={start} disabled={loading} accessibilityRole="button">
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>Get Started</Text>}
      </Pressable>
      <Pressable style={styles.secondary} onPress={maybeLater} disabled={loading}><Text style={styles.secondaryText}>Maybe Later</Text></Pressable>
    </View>
  </SafeAreaView>;
}

function makeStyles(c) { return StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.background }, content: { flex: 1, padding: 25, justifyContent: "center" },
  iconWrap: { width: 100, height: 100, borderRadius: 30, backgroundColor: c.primarySoft, alignItems: "center", justifyContent: "center", alignSelf: "center", marginBottom: 28 },
  eyebrow: { textAlign: "center", color: c.primary, fontSize: 11, fontWeight: "900", letterSpacing: 1.8 },
  title: { marginTop: 12, color: c.text, fontSize: 31, fontWeight: "900", textAlign: "center" },
  description: { marginTop: 14, color: c.secondaryText, fontSize: 16, lineHeight: 24, textAlign: "center" },
  infoCard: { marginTop: 28, padding: 18, borderRadius: 18, borderWidth: 1, borderColor: c.border, backgroundColor: c.surface, flexDirection: "row", alignItems: "center", gap: 13 },
  info: { flex: 1, color: c.text, fontSize: 14, lineHeight: 21, fontWeight: "600" },
  timeRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 7, marginTop: 18 }, time: { color: c.secondaryText, fontSize: 13 },
  error: { marginTop: 15, color: c.danger, fontSize: 13, lineHeight: 19, textAlign: "center" },
  primary: { minHeight: 56, marginTop: 27, borderRadius: 16, backgroundColor: c.primary, alignItems: "center", justifyContent: "center" }, primaryText: { color: "#fff", fontWeight: "900", fontSize: 16 },
  secondary: { minHeight: 50, marginTop: 8, alignItems: "center", justifyContent: "center" }, secondaryText: { color: c.secondaryText, fontWeight: "700", fontSize: 15 },
}); }
