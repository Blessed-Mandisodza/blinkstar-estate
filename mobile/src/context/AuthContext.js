import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiFetch } from "../services/api";

const AuthContext = createContext(null);

const USER_KEY = "blinkstar.mobile.user";
const TOKEN_KEY = "blinkstar.mobile.token";

const normalizeUser = (userData) =>
  userData
    ? {
        ...userData,
        _id: userData._id || userData.id,
        id: userData.id || userData._id,
      }
    : null;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      try {
        const [storedUser, storedToken] = await Promise.all([
          AsyncStorage.getItem(USER_KEY),
          AsyncStorage.getItem(TOKEN_KEY),
        ]);

        if (!isMounted) return;

        if (storedUser && storedToken) {
          setUser(normalizeUser(JSON.parse(storedUser)));
          setToken(storedToken);
        }
      } catch {
        await AsyncStorage.multiRemove([USER_KEY, TOKEN_KEY]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (userData, authToken) => {
    const nextUser = normalizeUser(userData);
    setUser(nextUser);
    setToken(authToken);
    await AsyncStorage.multiSet([
      [USER_KEY, JSON.stringify(nextUser)],
      [TOKEN_KEY, authToken],
    ]);
  }, []);

  const signIn = useCallback(
    async ({ email, password }) => {
      const response = await apiFetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      await login(data.user, data.token);
      return data;
    },
    [login]
  );

  const signUp = useCallback(
    async ({ name, email, password }) => {
      const response = await apiFetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      await login(data.user, data.token);
      return data;
    },
    [login]
  );

  const logout = useCallback(async () => {
    setUser(null);
    setToken("");
    await AsyncStorage.multiRemove([USER_KEY, TOKEN_KEY]);
  }, []);

  const value = {
    user,
    token,
    loading,
    login,
    signIn,
    signUp,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
