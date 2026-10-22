import React, { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, SafeAreaView, StatusBar, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useProfile } from "../context/ProfileContext";
import { beginCareerAssessment, getCareerAssessment } from "../services/careerAssessmentService";

export default function CareerAssessmentResultsScreen({ navigation }) {
  const { firebaseUser, colors, resolvedTheme } = useProfile();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const retake = async () => {
    try {
      setLoading(true); setError("");
      const current = await getCareerAssessment(firebaseUser.uid);
      const answers = await beginCareerAssessment(firebaseUser.uid);
      navigation.replace("CareerAssessment", { initialAnswers: answers || current.answers || {} });
    } catch (_error) { setError("We could not load your saved answers. Please try again."); }
    finally { setLoading(false); }
  };
  return <SafeAreaView style={styles.safe}><StatusBar barStyle={resolvedTheme === "dark" ? "light-content" : "dark-content"} backgroundColor={colors.background} />
    <View style={styles.content}><View style={styles.success}><Ionicons name="checkmark" size={42} color="#fff" /></View><Text style={styles.eyebrow}>ASSESSMENT SAVED</Text><Text style={styles.title}>Your Career Profile</Text><Text style={styles.description}>Your answers have been saved successfully. Personalised qualification recommendations will be available here once the recommendation engine is implemented.</Text>
      {!!error && <Text style={styles.error} accessibilityRole="alert">{error}</Text>}
      <Pressable style={styles.primary} onPress={() => navigation.reset({ index: 0, routes: [{ name: "Home" }] })}><Text style={styles.primaryText}>Return to Home</Text></Pressable>
      <Pressable style={styles.secondary} onPress={retake} disabled={loading}>{loading ? <ActivityIndicator color={colors.primary} /> : <Text style={styles.secondaryText}>Review or retake assessment</Text>}</Pressable>
    </View>
  </SafeAreaView>;
}
function makeStyles(c) { return StyleSheet.create({ safe: { flex: 1, backgroundColor: c.background }, content: { flex: 1, padding: 25, justifyContent: "center" }, success: { width: 82, height: 82, alignItems: "center", justifyContent: "center", borderRadius: 41, backgroundColor: c.primary, alignSelf: "center", marginBottom: 25 }, eyebrow: { color: c.primary, fontSize: 11, fontWeight: "900", textAlign: "center", letterSpacing: 1.5 }, title: { marginTop: 12, color: c.text, fontSize: 30, fontWeight: "900", textAlign: "center" }, description: { marginTop: 14, color: c.secondaryText, fontSize: 15, lineHeight: 23, textAlign: "center" }, error: { marginTop: 15, color: c.danger, fontSize: 13, textAlign: "center" }, primary: { minHeight: 55, marginTop: 28, backgroundColor: c.primary, borderRadius: 15, alignItems: "center", justifyContent: "center" }, primaryText: { color: "#fff", fontWeight: "900", fontSize: 15 }, secondary: { minHeight: 52, alignItems: "center", justifyContent: "center", marginTop: 7 }, secondaryText: { color: c.primary, fontWeight: "800", fontSize: 14 } }); }
