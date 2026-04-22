import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Grid, Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import PropertyCard from "./PropertyCard";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import Loader from "../ui/Loader";
import { apiFetch, authFetch } from "../../utils/authFetch";

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

const buildPropertyQuery = (filters, extra = {}) => {
  const params = new URLSearchParams();

  [...queryKeys, ...Object.keys(extra)].forEach((key) => {
    const value = extra[key] ?? filters[key];
    if (!value) return;
    params.set(key, value);
  });

  return params.toString();
};

const PropertyList = ({ filters = {} }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const pageSize = isMobile ? 8 : 16;

  useEffect(() => {
    setPage(1);
    setProperties([]);
  }, [filters, pageSize]);

  useEffect(() => {
    const controller = new AbortController();
    const query = buildPropertyQuery(filters, {
      includeMeta: "true",
      page,
      limit: pageSize,
    });
    const endpoint = query ? `/api/property?${query}` : "/api/property";

    if (page === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError("");

    apiFetch(endpoint, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load properties");
        return res.json();
      })
      .then((data) => {
        const nextProperties = Array.isArray(data)
          ? data
          : data.properties || [];
        setProperties((current) =>
          page === 1 ? nextProperties : [...current, ...nextProperties]
        );
        setTotalPages(Array.isArray(data) ? 1 : data.totalPages || 1);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setError(err.message || "Failed to load properties");
        if (page === 1) setProperties([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
          setLoadingMore(false);
        }
      });

    return () => controller.abort();
  }, [filters, page, pageSize]);

  useEffect(() => {
    if (user) {
      authFetch("/api/auth/favorites")
        .then((res) => res.json())
        .then((data) =>
          setFavorites(
            data.favorites?.map((f) => (typeof f === "string" ? f : f._id)) || []
          )
        );
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
    <>
      <Grid container spacing={{ xs: 2.5, md: 4 }}>
        {properties.map((property) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={property._id}>
            <Link
              to={`/property/${property._id}`}
              style={{ textDecoration: "none" }}
            >
              <PropertyCard
                property={property}
                isFavorite={favorites.includes(property._id)}
                onFavoriteToggle={() => toggleFavorite(property._id)}
              />
            </Link>
          </Grid>
        ))}
      </Grid>
      {page < totalPages && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Button
            variant="contained"
            onClick={() => setPage((current) => current + 1)}
            disabled={loadingMore}
            sx={{ minWidth: 160, fontWeight: 700 }}
          >
            {loadingMore ? "Loading..." : "Load More"}
          </Button>
        </Box>
      )}
    </>
  );
};

export default PropertyList;
