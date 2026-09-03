import React from 'react';
import { StyleSheet,Text, View } from 'react-native';



export default function LanguageScreen() {
    return (
        <View style={styles.container}>
            <Text>Select your preferred language.</Text>
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});