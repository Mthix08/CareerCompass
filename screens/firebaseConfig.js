import { initializeApp } from "firebase/app";
import { initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { Platform } from "react-native";

let persistence;
if (Platform.OS !== "web") {
  const AsyncStorage = require("@react-native-async-storage/async-storage").default;
  const { getReactNativePersistence } = require("firebase/auth");
  persistence = getReactNativePersistence(AsyncStorage);
}

const firebaseConfig = {
  apiKey: "AIzaSyDoYIxmEG7Pwr_JaSSr8-Kg7I409SLzBLo",
  authDomain: "careercompass-a75b2.firebaseapp.com",
  projectId: "careercompass-a75b2",
  storageBucket: "careercompass-a75b2.firebasestorage.app",
  messagingSenderId: "57484306899",
  appId: "1:57484306899:web:04fb24e5629b9424f4a726",
};

const app = initializeApp(firebaseConfig);

const authConfig = persistence ? { persistence } : {};
export const auth = initializeAuth(app, authConfig);
export const db = getFirestore(app);
