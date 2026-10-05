import { courseExamples } from "./courseExamples";
import { universities } from "./universities";

const SIX_SUBJECT_RULES = new Set([
  "cput", "cut", "dut", "mut", "nmu", "nwu", "smu", "tut", "stellenbosch",
  "ufh", "uj", "ukzn", "ul", "ump", "unisa", "unizulu", "up", "uwc", "vut", "wits", "wsu",
]);

const UNAVAILABLE_METHODS = {
  nmu: "NMU uses an Applicant Score with route-specific thresholds; the required conversion table is not included.",
  spu: "SPU uses a 1-8 point scale with subject bonuses; the exact conversion table is not included.",
  uct: "UCT uses faculty-specific FPS/WPS calculations and NBT results; marks alone are not enough to calculate these scores.",
  univen: "UNIVEN uses its prospectus percentage-to-score table, which is not included in this catalogue.",
};

function getLevel(mark) {
  if (mark === "" || mark === null || typeof mark === "undefined") return null;
  const percentage = Number(mark);
  if (!Number.isFinite(percentage)) return null;
  if (percentage >= 80) return 7;
  if (percentage >= 70) return 6;
  if (percentage >= 60) return 5;
  if (percentage >= 50) return 4;
  if (percentage >= 40) return 3;
  if (percentage >= 30) return 2;
  return 1;
}

function getEligibleSubjects(subjects) {
  return subjects
    .filter(({ subject, mark }) => subject.toLowerCase() !== "life orientation" && getLevel(mark) !== null)
    .map(({ subject, mark }) => ({ subject, mark: Number(mark), level: getLevel(mark) }));
}

function getBestSubjects(subjects, limit = 6) {
  return [...subjects].sort((first, second) => second.level - first.level).slice(0, limit);
}

function getUniversityScore(universityId, subjects) {
  const eligibleSubjects = getEligibleSubjects(subjects);
  if (eligibleSubjects.length < 6) return null;

  if (universityId === "rhodes") {
    const score = [...eligibleSubjects]
      .sort((first, second) => second.mark - first.mark)
      .slice(0, 6)
      .reduce((total, item) => total + item.mark, 0) / 10;
    return { score: Math.round(score * 10) / 10, method: "Best six subject percentages divided by 10; Life Orientation excluded.", estimated: false };
  }

  if (universityId === "ufs") {
    const selected = getBestSubjects(eligibleSubjects);
    const languageBonus = selected.some(({ subject, mark }) => /^(english|afrikaans)( home language| first additional language)?$/i.test(subject) && mark >= 60) ? 1 : 0;
    const score = Math.min(42, selected.reduce((total, item) => total + item.level, 0) + languageBonus);
    return { score, method: "Best six NSC levels, plus one English or Afrikaans bonus point from 60%; Life Orientation excluded.", estimated: false };
  }

  if (universityId === "ukzn") {
    const english = eligibleSubjects.find(({ subject }) => /^english\b/i.test(subject));
    const mathematics = eligibleSubjects.find(({ subject }) => /^(mathematics|mathematical literacy|technical mathematics)$/i.test(subject));
    if (!english || !mathematics) return null;
    const otherSubjects = eligibleSubjects.filter((item) => item !== english && item !== mathematics);
    const score = [english, mathematics, ...getBestSubjects(otherSubjects, 4)].reduce((total, item) => total + item.level, 0);
    return { score, method: "English, Mathematics or Mathematical Literacy, and the best four other subjects; Life Orientation excluded. NSC level conversion is an estimate.", estimated: true };
  }

  if (!SIX_SUBJECT_RULES.has(universityId)) return null;

  return {
    score: getBestSubjects(eligibleSubjects).reduce((total, item) => total + item.level, 0),
    method: "Best six NSC achievement levels (Life Orientation excluded); estimate because this catalogue lacks the institution's complete scoring table.",
    estimated: true,
  };
}

export function getInstitutionalApsScores(subjects = []) {
  return Object.fromEntries(
    universities.map(({ id }) => [id, getUniversityScore(id, subjects)]),
  );
}

export function getSavedInstitutionalApsScores(profile = {}) {
  if (Object.keys(profile.apsByUniversity || {}).length) return profile.apsByUniversity;
  const savedResults = Object.values(profile.apsResults || {});
  return getInstitutionalApsScores(savedResults[savedResults.length - 1]?.subjects || []);
}

export function getMatchingCourses(apsByUniversity = {}) {
  return courseExamples.filter((course) => {
    const score = apsByUniversity[course.universityId]?.score;
    return typeof score === "number" && typeof course.minimumAps === "number" && score >= course.minimumAps;
  });
}

export function getMatchedUniversityCount(apsByUniversity = {}) {
  return new Set(getMatchingCourses(apsByUniversity).map(({ universityId }) => universityId)).size;
}

export function getInstitutionApsMethod(universityId, score) {
  return score?.method || UNAVAILABLE_METHODS[universityId] || "This institution's APS method is not available in the course catalogue.";
}