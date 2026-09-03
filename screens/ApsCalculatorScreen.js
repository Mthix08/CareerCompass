import React from 'react';
import { StyleSheet,Text, View } from 'react-native';



export default function ApsCalculatorScreen() {
    return (
        <View style={styles.container}>
            <Text>Calculate your APS here.</Text>
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