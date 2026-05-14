import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "./AuthContext";
import { authFetch } from "../services/api";

const FavoritesContext = createContext(null);
const GUEST_FAVORITES_KEY = "blinkstar.mobile.guest-favorites";

export function FavoritesProvider({ children }) {
  const { token, user, loading: authLoading } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [loading, setLoading] = useState(true);

  const syncGuestFavorites = useCallback(async (nextFavorites) => {
    await AsyncStorage.setItem(GUEST_FAVORITES_KEY, JSON.stringify(nextFavorites));
  }, []);

  const refreshFavorites = useCallback(async () => {
    if (authLoading) return;

    setLoading(true);

    try {
      if (token && user) {
        const response = await authFetch("/api/auth/favorites", token);
        const data = await response.json();
        const nextFavorites = Array.isArray(data.favorites) ? data.favorites : [];
        setFavorites(nextFavorites);
        setFavoriteIds(nextFavorites.map((item) => item._id || item));
      } else {
        const stored = await AsyncStorage.getItem(GUEST_FAVORITES_KEY);
        const nextFavorites = stored ? JSON.parse(stored) : [];
        setFavorites(nextFavorites);
        setFavoriteIds(nextFavorites.map((item) => item._id));
      }
    } catch {
      setFavorites([]);
      setFavoriteIds([]);
    } finally {
      setLoading(false);
    }
  }, [authLoading, token, user]);

  useEffect(() => {
    refreshFavorites();
  }, [refreshFavorites]);

  const toggleFavorite = useCallback(
    async (property) => {
      if (!property?._id) return;

      if (token && user) {
        const response = await authFetch(`/api/auth/favorites/${property._id}`, token, {
          method: "POST",
        });
        const data = await response.json();
        const nextFavoriteIds = Array.isArray(data.favorites) ? data.favorites : [];
        setFavoriteIds(nextFavoriteIds);

        if (nextFavoriteIds.includes(property._id)) {
          setFavorites((current) => {
            const exists = current.some((item) => item._id === property._id);
            return exists ? current : [property, ...current];
          });
        } else {
          setFavorites((current) => current.filter((item) => item._id !== property._id));
        }
        return;
      }

      const exists = favoriteIds.includes(property._id);
      const nextFavorites = exists
        ? favorites.filter((item) => item._id !== property._id)
        : [property, ...favorites];

      setFavorites(nextFavorites);
      setFavoriteIds(nextFavorites.map((item) => item._id));
      await syncGuestFavorites(nextFavorites);
    },
    [favoriteIds, favorites, syncGuestFavorites, token, user]
  );

  const value = {
    favorites,
    favoriteIds,
    loading,
    isFavorite: (propertyId) => favoriteIds.includes(propertyId),
    toggleFavorite,
    refreshFavorites,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);

  if (!context) {
    throw new Error("useFavorites must be used inside FavoritesProvider");
  }

  return context;
}
