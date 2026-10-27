export const COURSE_SUGGESTION_CATEGORIES = {
  mathematicsFriendly: "mathematics_friendly",
  lessMathematics: "less_mathematics",
  balanced: "balanced",
};

const GROUP_A_IDS = new Set(["mathematics_1", "mathematics_2"]);
const GROUP_B_IDS = new Set(["mathematics_4", "mathematics_5", "mathematics_6"]);

export function getCourseSuggestionCategory(selectedAnswerIds) {
  if (!Array.isArray(selectedAnswerIds)) return COURSE_SUGGESTION_CATEGORIES.balanced;

  const answers = selectedAnswerIds.filter((answerId) => typeof answerId === "string");
  const selectsGroupA = answers.some((answerId) => GROUP_A_IDS.has(answerId));
  const selectsGroupB = answers.some((answerId) => GROUP_B_IDS.has(answerId));

  if (selectsGroupA && !selectsGroupB) return COURSE_SUGGESTION_CATEGORIES.mathematicsFriendly;
  if (selectsGroupB && !selectsGroupA) return COURSE_SUGGESTION_CATEGORIES.lessMathematics;
  return COURSE_SUGGESTION_CATEGORIES.balanced;
}

export const COURSE_SUGGESTION_COURSE_IDS = {
  [COURSE_SUGGESTION_CATEGORIES.mathematicsFriendly]: [
    "wits-efa01-13",
    "uct-24",
    "uct-81",
    "wits-sba13-62",
    "wits-cba18-5",
  ],
  [COURSE_SUGGESTION_CATEGORIES.lessMathematics]: [
    "uct-59",
    "nmu-58",
    "cput-70",
    "dut-du-b-dif",
    "NWU-2027-161",
  ],
  [COURSE_SUGGESTION_CATEGORIES.balanced]: [
    "up-14",
    "wits-mfa07-33",
    "nmu-37",
    "cput-31",
    "cput-65",
  ],
};

export function getSuggestedCourses(category, courses) {
  if (!Array.isArray(courses)) return [];
  const ids = new Set(COURSE_SUGGESTION_COURSE_IDS[category] || []);
  return courses.filter((course) => ids.has(course.id));
}
