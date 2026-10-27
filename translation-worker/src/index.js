const ALLOWED_LANGUAGES = new Set([
  "ES", "FR", "DE", "IT", "PT-PT", "JA", "ZH",
  "AF", "ZU", "XH", "ST", "TN", "TS",
]);
const MAX_BODY_BYTES = 64 * 1024;
const MAX_TEXTS = 50;
const MAX_TOTAL_CHARS = 20_000;

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "POST, OPTIONS",
      "access-control-allow-headers": "Content-Type",
      "cache-control": "no-store",
    },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") return json({ ok: true });
    if (url.pathname !== "/translate") return json({ error: "Not found." }, 404);
    if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);
    if (!request.headers.get("content-type")?.includes("application/json")) {
      return json({ error: "Content-Type must be application/json." }, 415);
    }

    const length = Number(request.headers.get("content-length") || 0);
    if (length > MAX_BODY_BYTES) return json({ error: "Request is too large." }, 413);
    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    const { success } = await env.TRANSLATION_RATE_LIMIT.limit({ key: ip });
    if (!success) return json({ code: "rate_limited", error: "Too many translation requests. Try again shortly." }, 429);

    let body;
    try {
      const raw = await request.text();
      if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) {
        return json({ error: "Request is too large." }, 413);
      }
      body = JSON.parse(raw);
    } catch {
      return json({ error: "Invalid JSON request." }, 400);
    }

    const { texts, lang } = body || {};
    if (!Array.isArray(texts) || texts.length < 1 || texts.length > MAX_TEXTS ||
        texts.some((text) => typeof text !== "string") ||
        texts.reduce((total, text) => total + text.length, 0) > MAX_TOTAL_CHARS) {
      return json({ error: "Invalid text list or request exceeds translation limits." }, 400);
    }
    if (typeof lang !== "string" || !ALLOWED_LANGUAGES.has(lang)) {
      return json({ error: "Unsupported target language." }, 400);
    }
    if (!env.DEEPL_API_KEY) return json({ error: "Translation service is not configured." }, 503);

    let upstream;
    try {
      upstream = await fetch("https://api-free.deepl.com/v2/translate", {
        method: "POST",
        headers: {
          "Authorization": `DeepL-Auth-Key ${env.DEEPL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: texts, target_lang: lang }),
      });
    } catch {
      return json({ error: "Translation provider could not be reached." }, 502);
    }

    if (upstream.status === 429) {
      return json({ code: "rate_limited", error: "Translation provider is rate-limiting requests." }, 429);
    }
    if (upstream.status === 456) {
      return json({ code: "quota", error: "The DeepL free translation quota has been reached." }, 429);
    }
    if (!upstream.ok) {
      // Do not return upstream response bodies; they may contain provider diagnostics.
      return json({ error: "Translation provider rejected the request. Check the server-side API key and language support." }, 502);
    }

    const result = await upstream.json();
    if (!Array.isArray(result.translations) || result.translations.length !== texts.length ||
        result.translations.some((item) => typeof item.text !== "string")) {
      return json({ error: "Translation provider returned an invalid response." }, 502);
    }
    return json({ translations: result.translations.map(({ text }) => ({ text })) });
  },
};
