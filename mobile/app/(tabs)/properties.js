import React, { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import Screen from "../../src/components/Screen";
import Loader from "../../src/components/Loader";
import EmptyState from "../../src/components/EmptyState";
import PropertyCard from "../../src/components/PropertyCard";
import { apiFetch } from "../../src/services/api";
import { colors } from "../../src/theme/colors";
import { useFavorites } from "../../src/context/FavoritesContext";

const statusOptions = ["", "sale", "rent"];

export default function PropertiesScreen() {
  const params = useLocalSearchParams();
  const [search, setSearch] = useState(params.search || "");
  const [type, setType] = useState(params.type || "");
  const [status, setStatus] = useState(params.status || "");
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const { isFavorite, toggleFavorite } = useFavorites();

  const queryString = useMemo(() => {
    const next = new URLSearchParams();
    next.set("includeMeta", "true");
    next.set("limit", "18");

    if (search) {
      next.set("search", search);
    }

    if (type) {
      next.set("type", type);
    }

    if (status) {
      next.set("status", status);
    }

    return next.toString();
  }, [search, status, type]);

  const loadProperties = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await apiFetch(`/api/property?${queryString}`);
      const data = await response.json();
      const nextProperties = Array.isArray(data) ? data : data.properties || [];
      setProperties(nextProperties);
    } catch (err) {
      setError(err.message || "Could not load properties.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, [queryString]);

  return (
    <Screen scroll={false}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadProperties(true)}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Browse Properties</Text>
          <Text style={styles.subtitle}>Search homes, rentals, land, and commercial spaces.</Text>
        </View>

        <View style={styles.searchCard}>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search location or keyword"
            placeholderTextColor={colors.muted}
            style={styles.input}
          />
          <View style={styles.chipRow}>
            {statusOptions.map((option) => {
              const active = option === status;
              const label = option ? option.toUpperCase() : "ALL";
              return (
                <Pressable
                  key={label}
                  onPress={() => setStatus(option)}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      active && styles.filterChipTextActive,
                    ]}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {loading ? <Loader label="Finding listings" /> : null}
        {error && !loading ? (
          <EmptyState title="Could not load listings" message={error} />
        ) : null}
        {!loading && !error && !properties.length ? (
          <EmptyState
            title="No properties found"
            message="Try a different location, keyword, or listing type."
          />
        ) : null}

        {!loading && !error
          ? properties.map((property) => (
              <PropertyCard
                key={property._id}
                property={property}
                isFavorite={isFavorite(property._id)}
                onPress={() => router.push(`/property/${property._id}`)}
                onToggleFavorite={() => toggleFavorite(property)}
              />
            ))
          : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 18,
    paddingBottom: 120,
    gap: 16,
  },
  header: {
    gap: 6,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
    color: colors.text,
  },
  subtitle: {
    color: colors.mutedDark,
    fontSize: 15,
    lineHeight: 22,
  },
  searchCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 14,
    gap: 14,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 15,
  },
  chipRow: {
    flexDirection: "row",
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.background,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
  },
  filterChipText: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 12,
  },
  filterChipTextActive: {
    color: colors.surface,
  },
});
