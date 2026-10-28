import collegeRecords from "./colleges.json";

const slugify = (value) =>
  String(value || "college")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const bundledColleges = (Array.isArray(collegeRecords) ? collegeRecords : [])
  .filter((college) => college && typeof college.name === "string")
  .map((college, index) => ({
    ...college,
    id: String(college.id || slugify(college.name)),
    type: college.type || "Public TVET College",
    order: Number.isFinite(college.order) ? college.order : index + 1,
  }));
