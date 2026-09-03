import React from 'react';
import { StyleSheet,Text, View } from 'react-native';



export default function Bookmarks() {
	return (
		<View style={styles.container}>
			<Text>Your bookmarked careers will appear here.</Text>
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