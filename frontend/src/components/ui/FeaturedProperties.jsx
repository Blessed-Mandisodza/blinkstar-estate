import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Skeleton,
  Typography,
} from "@mui/material";
import { ArrowForward } from "@mui/icons-material";
import PropertyCard from "../property/PropertyCard";
import { useAuth } from "../../context/AuthContext";
import { apiFetch, authFetch } from "../../utils/authFetch";
import Reveal from "./Reveal";

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
            <Skeleton
              variant="text"
              width={260}
              height={52}
              sx={{ mx: "auto" }}
            />
            <Skeleton
              variant="text"
              width={320}
              height={28}
              sx={{ mx: "auto", maxWidth: "80%" }}
            />
          </Box>
          <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
            {Array.from({ length: 3 }).map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: 2,
                    overflow: "hidden",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <Skeleton variant="rectangular" height={180} />
                  <Box sx={{ p: 2 }}>
                    <Skeleton variant="text" height={30} />
                    <Skeleton variant="text" width="70%" />
                    <Skeleton variant="text" width="45%" height={32} />
                    <Skeleton variant="text" width="60%" />
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
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
          <Grid
            container
            spacing={{ xs: 2, sm: 3, md: 4 }}
            justifyContent="center"
            alignItems="stretch"
          >
            {properties.slice(0, 3).map((property, index) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                key={property._id}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Reveal delay={(index % 4) * 80}>
                  <Box
                    sx={{
                      width: "100%",
                      maxWidth: { xs: "400px", sm: "100%" },
                    }}
                  >
                    <PropertyCard
                      property={property}
                      isFavorite={favorites.includes(property._id)}
                      onFavoriteToggle={() => toggleFavorite(property._id)}
                    />
                  </Box>
                </Reveal>
              </Grid>
            ))}
          </Grid>
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
