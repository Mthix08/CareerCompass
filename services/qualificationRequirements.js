const SUBJECT_ALIASES = {
  english: ["english"],
  english_home_language: ["english home language", "english home lang", "english hl"],
  english_first_additional_language: ["english first additional language", "english fal", "english first additional"],
  home_language: ["home language"],
  mathematics: ["mathematics"],
  mathematical_literacy: ["mathematical literacy"],
  technical_mathematics: ["technical mathematics"],
  physical_science: ["physical science", "physical sciences"],
  physical_sciences: ["physical science", "physical sciences"],
  technical_science: ["technical science", "technical sciences"],
  technical_sciences: ["technical science", "technical sciences"],
  life_science: ["life science", "life sciences"],
  life_sciences: ["life science", "life sciences"],
  engineering_mathematics: ["engineering mathematics"],
  engineering_science: ["engineering science"],
  biology: ["biology"],
  agriculture: ["agriculture"],
  additional_language: ["additional language"],
  other_language: ["additional language", "other language"],
};

const SUBJECT_LABELS = {
  english: "English",
  english_home_language: "English Home Language",
  english_first_additional_language: "English First Additional Language",
  home_language: "Home Language",
  mathematics: "Mathematics",
  mathematical_literacy: "Mathematical Literacy",
  technical_mathematics: "Technical Mathematics",
  physical_science: "Physical Sciences",
  physical_sciences: "Physical Sciences",
  technical_science: "Technical Sciences",
  technical_sciences: "Technical Sciences",
  life_science: "Life Sciences",
  life_sciences: "Life Sciences",
  engineering_mathematics: "Engineering Mathematics",
  engineering_science: "Engineering Sciences",
  biology: "Biology",
  agriculture: "Agriculture",
  additional_language: "Additional Language",
  other_language: "Other Language",
};

function achievementLevel(mark) {
  const percentage = Number(mark);
  if (!Number.isFinite(percentage) || percentage < 0 || percentage > 100) return null;
  if (percentage >= 80) return 7;
  if (percentage >= 70) return 6;
  if (percentage >= 60) return 5;
  if (percentage >= 50) return 4;
  if (percentage >= 40) return 3;
  if (percentage >= 30) return 2;
  return 1;
}

function describeThreshold(requirement) {
  const parts = [];
  const level = requirement.level == null || requirement.level === "" ? null : Number(requirement.level);
  const percentage = requirement.percentage == null || requirement.percentage === "" ? null : Number(requirement.percentage);
  if (Number.isFinite(level)) parts.push(`Level ${level}`);
  if (Number.isFinite(percentage)) parts.push(`${percentage}%`);
  return parts.length ? `Minimum ${parts.join(" and ")}` : "No minimum mark listed";
}

function candidateKeys(key) {
  return key.split("_or_").filter(Boolean);
}

function matchesSubject(subject, candidateKey) {
  const normalizedSubject = String(subject || "").trim().toLowerCase();
  const aliases = SUBJECT_ALIASES[candidateKey];
  if (!normalizedSubject || !aliases) return false;
  return aliases.some((alias) => normalizedSubject.includes(alias));
}

function evaluateRequirement(key, requirement, marks) {
  const candidates = candidateKeys(key);
  const aliases = candidates.flatMap((candidate) => SUBJECT_ALIASES[candidate] || []);
  if (!aliases.length) {
    return { status: "manual", current: "Check the official prospectus", minimum: "This item needs a manual check" };
  }

  const levelMinimum = requirement.level == null || requirement.level === "" ? null : Number(requirement.level);
  const percentageMinimum = requirement.percentage == null || requirement.percentage === "" ? null : Number(requirement.percentage);
  const hasMinimum = Number.isFinite(levelMinimum) || Number.isFinite(percentageMinimum);
  const matchingMarks = marks.filter(({ subject, mark }) =>
    candidates.some((candidate) => matchesSubject(subject, candidate))
      && mark != null
      && !(typeof mark === "string" && mark.trim() === "")
      && Number.isFinite(Number(mark))
      && Number(mark) >= 0
      && Number(mark) <= 100,
  );
  if (!matchingMarks.length) {
    return { status: "missing", current: "No matching mark saved", minimum: describeThreshold(requirement) };
  }

  const markThatMeets = matchingMarks.find(({ mark }) => {
    const percentage = Number(mark);
    const level = achievementLevel(percentage);
    return (!Number.isFinite(levelMinimum) || level >= levelMinimum)
      && (!Number.isFinite(percentageMinimum) || percentage >= percentageMinimum);
  });
  if (markThatMeets) {
    const percentage = Number(markThatMeets.mark);
    return {
      status: hasMinimum ? "met" : "recorded",
      current: `${markThatMeets.subject}: ${percentage}% (Level ${achievementLevel(percentage)})`,
      minimum: describeThreshold(requirement),
    };
  }

  const bestMark = matchingMarks.reduce((best, item) => Number(item.mark) > Number(best.mark) ? item : best);
  const percentage = Number(bestMark.mark);
  return {
    status: "below",
    current: `${bestMark.subject}: ${percentage}% (Level ${achievementLevel(percentage)})`,
    minimum: describeThreshold(requirement),
  };
}

/**
 * Compares saved NSC marks with subject minimums explicitly encoded in a course.
 * This deliberately does not decide admission: course data can include alternative
 * combinations, selection rules, and requirements that need a manual prospectus check.
 */
export function getCourseRequirementChecks(course, marks) {
  const requirements = course?.subjectRequirements;
  if (!requirements || typeof requirements !== "object" || !Array.isArray(marks)) return [];

  return Object.entries(requirements)
    .filter(([, requirement]) => requirement?.accepted === true)
    .map(([key, requirement]) => ({
      key,
      label: SUBJECT_LABELS[key]
        || candidateKeys(key).map((candidate) => SUBJECT_LABELS[candidate] || candidate.replaceAll("_", " ")).join(" or "),
      ...evaluateRequirement(key, requirement, marks),
    }));
}
