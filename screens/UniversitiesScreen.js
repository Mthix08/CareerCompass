import React, { useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";

import UniversityCard from "../components/Varsity-Card";
import { universities } from "../data/universities";

export default function UniversitiesScreen({ navigation }) {
  const [bookmarkedIds, setBookmarkedIds] = useState([]);

  const toggleBookmark = (universityId) => {
    setBookmarkedIds((current) =>
      current.includes(universityId)
        ? current.filter((id) => id !== universityId)
        : [...current, universityId],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <FlatList
        data={universities}
        keyExtractor={(university) => university.id}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.eyebrow}>EXPLORE YOUR OPTIONS</Text>
            <Text style={styles.title}>Universities</Text>
            <Text style={styles.subtitle}>
              Compare all {universities.length} public universities, their courses
              and application information.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <UniversityCard
            university={item}
            bookmarked={bookmarkedIds.includes(item.id)}
            onBookmarkPress={() => toggleBookmark(item.id)}
            onPress={() =>
              navigation.navigate("UniversityDetails", { university: item })
            }
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F8FC",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 25,
  },
  separator: { height: 20 },
  eyebrow: {
    color: "#117C72",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  title: {
    marginTop: 7,
    color: "#117C72",
    fontSize: 31,
    fontWeight: "900",
  },
  subtitle: {
    maxWidth: 420,
    marginTop: 8,
    color: "#9CA6B5",
    fontSize: 15,
    lineHeight: 22,
  },
});
