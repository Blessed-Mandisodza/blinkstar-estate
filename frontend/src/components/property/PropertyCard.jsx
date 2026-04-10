import React from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Stack,
  IconButton,
  Tooltip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import HotelIcon from "@mui/icons-material/Hotel";
import BathtubIcon from "@mui/icons-material/Bathtub";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { resolveMediaUrl } from "../../utils/authFetch";

const getImageUrl = (img) => {
  if (!img) return "";
  if (img.startsWith("http")) return img;
  return resolveMediaUrl(img.startsWith("/uploads") ? img : `/uploads/${img}`);
};

const formatPrice = (price) => {
  if (!price) return "";
  return `$${price.toLocaleString()}`;
};

const PropertyCard = ({ property, isFavorite, onFavoriteToggle }) => {
  const navigate = useNavigate();

  const handleCardClick = (e) => {
    // Don't navigate if clicking on favorite button
    if (e.target.closest("button")) {
      return;
    }
    navigate(`/property/${property._id}`);
  };

  if (!property) {
    return null;
  }
  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: 3,
        position: "relative",
        overflow: "visible",
        minHeight: 370,
        cursor: "pointer",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 6,
        },
      }}
      onClick={handleCardClick}
    >
      <Box sx={{ position: "relative" }}>
        <CardMedia
          component="img"
          height="180"
          image={getImageUrl(
            (property.images && property.images[0]) || property.imageUrl
          )}
          alt={property.title || "Property"}
          sx={{
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            objectFit: "cover",
          }}
        />
        {property.status && (
          <Chip
            label={property.status}
            color={property.status === "For Sale" ? "success" : "primary"}
            size="small"
            sx={{ position: "absolute", top: 12, left: 12, fontWeight: 600 }}
          />
        )}
        {onFavoriteToggle && (
          <Tooltip
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <IconButton
              aria-label="favorite"
              onClick={(e) => {
                e.stopPropagation();
                onFavoriteToggle();
              }}
              sx={{
                position: "absolute",
                top: 12,
                right: 12,
                color: "red",
                zIndex: 2,
              }}
            >
              {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            </IconButton>
          </Tooltip>
        )}
      </Box>
      <CardContent>
        <Typography variant="h6" fontWeight={700} gutterBottom noWrap>
          {property.title}
        </Typography>
        <Stack direction="row" alignItems="center" spacing={1} mb={1}>
          <LocationOnIcon fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary" noWrap>
            {property.location}
          </Typography>
        </Stack>
        <Typography variant="h5" color="primary" fontWeight={700} mb={1}>
          {formatPrice(property.price)}
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <Stack direction="row" spacing={0.5} alignItems="center">
            <HotelIcon fontSize="small" />
            <Typography variant="body2">
              {property.bedrooms || property.beds} Beds
            </Typography>
          </Stack>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <BathtubIcon fontSize="small" />
            <Typography variant="body2">
              {property.bathrooms || property.baths} Baths
            </Typography>
          </Stack>
        </Stack>
        {/* Contact Info Section */}
        {(property.contactName ||
          property.contactPhone ||
          property.contactEmail) && (
          <Box
            mt={2}
            p={1.5}
            sx={{
              background: "#f5f7fa",
              borderRadius: 2,
              border: "1px solid #e0e0e0",
            }}
          >
            <Typography
              variant="subtitle2"
              fontWeight={600}
              color="primary"
              gutterBottom
            >
              Contact
            </Typography>
            {property.contactName && (
              <Typography variant="body2" color="text.primary">
                {property.contactName}
              </Typography>
            )}
            {property.contactPhone && (
              <Typography variant="body2" color="text.primary">
                {property.contactPhone}
              </Typography>
            )}
            {property.contactEmail && (
              <Typography variant="body2" color="text.primary">
                {property.contactEmail}
              </Typography>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default PropertyCard;
