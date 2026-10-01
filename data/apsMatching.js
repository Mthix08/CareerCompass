import { courseExamples } from "./courseExamples";
import { universities } from "./universities";

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