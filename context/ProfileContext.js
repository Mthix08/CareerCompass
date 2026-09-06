import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useEffect,
  useState,
} from "react";
import { useColorScheme } from "react-native";
import { doc, getDoc, setDoc } from "firebase/firestore";

import { auth } from "../screens/firebaseConfig";
import { db } from "../screens/firebaseConfig";

const ProfileContext = createContext(null);

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
};

export function ProfileProvider({ children }) {
  const systemColorScheme = useColorScheme();
  const [profile, setProfile] = useState(initialProfile);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [themePreference, setThemePreference] = useState("Light");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    return auth.onAuthStateChanged(async (user) => {
      setFirebaseUser(user);
      if (!user) {
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
        photoURL: user.photoURL || storedProfile.photoURL || "",
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

  const resolvedTheme =
    themePreference === "System" ?
      systemColorScheme === "dark" ?
        "dark"
      : "light"
    : themePreference.toLowerCase();
  const colors = resolvedTheme === "dark" ? darkColors : lightColors;

  const updateProfile = useCallback(
    async (nextProfile) => {
      setProfile(nextProfile);
      if (firebaseUser) {
        await setDoc(
          doc(db, "users", firebaseUser.uid),
          {
            name: `${nextProfile.firstName} ${nextProfile.surname}`.trim(),
            email: nextProfile.email,
            phone: nextProfile.phone,
            category: nextProfile.category,
          },
          { merge: true },
        );
      }
      setSuccessMessage("Profile updated successfully.");
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
      updateProfile,
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
      updateProfile,
      themePreference,
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
