import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Button,
  Paper,
  Skeleton,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import PropertyCard from "./PropertyCard";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
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
  "maxBedrooms",
  "minBathrooms",
  "maxBathrooms",
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

const PropertyList = ({
  filters = {},
  desktopColumns = 4,
  pageSizeOverride,
  comparedProperties = [],
  onCompareToggle,
  compareLimit = 3,
  showContactInfo = true,
}) => {
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
  const pageSize = pageSizeOverride || (isMobile ? 8 : 16);
  const skeletonCount = Math.min(pageSize, isMobile ? 4 : desktopColumns * 2);

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
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            md: `repeat(${desktopColumns}, minmax(0, 1fr))`,
          },
          gap: { xs: 2.5, md: 4 },
        }}
      >
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <Paper
            key={index}
            elevation={0}
            sx={{
              overflow: "hidden",
              borderRadius: 2,
              border: "1px solid #e5e7eb",
              minHeight: 370,
            }}
          >
            <Skeleton variant="rectangular" height={180} animation="wave" />
            <Box sx={{ p: 2 }}>
              <Skeleton variant="text" height={34} width="84%" animation="wave" />
              <Skeleton variant="text" height={22} width="56%" animation="wave" />
              <Skeleton
                variant="text"
                height={34}
                width="42%"
                animation="wave"
                sx={{ mt: 0.75 }}
              />
              <Box sx={{ display: "flex", gap: 2, mt: 1.5 }}>
                <Skeleton variant="text" height={22} width={70} animation="wave" />
                <Skeleton variant="text" height={22} width={74} animation="wave" />
              </Box>
            </Box>
          </Paper>
        ))}
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
    const hasActiveFilters = queryKeys.some((key) => Boolean(filters[key]));

    return (
      <Box textAlign="center" py={8} color="text.secondary">
        <SentimentDissatisfiedIcon sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h5" fontWeight={600} mb={1}>
          No properties found
        </Typography>
        <Typography variant="body1">
          {hasActiveFilters
            ? "Try adjusting your search or filter criteria."
            : "There are no listings to show right now."}
        </Typography>
        <Box
          sx={{
            mt: 2.5,
            display: "flex",
            gap: 1.5,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Button component={Link} to="/properties" variant="contained">
            Browse All Properties
          </Button>
          <Button component={Link} to="/map" variant="outlined">
            Open Map Search
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            md: `repeat(${desktopColumns}, minmax(0, 1fr))`,
          },
          gap: { xs: 2.5, md: 4 },
        }}
      >
        {properties.map((property) => (
          <Box key={property._id} sx={{ minWidth: 0 }}>
            <Link
              to={`/property/${property._id}`}
              style={{
                textDecoration: "none",
                display: "block",
                width: "100%",
                height: "100%",
              }}
            >
              <PropertyCard
                property={property}
                isFavorite={favorites.includes(property._id)}
                onFavoriteToggle={() => toggleFavorite(property._id)}
                isCompared={comparedProperties.some((item) => item._id === property._id)}
                onCompareToggle={
                  onCompareToggle ? () => onCompareToggle(property) : undefined
                }
                compareDisabled={
                  !comparedProperties.some((item) => item._id === property._id) &&
                  comparedProperties.length >= compareLimit
                }
                showCompareAction={Boolean(onCompareToggle)}
                showContactInfo={showContactInfo}
              />
            </Link>
          </Box>
        ))}
      </Box>
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
