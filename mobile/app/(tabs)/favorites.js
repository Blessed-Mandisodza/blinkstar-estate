import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import Screen from "../../src/components/Screen";
import PropertyCard from "../../src/components/PropertyCard";
import EmptyState from "../../src/components/EmptyState";
import Loader from "../../src/components/Loader";
import { useFavorites } from "../../src/context/FavoritesContext";
import { colors } from "../../src/theme/colors";

export default function FavoritesScreen() {
  const { favorites, loading, toggleFavorite, isFavorite } = useFavorites();

  return (
    <Screen scroll={false}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Favorites</Text>
          <Text style={styles.subtitle}>
            Keep the listings you like close while you compare them.
          </Text>
        </View>

        {loading ? <Loader label="Loading favorites" /> : null}

        {!loading && !favorites.length ? (
          <EmptyState
            title="Nothing saved yet"
            message="Tap the heart on any listing and it will show up here."
          />
        ) : null}

        {!loading
          ? favorites.map((property) => (
              <PropertyCard
                key={property._id}
                property={property}
                isFavorite={isFavorite(property._id)}
                onPress={() => router.push(`/property/${property._id}`)}
                onToggleFavorite={() => toggleFavorite(property)}
              />
            ))
          : null}

        <Pressable
          style={styles.browseButton}
          onPress={() => router.push("/properties")}
        >
          <Text style={styles.browseButtonText}>Browse more listings</Text>
        </Pressable>
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
    fontWeight: "800",
    color: colors.text,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.mutedDark,
  },
  browseButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: 999,
    marginTop: 4,
  },
  browseButtonText: {
    color: colors.surface,
    fontWeight: "700",
  },
});
