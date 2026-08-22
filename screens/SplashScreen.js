import React, { useEffect, useRef } from "react";
import { Animated, Image, StyleSheet, Text, View } from "react-native";

export default function SplashScreen({ navigation }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.92)).current;
  const barAnimations = useRef(
    Array.from({ length: 5 }, () => new Animated.Value(0.35)),
  ).current;

  useEffect(() => {
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

    animation.start(({ finished }) => {
      if (finished) {
        navigation.replace("Login");
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "smokewhite",
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
    color: "#3ED6C2",
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
    backgroundColor: "#3ED6C2",
  },
});
