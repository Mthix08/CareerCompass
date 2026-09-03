import React from 'react';
import { StyleSheet,Text, View } from 'react-native';



export default function NsfasDetails() {
    return (
        <View style={styles.container}>
            <Text>NSFAS Details</Text>
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