import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import Header from "../ui/Header";
import SeoHead from "../ui/SeoHead";
import { resolveMediaUrl } from "../../utils/authFetch";
import {
  clearComparedProperties,
  comparePropertiesUpdatedEventName,
  removeComparedProperty,
  readComparedProperties,
} from "../../utils/compareProperties";

const getImageUrl = (img) => {
  if (!img) return "";
  if (img.startsWith("http") || img.startsWith("data:") || img.startsWith("blob:")) {
    return img;
  }
  return resolveMediaUrl(img.startsWith("/uploads") ? img : `/uploads/${img}`);
};

const formatPrice = (price) => {
  const amount = Number(price);
  return Number.isFinite(amount) ? `$${amount.toLocaleString()}` : "Price on request";
};

const formatLabel = (value) => {
  if (!value) return "N/A";
  return String(value)
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const comparisonFields = [
  {
    key: "status",
    label: "Status",
    render: (property) => property.status || "N/A",
  },
  {
    key: "propertyType",
    label: "Type",
    render: (property) => formatLabel(property.propertyType),
  },
  {
    key: "bedrooms",
    label: "Bedrooms",
    render: (property) => property.bedrooms || "N/A",
  },
  {
    key: "bathrooms",
    label: "Bathrooms",
    render: (property) => property.bathrooms || "N/A",
  },
  {
    key: "area",
    label: "Area",
    render: (property) =>
      property.area ? `${Number(property.area).toLocaleString()} sq ft` : "N/A",
  },
  {
    key: "furnished",
    label: "Furnished",
    render: (property) => formatLabel(property.furnished),
  },
  {
    key: "description",
    label: "Description",
    render: (property) =>
      property.description
        ? `${String(property.description).slice(0, 150)}${property.description.length > 150 ? "..." : ""}`
        : "N/A",
  },
];

export default function CompareProperties() {
  const [properties, setProperties] = useState(() => readComparedProperties());

  useEffect(() => {
    const syncProperties = () => {
      setProperties(readComparedProperties());
    };

    window.addEventListener(comparePropertiesUpdatedEventName, syncProperties);
    window.addEventListener("storage", syncProperties);

    return () => {
      window.removeEventListener(comparePropertiesUpdatedEventName, syncProperties);
      window.removeEventListener("storage", syncProperties);
    };
  }, []);

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      <SeoHead
        title="Compare Properties | BlinkStar Properties"
        description="Review selected property listings side by side."
      />
      <Header />
      <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={2}
          sx={{ mb: 3 }}
        >
          <Box>
            <Button
              component={Link}
              to="/properties"
              startIcon={<ArrowBackIcon />}
              sx={{ mb: 1 }}
            >
              Back to Properties
            </Button>
            <Stack direction="row" spacing={1} alignItems="center">
              <CompareArrowsIcon color="primary" />
              <Typography variant="h4" fontWeight={900}>
                Compare Properties
              </Typography>
            </Stack>
            <Typography color="text.secondary" sx={{ mt: 0.75 }}>
              Review the details that matter most without jumping between pages.
            </Typography>
          </Box>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ width: { xs: "100%", md: "auto" } }}>
            <Chip
              color={properties.length >= 2 ? "primary" : "default"}
              label={`${properties.length} selected`}
              sx={{ fontWeight: 700 }}
            />
            <Button
              variant="outlined"
              color="inherit"
              disabled={!properties.length}
              onClick={() => {
                clearComparedProperties();
                setProperties([]);
              }}
            >
              Clear All
            </Button>
          </Stack>
        </Stack>

        {properties.length === 0 && (
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 3,
              border: "1px solid #e5e7eb",
              textAlign: "center",
            }}
          >
            <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>
              No properties selected yet
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2.5 }}>
              Select at least two listings from the properties page to compare
              them side by side here.
            </Typography>
            <Button component={Link} to="/properties" variant="contained">
              Browse Properties
            </Button>
          </Paper>
        )}

        {properties.length === 1 && (
          <Alert severity="info" sx={{ mb: 2.5 }}>
            Add one more property to see a full side-by-side comparison.
          </Alert>
        )}

        {properties.length > 0 && (
          <Box sx={{ overflowX: "auto", pb: 1 }}>
            <Box
              sx={{
                minWidth: Math.max(720, 220 + properties.length * 280),
                display: "grid",
                gridTemplateColumns: `220px repeat(${properties.length}, minmax(260px, 1fr))`,
                borderRadius: 3,
                overflow: "hidden",
                border: "1px solid #dbe2ea",
                backgroundColor: "#ffffff",
              }}
            >
              <Box
                sx={{
                  p: 3,
                  backgroundColor: "#0f172a",
                  color: "#ffffff",
                  borderRight: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                <Typography variant="overline" sx={{ opacity: 0.8 }}>
                  Selected Listings
                </Typography>
                <Typography variant="h6" fontWeight={800}>
                  Property Snapshot
                </Typography>
              </Box>

              {properties.map((property) => (
                <Box
                  key={property._id}
                  sx={{
                    p: 2.5,
                    borderLeft: "1px solid #eef2f7",
                    background:
                      "linear-gradient(180deg, rgba(248,250,252,0.92), rgba(255,255,255,1))",
                  }}
                >
                  <Box sx={{ position: "relative", mb: 2 }}>
                    <Box
                      component="img"
                      src={getImageUrl(
                        (property.images && property.images[0]) || property.imageUrl
                      )}
                      alt={property.title || "Property"}
                      sx={{
                        width: "100%",
                        height: 180,
                        objectFit: "cover",
                        borderRadius: 2,
                        bgcolor: "grey.100",
                      }}
                    />
                    <IconButton
                      aria-label="remove from compare"
                      size="small"
                      onClick={() => removeComparedProperty(property._id)}
                      sx={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        backgroundColor: "rgba(255,255,255,0.92)",
                        "&:hover": {
                          backgroundColor: "rgba(255,255,255,1)",
                        },
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: "wrap" }}>
                    {property.status && (
                      <Chip
                        size="small"
                        label={property.status}
                        color={property.status === "For Sale" ? "success" : "primary"}
                      />
                    )}
                    {property.propertyType && (
                      <Chip
                        size="small"
                        variant="outlined"
                        label={formatLabel(property.propertyType)}
                      />
                    )}
                  </Stack>
                  <Typography
                    variant="h6"
                    fontWeight={800}
                    sx={{
                      minHeight: 56,
                      display: "-webkit-box",
                      WebkitBoxOrient: "vertical",
                      WebkitLineClamp: 2,
                      overflow: "hidden",
                    }}
                  >
                    {property.title || "Untitled property"}
                  </Typography>
                  <Typography color="text.secondary" sx={{ mt: 0.75, minHeight: 48 }}>
                    {property.location || "No location provided"}
                  </Typography>
                  <Typography variant="h5" color="primary" fontWeight={900} sx={{ mt: 1.5 }}>
                    {formatPrice(property.price)}
                  </Typography>
                  <Button
                    component={Link}
                    to={`/property/${property._id}`}
                    variant="outlined"
                    sx={{ mt: 2, fontWeight: 700 }}
                  >
                    View Property
                  </Button>
                </Box>
              ))}

              {comparisonFields.map((field) => (
                <React.Fragment key={field.key}>
                  <Box
                    sx={{
                      p: 2.25,
                      borderTop: "1px solid #eef2f7",
                      backgroundColor: "#f8fafc",
                    }}
                  >
                    <Typography variant="subtitle2" color="text.secondary" fontWeight={800}>
                      {field.label}
                    </Typography>
                  </Box>
                  {properties.map((property) => (
                    <Box
                      key={`${property._id}-${field.key}`}
                      sx={{
                        p: 2.25,
                        borderTop: "1px solid #eef2f7",
                        borderLeft: "1px solid #eef2f7",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Typography sx={{ lineHeight: 1.65, overflowWrap: "anywhere" }}>
                        {field.render(property)}
                      </Typography>
                    </Box>
                  ))}
                </React.Fragment>
              ))}
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
}
