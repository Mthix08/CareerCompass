const API_BASE_URL =
  "http://universities.hipolabs.com/search?country=South%20Africa";

const CAMPUS_IMAGES = {
  "Cape Peninsula University of Technology": require("../assets/CPUT.jpg"),
  "University of Johannesburg": require("../assets/UJ.webp"),
  "Univerisity of Mpumalanga": require("../assets/universityofmpumalanga.webp"),
  "University of Mpumalanga": require("../assets/universityofmpumalanga.webp"),
};

export async function getUniversities() {
  try {
    const response = await fetch(API_BASE_URL);

    if (!response.ok) {
      throw new Error("Failed to fetch universities");
    }

    const data = await response.json();

    return data.map((university) => {
      const website = university.web_pages?.[0] || "";
      const domain = university.domains?.[0] || "";

      return {
        ...university,
        id: `${university.name}-${university.alpha_two_code || "ZA"}`,
        province: university["state-province"] || "Province not listed",
        website,
        domain,
        logoUrl: domain ? `https://logo.clearbit.com/${domain}` : "",
        campusImage: CAMPUS_IMAGES[university.name] || null,
      };
    });
  } catch (error) {
    console.error("University API error:", error);
    throw error;
  }
}
