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
    return universities
        .map((university) => {
            const apsResult = apsByUniversity[university.id];
            const score = apsResult?.score;
            const qualifyingCourses = courseExamples.filter(
                (course) => course.universityId === university.id
                    && Number.isFinite(score)
                    && typeof course.minimumAps === "number"
                    && course.minimumAps <= score,
            );
            return { ...university, ...apsResult, qualifyingCourses };
        })
        .filter(({ qualifyingCourses }) => qualifyingCourses.length > 0)
        .sort((first, second) => first.name.localeCompare(second.name));
}
