import React from 'react';
import { StyleSheet,Text, View } from 'react-native';



export default function NotificationPreferences() {
    return (
        <View style={styles.container}>
            <Text>Manage your notification preferences here.</Text>
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