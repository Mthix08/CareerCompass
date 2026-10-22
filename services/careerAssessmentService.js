import { doc, getDoc, serverTimestamp, setDoc, writeBatch } from "firebase/firestore";
import { db } from "../screens/firebaseConfig";
import { ASSESSMENT_VERSION } from "../data/careerAssessmentQuestions";

const assessmentRef = (uid) => doc(db, "careerAssessments", uid);
const userRef = (uid) => doc(db, "users", uid);

export async function getCareerAssessment(uid) {
  const [assessment, user] = await Promise.all([getDoc(assessmentRef(uid)), getDoc(userRef(uid))]);
  return { ...(assessment.exists() ? assessment.data() : {}), status: user.data()?.careerAssessmentStatus || "not_started" };
}

export async function beginCareerAssessment(uid) {
  const current = await getCareerAssessment(uid);
  const hasDraft = current.draftAnswers && Object.keys(current.draftAnswers).length > 0;
  const answers = hasDraft ? current.draftAnswers : (current.status === "completed" ? current.answers || {} : current.draftAnswers || {});
  const batch = writeBatch(db);
  batch.set(assessmentRef(uid), {
    draftAnswers: answers,
    assessmentVersion: ASSESSMENT_VERSION,
    startedAt: current.startedAt || serverTimestamp(),
    updatedAt: serverTimestamp(),
    isRetake: current.status === "completed" || Boolean(current.isRetake),
  }, { merge: true });
  batch.set(userRef(uid), { careerAssessmentStatus: "in_progress" }, { merge: true });
  await batch.commit();
  return answers;
}

export async function saveCareerAssessmentDraft(uid, answers) {
  const batch = writeBatch(db);
  batch.set(assessmentRef(uid), { draftAnswers: answers, assessmentVersion: ASSESSMENT_VERSION, updatedAt: serverTimestamp() }, { merge: true });
  batch.set(userRef(uid), { careerAssessmentStatus: "in_progress" }, { merge: true });
  await batch.commit();
}

export async function skipCareerAssessment(uid) {
  const batch = writeBatch(db);
  batch.set(assessmentRef(uid), { updatedAt: serverTimestamp() }, { merge: true });
  batch.set(userRef(uid), { careerAssessmentStatus: "skipped" }, { merge: true });
  await batch.commit();
}

export async function completeCareerAssessment(uid, answers) {
  const batch = writeBatch(db);
  batch.set(assessmentRef(uid), {
    answers,
    draftAnswers: {},
    assessmentVersion: ASSESSMENT_VERSION,
    updatedAt: serverTimestamp(),
    completedAt: serverTimestamp(),
  }, { merge: true });
  batch.set(userRef(uid), { careerAssessmentStatus: "completed" }, { merge: true });
  await batch.commit();
}
