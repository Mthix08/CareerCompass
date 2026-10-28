import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, BackHandler, Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useProfile } from "../context/ProfileContext";
import { CAREER_ASSESSMENT_QUESTIONS, hasAnswered, sanitizeCareerAssessmentAnswers } from "../data/careerAssessmentQuestions";
import { beginCareerAssessment, completeCareerAssessment, saveCareerAssessmentDraft, skipCareerAssessment } from "../services/careerAssessmentService";
import { createCourseSuggestionNotification } from "../services/courseSuggestionNotifications";

export default function CareerAssessmentScreen({ navigation, route }) {
  const { firebaseUser, colors, resolvedTheme } = useProfile();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [answers, setAnswers] = useState(sanitizeCareerAssessmentAnswers(route.params?.initialAnswers || {}));
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(!route.params?.initialAnswers);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const loaded = useRef(false);
  const question = CAREER_ASSESSMENT_QUESTIONS[index];
  const isLast = index === CAREER_ASSESSMENT_QUESTIONS.length - 1;

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const savedAnswers = await beginCareerAssessment(firebaseUser.uid);
        if (active && !loaded.current && !route.params?.initialAnswers) setAnswers(sanitizeCareerAssessmentAnswers(savedAnswers));
        loaded.current = true;
      } catch (_error) { if (active) setError("Could not load your saved answers. Check your connection and try again."); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [firebaseUser.uid]);

  useEffect(() => {
    if (!loaded.current || loading) return undefined;
    const timer = setTimeout(() => {
      saveCareerAssessmentDraft(firebaseUser.uid, answers).catch(() => {
        setError("Your latest change has not synced yet. It will be retried when you continue.");
      });
    }, 650);
    return () => clearTimeout(timer);
  }, [answers, firebaseUser.uid, loading]);

  const changeAnswer = (option) => {
    setError("");
    setAnswers((current) => {
      if (question.selectionType === "single") return { ...current, [question.id]: option.id };
      const selected = current[question.id] || [];
      const next = option.exclusive
        ? selected.includes(option.id) ? [] : [option.id]
        : selected.includes("open_any_field") ? [option.id]
          : selected.includes(option.id) ? selected.filter((id) => id !== option.id)
            : [...selected, option.id];
      return { ...current, [question.id]: next };
    });
  };

  const advance = async () => {
    if (!hasAnswered(question, answers) && question.required) { setError("Please choose an answer before continuing."); return; }
    setSaving(true); setError("");
    try {
      await saveCareerAssessmentDraft(firebaseUser.uid, answers);
      if (isLast) {
        await completeCareerAssessment(firebaseUser.uid, answers);
        try {
          await createCourseSuggestionNotification(firebaseUser.uid, answers);
        } catch (notificationError) {
          console.warn("Assessment completed, but the course suggestion notification could not be saved.", notificationError);
        }
        navigation.replace("CareerAssessmentResults");
      } else setIndex((current) => current + 1);
    } catch (_error) { setError(isLast ? "We could not submit your answers. Your responses are saved as a draft; please retry." : "We could not save your progress. Check your connection and try again."); }
    finally { setSaving(false); }
  };
  const goBack = async () => {
    setSaving(true);
    try {
      await saveCareerAssessmentDraft(firebaseUser.uid, answers);
      if (index === 0) navigation.goBack();
      else setIndex((current) => current - 1);
      setError("");
    }
    catch (_error) { setError("We could not save your progress. Please retry before moving on."); }
    finally { setSaving(false); }
  };

  const skipAssessment = async () => {
    setSaving(true);
    setError("");
    try {
      await skipCareerAssessment(firebaseUser.uid, answers);
      navigation.reset({ index: 0, routes: [{ name: "Home" }] });
    } catch (_error) {
      setError("We could not save your progress yet. Please retry.");
    } finally { setSaving(false); }
  };

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      goBack();
      return true;
    });
    return () => subscription.remove();
  }, [goBack]);

  if (loading) return <SafeAreaView style={styles.safe}><View style={styles.center}><ActivityIndicator color={colors.primary} /><Text style={styles.loadingText}>Loading your assessment…</Text></View></SafeAreaView>;
  const selectedValue = answers[question.id];
  return <SafeAreaView style={styles.safe}>
    <StatusBar barStyle={resolvedTheme === "dark" ? "light-content" : "dark-content"} backgroundColor={colors.background} />
    <View style={styles.header}><Pressable onPress={goBack} style={styles.backIcon} accessibilityLabel="Go back"><Ionicons name="arrow-back" size={22} color={colors.text} /></Pressable><Text style={styles.headerTitle}>Career Assessment</Text><Pressable onPress={skipAssessment} disabled={saving} style={styles.skipButton} accessibilityRole="button"><Text style={styles.skipText}>Skip</Text></Pressable></View>
    <View style={styles.progressWrap}><View style={styles.progressTrack}><View style={[styles.progress, { width: `${((index + 1) / CAREER_ASSESSMENT_QUESTIONS.length) * 100}%` }]} /></View><Text style={styles.progressText}>Question {index + 1} of {CAREER_ASSESSMENT_QUESTIONS.length}</Text></View>
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <Text style={styles.category}>{question.category.toUpperCase()}</Text>
      <Text style={styles.title}>{question.text}</Text>
      {!!question.helperText && <Text style={styles.helper}>{question.helperText}</Text>}
      {question.selectionType === "multi" && <Text style={styles.instruction}>Choose all that apply{question.required ? "" : " · Optional"}</Text>}
      <View style={styles.options}>{question.options.map((option) => {
        const active = question.selectionType === "multi" ? (selectedValue || []).includes(option.id) : selectedValue === option.id;
        return <Pressable key={option.id} onPress={() => changeAnswer(option)} accessibilityRole={question.selectionType === "multi" ? "checkbox" : "radio"} accessibilityState={{ checked: active }} style={[styles.option, active && styles.optionActive]}>
          <View style={[styles.choice, active && styles.choiceActive]}>{active && <Ionicons name="checkmark" size={15} color="#fff" />}</View><Text style={[styles.optionText, active && styles.optionTextActive]}>{option.label}</Text>
        </Pressable>;
      })}</View>
      {!!error && <Text style={styles.error} accessibilityRole="alert">{error}</Text>}
    </ScrollView>
    <View style={styles.footer}><Pressable onPress={goBack} disabled={saving} style={styles.backButton}><Text style={styles.backText}>Back</Text></Pressable><Pressable onPress={advance} disabled={saving} style={styles.nextButton}>{saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.nextText}>{isLast ? "Submit" : "Next"}</Text>}</Pressable></View>
  </SafeAreaView>;
}

function makeStyles(c) { return StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.background }, center: { flex: 1, alignItems: "center", justifyContent: "center" }, loadingText: { color: c.secondaryText, marginTop: 12 },
  header: { height: 58, paddingHorizontal: 18, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, backIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: c.surface, borderColor: c.border, borderWidth: 1, alignItems: "center", justifyContent: "center" }, headerTitle: { color: c.text, fontSize: 16, fontWeight: "800" }, skipButton: { minWidth: 52, height: 40, paddingHorizontal: 9, borderRadius: 12, alignItems: "center", justifyContent: "center" }, skipText: { color: c.primary, fontSize: 14, fontWeight: "800" },
  progressWrap: { paddingHorizontal: 22, paddingTop: 6 }, progressTrack: { height: 6, borderRadius: 99, backgroundColor: c.border, overflow: "hidden" }, progress: { height: 6, backgroundColor: c.primary, borderRadius: 99 }, progressText: { marginTop: 10, color: c.secondaryText, fontSize: 12, fontWeight: "700" },
  scroll: { paddingHorizontal: 22, paddingTop: 28, paddingBottom: 25 }, category: { color: c.primary, fontSize: 11, fontWeight: "900", letterSpacing: 1.2 }, title: { marginTop: 11, color: c.text, fontSize: 25, lineHeight: 33, fontWeight: "900" }, helper: { marginTop: 10, color: c.secondaryText, fontSize: 14, lineHeight: 21 }, instruction: { marginTop: 18, color: c.secondaryText, fontSize: 13 },
  options: { gap: 10, marginTop: 18 }, option: { minHeight: 58, paddingHorizontal: 15, paddingVertical: 13, borderRadius: 15, borderWidth: 1, borderColor: c.border, backgroundColor: c.surface, flexDirection: "row", alignItems: "center" }, optionActive: { borderColor: c.primary, backgroundColor: c.primarySoft }, choice: { width: 22, height: 22, borderRadius: 7, borderWidth: 1.5, borderColor: c.mutedText, alignItems: "center", justifyContent: "center", marginRight: 12 }, choiceActive: { borderColor: c.primary, backgroundColor: c.primary }, optionText: { flex: 1, color: c.text, fontSize: 14, lineHeight: 20 }, optionTextActive: { fontWeight: "700" },
  error: { marginTop: 16, color: c.danger, fontSize: 13, lineHeight: 19 }, footer: { paddingHorizontal: 22, paddingVertical: 14, borderTopWidth: 1, borderTopColor: c.border, flexDirection: "row", gap: 12 }, backButton: { flex: 1, minHeight: 52, alignItems: "center", justifyContent: "center", borderRadius: 14, borderColor: c.border, borderWidth: 1, backgroundColor: c.surface }, backText: { color: c.text, fontWeight: "800" }, nextButton: { flex: 1.5, minHeight: 52, alignItems: "center", justifyContent: "center", borderRadius: 14, backgroundColor: c.primary }, nextText: { color: "#fff", fontWeight: "900", fontSize: 15 },
}); }
