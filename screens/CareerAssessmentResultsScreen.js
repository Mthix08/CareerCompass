import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useProfile } from "../context/ProfileContext";
import { CAREER_ASSESSMENT_QUESTIONS } from "../data/careerAssessmentQuestions";
import { beginCareerAssessment, getCareerAssessment } from "../services/careerAssessmentService";

export default function CareerAssessmentResultsScreen({ navigation }) {
  const { firebaseUser, colors, resolvedTheme } = useProfile();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getCareerAssessment(firebaseUser.uid)
      .then((assessment) => { if (active) setAnswers(assessment.answers || {}); })
      .catch(() => { if (active) setError("We could not load your saved answer summary."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [firebaseUser.uid]);

  const summary = CAREER_ASSESSMENT_QUESTIONS.map((question) => {
    const value = answers[question.id];
    const selectedIds = Array.isArray(value) ? value : value ? [value] : [];
    const labels = question.options.filter((option) => selectedIds.includes(option.id)).map((option) => option.label);
    return labels.length ? { id: question.id, question: question.text, labels } : null;
  }).filter(Boolean);

  const retake = async () => {
    try {
      setLoading(true); setError("");
      const current = await getCareerAssessment(firebaseUser.uid);
      const draft = await beginCareerAssessment(firebaseUser.uid);
      navigation.replace("CareerAssessment", { initialAnswers: draft || current.answers || {} });
    } catch (_error) { setError("We could not load your saved answers. Please try again."); }
    finally { setLoading(false); }
  };

  return <SafeAreaView style={styles.safe}>
    <StatusBar barStyle={resolvedTheme === "dark" ? "light-content" : "dark-content"} backgroundColor={colors.background} />
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.success}><Ionicons name="checkmark" size={42} color="#fff" /></View>
      <Text style={styles.eyebrow}>ASSESSMENT COMPLETE</Text>
      <Text style={styles.title}>Your Career Profile</Text>
      <Text style={styles.description}>Here’s a summary of the preferences you selected.</Text>

      <View style={styles.note}>
        <Ionicons name="bulb-outline" size={22} color={colors.primary} />
        <Text style={styles.noteText}>We’ll use this information to help shape qualification suggestions for you. Personalised suggestions will be available in a future update.</Text>
      </View>

      <Text style={styles.sectionTitle}>Your answers</Text>
      {loading ? <ActivityIndicator style={styles.loader} color={colors.primary} /> : error ? <Text style={styles.error} accessibilityRole="alert">{error}</Text> : summary.length ? summary.map((item) => (
        <View key={item.id} style={styles.answerCard}>
          <Text style={styles.question}>{item.question}</Text>
          <View style={styles.answerList}>{item.labels.map((label) => <View key={label} style={styles.answerRow}>
            <Ionicons name="checkmark-circle" size={17} color={colors.primary} />
            <Text style={styles.answerText}>{label}</Text>
          </View>)}</View>
        </View>
      )) : <Text style={styles.empty}>No answers were saved yet.</Text>}
    </ScrollView>
    <View style={styles.actions}>
      <Pressable style={styles.primary} onPress={() => navigation.reset({ index: 0, routes: [{ name: "Home" }] })}><Text style={styles.primaryText}>Return to Home</Text></Pressable>
      <Pressable style={styles.secondary} onPress={retake} disabled={loading}>{loading ? <ActivityIndicator color={colors.primary} /> : <Text style={styles.secondaryText}>Review or retake assessment</Text>}</Pressable>
    </View>
  </SafeAreaView>;
}

function makeStyles(c) { return StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.background },
  content: { padding: 22, paddingBottom: 16 },
  success: { width: 68, height: 68, alignItems: "center", justifyContent: "center", borderRadius: 34, backgroundColor: c.primary, alignSelf: "center", marginTop: 8, marginBottom: 17 },
  eyebrow: { color: c.primary, fontSize: 11, fontWeight: "900", textAlign: "center", letterSpacing: 1.5 },
  title: { marginTop: 8, color: c.text, fontSize: 28, fontWeight: "900", textAlign: "center" },
  description: { marginTop: 7, color: c.secondaryText, fontSize: 14, lineHeight: 21, textAlign: "center" },
  note: { marginTop: 19, padding: 15, borderRadius: 16, borderWidth: 1, borderColor: c.border, backgroundColor: c.primarySoft, flexDirection: "row", alignItems: "flex-start", gap: 11 },
  noteText: { flex: 1, color: c.text, fontSize: 13, lineHeight: 19, fontWeight: "600" },
  sectionTitle: { marginTop: 24, marginBottom: 10, color: c.text, fontSize: 19, fontWeight: "900" },
  loader: { marginTop: 25 },
  answerCard: { marginBottom: 10, padding: 15, borderRadius: 15, borderWidth: 1, borderColor: c.border, backgroundColor: c.surface },
  question: { color: c.text, fontSize: 14, lineHeight: 20, fontWeight: "800" },
  answerList: { gap: 8, marginTop: 11 },
  answerRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  answerText: { flex: 1, color: c.secondaryText, fontSize: 13, lineHeight: 19 },
  empty: { marginTop: 8, color: c.secondaryText, fontSize: 14 },
  error: { marginTop: 10, color: c.danger, fontSize: 13, lineHeight: 19 },
  actions: { paddingHorizontal: 22, paddingTop: 9, paddingBottom: 12, backgroundColor: c.background },
  primary: { minHeight: 52, backgroundColor: c.primary, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  primaryText: { color: "#fff", fontWeight: "900", fontSize: 15 },
  secondary: { minHeight: 45, alignItems: "center", justifyContent: "center", marginTop: 3 },
  secondaryText: { color: c.primary, fontWeight: "800", fontSize: 14 },
}); }
