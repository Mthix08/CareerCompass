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

export function getFundingCountdown(now = new Date()) {
  const days = Math.max(0, Math.ceil((new Date(NSFAS.closesAt).getTime() - now.getTime()) / 86400000));
  return { days, isClosed: now.getTime() > new Date(NSFAS.closesAt).getTime() };
}
