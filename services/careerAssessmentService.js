import AsyncStorage from "@react-native-async-storage/async-storage";
import { ASSESSMENT_VERSION } from "../data/careerAssessmentQuestions";
const localKey = (uid) => `@careercompass:careerAssessment:${uid}`;
const emptyAssessment = { status: "not_started", answers: {}, draftAnswers: {} };

async function readLocal(uid) {
  try {
    const value = await AsyncStorage.getItem(localKey(uid));
    return value ? { ...emptyAssessment, ...JSON.parse(value) } : null;
  } catch (_error) { return null; }
}

async function writeLocal(uid, value) {
  await AsyncStorage.setItem(localKey(uid), JSON.stringify(value));
}


export async function getCareerAssessmentStatus(uid) {
  const local = await readLocal(uid);
  if (local?.status) return local.status;
  return "not_started";
}

export async function getCareerAssessment(uid) {
  const local = await readLocal(uid);
  return local || emptyAssessment;
}

export async function beginCareerAssessment(uid) {
  const current = await getCareerAssessment(uid);
  const hasDraft = current.draftAnswers && Object.keys(current.draftAnswers).length > 0;
  const answers = hasDraft ? current.draftAnswers : (current.status === "completed" ? current.answers || {} : current.draftAnswers || {});
  const next = {
    ...current,
    draftAnswers: answers,
    assessmentVersion: ASSESSMENT_VERSION,
    startedAt: current.startedAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isRetake: current.status === "completed" || Boolean(current.isRetake),
    status: "in_progress",
  };
  await writeLocal(uid, next);
  return answers;
}

export async function saveCareerAssessmentDraft(uid, answers) {
  const current = await getCareerAssessment(uid);
  const next = { ...current, draftAnswers: answers, assessmentVersion: ASSESSMENT_VERSION, updatedAt: new Date().toISOString(), status: "in_progress" };
  await writeLocal(uid, next);
}

export async function skipCareerAssessment(uid, draftAnswers) {
  const current = await getCareerAssessment(uid);
  const next = { ...current, ...(draftAnswers ? { draftAnswers } : {}), updatedAt: new Date().toISOString(), status: "skipped" };
  await writeLocal(uid, next);
}

export async function completeCareerAssessment(uid, answers) {
  const current = await getCareerAssessment(uid);
  const next = {
    ...current,
    answers,
    draftAnswers: {},
    assessmentVersion: ASSESSMENT_VERSION,
    updatedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    status: "completed",
  };
  await writeLocal(uid, next);
}
