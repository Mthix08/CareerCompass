import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useEffect,
  useState,
} from "react";
import { useColorScheme } from "react-native";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { auth, db, storage } from "../screens/firebaseConfig";

const ProfileContext = createContext(null);
const THEME_STORAGE_KEY = "@careercompass:themePreference";

const lightColors = {
  background: "#F6F8FC",
  surface: "#FFFFFF",
  elevatedSurface: "#F2F6FA",
  text: "#172033",
  secondaryText: "#526078",
  mutedText: "#7C899D",
  border: "#DDE4ED",
  primary: "#117C72",
  primarySoft: "#E8F3F1",
  accent: "#C39A45",
  danger: "#D64545",
  dangerSoft: "#FFF0F0",
  input: "#F4F7FA",
};

const darkColors = {
  background: "#05080D",
  surface: "#0D1117",
  elevatedSurface: "#151A22",
  text: "#FFFFFF",
  secondaryText: "#B3BDCB",
  mutedText: "#909CAC",
  border: "#29313D",
  primary: "#25A99C",
  primarySoft: "#173934",
  accent: "#D1AD61",
  danger: "#FF6B6B",
  dangerSoft: "#32191C",
  input: "#151A22",
};

const initialProfile = {
  email: "",
  firstName: "Guest",
  surname: "User",
  phone: "",
  category: "Guest",
  learnerInfo: "",
  location: "Explore CareerCompass",
  applicationCount: 0,
};

export function ProfileProvider({ children }) {
  const systemColorScheme = useColorScheme();
  const [profile, setProfile] = useState(initialProfile);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [themePreference, setThemePreferenceState] = useState("Light");
  const [successMessage, setSuccessMessage] = useState("");

  // Load saved theme preference once on mount.
  useEffect(() => {
    (async () => {
      try {
        const storedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (storedTheme) setThemePreferenceState(storedTheme);
      } catch (error) {
        // If storage fails, we just keep the default "Light" theme.
      }
    })();
  }, []);

  // Wrap the setter so every change is also saved to AsyncStorage.
  const setThemePreference = useCallback((nextTheme) => {
    setThemePreferenceState(nextTheme);
    AsyncStorage.setItem(THEME_STORAGE_KEY, nextTheme).catch(() => {
      // Non-fatal: theme just won't persist this time.
    });
  }, []);

  useEffect(() => {
    return auth.onAuthStateChanged(async (user) => {
      setFirebaseUser(user);
      if (!user) {
        setIsGuest(false);
        setProfile(initialProfile);
        return;
      }

      setIsGuest(false);
      const userSnapshot = await getDoc(doc(db, "users", user.uid));
      const storedProfile = userSnapshot.exists() ? userSnapshot.data() : {};
      const nameParts = (storedProfile.name || user.displayName || "Student")
        .trim()
        .split(/\s+/);

      setProfile({
        ...initialProfile,
        ...storedProfile,
        email: user.email || storedProfile.email || "",
        firstName: nameParts[0] || "Student",
        surname: nameParts.slice(1).join(" "),
        category: "Student",
        photoURL: storedProfile.photoURL || user.photoURL || "",
        authProvider:
          (
            user.providerData?.some(
              ({ providerId }) => providerId === "google.com",
            )
          ) ?
            "Google"
            : "Email",
      });
    });
  }, []);

  const enterGuestMode = useCallback(() => {
    setIsGuest(true);
    setFirebaseUser(null);
    setProfile(initialProfile);
  }, []);
  const clearSession = useCallback(() => {
    setIsGuest(false);
    setFirebaseUser(null);
    setProfile(initialProfile);
    setSuccessMessage("");
  }, []);

  const resolvedTheme =
    themePreference === "System" ?
      systemColorScheme === "dark" ?
        "dark"
        : "light"
      : themePreference.toLowerCase();
  const colors = resolvedTheme === "dark" ? darkColors : lightColors;

  const updateProfile = useCallback(
    async (nextProfile) => {
      let photoURL = nextProfile.photoURL || "";
      if (nextProfile.photoAsset && firebaseUser) {
        const response = await fetch(nextProfile.photoAsset.uri);
        const photoBlob = await response.blob();
        const photoRef = ref(storage, `profilePhotos/${firebaseUser.uid}`);
        await uploadBytes(photoRef, photoBlob, {
          contentType: nextProfile.photoAsset.mimeType || "image/jpeg",
        });
        photoURL = await getDownloadURL(photoRef);
      }

      if (firebaseUser) {
        await setDoc(
          doc(db, "users", firebaseUser.uid),
          {
            name: `${nextProfile.firstName} ${nextProfile.surname}`.trim(),
            email: nextProfile.email,
            phone: nextProfile.phone,
            category: nextProfile.category,
            photoURL,
          },
          { merge: true },
        );
      }
      const updatedProfile = { ...nextProfile, photoURL };
      delete updatedProfile.photoAsset;
      setProfile(updatedProfile);
      setSuccessMessage("Profile updated successfully.");
    },
    [firebaseUser],
  );
  const setApplicationCount = useCallback(
    async (applicationCount) => {
      if (profile.applicationCount === applicationCount) return;

      setProfile((current) => ({ ...current, applicationCount }));
      if (firebaseUser) {
        await setDoc(
          doc(db, "users", firebaseUser.uid),
          { applicationCount },
          { merge: true },
        );
      }
    },
    [firebaseUser, profile.applicationCount],
  );
  const saveApsRecord = useCallback(
    async (period, record) => {
      if (!firebaseUser) {
        throw new Error("Sign in to save your APS marks to your account.");
      }

      await setDoc(
        doc(db, "users", firebaseUser.uid),
        {
          apsRecords: {
            [period]: { ...record, updatedAt: serverTimestamp() },
          },
        },
        { merge: true },
      );

      setProfile((current) => ({
        ...current,
        apsRecords: {
          ...current.apsRecords,
          [period]: record,
        },
      }));
    },
    [firebaseUser],
  );
  const clearSuccessMessage = useCallback(() => setSuccessMessage(""), []);

  const value = useMemo(
    () => ({
      profile,
      firebaseUser,
      isGuest: isGuest && !firebaseUser,
      isAuthenticated: Boolean(firebaseUser),
      enterGuestMode,
      clearSession,
      updateProfile,
      setApplicationCount,
      saveApsRecord,
      themePreference,
      setThemePreference,
      resolvedTheme,
      colors,
      successMessage,
      clearSuccessMessage,
    }),
    [
      profile,
      firebaseUser,
      isGuest,
      enterGuestMode,
      clearSession,
      updateProfile,
      setApplicationCount,
      saveApsRecord,
      themePreference,
      setThemePreference,
      resolvedTheme,
      colors,
      successMessage,
      clearSuccessMessage,
    ],
  );

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used inside ProfileProvider.");
  }
  return context;
}