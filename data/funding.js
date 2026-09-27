export const FUNDING_API_URL = "https://ithubahub.co.za/api/bursaries";

export const NSFAS = {
  id: "nsfas",
  name: "NSFAS",
  fullName: "National Student Financial Aid Scheme",
  cycle: "2027 academic year",
  opens: "18 September 2026",
  closes: "31 October 2026",
  // End of 31 October in South African Standard Time (UTC+02:00).
  closesAt: "2026-10-31T23:59:59+02:00",
  applyUrl: "https://my.nsfas.org.za/",
  infoUrl: "https://www.nsfas.org.za/content/how-to-apply.html",
  policyUrl: "https://www.nsfas.org.za/content/downloads/Annexure%20A_NSFAS%202026%20Bursary%20Guidelines.pdf",
};

// Example content demonstrating how additional bursaries should be structured.
// Replace this object with verified provider information before production use.
export const SAMPLE_BURSARY = {
  id: "future-leaders-bursary",
  name: "Future Leaders Bursary",
  fullName: "Future Leaders Student Bursary",
  provider: "Example Education Foundation",
  cycle: "Example 2027 intake",
  opens: "1 August 2026",
  closes: "30 November 2026",
  description: "An example bursary showing how future funding opportunities can be presented.",
  isPlaceholder: true,
};

export function parseFundingDeadline(deadline) {
  if (!deadline || typeof deadline !== "string") return null;
  const match = deadline.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
  if (!match) return null;

  const [, day, monthName, year] = match;
  const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth();
  const parsedDate = new Date(Date.UTC(Number(year), monthIndex, Number(day), 23, 59, 59));
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

export function normalizeFundingOption(item) {
  if (!item || typeof item !== "object") return null;

  const id = String(item.id ?? item.slug ?? item.name ?? "bursary");
  const closes = item.deadline || item.closes || item.deadline_date || "TBA";
  const closesAt = parseFundingDeadline(closes)?.toISOString() ?? null;

  return {
    id,
    name: item.name || "Funding opportunity",
    fullName: item.name || item.fullName || item.funder || "Funding opportunity",
    provider: item.funder || item.provider || "Funding provider",
    cycle: item.study_level || "Open application",
    opens: item.opens || "Open now",
    closes,
    closesAt,
    description: item.description || item.value || "Funding opportunity from a verified bursary provider.",
    requirements: item.requirements || "Check the official provider page for the latest eligibility requirements.",
    applyUrl: item.apply_url || item.applyUrl || item.url || "",
    infoUrl: item.url || item.infoUrl || item.apply_url || "",
    policyUrl: item.policy_url || item.policyUrl || item.url || "",
    value: item.value || "",
    fieldOfStudy: item.field_of_study || item.fieldOfStudy || "All fields",
    province: item.province || "National",
    featured: Boolean(item.featured && String(item.featured).toLowerCase() === "true"),
    isPlaceholder: false,
  };
}

export async function fetchBursaries() {
  try {
    const response = await fetch(FUNDING_API_URL, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`Request failed with status ${response.status}`);

    const payload = await response.json();
    const items = Array.isArray(payload) ? payload : Array.isArray(payload.data) ? payload.data : [];
    const normalized = items.map(normalizeFundingOption).filter(Boolean);
    return normalized.length ? normalized : [NSFAS, SAMPLE_BURSARY];
  } catch (error) {
    console.warn("Unable to load bursaries from API. Using fallback funding options.", error);
    return [NSFAS, SAMPLE_BURSARY];
  }
}

export function getFundingCountdown(now = new Date(), funding = NSFAS) {
  const closesAt = funding?.closesAt ? new Date(funding.closesAt) : parseFundingDeadline(funding?.closes);
  if (!closesAt || Number.isNaN(closesAt.getTime())) {
    return { days: 0, isClosed: false };
  }

  const days = Math.max(0, Math.ceil((closesAt.getTime() - now.getTime()) / 86400000));
  return { days, isClosed: now.getTime() > closesAt.getTime() };
}
