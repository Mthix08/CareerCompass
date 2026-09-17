import { Platform } from "react-native";
import {
  GoogleAuthProvider,
  signInWithCredential,
  signInWithPopup,
} from "firebase/auth";

import { auth } from "./firebaseConfig";

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

  const { GoogleSignin } = require("@react-native-google-signin/google-signin");
  GoogleSignin.configure({
    webClientId,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  });

  if (Platform.OS === "android") {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  }

  const response = await GoogleSignin.signIn();
  if (response.type !== "success" || !response.data.idToken) {
    const error = new Error("Google sign-in was cancelled.");
    error.code = "auth/popup-closed-by-user";
    throw error;
  }

  const credential = GoogleAuthProvider.credential(response.data.idToken);
  return signInWithCredential(auth, credential);
}