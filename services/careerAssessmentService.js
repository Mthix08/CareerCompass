import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, getDoc, runTransaction, serverTimestamp, Timestamp, writeBatch } from "firebase/firestore";
import { auth, db } from "../screens/firebaseConfig";
import { ASSESSMENT_VERSION } from "../data/careerAssessmentQuestions";

const localKey = (uid) => `@careercompass:careerAssessment:${uid}`;
const assessmentRef = (uid) => doc(db, "careerAssessments", uid);
const userRef = (uid) => doc(db, "users", uid);
const STATUSES = new Set(["not_started", "in_progress", "skipped", "completed"]);
const emptyAssessment = { status: "not_started", answers: {}, draftAnswers: {}, assessmentVersion: ASSESSMENT_VERSION, startedAt: null, updatedAt: null, completedAt: null, isRetake: false };

function requireCurrentUser(uid) {
  const activeUid = auth.currentUser?.uid;
  if (!activeUid) throw new Error("Sign in before opening or saving your career assessment.");
  if (uid && uid !== activeUid) throw new Error("Your signed-in account changed. Reopen the assessment and try again.");
  return activeUid;
}

function isValidRecord(value) {
  return Boolean(value && typeof value === "object" && STATUSES.has(value.status)
    && (!value.answers || typeof value.answers === "object")
    && (!value.draftAnswers || typeof value.draftAnswers === "object"));
}

function timestampToIso(value) {
  if (!value) return null;
  if (typeof value?.toDate === "function") return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  if (typeof value.seconds === "number") return new Date(value.seconds * 1000).toISOString();
  return null;
}

function timestampFromLocal(value) {
  if (!value) return null;
  if (typeof value?.toDate === "function") return value;
  if (typeof value.seconds === "number") return new Timestamp(value.seconds, value.nanoseconds || 0);
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : Timestamp.fromDate(date);
}

function fromFirestore(data, fallbackStatus) {
  return {
    ...emptyAssessment,
    ...data,
    status: STATUSES.has(data?.status) ? data.status : (STATUSES.has(fallbackStatus) ? fallbackStatus : "not_started"),
    answers: data?.answers && typeof data.answers === "object" ? data.answers : {},
    draftAnswers: data?.draftAnswers && typeof data.draftAnswers === "object" ? data.draftAnswers : {},
    startedAt: timestampToIso(data?.startedAt),
    updatedAt: timestampToIso(data?.updatedAt),
    completedAt: timestampToIso(data?.completedAt),
    isRetake: Boolean(data?.isRetake),
  };
}

function toFirestore(record, status, { completing = false } = {}) {
  return {
    status,
    answers: record.answers || {},
    draftAnswers: record.draftAnswers || {},
    assessmentVersion: record.assessmentVersion || ASSESSMENT_VERSION,
    startedAt: timestampFromLocal(record.startedAt) || serverTimestamp(),
    updatedAt: timestampFromLocal(record.updatedAt) || serverTimestamp(),
    completedAt: completing ? serverTimestamp() : timestampFromLocal(record.completedAt),
    isRetake: Boolean(record.isRetake),
  };
}

async function readLocal(uid) {
  try {
    const raw = await AsyncStorage.getItem(localKey(uid));
    if (!raw) return null;
    const value = JSON.parse(raw);
    return isValidRecord(value) ? { ...emptyAssessment, ...value } : null;
  } catch (_error) {
    return null;
  }
}

async function writeLocal(uid, record) {
  const cacheRecord = {
    ...emptyAssessment,
    ...record,
    startedAt: timestampToIso(record.startedAt),
    updatedAt: timestampToIso(record.updatedAt),
    completedAt: timestampToIso(record.completedAt),
  };
  await AsyncStorage.setItem(localKey(uid), JSON.stringify(cacheRecord));
}

async function saveCloud(uid, assessmentPatch, status, { completing = false, fallbackLocal } = {}) {
  requireCurrentUser(uid);
  const batch = writeBatch(db);
  batch.set(assessmentRef(uid), {
    ...assessmentPatch,
    status,
    updatedAt: serverTimestamp(),
    ...(completing ? { completedAt: serverTimestamp() } : {}),
  }, { merge: true });
  batch.set(userRef(uid), { careerAssessmentStatus: status }, { merge: true });

  try {
    await batch.commit();
  } catch (error) {
    if (fallbackLocal) {
      try { await writeLocal(uid, { ...fallbackLocal, status, syncState: "pending" }); } catch (_cacheError) { /* Keep the original Firestore error. */ }
    }
    throw error;
  }
}

async function migrateLocalIfNeeded(uid, local) {
  requireCurrentUser(uid);
  const assessmentDocument = assessmentRef(uid);
  const profileDocument = userRef(uid);
  const migration = await runTransaction(db, async (transaction) => {
    const cloudSnapshot = await transaction.get(assessmentDocument);
    const userSnapshot = await transaction.get(profileDocument);
    if (cloudSnapshot.exists()) {
      return { record: fromFirestore(cloudSnapshot.data(), userSnapshot.data()?.careerAssessmentStatus), migrated: false };
    }

    const profileStatus = userSnapshot.data()?.careerAssessmentStatus;
    // A locally completed assessment must not be downgraded by an older profile
    // status field that predates the assessment document.
    const status = profileStatus === "completed" || local.status === "completed"
      ? "completed"
      : local.status || (STATUSES.has(profileStatus) ? profileStatus : "not_started");
    const preserved = { ...emptyAssessment, ...local, status };
    const cloudRecord = toFirestore(preserved, status);
    requireCurrentUser(uid);
    transaction.set(assessmentDocument, cloudRecord, { merge: true });
    transaction.set(profileDocument, { careerAssessmentStatus: status }, { merge: true });
    return { record: preserved, migrated: true };
  });

  if (migration.migrated) {
    try { await writeLocal(uid, { ...migration.record, syncState: "synced" }); } catch (_cacheError) { /* The migration committed to Firestore. */ }
    return migration.record;
  }
  try { await writeLocal(uid, { ...migration.record, syncState: "synced" }); } catch (_cacheError) { /* Firestore remains authoritative. */ }
  return migration.record;
}

export async function getCareerAssessment(uid) {
  const activeUid = requireCurrentUser(uid);
  const local = await readLocal(activeUid);

  try {
    const [assessmentSnapshot, userSnapshot] = await Promise.all([
      getDoc(assessmentRef(activeUid)),
      getDoc(userRef(activeUid)),
    ]);
    const userStatus = userSnapshot.data()?.careerAssessmentStatus;

    if (assessmentSnapshot.exists()) {
      const cloudRecord = fromFirestore(assessmentSnapshot.data(), userStatus);
      try { await writeLocal(activeUid, { ...cloudRecord, syncState: "synced" }); } catch (_cacheError) { /* Cloud data remains authoritative. */ }
      return cloudRecord;
    }

    if (local) return await migrateLocalIfNeeded(activeUid, local);
    return { ...emptyAssessment, status: STATUSES.has(userStatus) ? userStatus : "not_started", syncState: "synced" };
  } catch (error) {
    if (local) return { ...local, syncState: "local_only", syncWarning: error.message || "Cloud assessment data is temporarily unavailable." };
    throw error;
  }
}

export async function getCareerAssessmentStatus(uid) {
  const assessment = await getCareerAssessment(uid);
  return assessment.status || "not_started";
}

export async function beginCareerAssessment(uid) {
  const activeUid = requireCurrentUser(uid);
  const current = await getCareerAssessment(activeUid);
  const hasDraft = current.draftAnswers && Object.keys(current.draftAnswers).length > 0;
  const answers = hasDraft ? current.draftAnswers : (current.status === "completed" ? current.answers || {} : current.draftAnswers || {});
  const next = {
    ...current,
    draftAnswers: answers,
    assessmentVersion: current.assessmentVersion || ASSESSMENT_VERSION,
    startedAt: current.startedAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isRetake: current.status === "completed" || Boolean(current.isRetake),
  };
  await saveCloud(activeUid, {
    draftAnswers: next.draftAnswers,
    assessmentVersion: next.assessmentVersion,
    startedAt: timestampFromLocal(next.startedAt) || serverTimestamp(),
    isRetake: next.isRetake,
  }, "in_progress", { fallbackLocal: { ...next, status: "in_progress" } });
  try { await writeLocal(activeUid, { ...next, status: "in_progress", syncState: "synced" }); } catch (_cacheError) { /* The Firestore write succeeded. */ }
  return answers;
}

export async function saveCareerAssessmentDraft(uid, answers) {
  const activeUid = requireCurrentUser(uid);
  const current = await readLocal(activeUid) || emptyAssessment;
  const next = {
    ...current,
    draftAnswers: answers,
    assessmentVersion: current.assessmentVersion || ASSESSMENT_VERSION,
    updatedAt: new Date().toISOString(),
    status: "in_progress",
  };
  try { await writeLocal(activeUid, { ...next, syncState: "pending" }); } catch (_cacheError) { /* Cloud persistence is still attempted. */ }
  await saveCloud(activeUid, {
    draftAnswers: answers,
    assessmentVersion: next.assessmentVersion,
  }, "in_progress", { fallbackLocal: next });
  try { await writeLocal(activeUid, { ...next, syncState: "synced" }); } catch (_cacheError) { /* Firestore is the source of truth. */ }
}

export async function skipCareerAssessment(uid, draftAnswers) {
  const activeUid = requireCurrentUser(uid);
  const current = await getCareerAssessment(activeUid);
  const hasCompletedAnswers = current.completedAt && current.answers && Object.keys(current.answers).length > 0;
  const status = hasCompletedAnswers ? "completed" : "skipped";
  const next = {
    ...current,
    ...(draftAnswers ? { draftAnswers } : {}),
    status,
    updatedAt: new Date().toISOString(),
  };
  await saveCloud(activeUid, {
    ...(draftAnswers ? { draftAnswers } : {}),
  }, status, { fallbackLocal: next });
  try { await writeLocal(activeUid, { ...next, syncState: "synced" }); } catch (_cacheError) { /* Firestore is the source of truth. */ }
}

export async function completeCareerAssessment(uid, answers) {
  const activeUid = requireCurrentUser(uid);
  const current = await readLocal(activeUid) || emptyAssessment;
  const pending = {
    ...current,
    draftAnswers: answers,
    assessmentVersion: current.assessmentVersion || ASSESSMENT_VERSION,
    updatedAt: new Date().toISOString(),
    status: "in_progress",
  };
  try { await writeLocal(activeUid, { ...pending, syncState: "pending" }); } catch (_cacheError) { /* Continue with cloud commit. */ }

  await saveCloud(activeUid, {
    answers,
    draftAnswers: {},
    assessmentVersion: pending.assessmentVersion,
    isRetake: Boolean(current.isRetake),
  }, "completed", { completing: true, fallbackLocal: pending });

  const completed = {
    ...current,
    answers,
    draftAnswers: {},
    assessmentVersion: pending.assessmentVersion,
    updatedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    status: "completed",
  };
  try { await writeLocal(activeUid, { ...completed, syncState: "synced" }); } catch (_cacheError) { /* Firestore is the source of truth. */ }
}
