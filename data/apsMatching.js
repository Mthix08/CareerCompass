import { courseExamples } from "./courseExamples";
import { universities } from "./universities";
import { calculateUniversityScores } from "../services/apsScoring";

const APS_PERIODS = [
    "Grade 11 Final",
    "Grade 12 Term 1",
    "Grade 12 Term 2",
    "Grade 12 Term 3",
    "Grade 12 Term 4",
];

export function getLatestApsRecord(apsRecords = {}) {
    for (const period of [...APS_PERIODS].reverse()) {
        const record = apsRecords[period];
        if (
            Number.isFinite(record?.totalAps) &&
            record.totalAps >= 0 &&
            record.subjectCount > 0
        ) {
            return { ...record, period };
        }
    }

    return null;
}

export function getApsUniversityMatches(totalAps) {
    if (!Number.isFinite(totalAps)) return [];

    return universities
        .map((university) => ({
            ...university,
            qualifyingCourses: courseExamples.filter(
                (course) =>
                    course.universityId === university.id &&
                    typeof course.minimumAps === "number" &&
                    course.minimumAps <= totalAps,
            ),
        }))
        .filter(({ qualifyingCourses }) => qualifyingCourses.length > 0)
        .sort((first, second) =>
            first.name.localeCompare(second.name),
        );
}

export function getInstitutionApsResults(marks) {
    const scores = calculateUniversityScores(universities, marks);
    return Object.fromEntries(scores.map((item) => [item.id, {
        score: item.score,
        maximumScore: item.maximumScore,
        status: item.status,
        availability: item.availability,
        methodLabel: item.methodLabel,
    }]));
}

export function getInstitutionApsMatches(marks) {
    const apsByUniversity = getInstitutionApsResults(marks);
    const normalizedMarks = Array.isArray(marks) ? marks : [];
    return universities
        .map((university) => {
            const apsResult = apsByUniversity[university.id];
            const score = apsResult?.score;
            const apsMatchedCourses = courseExamples.filter(
                (course) => course.universityId === university.id
                    && Number.isFinite(score)
                    && typeof course.minimumAps === "number"
                    && course.minimumAps <= score,
            );
            const qualifyingCourses = [];
            const verificationCourses = [];
            for (const course of apsMatchedCourses) {
                const maths = assessMathRequirement(course, normalizedMarks);
                const match = { ...course, mathMatchStatus: maths.status, mathMatchNote: maths.note };
                if (maths.status === "matched") qualifyingCourses.push(match);
                else if (maths.status === "needs_verification") verificationCourses.push(match);
            }
            return { ...university, ...apsResult, qualifyingCourses, verificationCourses };
        })
        .filter(({ qualifyingCourses, verificationCourses }) => qualifyingCourses.length > 0 || verificationCourses.length > 0)
        .sort((first, second) => first.name.localeCompare(second.name));
}

export function getInstitutionCourseMatchStatus(course, marks) {
    return assessMathRequirement(course, Array.isArray(marks) ? marks : []);
}

function assessMathRequirement(course, marks) {
    const requirements = course.subjectRequirements;
    if (!requirements || typeof requirements !== "object") {
        return { status: "needs_verification", note: "Maths requirement needs verification" };
    }

    const normalizedSubjects = marks.map(({ subject, mark }) => ({
        subject: String(subject || "").trim().toLowerCase(),
        mark: Number(mark),
    }));
    const subjectOptions = [
        { key: "mathematics", aliases: ["mathematics"], label: "Mathematics" },
        { key: "mathematical_literacy", aliases: ["mathematical literacy"], label: "Mathematical Literacy" },
        { key: "technical_mathematics", aliases: ["technical mathematics"], label: "Technical Mathematics" },
        { key: "mathematics_or_technical_mathematics", aliases: ["mathematics", "technical mathematics"], label: "Mathematics or Technical Mathematics" },
    ];
    const declaredOptions = subjectOptions.filter(({ key }) => requirements[key]?.accepted === true);
    if (declaredOptions.length === 0) {
        const hasMathFields = subjectOptions.some(({ key }) => Object.hasOwn(requirements, key));
        return hasMathFields
            ? { status: "matched", note: "No Maths subject requirement is listed" }
            : { status: "needs_verification", note: "Maths requirement needs verification" };
    }

    const metOption = declaredOptions.find(({ key, aliases }) => {
        const requirement = requirements[key];
        return aliases.some((alias) => normalizedSubjects.some(({ subject, mark }) => {
            const matches = alias === "mathematics"
                ? subject.includes("mathematics") && !subject.includes("mathematical literacy") && !subject.includes("technical mathematics")
                : subject.includes(alias);
            return matches && Number.isFinite(mark) && mark >= 0 && mark <= 100
                && (!Number.isFinite(requirement.level) || Math.floor(mark / 10) + 1 >= requirement.level)
                && (!Number.isFinite(requirement.percentage) || mark >= requirement.percentage);
        }));
    });
    if (metOption) return { status: "matched", note: `${metOption.label} requirement met` };

    const hasRelevantMark = declaredOptions.some(({ aliases }) => aliases.some((alias) => normalizedSubjects.some(({ subject }) =>
        alias === "mathematics"
            ? subject.includes("mathematics") && !subject.includes("mathematical literacy") && !subject.includes("technical mathematics")
            : subject.includes(alias),
    )));
    if (hasRelevantMark) return { status: "not_matched", note: "Maths subject is below the listed requirement" };
    return { status: "not_matched", note: "Required Maths subject is not in your saved marks" };
}
