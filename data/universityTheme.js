export const DEFAULT_UNIVERSITY_THEME = {
  accent: "#F26522",
  accentLight: "#F4B08F",
  accentSoft: "rgba(242, 101, 34, 0.17)",
  placeholderBackground: "#301B14",
};

export function getUniversityTheme(university) {
  return {
    ...DEFAULT_UNIVERSITY_THEME,
    ...(university?.theme || {}),
  };
}
