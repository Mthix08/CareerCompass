export const universities = [
  {
    id: "uj",
    name: "University of Johannesburg",
    shortName: "UJ",
    province: "Gauteng",
    type: "Public",
    applicationFee: 0,
    applicationFeeLabel: "Free to apply",
    image: require("../assets/UjCampus.jpg"),
    logo: require("../assets/UJLogoo.png"),
    description:
      "The University of Johannesburg is a public university situated in Johannesburg, Gauteng. It offers undergraduate and postgraduate programmes across several faculties.",
    campuses: [
      "Auckland Park Kingsway Campus",
      "Auckland Park Bunting Road Campus",
      "Doornfontein Campus",
      "Soweto Campus",
    ],
    virtualCampusUrl: "https://www.uj.ac.za/virtual-campus/",
    website: "https://www.uj.ac.za/",
    applicationUrl: "https://www.uj.ac.za/admissions-aid/",
    applicationStatus: "Check the official UJ website",
    openingDate: "Confirm on the official UJ website",
    closingDate: "Confirm on the official UJ website",
    applicationInstructions:
      "Visit the official admissions page, choose the relevant application route, and follow UJ's current instructions. Confirm all requirements and dates on the official website before submitting.",
    courses: [
      {
        id: "uj-bcom-it",
        name: "BCom in Information Management",
        faculty: "College of Business and Economics",
        minimumAPS: "Example only — verify with UJ",
        duration: "3 years",
        requiredSubjects: ["English", "Mathematics"],
      },
      {
        id: "uj-bit",
        name: "Bachelor of Information Technology",
        faculty: "Faculty of Engineering and the Built Environment",
        minimumAPS: "Example only — verify with UJ",
        duration: "3 years",
        requiredSubjects: ["English", "Mathematics"],
      },
    ],
  },
];
