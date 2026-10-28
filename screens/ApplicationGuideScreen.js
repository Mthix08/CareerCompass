import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import Text from "../components/TranslatedText";
import { useProfile } from "../context/ProfileContext";
import { db } from "./firebaseConfig";

const CHECKLIST = [
  { id: "choices", title: "Choose programmes", detail: "Shortlist courses and check their entry requirements and APS." },
  { id: "dates", title: "Check dates and fees", detail: "Confirm each institution’s current closing date and application fee." },
  { id: "identity", title: "Prepare identity documents", detail: "Have your ID or passport ready, plus parent or guardian details if requested." },
  { id: "results", title: "Prepare school results", detail: "Keep your latest official results available. Final-year learners may need to submit final results later." },
  { id: "supporting", title: "Check supporting documents", detail: "Some applications ask for proof of address, certificates, or other supporting documents." },
  { id: "portal", title: "Submit on the official portal", detail: "Create an account, complete every required section, upload requested files, and submit." },
  { id: "reference", title: "Save your reference and track progress", detail: "Keep the confirmation or reference number and check messages from the institution." },
];

const STORAGE_KEY = "@careercompass:applicationGuide:";

export default function ApplicationGuideScreen({ navigation }) {
  const { colors, resolvedTheme, firebaseUser } = useProfile();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [checked, setChecked] = useState({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    const uid = firebaseUser?.uid || "guest";
    const storageKey = `${STORAGE_KEY}${uid}`;

    (async () => {
      let local = {};
      try {
        const saved = await AsyncStorage.getItem(storageKey);
        if (saved) local = JSON.parse(saved);
      } catch (error) {
        console.warn("Unable to read the saved application checklist.", error);
      }

      if (firebaseUser) {
        try {
          const snapshot = await getDoc(doc(db, "users", uid));
          const remote = snapshot.exists() ? snapshot.data().applicationGuideChecklist || {} : {};
          local = { ...remote, ...local };
        } catch (error) {
          console.warn("Unable to sync the application checklist from Firebase.", error);
        }
      }

      if (!active) return;
      setChecked(local);
      setLoaded(true);
    })();

    return () => {
      active = false;
    };
  }, [firebaseUser]);

  useEffect(() => {
    if (!loaded) return undefined;
    const uid = firebaseUser?.uid || "guest";
    const storageKey = `${STORAGE_KEY}${uid}`;
    AsyncStorage.setItem(storageKey, JSON.stringify(checked)).catch((error) =>
      console.warn("Unable to save the application checklist on this device.", error),
    );
    if (!firebaseUser) return undefined;

    const timeout = setTimeout(() => {
      setDoc(doc(db, "users", uid), {
        applicationGuideChecklist: checked,
        applicationGuideUpdatedAt: serverTimestamp(),
      }, { merge: true }).catch((error) => {
        console.warn("Unable to sync the application checklist to Firebase.", error);
      });
    }, 400);
    return () => clearTimeout(timeout);
  }, [checked, firebaseUser, loaded]);

  const completedCount = CHECKLIST.filter((item) => checked[item.id]).length;
  const toggleItem = (id) => setChecked((current) => ({ ...current, [id]: !current[id] }));

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar style={resolvedTheme === "dark" ? "light" : "dark"} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Go back" style={styles.back}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
          <Text style={styles.backText}>My Applications</Text>
        </Pressable>

        <Text style={styles.eyebrow}>APPLICATION SUPPORT</Text>
        <Text style={styles.title}>Get ready to apply</Text>
        <Text style={styles.intro}>A simple checklist to help you prepare, submit, and keep track of your applications.</Text>

        <View style={styles.progressCard}>
          <View style={styles.progressTop}>
            <View style={styles.progressIcon}><Ionicons name="clipboard-outline" size={22} color={colors.primary} /></View>
            <View style={styles.progressCopy}>
              <Text style={styles.progressTitle}>Your application checklist</Text>
              <Text style={styles.progressDetail}>{completedCount} of {CHECKLIST.length} steps complete</Text>
            </View>
            <Text style={styles.progressPercent}>{Math.round((completedCount / CHECKLIST.length) * 100)}%</Text>
          </View>
          <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${(completedCount / CHECKLIST.length) * 100}%` }]} /></View>
        </View>

        {CHECKLIST.map((item, index) => {
          const isChecked = Boolean(checked[item.id]);
          return (
            <Pressable
              key={item.id}
              onPress={() => toggleItem(item.id)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isChecked }}
              accessibilityLabel={`${item.title}. ${item.detail}`}
              style={({ pressed }) => [styles.stepCard, isChecked && styles.stepCardComplete, pressed && styles.pressed]}
            >
              <View style={[styles.stepNumber, isChecked && styles.stepNumberComplete]}>
                {isChecked ? <Ionicons name="checkmark" size={16} color="#FFFFFF" /> : <Text style={styles.stepNumberText}>{index + 1}</Text>}
              </View>
              <View style={styles.stepCopy}>
                <Text style={styles.stepTitle}>{item.title}</Text>
                <Text style={styles.stepDetail}>{item.detail}</Text>
              </View>
              <Ionicons name={isChecked ? "checkbox" : "square-outline"} size={22} color={isChecked ? colors.primary : colors.mutedText} />
            </Pressable>
          );
        })}

        <View style={styles.noteCard}>
          <Ionicons name="information-circle-outline" size={22} color={colors.primary} />
          <Text style={styles.noteText}>Requirements and documents differ by institution and programme. Always confirm the latest instructions on the official application portal. Only upload documents there when requested.</Text>
        </View>

        <Pressable onPress={() => navigation.navigate("Applications")} accessibilityRole="button" style={({ pressed }) => [styles.trackButton, pressed && styles.pressed]}>
          <Text style={styles.trackButtonText}>Open my application tracker</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(c) {
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: c.background },
    content: { padding: 20, paddingBottom: 42 },
    back: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", gap: 8, marginBottom: 24 },
    backText: { color: c.text, fontSize: 16, fontWeight: "600" },
    eyebrow: { color: c.primary, fontSize: 12, fontWeight: "800", letterSpacing: 1.4 },
    title: { color: c.text, fontSize: 30, fontWeight: "800", marginTop: 7 },
    intro: { color: c.secondaryText, fontSize: 15, lineHeight: 22, marginTop: 8, marginBottom: 20 },
    progressCard: { backgroundColor: c.surface, borderColor: c.border, borderWidth: 1, borderRadius: 18, padding: 16, marginBottom: 14 },
    progressTop: { flexDirection: "row", alignItems: "center", gap: 11 },
    progressIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: c.primarySoft, alignItems: "center", justifyContent: "center" },
    progressCopy: { flex: 1 },
    progressTitle: { color: c.text, fontSize: 15, fontWeight: "800" },
    progressDetail: { color: c.secondaryText, fontSize: 12, marginTop: 3 },
    progressPercent: { color: c.primary, fontSize: 16, fontWeight: "900" },
    progressTrack: { height: 7, borderRadius: 8, backgroundColor: c.elevatedSurface, overflow: "hidden", marginTop: 14 },
    progressFill: { height: "100%", borderRadius: 8, backgroundColor: c.primary },
    stepCard: { flexDirection: "row", alignItems: "flex-start", gap: 12, backgroundColor: c.surface, borderColor: c.border, borderWidth: 1, borderRadius: 16, padding: 15, marginTop: 10 },
    stepCardComplete: { borderColor: c.primary, backgroundColor: c.primarySoft },
    stepNumber: { width: 28, height: 28, borderRadius: 10, backgroundColor: c.elevatedSurface, alignItems: "center", justifyContent: "center" },
    stepNumberComplete: { backgroundColor: c.primary },
    stepNumberText: { color: c.secondaryText, fontSize: 13, fontWeight: "800" },
    stepCopy: { flex: 1 },
    stepTitle: { color: c.text, fontSize: 15, fontWeight: "800" },
    stepDetail: { color: c.secondaryText, fontSize: 13, lineHeight: 19, marginTop: 4 },
    noteCard: { flexDirection: "row", alignItems: "flex-start", gap: 10, backgroundColor: c.surface, borderColor: c.border, borderWidth: 1, borderRadius: 16, padding: 15, marginTop: 18 },
    noteText: { flex: 1, color: c.secondaryText, fontSize: 13, lineHeight: 19 },
    trackButton: { minHeight: 52, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 9, backgroundColor: c.primary, borderRadius: 14, paddingHorizontal: 16, marginTop: 18 },
    trackButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
    pressed: { opacity: 0.82 },
  });
}
