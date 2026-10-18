require("dotenv").config();
const path = require("path");
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const colleges = require("../data/colleges.json");

const keyPath = path.resolve(
  process.cwd(),
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH || "./serviceAccountKey.json",
);

initializeApp({ credential: cert(require(keyPath)) });
const db = getFirestore();

const slug = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

(async () => {
  for (const c of colleges) {
    const data = {
      type: "Public TVET College",
      description: "",
      campuses: [],
      email: "",
      applyUrl: "",
      ...c,
    };
    await db.collection("colleges").doc(slug(c.name)).set(data, { merge: true });
    console.log("Saved", slug(c.name));
  }
  console.log("Done:", colleges.length, "colleges");
  process.exit(0);
})();