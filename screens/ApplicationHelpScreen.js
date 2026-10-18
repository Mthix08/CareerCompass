import React, { useMemo, useState } from "react";
import {
  Alert,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { useProfile } from "../context/ProfileContext";
import { APPLICATION_SUPPORT_CONTACTS } from "../data/applicationSupportContacts";

const CONTACT_METHODS = [
  {
    key: "phoneNumber",
    label: "Phone",
    icon: "call-outline",
    makeUrl: (value) => `tel:${value}`,
    placeholder: "Add phone number",
  },
  {
    key: "email",
    label: "Email",
    icon: "mail-outline",
    makeUrl: (value) => `mailto:${value}`,
    placeholder: "Add email address",
  },
  {
    key: "whatsappUrl",
    label: "WhatsApp",
    icon: "logo-whatsapp",
    makeUrl: (value) => value,
    placeholder: "Add WhatsApp link",
  },
  {
    key: "facebookUrl",
    displayKey: "facebookDisplayName",
    label: "Facebook",
    icon: "logo-facebook",
    makeUrl: (value) => value,
    placeholder: "Add Facebook profile link",
  },
];

function ContactCard({ contact, colors, styles }) {
  const [photoFailed, setPhotoFailed] = useState(false);

  const openContactMethod = async (method, value) => {
    try {
      await Linking.openURL(method.makeUrl(value));
    } catch (_error) {
      Alert.alert(
        `Could not open ${method.label}`,
        "Check that a suitable app is installed and try again.",
      );
    }
  };

  return (
    <View style={styles.contactCard}>
      <View style={styles.personHeader}>
        {!photoFailed ? (
          <Image
            source={contact.photoSource || { uri: contact.photoUrl }}
            onError={() => setPhotoFailed(true)}
            style={styles.avatar}
            accessibilityLabel={`Temporary portrait for ${contact.name}`}
          />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <Ionicons name="person" size={28} color={colors.primary} />
          </View>
        )}
        <View style={styles.personDetails}>
          <Text style={styles.personName}>{contact.name}</Text>
          <Text style={styles.personRole}>{contact.role}</Text>
        </View>
      </View>

      <View style={styles.contactMethods}>
        {CONTACT_METHODS.filter((method) =>
          contact.visibleContactMethods.includes(method.key),
        ).map((method) => {
          const value = contact[method.key]?.trim();
          const displayValue =
            contact[method.displayKey]?.trim() || value || method.placeholder;
          return (
            <Pressable
              key={method.key}
              accessibilityRole={value ? "button" : undefined}
              accessibilityLabel={
                value
                  ? `${method.label}: ${displayValue}`
                  : `${method.label}: ${method.placeholder}`
              }
              disabled={!value}
              onPress={() => openContactMethod(method, value)}
              style={({ pressed }) => [
                styles.contactMethod,
                pressed && value && styles.contactMethodPressed,
              ]}
            >
              <Ionicons
                name={method.icon}
                size={18}
                color={value ? colors.primary : colors.mutedText}
              />
              <View style={styles.methodCopy}>
                <Text style={styles.methodLabel}>{method.label}</Text>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.methodValue,
                    !value && styles.placeholderValue,
                  ]}
                >
                  {displayValue}
                </Text>
              </View>
              {value && (
                <Ionicons
                  name="open-outline"
                  size={16}
                  color={colors.mutedText}
                />
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function ApplicationHelpScreen({ navigation }) {
  const { colors, resolvedTheme } = useProfile();
  const styles = useMemo(
    () => createStyles(colors, resolvedTheme),
    [colors, resolvedTheme],
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Application help</Text>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.intro}>
          <View style={styles.introIcon}>
            <Ionicons name="chatbubbles-outline" size={26} color="#FFFFFF" />
          </View>
          <Text style={styles.title}>Need help with your application?</Text>
          <Text style={styles.description}>
            Reach out to our team for help with your applications. Choose a
            contact method below.
          </Text>
          <Text style={styles.placeholderNotice}>
            Any contact details that still say “Add” are waiting for the team
            to update them.
          </Text>
        </View>

        {APPLICATION_SUPPORT_CONTACTS.map((contact) => (
          <ContactCard
            key={contact.id}
            contact={contact}
            colors={colors}
            styles={styles}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors, resolvedTheme) {
  const isDark = resolvedTheme === "dark";
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    header: {
      minHeight: 54,
      paddingHorizontal: 18,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      width: 40,
      height: 40,
      alignItems: "flex-start",
      justifyContent: "center",
    },
    headerTitle: {
      color: colors.text,
      fontSize: 17,
      fontWeight: "700",
    },
    headerSpacer: { width: 40 },
    scrollContent: {
      width: "100%",
      maxWidth: 620,
      alignSelf: "center",
      paddingHorizontal: 18,
      paddingTop: 22,
      paddingBottom: 36,
      gap: 14,
    },
    intro: {
      alignItems: "center",
      paddingHorizontal: 8,
      paddingBottom: 8,
    },
    introIcon: {
      width: 54,
      height: 54,
      marginBottom: 12,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 27,
      backgroundColor: colors.primary,
    },
    title: {
      color: colors.text,
      fontSize: 22,
      lineHeight: 28,
      fontWeight: "800",
      textAlign: "center",
    },
    description: {
      marginTop: 8,
      color: colors.secondaryText,
      fontSize: 14,
      lineHeight: 21,
      textAlign: "center",
    },
    placeholderNotice: {
      marginTop: 10,
      color: colors.accent,
      fontSize: 12,
      lineHeight: 17,
      fontWeight: "600",
      textAlign: "center",
    },
    contactCard: {
      padding: 16,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      shadowColor: "#102D36",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: isDark ? 0 : 0.06,
      shadowRadius: 9,
      elevation: isDark ? 0 : 2,
    },
    personHeader: {
      flexDirection: "row",
      alignItems: "center",
      paddingBottom: 13,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    avatar: {
      width: 58,
      height: 58,
      borderRadius: 29,
      backgroundColor: colors.primarySoft,
    },
    avatarFallback: {
      alignItems: "center",
      justifyContent: "center",
    },
    personDetails: { flex: 1, marginLeft: 12 },
    personName: {
      color: colors.text,
      fontSize: 16,
      fontWeight: "700",
    },
    personRole: {
      marginTop: 3,
      color: colors.secondaryText,
      fontSize: 13,
    },
    contactMethods: { paddingTop: 5 },
    contactMethod: {
      minHeight: 54,
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 6,
      gap: 12,
    },
    contactMethodPressed: { opacity: 0.6 },
    methodCopy: { flex: 1 },
    methodLabel: {
      color: colors.secondaryText,
      fontSize: 11,
      fontWeight: "600",
    },
    methodValue: {
      marginTop: 2,
      color: colors.text,
      fontSize: 13,
      fontWeight: "600",
    },
    placeholderValue: {
      color: colors.mutedText,
      fontWeight: "400",
    },
  });
}
