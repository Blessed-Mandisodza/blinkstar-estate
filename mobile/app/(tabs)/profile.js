import React from "react";
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import Screen from "../../src/components/Screen";
import { useAuth } from "../../src/context/AuthContext";
import { colors } from "../../src/theme/colors";
import { WEB_BASE_URL } from "../../src/services/api";

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <Screen scroll={false}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.authCard}>
            <Text style={styles.title}>Your account, wherever you pick back up.</Text>
            <Text style={styles.subtitle}>
              Sign in to sync favorites, saved searches, and future alerts across web and mobile.
            </Text>
            <Pressable style={styles.primaryButton} onPress={() => router.push("/auth/signin")}>
              <Text style={styles.primaryButtonText}>Sign In</Text>
            </Pressable>
            <Pressable style={styles.secondaryButton} onPress={() => router.push("/auth/signup")}>
              <Text style={styles.secondaryButtonText}>Create Account</Text>
            </Pressable>
          </View>
        </ScrollView>
      </Screen>
    );
  }

  return (
    <Screen scroll={false}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(user.name || user.email || "B").slice(0, 1).toUpperCase()}</Text>
          </View>
          <Text style={styles.name}>{user.name || "BlinkStar Member"}</Text>
          <Text style={styles.email}>{user.email}</Text>
          <Text style={styles.role}>{(user.role || "user").toUpperCase()}</Text>
        </View>

        <View style={styles.actionGroup}>
          <Pressable
            style={styles.actionCard}
            onPress={() => Linking.openURL(`${WEB_BASE_URL}/dashboard`)}
          >
            <Text style={styles.actionTitle}>Open dashboard on web</Text>
            <Text style={styles.actionText}>Manage listings, leads, and moderation tools there for now.</Text>
          </Pressable>

          <Pressable
            style={styles.actionCard}
            onPress={() => Linking.openURL(`${WEB_BASE_URL}/saved-searches`)}
          >
            <Text style={styles.actionTitle}>Saved searches</Text>
            <Text style={styles.actionText}>Continue the same account across both experiences.</Text>
          </Pressable>
        </View>

        <Pressable style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutButtonText}>Sign Out</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 18,
    paddingBottom: 120,
    gap: 18,
  },
  authCard: {
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 22,
    gap: 14,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
    color: colors.text,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.mutedDark,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryButtonText: {
    color: colors.surface,
    fontWeight: "700",
    fontSize: 16,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 16,
  },
  profileCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    padding: 22,
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },
  avatarText: {
    color: colors.surface,
    fontSize: 28,
    fontWeight: "800",
  },
  name: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text,
  },
  email: {
    fontSize: 15,
    color: colors.mutedDark,
  },
  role: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.primary,
  },
  actionGroup: {
    gap: 12,
  },
  actionCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 18,
    gap: 6,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  actionText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.mutedDark,
  },
  logoutButton: {
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: colors.text,
  },
  logoutButtonText: {
    color: colors.surface,
    fontWeight: "700",
    fontSize: 16,
  },
});
