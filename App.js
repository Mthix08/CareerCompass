import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "./screens/LoginScreen";
import SignUpScreen from "./screens/SignUpScreen";
import PassRecoveryScreen from "./screens/PassRecoveryScreen";
import SplashScreen from "./screens/SplashScreen";
import UniversityDetailsScreen from "./screens/UniversityDetailsScreen";
import EditProfileScreen from "./screens/EditProfileScreen";
import BottomTabNavigator from "./navigation/BottomTabNavigator";
import { ProfileProvider } from "./context/ProfileContext";

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
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ProfileProvider>
      <AppNavigator />
    </ProfileProvider>
  );
}
