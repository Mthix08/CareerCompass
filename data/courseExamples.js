import cput from "./cput_2027.json";
import dut from "./dut_2027.json";
import mut from "./mut.json";
import tut from "./tut_2027.json";
import uct from "./uct_2027.json";
import uj from "./uj_undergraduate_courses_2027.json";
import ukzn from "./ukzn_2027.json";
import unizulu from "./unizulu_2026.json";
import up from "./UP_2027.json";
import uwc from "./uwc_2027.json";
import vut from "./vut_2027.json";
import wits from "./wits_2027.json";

const courseSources = [
  ["uj", uj], ["wits", wits], ["uct", uct], ["ukzn", ukzn],
  ["up", up], ["dut", dut], ["mut", mut], ["unizulu", unizulu],
  ["cput", cput], ["uwc", uwc], ["vut", vut], ["tut", tut],
];

const SUBJECT_LABELS = {
  english: "English",
  english_home_language: "English Home Language",
  english_first_additional_language: "English First Additional Language",
  mathematics: "Mathematics",
  mathematical_literacy: "Mathematical Literacy",
  technical_mathematics: "Technical Mathematics",
  mathematics_or_technical_mathematics: "Mathematics or Technical Mathematics",
  physical_science: "Physical Sciences",
  physical_sciences: "Physical Sciences",
  technical_science: "Technical Sciences",
  life_science: "Life Sciences",
  additional_language: "Additional Language",
};

const formatRequirement = ([key, requirement]) => {
  if (key === "raw_requirements") return requirement?.raw_note || null;
  if (!requirement?.accepted || !SUBJECT_LABELS[key]) return requirement?.raw_note || null;
  const threshold = requirement.level
    ? `Level ${requirement.level}`
    : requirement.percentage
      ? `${requirement.percentage}%`
      : "Required";
  return `${SUBJECT_LABELS[key]} — ${threshold}${requirement.raw_note ? ` (${requirement.raw_note})` : ""}`;
};

export const courseExamples = courseSources.flatMap(([universityId, data]) =>
  data.courses.map((course, index) => {
    const requiredSubjects = Object.entries(course.subject_requirements || {})
      .map(formatRequirement)
      .filter(Boolean);
    const prospectusYear = data.university.prospectus_year || course.source?.edition || null;

    return {
      id: `${universityId}-${course.qualification_code || index}${universityId === "wits" ? `-${index}` : ""}`.toLowerCase(),
      name: course.name,
      qualificationCode: course.qualification_code || "Not supplied",
      qualificationType: course.qualification_type === "Bachelor's degree"
        ? "Bachelor's Degree"
        : course.qualification_type,
      universityId,
      universityName: data.university.name,
      universityShortName: data.university.abbreviation,
      minimumAps: course.aps?.minimum ?? null,
      apsDisplay: course.aps?.display || "Confirm with the university",
      apsAlternatives: course.aps?.alternatives || [],
      faculty: course.faculty || "Not supplied",
      campus: course.campus || "Confirm with the university",
      duration: course.duration_years
        ? `${course.duration_years} ${course.duration_years === 1 ? "year" : "years"}`
        : `Confirm with ${data.university.abbreviation}`,
      requiredSubjects: requiredSubjects.length
        ? requiredSubjects
        : ["See the official prospectus for subject requirements"],
      description: course.description || "See the official prospectus for programme details.",
      careerOpportunities: course.career_opportunities || [],
      prospectusYear,
      prospectusPage: course.source?.prospectus_page,
      verificationNote: course.verification?.note,
    };
  }),
);
