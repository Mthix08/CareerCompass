import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const faqs = [
  {
    question: "What is an APS score?",
    answer: "An Admission Point Score (APS) is calculated from your school subject results. Universities use it, together with required subjects and other criteria, to assess applications. The way points are calculated can differ between universities and programmes.",
  },
  {
    question: "How do I know if I qualify for a course?",
    answer: "Check the course's minimum APS, required subjects and minimum marks. Meeting the minimum requirements does not guarantee admission, since places may be limited and universities can apply additional selection criteria.",
  },
  {
    question: "When should I apply to university?",
    answer: "Application dates vary by university and programme. Some programmes close early or once they receive enough applications, so check each university's official admissions page and apply as soon as applications open.",
  },
  {
    question: "What documents do I need to apply?",
    answer: "You will usually need a certified identity document or passport, your latest school results, and proof of payment if an application fee applies. Requirements differ, so confirm the document list with each university.",
  },
  {
    question: "Do I have to pay a registration fee?",
    answer: "Many universities require an upfront payment before registration. The amount depends on the university, programme, accommodation and funding. Use the registration cost information on the university details page as a starting point, then confirm the current amount directly with the university.",
  },
  {
    question: "Can I apply for financial aid?",
    answer: "You may be eligible for NSFAS or other bursaries, depending on the funder's requirements. Check the relevant application dates and eligibility rules, and contact the university's financial aid office about how confirmed funding affects upfront payments.",
  },
  {
    question: "Does meeting the minimum requirements guarantee admission?",
    answer: "No. Minimum requirements make you eligible to be considered, but admission depends on available places, applicant demand and any additional programme selection criteria.",
  },
];

export default function FaqsScreen() {
  const [expandedFaq, setExpandedFaq] = useState(null);

  const toggleFaq = (index) => {
    setExpandedFaq((current) => (current === index ? null : index));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Frequently Asked Questions</Text>
        <Text style={styles.intro}>Quick answers to common questions about planning for university.</Text>
        <View style={styles.list}>
          {faqs.map((faq, index) => {
            const expanded = expandedFaq === index;
            const answerId = `faq-answer-${index}`;
            return (
              <View key={faq.question} style={styles.faqItem}>
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
