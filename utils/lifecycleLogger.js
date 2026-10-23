import { useCallback, useEffect } from "react";
import { AppState } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Lifecycle log for the project brief (Criterion 3).
// Every event is printed to the console (Metro terminal or `adb logcat -s ReactNativeJS`)
// and the last 100 lines are kept in AsyncStorage as a log file you can read back.
const LOG_KEY = "@careercompass:lifecycleLog";

export async function logLifecycle(event) {
  const line = `${new Date().toISOString()}  ${event}`;
  console.log(`[Lifecycle] ${line}`);
  try {
    const stored = await AsyncStorage.getItem(LOG_KEY);
    const lines = stored ? JSON.parse(stored) : [];
    lines.push(line);
    await AsyncStorage.setItem(LOG_KEY, JSON.stringify(lines.slice(-100)));
  } catch (_error) {
    // logging must never crash the app
  }
}

export async function getLifecycleLog() {
  try {
    const stored = await AsyncStorage.getItem(LOG_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (_error) {
    return [];
  }
}

// Call once in App.js: logs launch, active / inactive / background, and unmount.
export function useAppLifecycleLogger() {
  useEffect(() => {
    logLifecycle(`App launched (state: ${AppState.currentState})`);
    const subscription = AppState.addEventListener("change", (nextState) => {
      logLifecycle(`App state changed -> ${nextState}`);
    });
    return () => {
      subscription.remove();
      logLifecycle("App unmounted");
    };
  }, []);
}

// Call inside a screen: logs mounted, focused, blurred, unmounted.
export function useScreenLifecycle(screenName) {
  useEffect(() => {
    logLifecycle(`${screenName} mounted`);
    return () => logLifecycle(`${screenName} unmounted`);
  }, [screenName]);

  useFocusEffect(
    useCallback(() => {
      logLifecycle(`${screenName} focused`);
      return () => logLifecycle(`${screenName} blurred`);
    }, [screenName]),
  );
}