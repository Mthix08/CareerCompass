import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import NavBar from "../components/NavBar";
import CoursesScreen from "../screens/CoursesScreen";
import HomeScreen from "../screens/HomeScreen";
import ProfileScreen from "../screens/Profile";
import UniversitiesScreen from "../screens/UniversitiesScreen";

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{ headerShown: false, tabBarHideOnKeyboard: true }}
      tabBar={(props) => <NavBar {...props} />}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen
        name="Universities"
        component={UniversitiesScreen}
        options={{ title: "Institutions" }}
      />
      <Tab.Screen name="Courses" component={CoursesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
