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

export default function SignUpScreen() {
  const { signUp } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setError("Fill in all fields.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await signUp(form);
      router.replace("/profile");
    } catch (err) {
      setError(err.message || "Could not create your account.");
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
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Start saving listings and sending inquiries on the go.</Text>

          <TextInput
            value={form.name}
            onChangeText={(value) => updateField("name", value)}
            placeholder="Full name"
            placeholderTextColor={colors.muted}
            style={styles.input}
          />
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
          <TextInput
            value={form.confirmPassword}
            onChangeText={(value) => updateField("confirmPassword", value)}
            secureTextEntry
            placeholder="Confirm password"
            placeholderTextColor={colors.muted}
            style={styles.input}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable style={styles.primaryButton} onPress={handleSubmit} disabled={loading}>
            <Text style={styles.primaryButtonText}>
              {loading ? "Creating account..." : "Create Account"}
            </Text>
          </Pressable>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <Link href="/auth/signin" style={styles.footerLink}>
              Sign in
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
