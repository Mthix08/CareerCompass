// Gives an existing user admin access:  node scripts/makeAdmin.cjs someone@email.com
// The person must already have an account (sign up in the app first).
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { initializeApp, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");

const keyName = (process.env.FIREBASE_SERVICE_ACCOUNT_PATH || "./serviceAccountKey.json").trim().replace(/^["']|["']$/g, "");
const keyPath = path.resolve(__dirname, "..", keyName);
if (!fs.existsSync(keyPath)) { console.error(`Key file not found. Looked for: ${keyPath}`); process.exit(1); }
const email = process.argv[2];
if (!email) { console.error("Usage: node scripts/makeAdmin.cjs someone@email.com"); process.exit(1); }

initializeApp({ credential: cert(JSON.parse(fs.readFileSync(keyPath, "utf8"))) });
getAuth().getUserByEmail(email)
  .then((user) => getFirestore().doc(`admins/${user.uid}`).set({ email, createdAt: Timestamp.now() }).then(() => console.log(`${email} is now an admin.`)))
  .catch((error) => { console.error("Failed:", error.message); process.exit(1); });
