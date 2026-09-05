import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "./screens/LoginScreen";
import SignUpScreen from "./screens/SignUpScreen";
import PassRecoveryScreen from "./screens/PassRecoveryScreen";
import SplashScreen from "./screens/SplashScreen";
import UniversityDetailsScreen from "./screens/UniversityDetailsScreen";
import EditProfileScreen from "./screens/EditProfileScreen";
import ApsCalculatorScreen from "./screens/ApsCalculatorScreen";
import NsfasDetails from "./screens/NsfasDetails";
import Applications from "./screens/Applications";
import Bookmarks from "./screens/Bookmarks";
import Notifications from "./screens/Notifications";
import NotificationPreferences from "./screens/NotificationPreferences";
import LanguageScreen from "./screens/LanguageScreen";
import FaqsScreen from "./screens/FaqsScreen";
import BottomTabNavigator from "./navigation/BottomTabNavigator";
import { ProfileProvider } from "./context/ProfileContext";
import { BookmarksProvider } from "./context/BookmarksContext";

const Stack = createNativeStackNavigator();

function AppNavigator() {
  return (
    <NavigationContainer>
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
          name="EditProfile"
          component={EditProfileScreen}
          options={{ headerShown: false, animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="ApsCalculator"
          component={ApsCalculatorScreen}
          options={{ title: "APS Calculator" }}
        />
        <Stack.Screen
          name="NsfasDetails"
          component={NsfasDetails}
          options={{ title: "NSFAS Funding" }}
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
  );
}

export default function App() {
  return (
    <ProfileProvider>
      <BookmarksProvider>
        <AppNavigator />
      </BookmarksProvider>
    </ProfileProvider>
  );
}
