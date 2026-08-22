import React, { useEffect, useRef } from "react";
import { Animated, Image, StyleSheet, Text, View } from "react-native";

export default function SplashScreen({ navigation }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.92)).current;

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

    return () => animation.stop();
  }, [navigation, opacity, scale]);

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
});
