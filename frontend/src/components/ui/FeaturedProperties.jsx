import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Typography,
  keyframes,
} from "@mui/material";
import { ArrowForward } from "@mui/icons-material";
import PropertyCard from "../property/PropertyCard";
import { useAuth } from "../../context/AuthContext";
import { apiFetch, authFetch } from "../../utils/authFetch";
import Reveal from "./Reveal";

const shimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

const guestFavoritesKey = "guestFavorites";

const readGuestFavorites = () => {
  try {
    return JSON.parse(localStorage.getItem(guestFavoritesKey) || "[]");
  } catch {
    return [];
  }
};

const writeGuestFavorites = (favorites) => {
  localStorage.setItem(guestFavoritesKey, JSON.stringify(favorites));
};

export default function FeaturedProperties() {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecentProperties = async () => {
      try {
        setLoading(true);
        const response = await apiFetch("/api/property?limit=3&sort=createdAt");

        if (!response.ok) {
          throw new Error("Failed to fetch properties");
        }

        const data = await response.json();
        setProperties(data);
      } catch (err) {
        console.error("Error fetching recent properties:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentProperties();
  }, []);

  useEffect(() => {
    if (user) {
      authFetch("/api/auth/favorites")
        .then((res) => res.json())
        .then((data) =>
          setFavorites(
            data.favorites?.map((f) => (typeof f === "string" ? f : f._id)) || []
          )
        )
        .catch(() => setFavorites([]));
    } else {
      setFavorites(readGuestFavorites());
    }
  }, [user]);

  const toggleFavorite = async (propertyId) => {
    if (!user) {
      setFavorites((current) => {
        const next = current.includes(propertyId)
          ? current.filter((id) => id !== propertyId)
          : [...current, propertyId];
        writeGuestFavorites(next);
        return next;
      });
      return;
    }

    const res = await authFetch(`/api/auth/favorites/${propertyId}`, {
      method: "POST",
    });
    if (res.ok) {
      const data = await res.json();
      setFavorites(data.favorites);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          py: { xs: 4, sm: 6, md: 8 },
          backgroundColor: "background.default",
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: { xs: 4, md: 5 } }}>
            <Stack spacing={1.25} alignItems="center">
              <Box
                sx={{
                  width: 74,
                  height: 74,
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, rgba(37,99,235,0.16), rgba(16,185,129,0.16))",
                  border: "1px solid rgba(37,99,235,0.12)",
                  display: "grid",
                  placeItems: "center",
                  position: "relative",
                  overflow: "hidden",
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent)",
                    animation: `${shimmer} 1.5s linear infinite`,
                  },
                }}
              />
              <Typography variant="h5" fontWeight={900}>
                Loading recent properties
              </Typography>
              <Typography color="text.secondary">
                Pulling in the newest listings for the homepage.
              </Typography>
            </Stack>
          </Box>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                md: "repeat(3, minmax(0, 1fr))",
              },
              gap: { xs: 2, sm: 3, md: 4 },
              justifyItems: "center",
            }}
          >
            {Array.from({ length: 3 }).map((_, index) => (
              <Paper
                key={index}
                elevation={0}
                sx={{
                  width: "100%",
                  maxWidth: { xs: 380, sm: "none" },
                  minHeight: 392,
                  borderRadius: 2,
                  overflow: "hidden",
                  border: "1px solid #e5e7eb",
                  position: "relative",
                  background: "#fff",
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "35%",
                    height: "100%",
                    background:
                      "linear-gradient(90deg, transparent, rgba(255,255,255,0.68), transparent)",
                    animation: `${shimmer} 1.45s linear infinite`,
                  },
                }}
              >
                <Box sx={{ height: 186, bgcolor: "#e2e8f0" }} />
                <Box sx={{ p: 2.25 }}>
                  <Box sx={{ height: 26, width: "72%", bgcolor: "#e2e8f0", borderRadius: 1, mb: 1.5 }} />
                  <Box sx={{ height: 16, width: "54%", bgcolor: "#edf2f7", borderRadius: 1, mb: 2 }} />
                  <Box sx={{ height: 28, width: "38%", bgcolor: "#dbeafe", borderRadius: 1, mb: 2 }} />
                  <Box sx={{ display: "flex", gap: 1.5 }}>
                    <Box sx={{ height: 16, width: 70, bgcolor: "#edf2f7", borderRadius: 1 }} />
                    <Box sx={{ height: 16, width: 74, bgcolor: "#edf2f7", borderRadius: 1 }} />
                  </Box>
                </Box>
              </Paper>
            ))}
          </Box>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          py: { xs: 4, sm: 6, md: 8 },
          backgroundColor: "background.default",
          textAlign: "center",
        }}
      >
        <Typography color="error" variant="h6">
          Error loading properties: {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        py: { xs: 4, sm: 6, md: 8 },
        backgroundColor: "background.default",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <Reveal>
          <Box
            sx={{
              mb: { xs: 4, sm: 5, md: 6 },
              textAlign: "center",
              maxWidth: "800px",
              mx: "auto",
            }}
          >
          <Typography
            variant="h3"
            component="h2"
            sx={{
              mb: 2,
              fontWeight: 700,
              fontSize: { xs: "1.75rem", sm: "2rem", md: "2.5rem" },
            }}
          >
            Recent Properties
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{
              mb: { xs: 3, sm: 4 },
              fontSize: { xs: "0.875rem", sm: "1rem", md: "1.25rem" },
              px: { xs: 2, sm: 0 },
            }}
          >
            Discover our latest property listings
          </Typography>
          </Box>
        </Reveal>

        {properties.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: 8,
            }}
          >
            <Typography variant="h6" color="text.secondary">
              No properties available at the moment
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Check back soon for new listings
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                md: "repeat(3, minmax(0, 1fr))",
              },
              gap: { xs: 2, sm: 3, md: 4 },
              justifyItems: "center",
            }}
          >
            {properties.slice(0, 3).map((property, index) => (
              <Box
                key={property._id}
                sx={{
                  width: "100%",
                  maxWidth: { xs: 380, sm: "none" },
                }}
              >
                <Reveal delay={(index % 4) * 80}>
                  <Box
                    sx={{
                      width: "100%",
                      height: "100%",
                    }}
                  >
                    <PropertyCard
                      property={property}
                      isFavorite={favorites.includes(property._id)}
                      onFavoriteToggle={() => toggleFavorite(property._id)}
                    />
                  </Box>
                </Reveal>
              </Box>
            ))}
          </Box>
        )}

        <Box
          sx={{
            mt: { xs: 4, sm: 5, md: 6 },
            textAlign: "center",
          }}
        >
          <Button
            variant="outlined"
            size="large"
            endIcon={<ArrowForward />}
            href="/properties"
            sx={{
              px: { xs: 3, sm: 4 },
              py: { xs: 1, sm: 1.5 },
              borderRadius: 2,
              fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" },
            }}
          >
            View All Properties
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
