import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useColorScheme } from "react-native";

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
  email: "mehndonyela@gmail.com",
  firstName: "Meh",
  surname: "Ndonyela",
  phone: "+27 82 123 4567",
  category: "Matric Learner",
  learnerInfo: "Class of 2024",
  location: "Soweto, Gauteng • South Africa",
};

export function ProfileProvider({ children }) {
  const systemColorScheme = useColorScheme();
  const [profile, setProfile] = useState(initialProfile);
  const [themePreference, setThemePreference] = useState("Light");
  const [successMessage, setSuccessMessage] = useState("");

  const resolvedTheme =
    themePreference === "System"
      ? systemColorScheme === "dark"
        ? "dark"
        : "light"
      : themePreference.toLowerCase();
  const colors = resolvedTheme === "dark" ? darkColors : lightColors;

  const updateProfile = useCallback((nextProfile) => {
    setProfile(nextProfile);
    setSuccessMessage("Profile updated successfully.");
  }, []);
  const clearSuccessMessage = useCallback(() => setSuccessMessage(""), []);

  const value = useMemo(
    () => ({
      profile,
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
