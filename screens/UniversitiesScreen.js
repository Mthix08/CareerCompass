import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import NavBar from "../components/NavBar";
import VarsityCard from "../components/Varsity-Card";
import { getUniversities } from "../services/api";

export default function UniversitiesScreen({ navigation }) {
  const [universities, setUniversities] = useState([]);
  const [filteredUniversities, setFilteredUniversities] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [province, setProvince] = useState("All provinces");

  useEffect(() => {
    loadUniversities();
  }, []);

  async function loadUniversities() {
    try {
      setLoading(true);
      setError("");

      const data = await getUniversities();

      setUniversities(data);
      setFilteredUniversities(data);
    } catch (err) {
      setError("Unable to load universities. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function applyFilters(nextSearch = search, nextProvince = province) {
    const normalizedSearch = nextSearch.trim().toLowerCase();
    const results = universities.filter((university) => {
      const matchesSearch = university.name
        .toLowerCase()
        .includes(normalizedSearch);
      const matchesProvince =
        nextProvince === "All provinces" ||
        university.province === nextProvince;
      return matchesSearch && matchesProvince;
    });
    setFilteredUniversities(results);
  }

  function handleSearch(text) {
    setSearch(text);
    applyFilters(text, province);
  }

  function handleProvince(nextProvince) {
    setProvince(nextProvince);
    applyFilters(search, nextProvince);
  }

  function renderUniversity({ item }) {
    return (
      <VarsityCard
        university={item}
        onPress={() =>
          navigation.navigate("UniversityDetails", { university: item })
        }
      />
    );
  }

  const provinces = [
    "All provinces",
    ...new Set(
      universities.map((university) => university.province).filter(Boolean),
    ),
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Institutions</Text>

      <Text style={styles.subtitle}>Explore universities in South Africa.</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Search university..."
        value={search}
        onChangeText={handleSearch}
      />

      <FlatList
        data={provinces}
        horizontal
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        style={styles.filters}
        contentContainerStyle={styles.filterContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.filter, province === item && styles.activeFilter]}
            onPress={() => handleProvince(item)}
            accessibilityRole="button"
            accessibilityState={{ selected: province === item }}
          >
            <Text
              style={[
                styles.filterText,
                province === item && styles.activeFilterText,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      {loading ?
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Loading universities...</Text>
        </View>
      : error ?
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadUniversities}
          >
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      : <FlatList
          data={filteredUniversities}
          keyExtractor={(item) => item.id}
          renderItem={renderUniversity}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No universities found.</Text>
          }
        />
      }

      <NavBar navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 100,
    backgroundColor: "#F6F8FC",
  },

  title: {
    color: "#172033",
    fontSize: 28,
    fontWeight: "700",
  },

  subtitle: {
    marginTop: 8,
    marginBottom: 20,
    color: "#526078",
    fontSize: 15,
  },

  searchInput: {
    height: 50,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E1E6EF",
  },

  list: {
    paddingBottom: 100,
  },

  filters: { flexGrow: 0, marginBottom: 14 },
  filterContent: { gap: 8 },
  filter: {
    borderColor: "#D5E0DD",
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  activeFilter: { backgroundColor: "#117C72", borderColor: "#117C72" },
  filterText: { color: "#526078", fontSize: 12, fontWeight: "600" },
  activeFilterText: { color: "#FFFFFF" },
  list: {
    paddingBottom: 100,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 10,
    color: "#526078",
  },

  errorText: {
    color: "#B42318",
    textAlign: "center",
    marginBottom: 15,
  },

  retryButton: {
    backgroundColor: "#117C72",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },

  retryText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },

  emptyText: {
    textAlign: "center",
    marginTop: 30,
    color: "#526078",
  },
});
