export const COURSE_SUGGESTION_CATEGORIES = {
  mathematicsFriendly: "mathematics_friendly",
  lessMathematics: "less_mathematics",
  balanced: "balanced",
};

const GROUP_A_IDS = new Set(["mathematics_1", "mathematics_2"]);
const GROUP_B_IDS = new Set(["mathematics_4", "mathematics_5", "mathematics_6"]);

export function getCourseSuggestionCategory(selectedAnswerIds) {
  if (!Array.isArray(selectedAnswerIds)) return COURSE_SUGGESTION_CATEGORIES.balanced;
  const selectsA = selectedAnswerIds.some((id) => GROUP_A_IDS.has(id));
  const selectsB = selectedAnswerIds.some((id) => GROUP_B_IDS.has(id));
  if (selectsA && !selectsB) return COURSE_SUGGESTION_CATEGORIES.mathematicsFriendly;
  if (selectsB && !selectsA) return COURSE_SUGGESTION_CATEGORIES.lessMathematics;
  return COURSE_SUGGESTION_CATEGORIES.balanced;
}

// IDs are verified against the normalized courseExamples catalogue.
export const COURSE_SUGGESTION_COURSE_IDS = {
  [COURSE_SUGGESTION_CATEGORIES.mathematicsFriendly]: [
    "wits-efa01-13", "uct-24", "uct-81", "wits-sba13-62", "wits-cba18-5",
    "uct-68", "wits-efa03-14", "up-14", "wits-cba14-1", "wits-cba08-2",
  ],
  [COURSE_SUGGESTION_CATEGORIES.lessMathematics]: [
    "uct-59", "nmu-58", "cput-70", "dut-du-b-dif", "NWU-2027-161",
    "NWU-2027-208", "NWU-2027-018", "SPU-2027-010-bachelor-of-arts", "dut-du-c-bdv", "vut-29",
  ],
  [COURSE_SUGGESTION_CATEGORIES.balanced]: [
    "up-14", "wits-mfa07-33", "nmu-37", "cput-31", "cput-65",
    "cput-53", "ufh-70001", "nmu-38", "UNIVEN-2027-037", "UL-2027-010",
  ],
};

// Each option maps to fields and/or skills, using the exact assessment option IDs.
const ANSWER_TAGS = {
  technology_computing: { fields: ["technology_computing"] },
  business_management: { fields: ["business_management"] },
  engineering_construction: { fields: ["engineering_construction"] },
  health_sciences: { fields: ["health_sciences"] },
  science_research: { fields: ["science_research"] },
  law_social_sciences: { fields: ["law_social_sciences"] },
  education: { fields: ["education"] },
  art_design_creativity: { fields: ["art_design_creativity"] },
  communication_media: { fields: ["communication_media"] },
  environment_agriculture: { fields: ["environment_agriculture"] },
  interests_activity_1: { fields: ["technology_computing"] },
  interests_activity_2: { fields: ["business_management"] },
  interests_activity_3: { fields: ["engineering_construction"] },
  interests_activity_4: { fields: ["health_sciences"] },
  interests_activity_5: { fields: ["science_research"] },
  interests_activity_6: { fields: ["law_social_sciences"] },
  interests_activity_7: { fields: ["education"] },
  interests_activity_8: { fields: ["art_design_creativity", "communication_media"] },
  interests_learning_1: { fields: ["technology_computing"] },
  interests_learning_2: { fields: ["business_management"] },
  interests_learning_3: { fields: ["engineering_construction"] },
  interests_learning_4: { fields: ["health_sciences"] },
  interests_learning_5: { fields: ["science_research"] },
  interests_learning_6: { fields: ["law_social_sciences"] },
  interests_learning_7: { fields: ["education"] },
  interests_learning_8: { fields: ["art_design_creativity", "communication_media"] },
  strengths_1: { skills: ["analytical_thinking"] },
  strengths_2: { skills: ["creativity"] },
  strengths_3: { skills: ["communication"] },
  strengths_4: { skills: ["leadership"] },
  strengths_5: { skills: ["collaboration"] },
  strengths_6: { skills: ["practical_problem_solving"] },
  strengths_7: { skills: ["research"] },
  strengths_8: { skills: ["attention_to_detail"] },
  problem_approach_1: { skills: ["analytical_thinking"] },
  problem_approach_2: { skills: ["research"] },
  problem_approach_3: { skills: ["creativity", "practical_problem_solving"] },
  problem_approach_4: { skills: ["collaboration", "communication"] },
  problem_approach_5: { skills: ["leadership", "attention_to_detail"] },
  task_preference_1: { fields: ["technology_computing", "science_research"], skills: ["analytical_thinking"] },
  task_preference_2: { fields: ["art_design_creativity"], skills: ["creativity"] },
  task_preference_3: { fields: ["education", "communication_media"], skills: ["communication"] },
  task_preference_4: { fields: ["business_management"], skills: ["leadership"] },
  task_preference_5: { fields: ["science_research"], skills: ["research"] },
  task_preference_6: { fields: ["engineering_construction"], skills: ["practical_problem_solving"] },
  school_subjects_3: { fields: ["science_research", "engineering_construction"] },
  school_subjects_4: { fields: ["health_sciences", "science_research"] },
  school_subjects_5: { fields: ["business_management"] },
  school_subjects_6: { fields: ["business_management"] },
  school_subjects_7: { fields: ["business_management", "law_social_sciences"] },
  school_subjects_8: { fields: ["technology_computing"] },
  school_subjects_9: { fields: ["technology_computing"] },
  school_subjects_10: { fields: ["environment_agriculture", "science_research"] },
  school_subjects_11: { fields: ["law_social_sciences"] },
  school_subjects_12: { fields: ["communication_media", "education"] },
  school_subjects_13: { fields: ["art_design_creativity"] },
  school_subjects_14: { fields: ["environment_agriculture"] },
  learning_approach_1: { skills: ["practical_problem_solving"] },
  learning_approach_2: { skills: ["analytical_thinking"] },
  learning_approach_3: { skills: ["research"] },
  learning_approach_4: { skills: ["communication", "collaboration"] },
  learning_approach_5: { skills: ["creativity"] },
  environment_1: { fields: ["technology_computing"] },
  environment_2: { fields: ["business_management"] },
  environment_3: { fields: ["engineering_construction"] },
  environment_4: { fields: ["health_sciences"] },
  environment_5: { fields: ["science_research"] },
  environment_6: { fields: ["education"] },
  environment_7: { fields: ["art_design_creativity", "communication_media"] },
  environment_8: { fields: ["law_social_sciences", "health_sciences"] },
  environment_9: { fields: ["environment_agriculture"] },
  work_with_1: { fields: ["technology_computing"] },
  work_with_2: { fields: ["business_management", "science_research"] },
  work_with_3: { fields: ["engineering_construction"] },
  work_with_4: { fields: ["health_sciences", "education", "law_social_sciences"] },
  work_with_5: { fields: ["science_research"] },
  work_with_6: { fields: ["art_design_creativity", "communication_media"] },
  work_with_7: { fields: ["business_management"] },
  career_values_1: { skills: ["analytical_thinking"] },
  career_values_2: { skills: ["communication"] },
  career_values_3: { fields: ["business_management"] },
  career_values_4: { skills: ["creativity"] },
  career_values_5: { skills: ["leadership"] },
  career_values_6: { skills: ["research"] },
};

// Course tags are curated by normalized ID; no broad description keyword inference is used.
export const COURSE_RECOMMENDATION_TAGS = {
  "wits-efa01-13": { fields: ["engineering_construction"], skills: ["analytical_thinking", "practical_problem_solving"] },
  "uct-24": { fields: ["engineering_construction", "science_research"], skills: ["analytical_thinking", "practical_problem_solving"] },
  "uct-81": { fields: ["science_research", "technology_computing"], skills: ["analytical_thinking", "research"] },
  "wits-sba13-62": { fields: ["technology_computing", "science_research"], skills: ["analytical_thinking", "research"] },
  "wits-cba18-5": { fields: ["business_management"], skills: ["analytical_thinking", "attention_to_detail"] },
  "uct-68": { fields: ["technology_computing", "science_research"], skills: ["analytical_thinking", "research"] },
  "wits-efa03-14": { fields: ["engineering_construction"], skills: ["analytical_thinking", "practical_problem_solving"] },
  "up-14": { fields: ["business_management"], skills: ["analytical_thinking", "leadership"] },
  "wits-cba14-1": { fields: ["business_management"], skills: ["analytical_thinking", "attention_to_detail"] },
  "wits-cba08-2": { fields: ["business_management"], skills: ["analytical_thinking", "attention_to_detail"] },
  "uct-59": { fields: ["law_social_sciences"], skills: ["communication", "research"] },
  "nmu-58": { fields: ["law_social_sciences", "health_sciences"], skills: ["communication", "collaboration"] },
  "cput-70": { fields: ["communication_media"], skills: ["communication", "research"] },
  "dut-du-b-dif": { fields: ["art_design_creativity"], skills: ["creativity", "practical_problem_solving"] },
  "NWU-2027-161": { fields: ["art_design_creativity"], skills: ["creativity", "communication"] },
  "NWU-2027-208": { fields: ["law_social_sciences"], skills: ["communication", "research"] },
  "NWU-2027-018": { fields: ["law_social_sciences", "health_sciences"], skills: ["communication", "collaboration"] },
  "SPU-2027-010-bachelor-of-arts": { fields: ["law_social_sciences", "communication_media"], skills: ["communication", "research"] },
  "dut-du-c-bdv": { fields: ["art_design_creativity", "communication_media"], skills: ["creativity", "communication"] },
  "vut-29": { fields: ["communication_media"], skills: ["communication", "collaboration"] },
  "wits-mfa07-33": { fields: ["health_sciences"], skills: ["communication", "attention_to_detail"] },
  "nmu-37": { fields: ["health_sciences", "law_social_sciences"], skills: ["communication", "research"] },
  "cput-31": { fields: ["business_management"], skills: ["communication", "leadership"] },
  "cput-65": { fields: ["art_design_creativity", "communication_media"], skills: ["creativity", "communication"] },
  "cput-53": { fields: ["health_sciences"], skills: ["communication", "attention_to_detail"] },
  "ufh-70001": { fields: ["environment_agriculture"], skills: ["practical_problem_solving", "research"] },
  "nmu-38": { fields: ["law_social_sciences", "communication_media"], skills: ["communication", "research"] },
  "UNIVEN-2027-037": { fields: ["business_management"], skills: ["analytical_thinking", "attention_to_detail"] },
  "UL-2027-010": { fields: ["health_sciences", "law_social_sciences"], skills: ["communication", "research"] },
};

const INTEREST_QUESTIONS = ["interests_fields"];
const SUPPORT_QUESTIONS = ["interests_activity", "interests_learning", "task_preference", "environment", "work_with", "school_subjects"];
const SKILL_QUESTIONS = ["strengths", "problem_approach", "learning_approach", "career_values"];
const FIELD_WEIGHT = 3;
const SUPPORT_WEIGHT = 2;
const SKILL_WEIGHT = 1;
const MAX_SUPPORT_PER_FIELD = 2;
const MAX_SKILL_PER_TAG = 2;
const QUALIFICATION_TYPE_WEIGHT = 2;
const MATHEMATICS_ADJUSTMENT = 1;

function selectedAnswers(answers, questionId) {
  return Array.isArray(answers?.[questionId]) ? answers[questionId].filter((id) => typeof id === "string") : [];
}

function requestedTypes(answers) {
  const types = new Set();
  if (selectedAnswers(answers, "qualification_type").includes("qualification_type_1")) types.add("bachelor");
  if (selectedAnswers(answers, "qualification_type").includes("qualification_type_2")) types.add("diploma");
  if (selectedAnswers(answers, "qualification_type").includes("qualification_type_3")) types.add("higher certificate");
  return types;
}

function courseTypeMatches(course, requested) {
  const type = String(course.qualificationType || "").toLowerCase();
  return [...requested].some((wanted) => type.includes(wanted));
}

function getExplicitMathStatus(course) {
  const requirements = course.subjectRequirements || {};
  const explicitStructured = ["mathematics", "mathematical_literacy", "technical_mathematics", "mathematics_or_technical_mathematics"]
    .some((key) => requirements[key]?.accepted === true);
  const rawValue = requirements.raw_requirements;
  const raw = typeof rawValue === "string" ? rawValue : Array.isArray(rawValue) ? rawValue.join(" ") : rawValue?.raw_note || "";
  const deniesRequirement = /\b(not required|not accepted|not needed|no requirement)\b/i.test(raw);
  const explicitRaw = !deniesRequirement && /\b(mathematics|maths|mathematical literacy|technical maths|technical mathematics)\b/i.test(raw);
  return explicitStructured || explicitRaw;
}

function getExcludedFields(answers) {
  return new Set(selectedAnswers(answers, "excluded_fields").filter((field) => field !== "open_any_field"));
}

function isExcluded(course, excluded) {
  const tags = COURSE_RECOMMENDATION_TAGS[course.id];
  return Boolean(tags && tags.fields.some((field) => excluded.has(field)));
}

function scoreCourse(course, answers) {
  const tags = COURSE_RECOMMENDATION_TAGS[course.id];
  if (!tags) return { score: 0, reasons: [] };
  let score = 0;
  const reasons = [];
  const interests = new Set(INTEREST_QUESTIONS.flatMap((question) => selectedAnswers(answers, question)));
  let fieldMatches = tags.fields.filter((field) => interests.has(field));
  fieldMatches.forEach((field) => { score += FIELD_WEIGHT; reasons.push(field); });

  const supportCounts = new Map();
  SUPPORT_QUESTIONS.forEach((question) => selectedAnswers(answers, question).forEach((answerId) => {
    const mapped = ANSWER_TAGS[answerId];
    mapped?.fields?.forEach((field) => {
      if (tags.fields.includes(field)) supportCounts.set(field, Math.min(MAX_SUPPORT_PER_FIELD, (supportCounts.get(field) || 0) + 1));
    });
  }));
  for (const [field, count] of supportCounts) {
    score += count * SUPPORT_WEIGHT;
    if (count) reasons.push(field);
  }

  selectedAnswers(answers, "career_values").forEach((answerId) => {
    const fields = ANSWER_TAGS[answerId]?.fields || [];
    fields.filter((field) => tags.fields.includes(field)).forEach((field) => {
      score += SKILL_WEIGHT;
      reasons.push(field);
    });
  });

  const skillCounts = new Map();
  SKILL_QUESTIONS.forEach((question) => selectedAnswers(answers, question).forEach((answerId) => {
    ANSWER_TAGS[answerId]?.skills?.forEach((skill) => {
      if (tags.skills.includes(skill)) skillCounts.set(skill, Math.min(MAX_SKILL_PER_TAG, (skillCounts.get(skill) || 0) + 1));
    });
  }));
  for (const [skill, count] of skillCounts) {
    score += count * SKILL_WEIGHT;
    if (count) reasons.push(skill);
  }

  const types = requestedTypes(answers);
  if (courseTypeMatches(course, types)) score += QUALIFICATION_TYPE_WEIGHT;

  const matchScore = score;
  const mathPreferences = selectedAnswers(answers, "mathematics");
  const explicitMath = getExplicitMathStatus(course);
  if (explicitMath && mathPreferences.some((id) => GROUP_A_IDS.has(id))) score += MATHEMATICS_ADJUSTMENT;
  if (explicitMath && mathPreferences.some((id) => id === "mathematics_5" || id === "mathematics_6")) score -= MATHEMATICS_ADJUSTMENT;

  return { score, matchScore, reasons };
}

export function getSuggestedCourses(category, courses) {
  return getRecommendedCourses({}, category, courses).map(({ course }) => course);
}

export function getRecommendedCourses(answers, fallbackCategory, courses, limit = 10) {
  if (!Array.isArray(courses)) return [];
  const validAnswers = answers && typeof answers === "object" && !Array.isArray(answers) ? answers : {};
  const excluded = getExcludedFields(validAnswers);
  const hasUsefulAnswers = Object.keys(validAnswers).some((questionId) =>
    selectedAnswers(validAnswers, questionId).some((id) => ANSWER_TAGS[id] || GROUP_A_IDS.has(id) || GROUP_B_IDS.has(id))
    || questionId === "mathematics" && selectedAnswers(validAnswers, questionId).length > 0,
  );
  const curatedIds = COURSE_SUGGESTION_COURSE_IDS[fallbackCategory] || COURSE_SUGGESTION_COURSE_IDS[COURSE_SUGGESTION_CATEGORIES.balanced];
  const curated = new Set(curatedIds);
  const unique = new Map(courses.filter((course) => course?.id && !isExcluded(course, excluded)).map((course) => [course.id, course]));
  const ranked = [...unique.values()].map((course) => ({ course, ...scoreCourse(course, validAnswers) }));

  if (!hasUsefulAnswers) {
    return curatedIds.map((id) => unique.get(id)).filter(Boolean).slice(0, limit).map((course) => ({ course, score: 0, reasons: [] }));
  }

  ranked.sort((a, b) => b.score - a.score || a.course.id.localeCompare(b.course.id));
  // Math preference adjusts a relevant match; it cannot create one by itself.
  const meaningful = ranked.filter(({ matchScore }) => matchScore > 0);
  const chosen = meaningful.slice(0, limit);
  if (chosen.length < limit) {
    for (const id of curatedIds) {
      const course = unique.get(id);
      if (!course || chosen.some((item) => item.course.id === id)) continue;
      chosen.push({ course, ...scoreCourse(course, validAnswers) });
      if (chosen.length >= limit) break;
    }
  }
  return chosen.slice(0, limit);
}
