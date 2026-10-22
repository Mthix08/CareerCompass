import React from 'react';
import { StyleSheet, View } from 'react-native';

import Text from '../components/TranslatedText';

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