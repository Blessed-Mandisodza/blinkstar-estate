import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Box,
  Typography,
  Card,
  CardMedia,
  Button,
  Grid,
  Paper,
  Divider,
  Chip,
  Container,
  IconButton,
  Dialog,
  DialogContent,
  DialogActions,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  LocationOn,
  KingBed,
  Bathtub,
  AspectRatio,
  Edit,
  Delete,
  ArrowBack,
  Close,
  NavigateBefore,
  NavigateNext,
} from "@mui/icons-material";
import Loader from "../ui/Loader";
import { apiFetch, authFetch, resolveMediaUrl } from "../../utils/authFetch";

const getImageUrl = (img) => {
  if (!img) return "";
  if (img.startsWith("http")) return img;
  return resolveMediaUrl(img.startsWith("/uploads") ? img : `/uploads/${img}`);
};

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    apiFetch(`/api/property/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProperty(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleImageClick = (index) => {
    setSelectedImageIndex(index);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handlePrev = () => {
    setSelectedImageIndex((prev) =>
      prev === 0 ? property.images.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setSelectedImageIndex((prev) =>
      prev === property.images.length - 1 ? 0 : prev + 1
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={8}>
        <Loader size="large" />
      </Box>
    );
  }
  if (!property) return <Typography>Property not found.</Typography>;

  const isOwner =
    user && property.listedBy && user._id === property.listedBy._id;

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this property?"))
      return;
    try {
      const res = await authFetch(`/api/property/${property._id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete property");
      navigate("/properties");
    } catch (err) {
      alert("Error deleting property");
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
          <ArrowBack />
        </IconButton>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 700,
            display: "inline-block",
            verticalAlign: "middle",
          }}
        >
          {property.title}
        </Typography>
      </Box>

      {/* Image Gallery */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {property.images &&
          property.images.map((img, idx) => (
            <Grid
              item
              xs={12}
              sm={idx === 0 ? 12 : 6}
              md={idx === 0 ? 12 : 4}
              key={idx}
            >
              <Card
                sx={{
                  borderRadius: 2,
                  overflow: "hidden",
                  boxShadow: 3,
                  cursor: "pointer",
                }}
                onClick={() => handleImageClick(idx)}
              >
                <CardMedia
                  component="img"
                  height={idx === 0 ? "400" : "250"}
                  image={getImageUrl(img)}
                  alt={property.title}
                  sx={{
                    objectFit: "cover",
                    transition: "transform 0.3s",
                    "&:hover": {
                      transform: "scale(1.03)",
                    },
                  }}
                />
              </Card>
            </Grid>
          ))}
      </Grid>

      {/* Image Modal */}
      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            backgroundColor: "transparent",
            boxShadow: "none",
            overflow: "visible",
          },
        }}
      >
        <DialogContent sx={{ p: 0, position: "relative" }}>
          <IconButton
            onClick={handleCloseModal}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: "white",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              zIndex: 1,
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.7)",
              },
            }}
          >
            <Close />
          </IconButton>

          <IconButton
            onClick={handlePrev}
            sx={{
              position: "absolute",
              left: 8,
              top: "50%",
              color: "white",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              zIndex: 1,
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.7)",
              },
            }}
          >
            <NavigateBefore />
          </IconButton>

          <IconButton
            onClick={handleNext}
            sx={{
              position: "absolute",
              right: 8,
              top: "50%",
              color: "white",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              zIndex: 1,
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.7)",
              },
            }}
          >
            <NavigateNext />
          </IconButton>

          <CardMedia
            component="img"
            image={getImageUrl(property.images[selectedImageIndex])}
            alt={`${property.title} - Image ${selectedImageIndex + 1}`}
            sx={{
              width: "100%",
              maxHeight: "80vh",
              objectFit: "contain",
            }}
          />
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: "center",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            color: "white",
          }}
        >
          <Typography>
            {selectedImageIndex + 1} / {property.images.length}
          </Typography>
        </DialogActions>
      </Dialog>

      {/* Rest of the content remains the same */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper
            elevation={0}
            sx={{ p: 3, mb: 3, borderRadius: 2, border: "1px solid #e0e0e0" }}
          >
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
              Property Details
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
                ${property.price.toLocaleString()}
              </Typography>
              {property.propertyType && (
                <Chip
                  label={
                    property.propertyType === "rent"
                      ? "For Rent"
                      : property.propertyType === "sale"
                      ? "For Sale"
                      : property.propertyType
                  }
                  sx={{
                    ml: 2,
                    bgcolor: "primary.light",
                    color: "primary.contrastText",
                    fontWeight: 500,
                  }}
                />
              )}
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
              <LocationOn color="action" sx={{ mr: 1 }} />
              <Typography variant="body1">{property.location}</Typography>
            </Box>

            <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
              {property.description}
            </Typography>

            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={6} sm={3}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <KingBed sx={{ mr: 1, color: "primary.main" }} />
                  <Typography>{property.bedrooms} Bedrooms</Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Bathtub sx={{ mr: 1, color: "primary.main" }} />
                  <Typography>{property.bathrooms} Bathrooms</Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <AspectRatio sx={{ mr: 1, color: "primary.main" }} />
                  <Typography>
                    {property.area.toLocaleString()} sq ft
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {isOwner && (
            <Paper
              elevation={0}
              sx={{ p: 3, mb: 3, borderRadius: 2, border: "1px solid #e0e0e0" }}
            >
              <Typography variant="h6" sx={{ mb: 2 }}>
                Manage Your Property
              </Typography>
              <Box>
                <Button
                  variant="contained"
                  startIcon={<Edit />}
                  onClick={() => navigate(`/property/edit/${property._id}`)}
                  sx={{ mr: 2, px: 3 }}
                >
                  Edit
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Delete />}
                  onClick={handleDelete}
                  sx={{ px: 3 }}
                >
                  Delete
                </Button>
              </Box>
            </Paper>
          )}
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper
            elevation={3}
            sx={{ p: 3, borderRadius: 2, position: isMobile ? 'static' : 'sticky', top: 20, mb: 3 }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Contact About This Property
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Button
                variant="contained"
                color="success"
                href={`https://api.whatsapp.com/send?phone=263782931905&text=Hi BlinkStar Properties, I would like to get more information about this property: ${window.location.href}`}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ mb: 1 }}
              >
                WhatsApp
              </Button>
              <Button
                variant="outlined"
                color="primary"
                href="tel:+263782931905"
                sx={{ mb: 1 }}
              >
                Call
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                href="mailto:blinkstardesigns@gmail.com"
              >
                Email
              </Button>
            </Box>
          </Paper>

          {/* Property Highlights */}
          <Paper
            elevation={3}
            sx={{ p: 3, borderRadius: 2, mt: 3 }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Property Highlights
            </Typography>
            <Box sx={{ '& > *:not(:last-child)': { mb: 1 } }}>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Property Type:
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {property.propertyType?.charAt(0).toUpperCase() + property.propertyType?.slice(1) || 'N/A'}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Year Built:
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {property.yearBuilt || 'N/A'}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Garage:
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {property.garage ? `${property.garage} spaces` : 'No'}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Property details content */}
      </Container>
    </Container>
  );
};

export default PropertyDetail;
