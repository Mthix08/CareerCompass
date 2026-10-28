const ALLOWED_LANGUAGES = new Set([
  "ES", "FR", "DE", "IT", "PT-PT", "JA", "ZH",
  "AF", "ZU", "XH", "ST", "TN", "TS",
]);
const MAX_BODY_BYTES = 64 * 1024;
const MAX_TEXTS = 50;
const MAX_TOTAL_CHARS = 20_000;
const MAX_ASSISTANT_QUESTION_CHARS = 500;
const APP_OVERVIEW_ANSWER =
  "CareerCompass is a career and study-planning app for South African learners. It helps you calculate your APS, explore universities, colleges and courses, connect study options to careers, take a career assessment, find funding information, and track applications. Always confirm current admission and funding requirements with the official institution or funder.";
const ASSISTANT_CONTEXT = `You are the CareerCompass Assistant, a concise and friendly guide for South African learners. Answer the user's actual question directly before adding helpful context. For questions asking what CareerCompass or this app is about, describe it as a career and study-planning app that helps South African learners calculate APS, explore universities, colleges and courses, connect study options to careers, take a career assessment, find funding information, and track applications. Do not answer an app overview question with a generic definition of an app or unrelated information. Stay within CareerCompass and education/career guidance. If a question is unrelated, briefly say you can help with CareerCompass and education guidance. Do not invent course requirements, APS rules, fees, deadlines, or bursary eligibility; advise the learner to confirm current information with the institution or funder. The app's information may be incomplete or change.`;

function getAppOverviewAnswer(question) {
  const normalizedQuestion = question.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
  const matches =
    /\bwhat(?: is|s) (this|the) app(?:(?: is)? (about|for))?\b/.test(normalizedQuestion) ||
    /\bwhat does (this|the) app do\b/.test(normalizedQuestion) ||
    /\btell me about (careercompass|this app|the app)\b/.test(normalizedQuestion) ||
    /\bwhat(?: is|s) careercompass(?:(?: is)? about)?\b/.test(normalizedQuestion) ||
    /\bwhat does careercompass do\b/.test(normalizedQuestion) ||
    /\bdescribe (careercompass|this app|the app)\b/.test(normalizedQuestion);

  return matches ? APP_OVERVIEW_ANSWER : null;
}

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
    const route = url.pathname;
    if (route !== "/translate" && route !== "/assistant") {
      return json({ error: "Not found." }, 404);
    }
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

    if (route === "/assistant") {
      const question = typeof body?.question === "string" ? body.question.trim() : "";
      if (!question || question.length > MAX_ASSISTANT_QUESTION_CHARS) {
        return json({ error: "Enter a question of 1 to 500 characters." }, 400);
      }
      const overviewAnswer = getAppOverviewAnswer(question);
      if (overviewAnswer) return json({ answer: overviewAnswer });
      if (!env.GEMINI_API_KEY) {
        return json({ error: "The assistant service is not configured." }, 503);
      }

      let upstream;
      try {
        upstream = await fetch(
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": env.GEMINI_API_KEY,
            },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: ASSISTANT_CONTEXT }] },
              contents: [{ role: "user", parts: [{ text: question }] }],
              generationConfig: { temperature: 0.2, maxOutputTokens: 450 },
            }),
          },
        );
      } catch {
        return json({ error: "The assistant provider could not be reached." }, 502);
      }

      if (upstream.status === 429) {
        return json({ code: "rate_limited", error: "The assistant is busy. Try again shortly." }, 429);
      }
      if (!upstream.ok) {
        return json({ error: "The assistant provider rejected the request. Check the server-side API key and quota." }, 502);
      }

      let result;
      try {
        result = await upstream.json();
      } catch {
        return json({ error: "The assistant provider returned an invalid response." }, 502);
      }
      const answer = result.candidates?.[0]?.content?.parts
        ?.filter((part) => part.thought !== true)
        ?.map((part) => part.text)
        .filter((text) => typeof text === "string")
        .join("\n")
        .trim();
      if (!answer) return json({ error: "The assistant provider returned no answer." }, 502);
      return json({ answer });
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
