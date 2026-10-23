import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useProfile } from "../context/ProfileContext";



export default function LanguageScreen() {
    const { colors } = useProfile();
    const styles = useMemo(() => makeStyles(colors), [colors]);
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Select your preferred language.</Text>
        </View>
    );
}

function makeStyles(colors) {
  return StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  text: { color: colors.text },
  });
}