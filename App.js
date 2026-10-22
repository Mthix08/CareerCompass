import React, { useState } from "react";
import { Platform, StatusBar, View } from "react-native";
import {
  NavigationContainer,
  createNavigationContainerRef,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "./screens/LoginScreen";
import SignUpScreen from "./screens/SignUpScreen";
import PassRecoveryScreen from "./screens/PassRecoveryScreen";
import SplashScreen from "./screens/SplashScreen";
import UniversityDetailsScreen from "./screens/UniversityDetailsScreen";
import EditProfileScreen from "./screens/EditProfileScreen";
import ApsCalculatorScreen from "./screens/ApsCalculatorScreen";
import UniversityApsScoresScreen from "./screens/UniversityApsScoresScreen";
import FundingScreen from "./screens/FundingScreen";
import FundingDetailsScreen from "./screens/FundingDetailsScreen";
import Applications from "./screens/Applications";
import Bookmarks from "./screens/Bookmarks";
import Notifications from "./screens/Notifications";
import NotificationPreferences from "./screens/NotificationPreferences";
import LanguageScreen from "./screens/LanguageScreen";
import FaqsScreen from "./screens/FaqsScreen";
import CourseDetailsScreen from "./screens/CourseDetailsScreen";
import ProspectusScreen from "./screens/ProspectusScreen";
import BottomTabNavigator from "./navigation/BottomTabNavigator";
import LanguageButton from "./components/LanguageButton";
import { ProfileProvider } from "./context/ProfileContext";
import { BookmarksProvider } from "./context/BookmarksContext";
import { LanguageProvider } from "./context/LanguageContext";

const Stack = createNativeStackNavigator();
const navigationRef = createNavigationContainerRef();

// Screens where the language button should not appear
const HIDE_BUTTON_ON = ["Splash", "Language"];

const BUTTON_TOP =
  Platform.OS === "android" ? (StatusBar.currentHeight || 24) + 8 : 54;

function AppNavigator() {
  const [currentRoute, setCurrentRoute] = useState("Splash");

  const showButton = !HIDE_BUTTON_ON.includes(currentRoute);

  return (
    <View style={{ flex: 1 }}>
      <NavigationContainer
        ref={navigationRef}
        onReady={() =>
          setCurrentRoute(navigationRef.getCurrentRoute()?.name ?? "Splash")
        }
        onStateChange={() =>
          setCurrentRoute(navigationRef.getCurrentRoute()?.name ?? "Splash")
        }
      >
        <Stack.Navigator initialRouteName="Splash">
          <Stack.Screen
            name="Splash"
            component={SplashScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen
            name="PassRecovery"
            component={PassRecoveryScreen}
            options={{ headerShown: false, animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="Home"
            component={BottomTabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="UniversityDetails"
            component={UniversityDetailsScreen}
            options={{ headerShown: false, animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="CourseDetails"
            component={CourseDetailsScreen}
            options={{ headerShown: false, animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="Prospectus"
            component={ProspectusScreen}
            options={{ headerShown: false, animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="EditProfile"
            component={EditProfileScreen}
            options={{ headerShown: false, animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="ApsCalculator"
            component={ApsCalculatorScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="UniversityApsScores"
            component={UniversityApsScoresScreen}
            options={{ headerShown: false, animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="Funding"
            component={FundingScreen}
            options={{ headerShown: false, animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="FundingDetails"
            component={FundingDetailsScreen}
            options={{ headerShown: false, animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="Applications"
            component={Applications}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Bookmarks"
            component={Bookmarks}
            options={{ title: "Saved Universities & Courses" }}
          />
          <Stack.Screen
            name="NotificationPreferences"
            component={NotificationPreferences}
            options={{ headerShown: false, animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="Notifications"
            component={Notifications}
            options={{ headerShown: false, animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="Language"
            component={LanguageScreen}
            options={{ title: "Language" }}
          />
          <Stack.Screen
            name="Faqs"
            component={FaqsScreen}
            options={{ title: "FAQs" }}
          />
        </Stack.Navigator>
      </NavigationContainer>

      {/* LANGUAGE BUTTON - floats on top of every screen */}
      {showButton && (
        <LanguageButton
          onPress={() => navigationRef.navigate("Language")}
          style={{
            position: "absolute",
            top: BUTTON_TOP,
            right: 16,
            zIndex: 100,
          }}
        />
      )}
    </View>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <ProfileProvider>
        <BookmarksProvider>
          <AppNavigator />
        </BookmarksProvider>
      </ProfileProvider>
    </LanguageProvider>
  );
}