import ujCourseData from "./uj_undergraduate_courses_2027.json";

const SUBJECT_LABELS = {
  english: "English",
  mathematics: "Mathematics",
  mathematical_literacy: "Mathematical Literacy",
  technical_mathematics: "Technical Mathematics",
  mathematics_or_technical_mathematics: "Mathematics or Technical Mathematics",
  physical_science: "Physical Sciences",
  technical_science: "Technical Sciences",
  life_science: "Life Sciences",
  additional_language: "Additional Language",
};

const formatRequirement = ([key, requirement]) => {
  if (!requirement?.accepted || !SUBJECT_LABELS[key]) return null;

  const threshold = requirement.level
    ? `Level ${requirement.level}`
    : requirement.percentage
      ? `${requirement.percentage}%`
      : "Required";

  return `${SUBJECT_LABELS[key]} — ${threshold}`;
};

export const courseDataNotice = ujCourseData.important_notice;

export const courseExamples = ujCourseData.courses.map((course) => {
  const requiredSubjects = Object.entries(course.subject_requirements || {})
    .map(formatRequirement)
    .filter(Boolean);

  return {
    id: `uj-${course.qualification_code.toLowerCase()}`,
    name: course.name,
    qualificationCode: course.qualification_code,
    qualificationType:
      course.qualification_type === "Bachelor's degree"
        ? "Bachelor's Degree"
        : course.qualification_type,
    universityId: "uj",
    universityName: ujCourseData.university.name,
    universityShortName: ujCourseData.university.abbreviation,
    minimumAps: course.aps.minimum,
    apsDisplay: course.aps.display,
    apsAlternatives: course.aps.alternatives || [],
    faculty: course.faculty,
    campus: course.campus,
    duration: course.duration_years
      ? `${course.duration_years} ${course.duration_years === 1 ? "year" : "years"}`
      : "Confirm with UJ",
    requiredSubjects:
      requiredSubjects.length > 0
        ? requiredSubjects
        : ["See the official prospectus for subject requirements"],
    description: course.description,
    careerOpportunities: course.career_opportunities || [],
    prospectusYear: ujCourseData.university.prospectus_year,
    prospectusPage: course.source?.prospectus_page,
    verificationNote: course.verification?.note,
  };
});
