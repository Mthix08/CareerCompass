import React, { useEffect, useMemo, useRef } from "react";
import { Animated, Image, StatusBar, StyleSheet, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { auth } from "./firebaseConfig";
import { useProfile } from "../context/ProfileContext";

// Must match the key used in OnboardingScreen.js
const ONBOARDING_SEEN_KEY = "@careercompass:hasSeenOnboarding";

// NEW: works out where to go once the splash animation finishes.
// Signed in -> Home, onboarding already seen -> Login, otherwise -> Onboarding.
async function getStartRoute() {
  try {
    const [seenOnboarding, user] = await Promise.all([
      AsyncStorage.getItem(ONBOARDING_SEEN_KEY),
      new Promise((resolve) => {
        let unsubscribe = null;
        unsubscribe = auth.onAuthStateChanged((currentUser) => {
          unsubscribe?.();
          resolve(currentUser);
        });
      }),
    ]);
    if (user) return "Home";
    return seenOnboarding ? "Login" : "Onboarding";
  } catch (_error) {
    return "Onboarding";
  }
}

export default function SplashScreen({ navigation }) {
  const { publicColors: colors } = useProfile();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.92)).current;
  const barAnimations = useRef(
    Array.from({ length: 5 }, () => new Animated.Value(0.35)),
  ).current;
  const startRoute = useRef(null);

  useEffect(() => {
    // Start checking storage + auth while the animation plays
    startRoute.current = getStartRoute();

    const animation = Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 7,
          tension: 45,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(1200),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]);

    animation.start(async ({ finished }) => {
      if (finished) {
        navigation.replace(await startRoute.current);
      }
    });

    const barLoops = barAnimations.map((bar, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 110),
          Animated.timing(bar, {
            toValue: 1,
            duration: 320,
            useNativeDriver: true,
          }),
          Animated.timing(bar, {
            toValue: 0.35,
            duration: 320,
            useNativeDriver: true,
          }),
          Animated.delay((barAnimations.length - index) * 110),
        ]),
      ),
    );

    barLoops.forEach((barLoop) => barLoop.start());

    return () => {
      animation.stop();
      barLoops.forEach((barLoop) => barLoop.stop());
    };
  }, [barAnimations, navigation, opacity, scale]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <Animated.View
        style={[styles.content, { opacity, transform: [{ scale }] }]}
      >
        <Image
          source={require("../assets/CC.png")}
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel="CareerCompass"
        />
        <Text style={styles.loadingText}>DISCOVER • PLAN • ACHIEVE</Text>
      </Animated.View>

      <View style={styles.loader} accessibilityLabel="Loading">
        {barAnimations.map((bar, index) => (
          <Animated.View
            key={index}
            style={[styles.bar, { transform: [{ scaleY: bar }] }]}
          />
        ))}
      </View>
    </View>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    width: "100%",
    alignItems: "center",
  },
  logo: {
    width: "92%",
    height: 250,
  },
  loadingText: {
    marginTop: 16,
    color: colors.primary,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
  },
  loader: {
    position: "absolute",
    bottom: 54,
    flexDirection: "row",
    alignItems: "flex-end",
    height: 38,
    gap: 6,
  },
  bar: {
    width: 7,
    height: 34,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  });
}