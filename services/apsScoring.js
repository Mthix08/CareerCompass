import { apsRuleAdmissionsYear, apsScoringRules } from "../data/apsScoringRules";

const isLifeOrientation = (subject = "") => subject.trim().toLowerCase() === "life orientation";

export function percentageToAchievementPoints(mark, bands) {
  if (mark == null || (typeof mark === "string" && mark.trim() === "")) return null;
  const percentage = Number(mark);
  if (!Number.isFinite(percentage) || percentage < 0 || percentage > 100) return null;
  const band = [...(bands || [])]
    .sort((first, second) => second.minimum - first.minimum)
    .find(({ minimum }) => percentage >= minimum);
  return band?.points ?? null;
}

function unavailableResult(universityId, rule, reason) {
  return {
    universityId,
    admissionsYear: rule?.admissionsYear ?? apsRuleAdmissionsYear,
    status: rule?.status || "needs_verification",
    availability: ["verified", "needs_verification"].includes(rule?.status)
      ? "needs_input"
      : "needs_verification",
    score: null,
    maximumScore: rule?.maximumScore ?? null,
    maximumBonusScore: rule?.maximumBonusScore ?? null,
    methodLabel: rule?.methodLabel || "Scoring method not verified",
    sourceUrl: rule?.sourceUrl || null,
    note: reason || rule?.notes?.[0] || "An official, complete scoring rule is not configured.",
  };
}

function validMarks(marks) {
  return Array.isArray(marks) && marks.length > 0 && marks.every(({ mark }) => {
    if (mark == null || (typeof mark === "string" && mark.trim() === "")) return false;
    const percentage = Number(mark);
    return Number.isFinite(percentage) && percentage >= 0 && percentage <= 100;
  });
}

function matchesRequiredSubject(subjectName, candidate) {
  const subject = subjectName.trim().toLowerCase();
  if (candidate === "english") return subject.includes("english");
  if (candidate === "mathematical literacy") return subject.includes("mathematical literacy");
  if (candidate === "mathematics") {
    return subject.includes("mathematics")
      && !subject.includes("mathematical literacy")
      && !subject.includes("technical mathematics");
  }
  return subject === candidate;
}

function isWitsMathematics(subject = "") {
  const normalized = subject.trim().toLowerCase();
  return normalized.includes("mathematics")
    && !normalized.includes("mathematical literacy")
    && !normalized.includes("technical mathematics");
}

function getWitsPoints(subject, mark, rule) {
  const bands = isLifeOrientation(subject) ? rule.lifeOrientationBands : rule.percentageBands;
  const points = bands.find(({ minimum }) => mark >= minimum)?.points ?? 0;
  const englishOrMathematics = subject.trim().toLowerCase().includes("english") || isWitsMathematics(subject);
  return points + (englishOrMathematics && mark >= rule.bonus.minimumPercentage ? rule.bonus.points : 0);
}

function isPureMathematics(subject = "") {
  const normalized = subject.trim().toLowerCase();
  return normalized.includes("mathematics")
    && !normalized.includes("mathematical literacy")
    && !normalized.includes("technical mathematics");
}

function getSpuPoints(subject, mark, rule) {
  const normalized = subject.trim().toLowerCase();
  if (isLifeOrientation(subject)) {
    return rule.lifeOrientationBands.find(({ minimum }) => mark >= minimum)?.points ?? 0;
  }
  const basePoints = rule.percentageBands.find(({ minimum }) => mark >= minimum)?.points ?? 0;
  const isHomeLanguage = normalized.includes("home language")
    || (/(^|\W)hl($|\W)/.test(normalized)
      && !normalized.includes("first additional")
      && !/(^|\W)fal($|\W)/.test(normalized));
  const getsBonus = isPureMathematics(subject) || isHomeLanguage;
  if (!getsBonus) return basePoints;
  const bonus = mark >= 60 ? 2 : mark >= 40 ? 1 : 0;
  return basePoints + bonus;
}

function scoreWithRule(marks, rule) {
  const hasLifeOrientation = marks.some(({ subject }) => isLifeOrientation(subject));
  const lifeOrientationMark = marks.find(({ subject }) => isLifeOrientation(subject));
  const eligibilityNotes = [];
  if (rule.lifeOrientation?.requireMark && !hasLifeOrientation) {
    return { score: null, reason: "Add a Life Orientation mark to calculate this score." };
  }
  if (Number.isFinite(rule.lifeOrientation?.minimumEligibilityMark)) {
    if (!lifeOrientationMark) {
      eligibilityNotes.push(`Life Orientation must be at least ${rule.lifeOrientation.minimumEligibilityMark}% for eligibility; no mark was entered.`);
    } else if (Number(lifeOrientationMark.mark) < rule.lifeOrientation.minimumEligibilityMark) {
      eligibilityNotes.push(`Life Orientation must be at least ${rule.lifeOrientation.minimumEligibilityMark}% for eligibility; this mark does not meet that threshold.`);
    }
  }
  if (rule.bonus?.type === "life_orientation_quintile") {
    const loMark = lifeOrientationMark ? Number(lifeOrientationMark.mark) : null;
    if (loMark === null || loMark < rule.bonus.minimumPercentage) {
      eligibilityNotes.push(`The possible ${rule.bonus.points}-point bonus requires at least ${rule.bonus.minimumPercentage}% in Life Orientation and a qualifying school quintile; it is not included.`);
    } else {
      eligibilityNotes.push(`The possible ${rule.bonus.points}-point Life Orientation bonus is not included because school quintile is not collected.`);
    }
  }
  if (rule.bonus?.type === "single_threshold") {
    eligibilityNotes.push(`One ${rule.bonus.points}-point bonus applies when a selected subject is above ${rule.bonus.minimumPercentageExclusive}%.`);
  }

  const eligible = marks
    .filter(({ subject }) => rule.lifeOrientation?.mode !== "excluded" || !isLifeOrientation(subject))
    .map(({ subject, mark }) => ({
      subject,
      percentage: Number(mark),
      points: rule.method === "wits_weighted_best_n"
        ? getWitsPoints(subject, Number(mark), rule)
        : rule.method === "spu_weighted_best_n"
          ? getSpuPoints(subject, Number(mark), rule)
        : percentageToAchievementPoints(mark, rule.percentageBands),
    }));

  if (rule.subjectSelection?.mode === "best_n") {
    const byPercentage = ["percentage_best_n", "percentage_best_n_average", "percentage_best_n_with_lo_bonus", "percentage_tenths_best_n"].includes(rule.method);
    eligible.sort((first, second) => byPercentage
      ? second.percentage - first.percentage
      : second.points - first.points);
  }
  const count = rule.subjectSelection?.count;
  const requiredGroups = rule.subjectSelection?.requiredSubjectGroups || [];
  const lockedSubjects = [];
  for (const group of requiredGroups) {
    const requiredSubject = eligible.find((subject) =>
      !lockedSubjects.includes(subject)
      && group.some((candidate) => matchesRequiredSubject(subject.subject, candidate)),
    );
    if (!requiredSubject) {
      return { score: null, reason: `Include a required subject: ${group.join(" or ")}.` };
    }
    lockedSubjects.push(requiredSubject);
  }
  const remainingCount = Number.isInteger(count) ? Math.max(0, count - lockedSubjects.length) : eligible.length;
  const selected = Number.isInteger(count)
    ? [...lockedSubjects, ...eligible.filter((subject) => !lockedSubjects.includes(subject)).slice(0, remainingCount)]
    : eligible;
  if (Number.isInteger(count) && selected.length < count) {
    return { score: null, reason: `Enter at least ${count} non-Life Orientation subjects.` };
  }

  let score;
  if (["nsc_levels_best_n", "nsc_levels_best_n_with_fixed_lo", "nsc_levels_best_n_with_included_lo", "wits_weighted_best_n", "spu_weighted_best_n"].includes(rule.method)) {
    score = selected.reduce((total, subject) => total + subject.points, 0);
    if (rule.lifeOrientation?.mode === "fixed_point") score += rule.lifeOrientation.points;
  } else if (rule.method === "nsc_levels_best_n_with_percentage_bonus") {
    score = selected.reduce((total, subject) => total + subject.points, 0);
    if (selected.some((subject) => subject.percentage > rule.bonus.minimumPercentageExclusive)) {
      score += rule.bonus.points;
    }
  } else if (rule.method === "percentage_best_n" || rule.method === "percentage_best_n_with_lo_bonus") {
    const percentageTotal = selected.reduce((total, subject) => {
      const minimum = rule.minimumPercentageForScore ?? 0;
      return total + (subject.percentage >= minimum ? subject.percentage : 0);
    }, 0);
    score = percentageTotal;
  } else if (rule.method === "percentage_best_n_average") {
    score = Number((selected.reduce((total, subject) => total + subject.percentage, 0) / selected.length).toFixed(2));
  } else if (rule.method === "percentage_tenths_best_n") {
    score = selected.reduce((total, subject) => {
      const minimum = rule.minimumPercentageForScore ?? 0;
      return total + (subject.percentage >= minimum ? subject.percentage / 10 : 0);
    }, 0);
    score = Math.round(score * 10) / 10;
  } else if (rule.method === "weighted_nsc_levels") {
    score = selected.reduce((total, subject) => {
      const weight = rule.subjectWeights?.[subject.subject];
      return total + subject.points * (Number.isFinite(weight) ? weight : 1);
    }, 0);
  } else {
    return { score: null, reason: "The configured scoring method is not supported by the calculator." };
  }

  return { score, reason: null, eligibilityNotes };
}

export function calculateUniversityScores(universities, marks, rules = apsScoringRules) {
  return universities.map((university) => {
    const rule = rules[university.id];
    if (!rule || !["verified", "needs_verification"].includes(rule.status)) {
      return { ...university, ...unavailableResult(university.id, rule) };
    }
    if (!validMarks(marks)) {
      return { ...university, ...unavailableResult(university.id, rule, "Enter valid percentage marks for every selected subject.") };
    }

    const result = scoreWithRule(marks, rule);
    if (result.score === null) {
      return { ...university, ...unavailableResult(university.id, rule, result.reason) };
    }

    return {
      ...university,
      universityId: university.id,
      admissionsYear: rule.admissionsYear,
      status: rule.status,
      availability: "available",
      score: result.score,
      maximumScore: rule.maximumScore,
      maximumBonusScore: rule.maximumBonusScore ?? null,
      methodLabel: rule.methodLabel,
      sourceUrl: rule.sourceUrl,
      note: [...(rule.notes || []), ...(result.eligibilityNotes || [])].join(" ") || null,
    };
  });
}
