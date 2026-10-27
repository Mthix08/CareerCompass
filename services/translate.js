const DEEPL_API_URL = 'https://api-free.deepl.com/v2/translate';
const MAX_TEXTS_PER_REQUEST = 50;
const BATCH_DELAY_MS = 25;
const DEFAULT_RATE_LIMIT_MS = 30_000;
const DEFAULT_QUOTA_LIMIT_MS = 5 * 60_000;

const SUPPORTED_LANGUAGES = new Set([
  'ES',
  'FR',
  'DE',
  'IT',
  'PT-PT',
  'JA',
  'ZH',
]);

const translationsByLanguage = new Map();
const pendingByLanguage = new Map();
const queuesByLanguage = new Map();
const processingLanguages = new Set();
const scheduledLanguages = new Set();
const pausedUntilByLanguage = new Map();
const lastReportedAtByLanguage = new Map();

function getLanguageMap(map, lang) {
  let languageMap = map.get(lang);
  if (!languageMap) {
    languageMap = new Map();
    map.set(lang, languageMap);
  }
  return languageMap;
}

function getPausedError(lang) {
  const pausedUntil = pausedUntilByLanguage.get(lang);
  if (!pausedUntil || Date.now() >= pausedUntil) {
    return null;
  }

  const remainingSeconds = Math.ceil((pausedUntil - Date.now()) / 1000);
  return new Error(
    `DeepL translation is paused for ${remainingSeconds} seconds after a rate-limit or quota response.`,
  );
}

function reportTranslationError(error, lang) {
  const now = Date.now();
  const reportAgainAfter =
    pausedUntilByLanguage.get(lang) || now + DEFAULT_RATE_LIMIT_MS;
  const lastReportedAt = lastReportedAtByLanguage.get(lang) || 0;

  if (now < lastReportedAt) {
    return;
  }

  lastReportedAtByLanguage.set(lang, reportAgainAfter);
  console.warn(
    `[translate] ${error.message}. Showing the original text until translation is available.`,
  );
}

function getRetryDelay(response) {
  const retryAfter = response.headers?.get('Retry-After');
  if (retryAfter) {
    const seconds = Number(retryAfter);
    if (Number.isFinite(seconds) && seconds > 0) {
      return seconds * 1000;
    }

    const retryAt = Date.parse(retryAfter);
    if (!Number.isNaN(retryAt) && retryAt > Date.now()) {
      return retryAt - Date.now();
    }
  }

  return response.status === 456
    ? DEFAULT_QUOTA_LIMIT_MS
    : DEFAULT_RATE_LIMIT_MS;
}

async function requestTranslations(texts, lang) {
  const apiKey = process.env.EXPO_PUBLIC_DEEPL_API_KEY;
  if (!apiKey) {
    throw new Error('EXPO_PUBLIC_DEEPL_API_KEY is not configured.');
  }

  const response = await fetch(DEEPL_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `DeepL-Auth-Key ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: texts,
      target_lang: lang,
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    const statusMessage =
      response.status === 429
        ? 'DeepL rate limit reached'
        : response.status === 456
          ? 'DeepL character quota exceeded'
          : `DeepL translation failed (${response.status})`;
    const error = new Error(
      `${statusMessage}${details ? `: ${details}` : ''}`,
    );

    if (response.status === 429 || response.status === 456) {
      pausedUntilByLanguage.set(
        lang,
        Date.now() + getRetryDelay(response),
      );
    }

    throw error;
  }

  const result = await response.json();
  if (
    !Array.isArray(result.translations) ||
    result.translations.length !== texts.length ||
    result.translations.some(
      (translation) => typeof translation.text !== 'string',
    )
  ) {
    throw new Error('DeepL returned an invalid translation response.');
  }

  return result.translations.map((translation) => translation.text);
}

function rejectQueuedTranslations(lang, texts, error) {
  const pending = pendingByLanguage.get(lang);
  for (const text of texts) {
    const request = pending?.get(text);
    if (request) {
      pending.delete(text);
      request.reject(error);
    }
  }
}

async function processQueue(lang) {
  if (processingLanguages.has(lang)) {
    return;
  }

  processingLanguages.add(lang);
  const queue = getLanguageMap(queuesByLanguage, lang);
  const pending = getLanguageMap(pendingByLanguage, lang);

  try {
    while (queue.size > 0) {
      const texts = Array.from(queue.keys()).slice(0, MAX_TEXTS_PER_REQUEST);
      for (const text of texts) {
        queue.delete(text);
      }

      const pausedError = getPausedError(lang);
      if (pausedError) {
        rejectQueuedTranslations(lang, texts, pausedError);
        continue;
      }

      try {
        const translated = await requestTranslations(texts, lang);
        const cache = getLanguageMap(translationsByLanguage, lang);

        texts.forEach((text, index) => {
          cache.set(text, translated[index]);
          const request = pending.get(text);
          if (request) {
            pending.delete(text);
            request.resolve(translated[index]);
          }
        });
      } catch (error) {
        reportTranslationError(error, lang);
        rejectQueuedTranslations(lang, texts, error);
      }
    }
  } finally {
    processingLanguages.delete(lang);
  }
}

function queueTranslation(text, lang) {
  const cache = getLanguageMap(translationsByLanguage, lang);
  if (cache.has(text)) {
    return Promise.resolve(cache.get(text));
  }

  const pausedError = getPausedError(lang);
  if (pausedError) {
    return Promise.reject(pausedError);
  }

  const pending = getLanguageMap(pendingByLanguage, lang);
  const existingRequest = pending.get(text);
  if (existingRequest) {
    return existingRequest.promise;
  }

  let resolve;
  let reject;
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  pending.set(text, { promise, resolve, reject });
  getLanguageMap(queuesByLanguage, lang).set(text, true);
  if (!scheduledLanguages.has(lang)) {
    scheduledLanguages.add(lang);
    setTimeout(() => {
      scheduledLanguages.delete(lang);
      processQueue(lang);
    }, BATCH_DELAY_MS);
  }

  return promise;
}

export async function translateTexts(texts, lang) {
  if (
    !Array.isArray(texts) ||
    texts.some((text) => typeof text !== 'string')
  ) {
    throw new TypeError('Translation input must be an array of strings.');
  }

  if (texts.length === 0 || lang === 'EN') {
    return texts;
  }

  if (!SUPPORTED_LANGUAGES.has(lang)) {
    throw new Error(`Translation to "${lang}" is not supported.`);
  }

  return Promise.all(texts.map((text) => queueTranslation(text, lang)));
}

export async function translateText(text, lang) {
  const [translated] = await translateTexts([text], lang);
  return translated;
}
