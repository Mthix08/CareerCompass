// One-time (re-runnable) script that puts the app's content into Firestore.
//
// Setup:
//   1. npm install --save-dev firebase-admin dotenv
//   2. Firebase Console -> Project settings -> Service accounts -> Generate new private key
//      Save the file as serviceAccountKey.json in the project root.
//   3. Add to .gitignore:  serviceAccountKey.json
//   4. Add to .env:        FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
//   5. Run:                node scripts/seedFirestore.cjs
//
// The service account key is a real secret. Never commit it and never put it inside the app.

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");

// Key file location: from .env, or serviceAccountKey.json in the project root by default.
// Always resolved from the project root, no matter which folder you run node from.
const keyName = (process.env.FIREBASE_SERVICE_ACCOUNT_PATH || "./serviceAccountKey.json")
  .trim()
  .replace(/^["']|["']$/g, "");
const keyPath = path.resolve(__dirname, "..", keyName);

if (!fs.existsSync(keyPath)) {
  console.error(`Key file not found. Looked for: ${keyPath}`);
  console.error("Put serviceAccountKey.json in the project root (next to package.json).");
  process.exit(1);
}

initializeApp({ credential: cert(JSON.parse(fs.readFileSync(keyPath, "utf8"))) });
const db = getFirestore();

const daysAgo = (days) =>
  Timestamp.fromDate(new Date(Date.now() - days * 24 * 60 * 60 * 1000));

// ---------------------------------------------------------------- faqs
const faqs = [
  {
    id: "faq-1",
    order: 1,
    question: "What is an APS score?",
    answer: "An Admission Point Score (APS) is calculated from your school subject results. Universities use it, together with required subjects and other criteria, to assess applications. The way points are calculated can differ between universities and programmes.",
  },
  {
    id: "faq-2",
    order: 2,
    question: "How do I know if I qualify for a course?",
    answer: "Check the course's minimum APS, required subjects and minimum marks. Meeting the minimum requirements does not guarantee admission, since places may be limited and universities can apply additional selection criteria.",
  },
  {
    id: "faq-3",
    order: 3,
    question: "When should I apply to university?",
    answer: "Application dates vary by university and programme. Some programmes close early or once they receive enough applications, so check each university's official admissions page and apply as soon as applications open.",
  },
  {
    id: "faq-4",
    order: 4,
    question: "What documents do I need to apply?",
    answer: "You will usually need a certified identity document or passport, your latest school results, and proof of payment if an application fee applies. Requirements differ, so confirm the document list with each university.",
  },
  {
    id: "faq-5",
    order: 5,
    question: "Do I have to pay a registration fee?",
    answer: "Many universities require an upfront payment before registration. The amount depends on the university, programme, accommodation and funding. Use the registration cost information on the university details page as a starting point, then confirm the current amount directly with the university.",
  },
  {
    id: "faq-6",
    order: 6,
    question: "Can I apply for financial aid?",
    answer: "You may be eligible for NSFAS or other bursaries, depending on the funder's requirements. Check the relevant application dates and eligibility rules, and contact the university's financial aid office about how confirmed funding affects upfront payments.",
  },
  {
    id: "faq-7",
    order: 7,
    question: "Does meeting the minimum requirements guarantee admission?",
    answer: "No. Minimum requirements make you eligible to be considered, but admission depends on available places, applicant demand and any additional programme selection criteria.",
  },
];

// ---------------------------------------------------------------- notifications
// createdAt is set relative to the day you run the script, so "Today", "2d ago" etc. look right.
const notifications = [
  {
    id: "wits-closing-30-days",
    category: "Universities",
    eyebrow: "UNIVERSITY APPLICATION",
    title: "Wits applications close in 30 days",
    description: "Complete your application and upload the required documents before the deadline.",
    icon: "business",
    universityId: "wits",
    createdAt: daysAgo(0),
  },
  {
    id: "nsfas-reminder",
    category: "Bursaries",
    eyebrow: "BURSARY",
    title: "Remember to check your NSFAS application",
    description: "Review your application status and make sure all supporting documents are submitted.",
    icon: "wallet",
    routeName: "FundingDetails",
    fundingId: "nsfas",
    createdAt: daysAgo(2),
  },
  {
    id: "new-university-guides",
    category: "New Content",
    eyebrow: "NEW CONTENT",
    title: "University profiles have been updated",
    description: "Explore campus information, representative courses and application guidance.",
    icon: "sparkles",
    routeName: "Home",
    screen: "Universities",
    createdAt: daysAgo(4),
  },
  {
    id: "preferences-tip",
    category: "Announcements",
    eyebrow: "ANNOUNCEMENT",
    title: "Choose the alerts you want to receive",
    description: "You can update your notification preferences at any time.",
    icon: "notifications",
    routeName: "NotificationPreferences",
    createdAt: daysAgo(7),
  },
];

// ---------------------------------------------------------------- bursaries
// Moved here from data/funding.js (NSFAS, SAMPLE_BURSARY) and FundingDetailsScreen.js (the section lists).
const bursaries = [
  {
    id: "nsfas",
    order: 1,
    featured: true,
    isPlaceholder: false,
    name: "NSFAS",
    fullName: "National Student Financial Aid Scheme",
    provider: "NSFAS",
    cycle: "2027 academic year",
    opens: "18 September 2026",
    closes: "31 October 2026",
    // End of 31 October in South African Standard Time (UTC+02:00).
    closesAt: "2026-10-31T23:59:59+02:00",
    applyUrl: "https://my.nsfas.org.za/",
    infoUrl: "https://www.nsfas.org.za/content/how-to-apply.html",
    policyUrl: "https://www.nsfas.org.za/content/downloads/Annexure%20A_NSFAS%202026%20Bursary%20Guidelines.pdf",
    description: "A national funding scheme that helps eligible students study approved qualifications at South African public universities and TVET colleges.",
    footnote: "Dates are for the 2027 application cycle. Study progress figures are from the published 2026 bursary policy; check NSFAS for current rules before applying.",
    sections: [
      {
        title: "Who qualifies?", icon: "people-outline", items: [
          "South African citizens and eligible permanent residents studying an approved qualification at a public university or TVET college.",
          "Combined annual household income of R350,000 or less, or R600,000 or less for applicants with disabilities.",
          "Verified SASSA grant recipients meet the financial eligibility test, subject to the remaining requirements.",
        ],
      },
      {
        title: "Fields and courses funded", icon: "school-outline", items: [
          "Approved undergraduate qualifications across fields of study at public universities and TVET colleges.",
          "Funding depends on the specific qualification and institution being approved. Check your course before applying.",
        ],
      },
      {
        title: "What does it fund?", icon: "wallet-outline", items: [
          "Registration and tuition fees for an approved programme.",
          "Learning materials, plus eligible living, personal care, and accommodation or transport allowances.",
          "Approved disability support may be available after assessment. Allowances depend on your study and living arrangements.",
        ],
      },
      {
        title: "Application requirements", icon: "document-text-outline", items: [
          "Create or sign in to myNSFAS with your South African ID number, cellphone number, and email address.",
          "Complete your personal and household details, consent to income verification, and upload requested supporting documents.",
          "Submit before the closing date and keep your reference number to track your application.",
        ],
      },
      {
        title: "Marks needed to keep funding", icon: "stats-chart-outline", items: [
          "The published 2026 NSFAS bursary policy requires university students who are not first-time entrants to pass at least 50% of registered modules for the next year of funding.",
          "TVET students who are not first-time entrants must pass at least 70% of their registered modules or courses. TVET progression rules also apply.",
          "These are study progress rules, not a minimum school mark or APS for a new application. Confirm the policy for your funding year.",
        ],
      },
    ],
  },
  {
    id: "future-leaders-bursary",
    order: 2,
    featured: false,
    isPlaceholder: true,
    name: "Future Leaders Bursary",
    fullName: "Future Leaders Student Bursary",
    provider: "Example Education Foundation",
    cycle: "Example 2027 intake",
    opens: "1 August 2026",
    closes: "30 November 2026",
    description: "An example bursary showing how future funding opportunities can be presented.",
    notice: "Example bursary \u2014 placeholder content demonstrating the expected layout.",
    footnote: "This bursary is fictional. Replace all example content with verified details and an official application link before publishing it as a real opportunity.",
    sections: [
      {
        title: "Who can apply?", icon: "people-outline", items: [
          "South African students planning to study full-time at a recognised university or TVET college.",
          "Applicants should demonstrate financial need and involvement in their school or community.",
        ],
      },
      {
        title: "Fields of study", icon: "school-outline", items: [
          "Example priority fields include education, engineering, information technology, and health sciences.",
        ],
      },
      {
        title: "What could it cover?", icon: "wallet-outline", items: [
          "Tuition fees, prescribed learning materials, and a possible living allowance.",
          "Final benefits would need to be confirmed with the real bursary provider.",
        ],
      },
      {
        title: "Documents to prepare", icon: "document-text-outline", items: [
          "A certified ID copy, latest academic results, proof of household income, and proof of admission.",
          "A short motivation letter explaining your study plans and career goals.",
        ],
      },
    ],
  },
];

// ---------------------------------------------------------------- subjects
// Moved here from ApsCalculatorScreen.js (SUBJECT_GROUPS). One document per group.
const LANGUAGES = [
  "Afrikaans", "English", "IsiNdebele", "IsiXhosa", "IsiZulu", "Sepedi",
  "Sesotho", "Setswana", "Siswati", "Tshivenda", "XiTsonga",
];
const subjects = [
  {
    id: "core-subjects",
    order: 1,
    title: "Core subjects",
    subjects: ["Life Orientation", "Mathematical Literacy", "Mathematics", "Technical Mathematics"],
  },
  {
    id: "languages",
    order: 2,
    title: "Languages",
    subjects: LANGUAGES.flatMap((language) => [
      `${language} Home Language`,
      `${language} First Additional Language`,
      `${language} Second Additional Language`,
    ]),
  },
  {
    id: "sciences-and-technology",
    order: 3,
    title: "Sciences and technology",
    subjects: [
      "Agricultural Sciences", "Computer Applications Technology", "Information Technology",
      "Life Sciences", "Physical Sciences", "Technical Sciences",
    ],
  },
  {
    id: "business-and-social-sciences",
    order: 4,
    title: "Business and social sciences",
    subjects: ["Accounting", "Business Studies", "Economics", "Geography", "History", "Religion Studies"],
  },
  {
    id: "arts-and-services",
    order: 5,
    title: "Arts and services",
    subjects: [
      "Consumer Studies", "Dance Studies", "Design", "Dramatic Arts",
      "Hospitality Studies", "Music", "Tourism", "Visual Arts",
    ],
  },
  {
    id: "technical-and-agricultural",
    order: 6,
    title: "Technical and agricultural",
    subjects: [
      "Agricultural Management Practices", "Agricultural Technology", "Civil Technology",
      "Electrical Technology", "Engineering Graphics and Design", "Mechanical Technology",
    ],
  },
];

// ---------------------------------------------------------------- colleges
// Two EXAMPLE colleges so the structure works. Replace them with real data from the admin site
// (delete the examples there once you have real ones). Fields match what the university screens already read.
const exampleColleges = [
  {
    id: "example-private-college",
    order: 1,
    isPlaceholder: true,
    name: "Example Private College",
    shortName: "EPC",
    type: "Private Higher Education",
    province: "Gauteng",
    description: "Example private college showing how a college profile is laid out. Replace this with the real description.",
    campuses: ["Example Campus, Johannesburg"],
    virtualCampusUrl: "",
    contactEmail: "admissions@example.org",
    contactPhone: "000 000 0000",
    website: "https://example.org",
    logoUrl: "",
    imageUrl: "",
    applicationFee: 0,
    applicationFeeLabel: "Free to apply",
    applicationStatus: "Open",
    openingDate: "1 August 2026",
    closingDate: "30 November 2026",
    applicationInstructions: "Example instructions. Replace with the real steps to apply.",
    applicationUrl: "https://example.org/apply",
    // EXAMPLE figures only. Replace with the real costs from the college's official fee page.
    costs: {
      year: 2026,
      registrationFee: 5000,
      tuitionPerYear: 25000,
      accommodationPerYear: 30000,
      nsfasFunding: "Not covered (example)",
      sourceUrl: "https://example.org/fees",
    },
  },
  {
    id: "example-tvet-college",
    order: 2,
    isPlaceholder: true,
    name: "Example TVET College",
    shortName: "ETC",
    type: "Public TVET College",
    province: "Gauteng",
    description: "Example public TVET college showing how a college profile is laid out. Replace this with the real description.",
    campuses: ["Example Campus, Pretoria"],
    virtualCampusUrl: "",
    contactEmail: "info@example.org",
    contactPhone: "000 000 0000",
    website: "https://example.org",
    logoUrl: "",
    imageUrl: "",
    applicationFee: 100,
    applicationFeeLabel: "",
    applicationStatus: "Open",
    openingDate: "1 September 2026",
    closingDate: "31 January 2027",
    applicationInstructions: "Example instructions. Replace with the real steps to apply.",
    applicationUrl: "https://example.org/apply",
    // EXAMPLE figures only. Replace with the real costs from the college's official fee page.
    costs: {
      year: 2026,
      registrationFee: 1000,
      tuitionPerYear: 12000,
      accommodationPerYear: 20000,
      nsfasFunding: "NSFAS may fund eligible students (example)",
      sourceUrl: "https://example.org/fees",
    },
  },
];

// Real colleges come from data/colleges.json (the file the app was built with).
// If that file is missing or empty, the two example colleges above are used instead.
let colleges = exampleColleges;
let usingRealColleges = false;
try {
  const file = require("../data/colleges.json");
  const list = Array.isArray(file) ? file : file.colleges || [];
  const slug = (text) => String(text).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  if (list.length) {
    colleges = list.map((college, index) => ({
      ...college,
      id: college.id ? String(college.id) : slug(college.name || `college-${index + 1}`),
      type: college.type ?? "Public TVET College",
      order: college.order ?? index + 1,
    }));
    usingRealColleges = true;
  }
} catch (error) {
  console.warn("data/colleges.json was not found or could not be read. Using the example colleges.");
}

// ---------------------------------------------------------------- applicationDeadlines
// Moved here from data/homeMockData.js (MOCK_APPLICATION_DEADLINES).
// These are EXAMPLE dates, not official guidance. Edit them on the admin site.
const applicationDeadlines = [
  { id: "uj-example-deadline", universityId: "uj", closingDate: "31 October", daysRemaining: 38, isExample: true },
  { id: "wits-example-deadline", universityId: "wits", closingDate: "30 September", daysRemaining: 10, isExample: true },
];

// ---------------------------------------------------------------- runner
async function seedCollection(name, items) {
  // Firestore allows at most 500 writes per batch, so big collections (courses) are written in chunks.
  for (let start = 0; start < items.length; start += 400) {
    const batch = db.batch();
    items.slice(start, start + 400).forEach(({ id, ...data }) => {
      batch.set(db.collection(name).doc(id), data); // same id = overwritten, so re-running is safe
    });
    await batch.commit();
  }
  console.log(`Seeded "${name}": ${items.length} documents`);
}

async function main() {
  await seedCollection("faqs", faqs);
  await seedCollection("notifications", notifications);
  await seedCollection("bursaries", bursaries);
  await seedCollection("subjects", subjects);
  await seedCollection("colleges", colleges);
  if (usingRealColleges) {
    // remove the two example documents created earlier
    await Promise.all(exampleColleges.map(({ id }) => db.collection("colleges").doc(id).delete()));
    console.log("Removed the example colleges.");
  }
  await seedCollection("applicationDeadlines", applicationDeadlines);
  // universities, courses and applicationDeadlines get added here next.
  console.log("Done.");
}

main().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
``