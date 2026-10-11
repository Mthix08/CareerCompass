import React, { useEffect, useRef, useState } from "react";
import * as Speech from "expo-speech";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  careerCompassKnowledge,
  getLocalCareerCompassAnswer,
} from "../data/careerCompassKnowledge";
import { useProfile } from "../context/ProfileContext";

const WELCOME_MESSAGE =
  "Hi, I’m your CareerCompass Assistant. Ask me about universities, courses, careers, funding, or using the app.";

async function getAssistantAnswer(question) {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) return getLocalCareerCompassAnswer(question);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text: `${careerCompassKnowledge}\n\nYou are the CareerCompass Assistant. Only answer from this information. If a question is unrelated, say: "I'm the CareerCompass Assistant. I can only help you with questions about CareerCompass and its features." If information is unavailable, say it is not currently available in CareerCompass.`,
            },
          ],
        },
        contents: [{ role: "user", parts: [{ text: question }] }],
      }),
    },
  );

  if (!response.ok) throw new Error("Assistant request failed");
  const data = await response.json();
  return (
    data.candidates?.[0]?.content?.parts?.[0]?.text ||
    getLocalCareerCompassAnswer(question)
  );
}

export default function AssistantScreen({ navigation }) {
  const { colors } = useProfile();
  const [messages, setMessages] = useState([
    { id: "welcome", role: "assistant", text: WELCOME_MESSAGE },
  ]);
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const listRef = useRef(null);

  useSpeechRecognitionEvent("start", () => {
    setIsListening(true);
    setVoiceError("");
  });

  useSpeechRecognitionEvent("end", () => setIsListening(false));

  useSpeechRecognitionEvent("result", (event) => {
    const transcript = event.results?.[0]?.transcript?.trim();
    if (transcript) setQuestion(transcript);
  });

  useSpeechRecognitionEvent("error", (event) => {
    setIsListening(false);
    setVoiceError(
      event.error === "not-allowed" ?
        "Microphone permission is required for voice input."
      : event.error === "no-speech" ?
        "No speech was detected. Tap the microphone and try again."
      : "Voice input is unavailable. Check that speech recognition is enabled on your device.",
    );
  });

  useEffect(
    () => () => {
      Speech.stop();
      ExpoSpeechRecognitionModule.abort();
    },
    [],
  );

  const speak = async (text) => {
    Speech.stop();
    setIsSpeaking(true);

    try {
      const voices = await Speech.getAvailableVoicesAsync();
      const preferredVoice = voices.find(
        ({ language }) => language?.toLowerCase() === "en-za",
      );
      const fallbackVoice = voices.find(({ language }) =>
        language?.toLowerCase().startsWith("en"),
      );

      Speech.speak(text, {
        ...(preferredVoice || fallbackVoice ?
          { voice: (preferredVoice || fallbackVoice).identifier }
        : {}),
        language:
          preferredVoice?.language || fallbackVoice?.language || "en-US",
        rate: 0.95,
        onDone: () => setIsSpeaking(false),
        onStopped: () => setIsSpeaking(false),
        onError: () => {
          setIsSpeaking(false);
        },
      });
    } catch {
      setIsSpeaking(false);
    }
  };

  const askQuestion = async () => {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion || isLoading) return;

    setMessages((current) => [
      ...current,
      { id: `${Date.now()}-user`, role: "user", text: trimmedQuestion },
    ]);
    setQuestion("");
    setIsLoading(true);

    try {
      const answer = await getAssistantAnswer(trimmedQuestion);
      setMessages((current) => [
        ...current,
        { id: `${Date.now()}-assistant`, role: "assistant", text: answer },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-fallback`,
          role: "assistant",
          text: getLocalCareerCompassAnswer(trimmedQuestion),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVoiceInput = async () => {
    setVoiceError("");

    if (isListening) {
      ExpoSpeechRecognitionModule.stop();
      return;
    }

    try {
      if (!ExpoSpeechRecognitionModule.isRecognitionAvailable()) {
        setVoiceError(
          "Speech recognition is unavailable. Enable Siri & Dictation on iOS or install a speech service on Android.",
        );
        return;
      }

      const permission =
        await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!permission.granted) {
        setVoiceError("Allow microphone and speech access to use voice input.");
        return;
      }

      ExpoSpeechRecognitionModule.start({
        lang: "en-ZA",
        interimResults: true,
        maxAlternatives: 1,
        continuous: false,
      });
    } catch {
      setIsListening(false);
      setVoiceError("Voice input could not start. Please try again.");
    }
  };

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={10}
            accessibilityLabel="Close assistant"
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>CareerCompass Assistant</Text>
            <Text style={styles.status}>
              {isListening ?
                "Listening... Tap the mic when finished"
              : "Ready to help with your next step"}
            </Text>
          </View>
          <View style={styles.headerIcon}>
            <Ionicons name="sparkles-outline" size={21} color="#FFFFFF" />
          </View>
        </View>

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            listRef.current?.scrollToEnd({ animated: true })
          }
          renderItem={({ item }) => (
            <View
              style={[
                styles.messageRow,
                item.role === "user" && styles.userRow,
              ]}
            >
              <View
                style={[
                  styles.messageBubble,
                  item.role === "user" ?
                    styles.userBubble
                  : styles.assistantBubble,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    item.role === "user" && styles.userText,
                  ]}
                >
                  {item.text}
                </Text>
                {item.role === "assistant" && (
                  <Pressable
                    onPress={() => speak(item.text)}
                    style={styles.speakButton}
                    accessibilityLabel="Read answer aloud"
                    accessibilityState={{ busy: isSpeaking }}
                  >
                    <Ionicons
                      name={
                        isSpeaking ? "volume-high" : "volume-medium-outline"
                      }
                      size={17}
                      color={colors.primary}
                    />
                    <Text style={styles.speakText}>Read aloud</Text>
                  </Pressable>
                )}
              </View>
            </View>
          )}
          ListFooterComponent={
            isLoading ?
              <ActivityIndicator color={colors.primary} style={styles.loader} />
            : null
          }
        />

        <View style={styles.composer}>
          <TextInput
            value={question}
            onChangeText={setQuestion}
            placeholder="Ask about CareerCompass..."
            placeholderTextColor={colors.mutedText}
            multiline
            maxLength={500}
            style={styles.input}
            onSubmitEditing={askQuestion}
            accessibilityLabel="Ask the CareerCompass Assistant"
          />
          <Pressable
            onPress={toggleVoiceInput}
            disabled={isLoading}
            style={[
              styles.voiceButton,
              isListening && styles.voiceButtonActive,
            ]}
            accessibilityRole="button"
            accessibilityLabel={
              isListening ? "Stop voice input" : "Start voice input"
            }
            accessibilityState={{ busy: isListening, disabled: isLoading }}
          >
            <Ionicons
              name={isListening ? "mic" : "mic-outline"}
              size={21}
              color={isListening ? "#FFFFFF" : colors.primary}
            />
          </Pressable>
          <Pressable
            onPress={askQuestion}
            disabled={!question.trim() || isLoading}
            style={[
              styles.sendButton,
              (!question.trim() || isLoading) && styles.sendDisabled,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Send question"
          >
            <Ionicons name="arrow-up" size={21} color="#FFFFFF" />
          </Pressable>
        </View>
        {voiceError ?
          <Text style={styles.voiceError}>{voiceError}</Text>
        : null}
        <Text style={styles.disclaimer}>
          Answers are limited to information available in CareerCompass.
        </Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    container: { flex: 1 },
    header: {
      flexDirection: "row",
      alignItems: "center",
      padding: 18,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerCopy: { flex: 1, marginLeft: 14 },
    title: { color: colors.text, fontSize: 18, fontWeight: "800" },
    status: { color: colors.secondaryText, fontSize: 12, marginTop: 3 },
    headerIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    messageList: { padding: 18, paddingBottom: 26 },
    messageRow: { alignItems: "flex-start", marginBottom: 14 },
    userRow: { alignItems: "flex-end" },
    messageBubble: { maxWidth: "88%", borderRadius: 18, padding: 15 },
    assistantBubble: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderBottomLeftRadius: 5,
    },
    userBubble: { backgroundColor: colors.primary, borderBottomRightRadius: 5 },
    messageText: { color: colors.text, fontSize: 15, lineHeight: 22 },
    userText: { color: "#FFFFFF" },
    speakButton: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 12,
      gap: 5,
    },
    speakText: { color: colors.primary, fontSize: 12, fontWeight: "700" },
    loader: { marginVertical: 10 },
    composer: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: 10,
      padding: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.surface,
    },
    input: {
      flex: 1,
      minHeight: 48,
      maxHeight: 110,
      borderRadius: 15,
      paddingHorizontal: 15,
      paddingVertical: 12,
      color: colors.text,
      backgroundColor: colors.input,
      fontSize: 15,
    },
    sendButton: {
      width: 46,
      height: 46,
      borderRadius: 23,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary,
    },
    voiceButton: {
      width: 46,
      height: 46,
      borderRadius: 23,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primarySoft,
    },
    voiceButtonActive: { backgroundColor: colors.primary },
    sendDisabled: { opacity: 0.45 },
    voiceError: {
      color: colors.danger,
      fontSize: 12,
      textAlign: "center",
      paddingHorizontal: 16,
      paddingTop: 6,
      backgroundColor: colors.surface,
    },
    disclaimer: {
      color: colors.mutedText,
      fontSize: 11,
      textAlign: "center",
      paddingHorizontal: 16,
      paddingBottom: 10,
      backgroundColor: colors.surface,
    },
  });
