import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { loadCollection } from "../data/firestoreContent";

export default function FaqsScreen() {
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
                    color="#A9B7C9"
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

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#07111F" },
  container: { padding: 20, paddingBottom: 36 },
  heading: { color: "#F5F7FA", fontSize: 24, fontWeight: "800" },
  intro: { color: "#A9B7C9", fontSize: 14, lineHeight: 21, marginTop: 8, marginBottom: 20 },
  status: { color: "#A9B7C9", fontSize: 14, lineHeight: 21, textAlign: "center", marginTop: 12 },
  list: { gap: 10 },
  faqItem: {
    backgroundColor: "#101D2D",
    borderColor: "#223247",
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
  question: { flex: 1, color: "#F5F7FA", fontSize: 15, lineHeight: 21, fontWeight: "700" },
  chevron: { transform: [{ rotate: "0deg" }] },
  chevronExpanded: { transform: [{ rotate: "180deg" }] },
  answerContainer: { paddingHorizontal: 16, paddingBottom: 16 },
  answer: { color: "#B6C2D0", fontSize: 14, lineHeight: 21 },
});