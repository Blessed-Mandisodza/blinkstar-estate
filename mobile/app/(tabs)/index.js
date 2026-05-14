import React, { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Screen from "../../src/components/Screen";
import PropertyCard from "../../src/components/PropertyCard";
import Loader from "../../src/components/Loader";
import EmptyState from "../../src/components/EmptyState";
import { apiFetch } from "../../src/services/api";
import { colors } from "../../src/theme/colors";
import { useFavorites } from "../../src/context/FavoritesContext";

const quickFilters = [
  { label: "For Sale", params: { status: "sale" } },
  { label: "For Rent", params: { status: "rent" } },
  { label: "Land", params: { type: "land" } },
];

export default function HomeScreen() {
  const [featured, setFeatured] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const { isFavorite, toggleFavorite } = useFavorites();

  const sections = useMemo(
    () => [
      { title: "Featured", data: featured },
      { title: "Recent", data: recent },
    ],
    [featured, recent]
  );

  const loadHome = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const [featuredResponse, recentResponse] = await Promise.all([
        apiFetch("/api/property?featured=true&limit=3"),
        apiFetch("/api/property?limit=6"),
      ]);

      const [featuredData, recentData] = await Promise.all([
        featuredResponse.json(),
        recentResponse.json(),
      ]);

      setFeatured(Array.isArray(featuredData) ? featuredData : []);
      setRecent(Array.isArray(recentData) ? recentData.slice(0, 3) : []);
    } catch (err) {
      setError(err.message || "Could not load mobile home.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadHome();
  }, []);

  if (loading) {
    return (
      <Screen scroll={false}>
        <Loader label="Loading BlinkStar Mobile" />
      </Screen>
    );
  }

  return (
    <Screen scroll={false}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => loadHome(true)} />
        }
      >
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>BlinkStar Mobile</Text>
          <Text style={styles.title}>Find the next place without the desktop detour.</Text>
          <Text style={styles.subtitle}>
            Browse verified listings, save the ones you like, and reach out fast.
          </Text>
          <View style={styles.quickRow}>
            {quickFilters.map((item) => (
              <Pressable
                key={item.label}
                onPress={() =>
                  router.push({
                    pathname: "/properties",
                    params: item.params,
                  })
                }
                style={styles.quickChip}
              >
                <Text style={styles.quickChipText}>{item.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {error ? <EmptyState title="Home is taking a breath" message={error} /> : null}

        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Pressable
                onPress={() => router.push("/properties")}
                style={styles.inlineAction}
              >
                <Text style={styles.inlineActionText}>See all</Text>
                <Ionicons name="arrow-forward" size={14} color={colors.primary} />
              </Pressable>
            </View>

            {section.data.length ? (
              section.data.map((property) => (
                <PropertyCard
                  key={property._id}
                  property={property}
                  isFavorite={isFavorite(property._id)}
                  onPress={() => router.push(`/property/${property._id}`)}
                  onToggleFavorite={() => toggleFavorite(property)}
                />
              ))
            ) : (
              <EmptyState
                title={`No ${section.title.toLowerCase()} listings yet`}
                message="Once listings are live, they will show up here."
              />
            )}
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 18,
    paddingBottom: 120,
    gap: 22,
  },
  hero: {
    backgroundColor: colors.text,
    borderRadius: 24,
    padding: 22,
    gap: 10,
  },
  eyebrow: {
    color: colors.primarySoft,
    fontWeight: "700",
    letterSpacing: 0,
    fontSize: 13,
  },
  title: {
    color: colors.surface,
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 34,
  },
  subtitle: {
    color: "#cbd5e1",
    fontSize: 15,
    lineHeight: 22,
  },
  quickRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 6,
  },
  quickChip: {
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  quickChipText: {
    color: colors.surface,
    fontWeight: "700",
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text,
  },
  inlineAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  inlineActionText: {
    color: colors.primary,
    fontWeight: "700",
  },
});
