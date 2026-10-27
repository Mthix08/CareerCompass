import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LANGUAGE_STORAGE_KEY = '@careercompass:language';
const SUPPORTED_LANGUAGES = new Set(['EN', 'ES', 'FR', 'DE', 'IT', 'PT-PT', 'JA', 'ZH']);

const LanguageContext = createContext({
  lang: 'EN',
  changeLanguage: () => {},
});

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('EN');
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(LANGUAGE_STORAGE_KEY)
      .then((storedLanguage) => {
        if (active && SUPPORTED_LANGUAGES.has(storedLanguage)) setLang(storedLanguage);
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  const changeLanguage = useCallback((nextLanguage) => {
    if (!SUPPORTED_LANGUAGES.has(nextLanguage)) return;
    setLang(nextLanguage);
    AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage).catch(() => {});
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
