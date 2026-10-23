import React, { useEffect, useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Text from "../components/TranslatedText";
import { loadCollection } from "../data/firestoreContent";
import { useProfile } from "../context/ProfileContext";

export default function FaqsScreen() {
  const { colors } = useProfile();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  // CHANGED: the questions now come from the Firestore "faqs" collection
  // (with an AsyncStorage copy for offline) instead of a hardcoded array.
  const [faqs, setFaqs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedFaq, setExpandedFaq] = useState(null);

  useEffect(() => {
    let active = true;
    loadCollection("faqs", { sortBy: "order" })
      .then((items) => {
        if (active) setFaqs(items);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const toggleFaq = (index) => {
    setExpandedFaq((current) => (current === index ? null : index));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Frequently Asked Questions</Text>
        <Text style={styles.intro}>Quick answers to common questions about planning for university.</Text>
        {isLoading && <Text style={styles.status}>Loading questions...</Text>}
        {!isLoading && faqs.length === 0 && (
          <Text style={styles.status}>
            No questions available right now. Connect to the internet and try again.
          </Text>
        )}
        <View style={styles.list}>
          {faqs.map((faq, index) => {
            const expanded = expandedFaq === index;
            const answerId = `faq-answer-${index}`;
            return (
              <View key={faq.id} style={styles.faqItem}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ expanded }}
                  accessibilityControls={answerId}
                  onPress={() => toggleFaq(index)}
                  style={styles.questionRow}
                >
                  <Text style={styles.question}>{faq.question}</Text>
                  <Ionicons
                    name="chevron-down"
                    size={20}
                    color={colors.mutedText}
                    style={[styles.chevron, expanded && styles.chevronExpanded]}
                  />
                </Pressable>
                {expanded && (
                  <View nativeID={answerId} style={styles.answerContainer}>
                    <Text style={styles.answer}>{faq.answer}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { padding: 20, paddingBottom: 36 },
  heading: { color: colors.text, fontSize: 24, fontWeight: "800" },
  intro: { color: colors.secondaryText, fontSize: 14, lineHeight: 21, marginTop: 8, marginBottom: 20 },
  status: { color: colors.secondaryText, fontSize: 14, lineHeight: 21, textAlign: "center", marginTop: 12 },
  list: { gap: 10 },
  faqItem: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    overflow: "hidden",
  },
  questionRow: {
    minHeight: 56,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  question: { flex: 1, color: colors.text, fontSize: 15, lineHeight: 21, fontWeight: "700" },
  chevron: { transform: [{ rotate: "0deg" }] },
  chevronExpanded: { transform: [{ rotate: "180deg" }] },
  answerContainer: { paddingHorizontal: 16, paddingBottom: 16 },
  answer: { color: colors.secondaryText, fontSize: 14, lineHeight: 21 },
  });
}