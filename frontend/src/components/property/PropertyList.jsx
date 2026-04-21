import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Grid, Box, Typography } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import PropertyCard from "./PropertyCard";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import Loader from "../ui/Loader";
import { apiFetch, authFetch } from "../../utils/authFetch";

const queryKeys = [
  "search",
  "type",
  "location",
  "minPrice",
  "maxPrice",
  "minBedrooms",
  "minBathrooms",
  "minArea",
  "maxArea",
  "sort",
  "status",
  "furnished",
];

const buildPropertyQuery = (filters) => {
  const params = new URLSearchParams();

  queryKeys.forEach((key) => {
    const value = filters[key];
    if (!value) return;
    params.set(key, value);
  });

  return params.toString();
};

const PropertyList = ({ filters = {} }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [favorites, setFavorites] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const controller = new AbortController();
    const query = buildPropertyQuery(filters);
    const endpoint = query ? `/api/property?${query}` : "/api/property";

    setLoading(true);
    setError("");

    apiFetch(endpoint, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load properties");
        return res.json();
      })
      .then((data) => {
        setProperties(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setError(err.message || "Failed to load properties");
        setProperties([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [filters]);

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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={8}>
        <Loader size="large" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" py={8} color="error.main">
        <Typography variant="h5" fontWeight={600} mb={1}>
          Could not load properties
        </Typography>
        <Typography variant="body1">{error}</Typography>
      </Box>
    );
  }

  if (properties.length === 0) {
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
      {properties.map((property) => (
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
