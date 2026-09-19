import cput from "./cput_2027.json";
import cut from "./cut_2026.json";
import dut from "./dut_2027.json";
import mut from "./mut.json";
import nmu from "./nmu_2027.json";
import nwu from "./nwu_2027.json";
import rhodes from "./rhodes_2027.json";
import smu from "./smu_2027.json";
import spu from "./spu_2027.json";
import stellenbosch from "./stellenbosch_2027.json";
import tut from "./tut_2027.json";
import uct from "./uct_2027.json";
import ufh from "./ufh_2027.json";
import ufs from "./ufs_2027.json";
import uj from "./uj_undergraduate_courses_2027.json";
import ukzn from "./ukzn_2027.json";
import ul from "./ul_2027.json";
import ump from "./ump_2027.json";
import unisa from "./unisa_2027.json";
import univen from "./univen_2027.json";
import unizulu from "./unizulu_2026.json";
import up from "./UP_2027.json";
import uwc from "./uwc_2027.json";
import vut from "./vut_2027.json";
import wits from "./wits_2027.json";
import wsu from "./wsu_2027.json";
import { universities } from "./universities";

const courseSources = [
  ["uj", uj], ["wits", wits], ["uct", uct], ["ukzn", ukzn],
  ["up", up], ["dut", dut], ["mut", mut], ["unizulu", unizulu],
  ["cput", cput], ["uwc", uwc], ["vut", vut], ["tut", tut],
  ["stellenbosch", stellenbosch], ["nwu", nwu], ["ufs", ufs],
  ["ufh", ufh], ["ump", ump], ["spu", spu], ["univen", univen],
  ["ul", ul], ["wsu", wsu], ["smu", smu], ["rhodes", rhodes],
  ["nmu", nmu], ["cut", cut], ["unisa", unisa],
];

const universityById = Object.fromEntries(universities.map((item) => [item.id, item]));

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
  if (key === "raw_requirements") {
    return Array.isArray(requirement) ? requirement : requirement?.raw_note || null;
  }
  if (key === "structured" || key === "aps_calculation_method" || key.endsWith("_url")) return null;
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
      .flatMap((entry) => formatRequirement(entry) || [])
      .filter(Boolean);
    const university = universityById[universityId];
    const prospectusYear = data.university?.prospectus_year || data.academic_year || course.source?.edition || null;

    return {
      id: course.record_id || `${universityId}-${course.qualification_code || index}${universityId === "wits" ? `-${index}` : ""}`.toLowerCase(),
      name: course.name,
      qualificationCode: course.qualification_code || "Not supplied",
      qualificationType: course.qualification_type === "Bachelor's degree"
        ? "Bachelor's Degree"
        : course.qualification_type,
      universityId,
      universityName: university.name,
      universityShortName: university.shortName,
      minimumAps: course.aps?.minimum ?? null,
      apsDisplay: course.aps?.display || "Confirm with the university",
      apsAlternatives: course.aps?.alternatives || [],
      faculty: course.faculty || "Not supplied",
      campus: Array.isArray(course.campus)
        ? course.campus.join(", ") || course.campus_note || "Confirm with the university"
        : course.campus || "Confirm with the university",
      duration: course.duration_years
        ? `${course.duration_years} ${course.duration_years === 1 ? "year" : "years"}`
        : `Confirm with ${university.shortName}`,
      requiredSubjects: requiredSubjects.length
        ? requiredSubjects
        : ["See the official prospectus for subject requirements"],
      description: course.description || "See the official prospectus for programme details.",
      careerOpportunities: course.career_opportunities || [],
      prospectusYear,
      prospectusPage: course.source?.prospectus_page || course.source?.page || course.source?.prospectus_pages?.[0],
      verificationNote: course.verification?.note,
    };
  }),
);
