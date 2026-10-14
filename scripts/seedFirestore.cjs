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
const path = require("path");
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");

const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
if (!keyPath) {
  console.error("Add FIREBASE_SERVICE_ACCOUNT_PATH to your .env file first.");
  process.exit(1);
}

initializeApp({
  credential: cert(require(path.resolve(keyPath))),
});
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

// ---------------------------------------------------------------- runner
async function seedCollection(name, items) {
  const batch = db.batch();
  items.forEach(({ id, ...data }) => {
    batch.set(db.collection(name).doc(id), data); // same id = overwritten, so re-running is safe
  });
  await batch.commit();
  console.log(`Seeded "${name}": ${items.length} documents`);
}

async function main() {
  await seedCollection("faqs", faqs);
  await seedCollection("notifications", notifications);
  // universities, courses, bursaries, applicationDeadlines and subjects get added here next.
  console.log("Done.");
}

main().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
