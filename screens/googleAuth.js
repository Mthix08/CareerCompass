import { Platform } from "react-native";
import {
  GoogleAuthProvider,
  signInWithCredential,
  signInWithPopup,
} from "firebase/auth";

import { auth } from "./firebaseConfig";

function getNativeGoogleSignin() {
  if (Platform.OS === "web") return null;
  return require("@react-native-google-signin/google-signin").GoogleSignin;
}

export async function signOutFromGoogle() {
  const GoogleSignin = getNativeGoogleSignin();
  if (GoogleSignin) await GoogleSignin.signOut();
}

export function getGoogleAuthErrorMessage(error) {
  if (error?.code === "auth/google-client-id-missing") {
    return "Add the Google web OAuth client ID before using Google sign-in on mobile.";
  }

  const code = String(error?.code || "").toUpperCase();
  const message = String(error?.message || "").toUpperCase();
  if (code === "10" || code === "DEVELOPER_ERROR" || message.includes("DEVELOPER_ERROR")) {
    return "Google rejected this Android build's OAuth configuration (error 10). Add this EAS Android signing key's SHA-1 fingerprint to the Android app in Firebase, download the updated google-services.json, then build a new APK.";
  }

  return "We could not sign in with Google. Please try again.";
}

export async function signInWithGoogle() {
  if (Platform.OS === "web") {
    return signInWithPopup(auth, new GoogleAuthProvider());
  }

  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

  if (!webClientId) {
    const error = new Error("Google OAuth client ID is missing.");
    error.code = "auth/google-client-id-missing";
    throw error;
  }

  const GoogleSignin = getNativeGoogleSignin();

  GoogleSignin.configure({
    webClientId,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  });

  // Firebase sign-out does not clear the native Google session. Clear it before
  // every explicit login so the user must choose an account again.
  await GoogleSignin.signOut();

  if (Platform.OS === "android") {
    await GoogleSignin.hasPlayServices({
      showPlayServicesUpdateDialog: true,
    });
  }

  const response = await GoogleSignin.signIn();

  if (response.type !== "success" || !response.data.idToken) {
    const error = new Error("Google sign-in was cancelled.");
    error.code = "auth/popup-closed-by-user";
    throw error;
  }

  const credential = GoogleAuthProvider.credential(
    response.data.idToken
  );

  return signInWithCredential(auth, credential);
}
