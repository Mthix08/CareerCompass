import {
  addDoc,
  collection,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { auth, db } from "../screens/firebaseConfig";
import { sanitizeCareerAssessmentAnswers } from "../data/careerAssessmentQuestions";
import {
  getCourseSuggestionCategory,
} from "../data/courseSuggestions";

const userNotificationsRef = (uid) => collection(db, "users", uid, "notifications");
const userReadStatesRef = (uid) => collection(db, "users", uid, "notificationReads");
const sharedReadStateId = (notificationId) => `shared_${notificationId}`;

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
    isRead: false,
    readAt: null,
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
    .map((document) => ({ id: document.id, ...document.data(), source: "personal", isRead: document.data().isRead === true }))
    .sort((first, second) => timestampValue(second.createdAt) - timestampValue(first.createdAt));
}

export async function loadNotificationReadStates(uid) {
  if (!uid) return new Set();
  requireNotificationOwner(uid);
  const snapshot = await getDocs(userReadStatesRef(uid));
  return new Set(snapshot.docs.map((document) => document.id));
}

export async function getUnreadNotificationCount(uid) {
  if (!uid) return 0;
  requireNotificationOwner(uid);
  const [sharedSnapshot, personalSnapshot, readStates] = await Promise.all([
    getDocs(collection(db, "notifications")),
    getDocs(userNotificationsRef(uid)),
    loadNotificationReadStates(uid),
  ]);
  const unreadShared = sharedSnapshot.docs.filter((notification) =>
    !readStates.has(sharedReadStateId(notification.id)),
  ).length;
  const unreadPersonal = personalSnapshot.docs.filter((notification) =>
    notification.data().isRead !== true,
  ).length;
  return unreadShared + unreadPersonal;
}

export async function markNotificationRead(uid, notification) {
  requireNotificationOwner(uid);
  if (notification.source === "personal") {
    await updateDoc(doc(userNotificationsRef(uid), notification.id), {
      isRead: true,
      readAt: serverTimestamp(),
    });
    return;
  }

  await setDoc(doc(userReadStatesRef(uid), sharedReadStateId(notification.id)), {
    source: "shared",
    notificationId: notification.id,
    isRead: true,
    readAt: serverTimestamp(),
  });
}

export async function markNotificationsRead(uid, notifications) {
  requireNotificationOwner(uid);
  const unreadItems = notifications.filter((notification) => !notification.isRead);
  for (let offset = 0; offset < unreadItems.length; offset += 450) {
    const batch = writeBatch(db);
    unreadItems.slice(offset, offset + 450).forEach((notification) => {
      if (notification.source === "personal") {
        batch.update(doc(userNotificationsRef(uid), notification.id), {
          isRead: true,
          readAt: serverTimestamp(),
        });
      } else {
        batch.set(doc(userReadStatesRef(uid), sharedReadStateId(notification.id)), {
          source: "shared",
          notificationId: notification.id,
          isRead: true,
          readAt: serverTimestamp(),
        });
      }
    });
    await batch.commit();
  }
}
