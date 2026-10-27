import { addDoc, collection, getDocs, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../screens/firebaseConfig";
import { sanitizeCareerAssessmentAnswers } from "../data/careerAssessmentQuestions";
import {
  getCourseSuggestionCategory,
} from "../data/courseSuggestions";

const userNotificationsRef = (uid) => collection(db, "users", uid, "notifications");

function requireNotificationOwner(uid) {
  if (!uid || auth.currentUser?.uid !== uid) {
    throw new Error("Sign in to access your course suggestion notifications.");
  }
}

export async function createCourseSuggestionNotification(uid, completedAnswers) {
  requireNotificationOwner(uid);
  const assessmentAnswers = sanitizeCareerAssessmentAnswers(completedAnswers || {});
  const suggestionCategory = getCourseSuggestionCategory(assessmentAnswers.mathematics);

  const notification = {
    category: "Announcements",
    eyebrow: "COURSE SUGGESTIONS",
    title: "Your course suggestions are ready",
    description: "Explore qualifications selected using your completed Career Assessment answers.",
    icon: "school",
    routeName: "CourseSuggestions",
    suggestionCategory,
    assessmentAnswers,
    createdAt: serverTimestamp(),
  };

  const reference = await addDoc(userNotificationsRef(uid), notification);
  return { id: reference.id, ...notification };
}

function timestampValue(value) {
  if (typeof value?.toMillis === "function") return value.toMillis();
  if (typeof value?.seconds === "number") return value.seconds * 1000;
  return 0;
}

export async function loadCourseSuggestionNotifications(uid) {
  if (!uid) return [];
  requireNotificationOwner(uid);
  const snapshot = await getDocs(userNotificationsRef(uid));
  return snapshot.docs
    .map((document) => ({ id: document.id, ...document.data() }))
    .sort((first, second) => timestampValue(second.createdAt) - timestampValue(first.createdAt));
}
