import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext({
  lang: 'EN',
  changeLanguage: () => {},
});

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('EN');

  return (
    <LanguageContext.Provider value={{ lang, changeLanguage: setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}