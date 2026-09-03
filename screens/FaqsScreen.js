import React from 'react';
import { StyleSheet,Text, View } from 'react-native';



export default function FaqsScreen() {
    return (
        <View style={styles.container}>
            <Text>Frequently Asked Questions</Text>
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