import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Link, router } from "expo-router";
import Screen from "../../src/components/Screen";
import { useAuth } from "../../src/context/AuthContext";
import { colors } from "../../src/theme/colors";

export default function SignInScreen() {
  const { signIn } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.email || !form.password) {
      setError("Enter both email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await signIn(form);
      router.replace("/profile");
    } catch (err) {
      setError(err.message || "Could not sign you in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.root}
      >
        <View style={styles.card}>
          <Text style={styles.eyebrow}>BlinkStar Mobile</Text>
          <Text style={styles.title}>Sign in</Text>
          <Text style={styles.subtitle}>Your saved homes and future alerts will follow you here.</Text>

          <TextInput
            value={form.email}
            onChangeText={(value) => updateField("email", value)}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            placeholder="Email"
            placeholderTextColor={colors.muted}
            style={styles.input}
          />
          <TextInput
            value={form.password}
            onChangeText={(value) => updateField("password", value)}
            secureTextEntry
            placeholder="Password"
            placeholderTextColor={colors.muted}
            style={styles.input}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable style={styles.primaryButton} onPress={handleSubmit} disabled={loading}>
            <Text style={styles.primaryButtonText}>{loading ? "Signing in..." : "Sign In"}</Text>
          </Pressable>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Need an account?</Text>
            <Link href="/auth/signup" style={styles.footerLink}>
              Create one
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "center",
    padding: 18,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    padding: 22,
    gap: 14,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "700",
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
  },
  subtitle: {
    color: colors.mutedDark,
    fontSize: 15,
    lineHeight: 22,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: colors.text,
    fontSize: 15,
  },
  error: {
    color: colors.danger,
    fontWeight: "600",
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryButtonText: {
    color: colors.surface,
    fontWeight: "800",
    fontSize: 16,
  },
  footerRow: {
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
  },
  footerText: {
    color: colors.mutedDark,
  },
  footerLink: {
    color: colors.primary,
    fontWeight: "700",
  },
});
