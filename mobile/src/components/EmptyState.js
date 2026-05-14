import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";

export default function EmptyState({ title, message }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 18,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
  },
  message: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.mutedDark,
  },
});
