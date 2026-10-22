import React, { useEffect, useState } from 'react';
import { Text as RNText } from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { translateText } from '../services/translate';

function getPlainText(children) {
  let text = null;

  if (typeof children === 'string') {
    text = children;
  } else if (
    Array.isArray(children) &&
    children.every((child) => typeof child === 'string' || typeof child === 'number')
  ) {
    text = children.join('');
  }

  if (!text || !/[A-Za-z]/.test(text)) {
    return null;
  }

  return text;
}

export default function TranslatedText({
  children,
  translate = true,
  ...props
}) {
  const { lang } = useLanguage();
  const original = translate ? getPlainText(children) : null;
  const [translation, setTranslation] = useState(null);

  useEffect(() => {
    let active = true;

    if (!original || lang === 'EN') {
      return undefined;
    }

    translateText(original, lang)
      .then((result) => {
        if (active) {
          setTranslation({ original, lang, text: result });
        }
      })
      .catch(() => {
        // The translation service reports each failed request once.
      });

    return () => {
      active = false;
    };
  }, [original, lang]);

  const translated =
    translation?.original === original && translation.lang === lang
      ? translation.text
      : null;
  const showTranslated = original && lang !== 'EN' && translated;

  return <RNText {...props}>{showTranslated ? translated : children}</RNText>;
}
