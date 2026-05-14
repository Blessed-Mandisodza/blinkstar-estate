import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../src/context/AuthContext";
import { FavoritesProvider } from "../src/context/FavoritesContext";
import { colors } from "../src/theme/colors";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <FavoritesProvider>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: colors.surface },
              headerTintColor: colors.text,
              headerShadowVisible: false,
              contentStyle: { backgroundColor: colors.background },
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="property/[id]"
              options={{ title: "Property", presentation: "card" }}
            />
            <Stack.Screen
              name="auth/signin"
              options={{ title: "Sign In", presentation: "modal" }}
            />
            <Stack.Screen
              name="auth/signup"
              options={{ title: "Create Account", presentation: "modal" }}
            />
          </Stack>
        </FavoritesProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
