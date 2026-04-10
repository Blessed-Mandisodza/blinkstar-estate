import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Grid, Box, Typography } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import PropertyCard from "./PropertyCard";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import Loader from "../ui/Loader";
import { apiFetch, authFetch } from "../../utils/authFetch";

const PropertyList = ({ filters = {} }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    apiFetch("/api/property")
      .then((res) => res.json())
      .then((data) => {
        setProperties(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (user) {
      authFetch("/api/auth/favorites")
        .then((res) => res.json())
        .then((data) => setFavorites(data.favorites?.map((f) => f._id) || []));
    } else {
      setFavorites([]);
    }
  }, [user]);

  const toggleFavorite = async (propertyId) => {
    if (!user) return;
    const res = await authFetch(`/api/auth/favorites/${propertyId}`, {
      method: "POST",
    });
    if (res.ok) {
      const data = await res.json();
      setFavorites(data.favorites);
    }
  };

  const filtered = properties.filter((property) => {
    const search = filters.search?.toLowerCase() || "";
    const matchesSearch =
      property.title.toLowerCase().includes(search) ||
      property.location.toLowerCase().includes(search);
    const matchesType =
      !filters.type ||
      (["rent", "sale"].includes(property.propertyType) &&
        property.propertyType === filters.type);
    const matchesMinPrice =
      !filters.minPrice || property.price >= Number(filters.minPrice);
    const matchesMaxPrice =
      !filters.maxPrice || property.price <= Number(filters.maxPrice);
    const matchesLocation =
      !filters.location ||
      property.location.toLowerCase().includes(filters.location.toLowerCase());
    return (
      matchesSearch &&
      matchesType &&
      matchesMinPrice &&
      matchesMaxPrice &&
      matchesLocation
    );
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={8}>
        <Loader size="large" />
      </Box>
    );
  }

  if (filtered.length === 0) {
    return (
      <Box textAlign="center" py={8} color="text.secondary">
        <SentimentDissatisfiedIcon sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h5" fontWeight={600} mb={1}>
          No properties found
        </Typography>
        <Typography variant="body1">
          Try adjusting your search or filter criteria.
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={4}>
      {filtered.map((property) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={property._id}>
          <Link
            to={`/property/${property._id}`}
            style={{ textDecoration: "none" }}
          >
            <PropertyCard
              property={property}
              isFavorite={favorites.includes(property._id)}
              onFavoriteToggle={
                user
                  ? () => toggleFavorite(property._id)
                  : undefined
              }
            />
          </Link>
        </Grid>
      ))}
    </Grid>
  );
};

export default PropertyList;
