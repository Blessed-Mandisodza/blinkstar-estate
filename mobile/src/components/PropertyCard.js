import React from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../theme/colors";
import { formatLabel, formatPrice, getPropertyImage } from "../utils/format";

export default function PropertyCard({
  property,
  isFavorite = false,
  onPress,
  onToggleFavorite,
}) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.imageWrap}>
        <Image source={{ uri: getPropertyImage(property) }} style={styles.image} />
        <TouchableOpacity
          onPress={(event) => {
            event.stopPropagation?.();
            onToggleFavorite?.();
          }}
          style={[styles.favoriteButton, isFavorite && styles.favoriteButtonActive]}
        >
          <Text style={[styles.favoriteText, isFavorite && styles.favoriteTextActive]}>
            {isFavorite ? "♥" : "♡"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <View style={styles.rowBetween}>
          <Text style={styles.price}>{formatPrice(property.price)}</Text>
          <View style={styles.typeChip}>
            <Text style={styles.typeChipText}>{formatLabel(property.propertyType)}</Text>
          </View>
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {property.title}
        </Text>
        <Text style={styles.location} numberOfLines={1}>
          {property.location || "Zimbabwe"}
        </Text>

        <View style={styles.metaRow}>
          <Text style={styles.metaText}>{property.bedrooms || 0} bed</Text>
          <Text style={styles.metaText}>{property.bathrooms || 0} bath</Text>
          <Text style={styles.metaText}>{property.area || "N/A"} sqm</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    marginBottom: 14,
  },
  imageWrap: {
    position: "relative",
  },
  image: {
    width: "100%",
    height: 220,
    backgroundColor: colors.border,
  },
  favoriteButton: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.95)",
    alignItems: "center",
    justifyContent: "center",
  },
  favoriteButtonActive: {
    backgroundColor: "#fee2e2",
  },
  favoriteText: {
    fontSize: 20,
    color: colors.text,
  },
  favoriteTextActive: {
    color: colors.danger,
  },
  body: {
    padding: 16,
    gap: 8,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  price: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: "800",
    flex: 1,
  },
  typeChip: {
    backgroundColor: colors.background,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  typeChipText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.text,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "800",
  },
  location: {
    color: colors.mutedDark,
    fontSize: 14,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 2,
  },
  metaText: {
    color: colors.mutedDark,
    fontSize: 13,
    fontWeight: "600",
  },
});
