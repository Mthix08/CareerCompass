import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import LanguageDropdown from '../components/LanguageDropdown';
import { useLanguage } from '../context/LanguageContext';
import { useProfile } from '../context/ProfileContext';
import { translateTexts } from '../services/translate';

const ENGLISH_TEXT = [
  'Language',
  'Choose the language you want to use in the app.',
  'Welcome to CareerCompass',
  'Find courses and apply to universities.',
];

export default function LanguageScreen() {
  const { lang, changeLanguage } = useLanguage();
  const { colors } = useProfile();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [text, setText] = useState(ENGLISH_TEXT);

  useEffect(() => {
    let active = true;

    translateTexts(ENGLISH_TEXT, lang)
      .then((translated) => {
        if (active) {
          setText(translated);
        }
      })
      .catch(() => {
        // The translation service reports each failed request once.
      });

    return () => {
      active = false;
    };
  }, [lang]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{text[0]}</Text>
      <Text style={styles.subtitle}>{text[1]}</Text>

      <LanguageDropdown
        currentLang={lang}
        onSelectLanguage={changeLanguage}
      />

      <View style={styles.sample}>
        <Text style={styles.sampleTitle}>{text[2]}</Text>
        <Text style={styles.sampleBody}>{text[3]}</Text>
      </View>
    </ScrollView>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
    container: { padding: 20, backgroundColor: colors.background, flexGrow: 1 },
    title: { fontSize: 24, fontWeight: '700', color: colors.text },
    subtitle: {
      fontSize: 14,
      color: colors.secondaryText,
      marginTop: 6,
      marginBottom: 20,
    },
    sample: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      padding: 16,
      marginTop: 10,
    },
    sampleTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
    sampleBody: { fontSize: 14, color: colors.secondaryText, marginTop: 6 },
  });
}