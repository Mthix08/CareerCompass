import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';

const ACTIVE_COLOR = '#117C72';

export default function LanguageButton({ onPress, style }) {
  const { lang } = useLanguage();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Select language"
      style={({ pressed }) => [
        styles.button,
        pressed && styles.pressed,
        style,
      ]}
    >
      <Ionicons name="globe-outline" size={16} color={ACTIVE_COLOR} />

    <Text style={styles.label}>Select Language</Text>

      <View style={styles.codeBadge}>
        <Text style={styles.codeText}>{lang}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: ACTIVE_COLOR,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  pressed: { opacity: 0.6 },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1A2B4A',
  },
  codeBadge: {
    backgroundColor: ACTIVE_COLOR,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 10,
  },
  codeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});