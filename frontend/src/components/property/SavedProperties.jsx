import React, { useEffect, useState } from "react";
import { Box, Button, Container, Grid, Typography, Alert } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import Header from "../ui/Header";
import Loader from "../ui/Loader";
import PropertyCard from "./PropertyCard";
import { authFetch } from "../../utils/authFetch";

export default function SavedProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchFavorites = () => {
    setLoading(true);
    setError("");

    authFetch("/api/auth/favorites")
      .then((res) => res.json())
      .then((data) => {
        setProperties(data.favorites || []);
      })
      .catch((err) => setError(err.message || "Could not load saved properties"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const removeFavorite = async (propertyId) => {
    const res = await authFetch(`/api/auth/favorites/${propertyId}`, {
      method: "POST",
    });

    if (res.ok) {
      setProperties((current) =>
        current.filter((property) => property._id !== propertyId)
      );
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f6f8fb" }}>
      <Header />
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight={800}>
            Saved Properties
          </Typography>
          <Typography color="text.secondary">
            {properties.length} saved listing
            {properties.length === 1 ? "" : "s"}
          </Typography>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" py={8}>
            <Loader size="large" />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : properties.length === 0 ? (
          <Box textAlign="center" py={8}>
            <FavoriteIcon color="disabled" sx={{ fontSize: 64, mb: 2 }} />
            <Typography variant="h6" fontWeight={700}>
              No saved properties yet.
            </Typography>
            <Button href="/properties" variant="contained" sx={{ mt: 2 }}>
              Browse Properties
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {properties.map((property) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={property._id}>
                <PropertyCard
                  property={property}
                  isFavorite
                  onFavoriteToggle={() => removeFavorite(property._id)}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}
