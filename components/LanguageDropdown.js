import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';

export const LANGUAGES = [
  { code: 'EN', name: 'English', flag: '🇬🇧', supported: true },
  { code: 'ES', name: 'Spanish', flag: '🇪🇸', supported: true },
  { code: 'FR', name: 'French', flag: '🇫🇷', supported: true },
  { code: 'DE', name: 'German', flag: '🇩🇪', supported: true },
  { code: 'IT', name: 'Italian', flag: '🇮🇹', supported: true },
  { code: 'PT-PT', name: 'Portuguese', flag: '🇵🇹', supported: true },
  { code: 'JA', name: 'Japanese', flag: '🇯🇵', supported: true },
  { code: 'ZH', name: 'Chinese (Simplified)', flag: '🇨🇳', supported: true },

  // These South African languages have target-language support in DeepL API.
  { code: 'AF', name: 'Afrikaans', flag: '🇿🇦', supported: true },
  { code: 'ZU', name: 'isiZulu (Zulu)', flag: '🇿🇦', supported: true },
  { code: 'XH', name: 'isiXhosa (Xhosa)', flag: '🇿🇦', supported: true },
  { code: 'ST', name: 'Sesotho (Southern Sotho)', flag: '🇿🇦', supported: true },
  { code: 'TN', name: 'Setswana (Tswana)', flag: '🇿🇦', supported: true },
  { code: 'TS', name: 'XiTsonga (Tsonga)', flag: '🇿🇦', supported: true },
  { code: 'NSO', name: 'Sepedi (Northern Sotho)', flag: '🇿🇦', supported: false },
  { code: 'SS', name: 'siSwati (Swazi)', flag: '🇿🇦', supported: false },
  { code: 'VE', name: 'Tshivenda (Venda)', flag: '🇿🇦', supported: false },
  { code: 'NR', name: 'isiNdebele (Southern Ndebele)', flag: '🇿🇦', supported: false },
];

export default function LanguageDropdown({
  currentLang,
  onSelectLanguage,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedLanguage =
    LANGUAGES.find((language) => language.code === currentLang) ||
    LANGUAGES[0];

  function handleSelect(language) {
    if (!language.supported) {
      return;
    }

    onSelectLanguage(language.code);
    setIsOpen(false);
  }

  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [
          styles.dropdownButton,
          pressed && styles.pressed,
        ]}
        onPress={() => setIsOpen((previous) => !previous)}
        accessibilityRole="button"
        accessibilityLabel={`Choose language. Current language: ${selectedLanguage.name}`}
      >
        <Text style={styles.globe}>🌐</Text>

        <View style={styles.buttonTextContainer}>
          <Text style={styles.buttonLabel}>Display language</Text>
          <Text style={styles.selectedLanguage}>
            {selectedLanguage.flag} {selectedLanguage.name}
          </Text>
        </View>

        <Text style={styles.arrow}>{isOpen ? '▲' : '▼'}</Text>
      </Pressable>

      {isOpen && (
        <View style={styles.menu}>
          <Text style={styles.menuHeading}>Choose a language</Text>

          <ScrollView
            style={styles.languageList}
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
          >
            {LANGUAGES.map((language) => {
              const isSelected = language.code === currentLang;

              return (
                <Pressable
                  key={language.code}
                  onPress={() => handleSelect(language)}
                  disabled={!language.supported}
                  style={({ pressed }) => [
                    styles.languageOption,
                    isSelected && styles.selectedOption,
                    pressed && language.supported && styles.pressed,
                    !language.supported && styles.unsupportedOption,
                  ]}
                >
                  <Text style={styles.flag}>{language.flag}</Text>

                  <View style={styles.languageTextContainer}>
                    <Text
                      style={[
                        styles.languageName,
                        isSelected && styles.selectedLanguageName,
                        !language.supported && styles.disabledText,
                      ]}
                    >
                      {language.name}
                    </Text>

                    <Text style={styles.languageCode}>
                      {language.supported
                        ? language.code
                        : 'South African language'}
                    </Text>
                  </View>

                  <Text style={styles.optionStatus}>
                    {isSelected
                      ? '✓'
                      : language.supported
                      ? ''
                      : 'Soon'}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <Text style={styles.menuFooter}>
            Afrikaans, isiZulu, isiXhosa, Sesotho, Setswana, and Xitsonga are available.
            Other South African languages are marked Soon because DeepL does not yet support them.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 10,
    marginBottom: 16,
  },
  dropdownButton: {
    minHeight: 66,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9E2EC',
    borderRadius: 14,
    paddingHorizontal: 15,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    elevation: 2,
  },
  globe: {
    fontSize: 25,
  },
  buttonTextContainer: {
    flex: 1,
  },
  buttonLabel: {
    color: '#64748B',
    fontSize: 12,
    marginBottom: 3,
  },
  selectedLanguage: {
    color: '#1A2B4A',
    fontSize: 16,
    fontWeight: '700',
  },
  arrow: {
    color: '#1A2B4A',
    fontSize: 13,
  },
  menu: {
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9E2EC',
    borderRadius: 14,
    padding: 10,
    elevation: 5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  menuHeading: {
    color: '#1A2B4A',
    fontSize: 15,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  languageList: {
    maxHeight: 290,
  },
  languageOption: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 7,
    borderRadius: 9,
    gap: 10,
  },
  selectedOption: {
    backgroundColor: '#E6F7F5',
  },
  pressed: {
    opacity: 0.7,
  },
  unsupportedOption: {
    opacity: 0.55,
  },
  flag: {
    fontSize: 23,
    width: 30,
  },
  languageTextContainer: {
    flex: 1,
  },
  languageName: {
    color: '#1A2B4A',
    fontSize: 14,
    fontWeight: '600',
  },
  selectedLanguageName: {
    color: '#0D9488',
  },
  languageCode: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  disabledText: {
    color: '#64748B',
  },
  optionStatus: {
    color: '#0D9488',
    fontSize: 12,
    fontWeight: '700',
  },
  menuFooter: {
    color: '#64748B',
    fontSize: 11,
    lineHeight: 16,
    paddingHorizontal: 8,
    paddingTop: 10,
  },
});
