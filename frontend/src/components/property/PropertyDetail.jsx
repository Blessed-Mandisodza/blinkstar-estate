import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Grid,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  ArrowBack,
  AspectRatio,
  Bathtub,
  Close,
  Delete,
  Edit,
  Email,
  EventAvailable,
  Favorite,
  FavoriteBorder,
  HomeWork,
  KingBed,
  LocationOn,
  NavigateBefore,
  NavigateNext,
  Phone,
  PhotoLibrary,
  Share,
  WhatsApp,
} from "@mui/icons-material";
import Header from "../ui/Header";
import Loader from "../ui/Loader";
import PropertyCard from "./PropertyCard";
import ContactForm from "./ContactForm";
import { apiFetch, authFetch, resolveMediaUrl } from "../../utils/authFetch";

const FALLBACK_CONTACT = {
  email: "blinkstardesigns@gmail.com",
  phone: "+263782931905",
  whatsapp: "263782931905",
};

const getImageUrl = (img) => {
  if (!img) return "";
  if (img.startsWith("http") || img.startsWith("data:") || img.startsWith("blob:")) {
    return img;
  }
  return resolveMediaUrl(img.startsWith("/uploads") ? img : `/uploads/${img}`);
};

const formatPrice = (price) => {
  const amount = Number(price);
  if (!Number.isFinite(amount)) return "Price on request";
  return `$${amount.toLocaleString()}`;
};

const formatLabel = (value) => {
  if (!value) return "N/A";
  return String(value)
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const normalizeWhatsAppPhone = (phone) => {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return FALLBACK_CONTACT.whatsapp;
  if (digits.startsWith("0")) return `263${digits.slice(1)}`;
  return digits;
};

const GalleryTile = ({ image, alt, onOpen, sx, children }) => (
  <Box
    role="button"
    tabIndex={0}
    onClick={onOpen}
    onKeyDown={(event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onOpen();
      }
    }}
    sx={{
      position: "relative",
      overflow: "hidden",
      borderRadius: 2,
      bgcolor: "grey.100",
      cursor: "pointer",
      isolation: "isolate",
      outline: "none",
      "&:focus-visible": {
        boxShadow: "0 0 0 3px rgba(25, 118, 210, 0.35)",
      },
      "&:hover img": {
        transform: "scale(1.035)",
      },
      ...sx,
    }}
  >
    <Box
      component="img"
      src={getImageUrl(image)}
      alt={alt}
      sx={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        display: "block",
        transition: "transform 220ms ease",
      }}
    />
    {children}
  </Box>
);

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [similarProperties, setSimilarProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [contactIntent, setContactIntent] = useState("general");
  const [shareMessage, setShareMessage] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const contactSectionRef = useRef(null);
  const agentCardRef = useRef(null);
  const [agentCardHeight, setAgentCardHeight] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isOwner =
    user && property?.listedBy && user._id === property.listedBy._id;
  const contactEmail =
    property?.contactEmail || property?.listedBy?.email || FALLBACK_CONTACT.email;
  const contactPhone = property?.contactPhone || FALLBACK_CONTACT.phone;
  const agentName =
    property?.contactName || property?.listedBy?.name || "BlinkStar Agent";
  const propertyUrl =
    typeof window !== "undefined" ? window.location.href : "";

  useEffect(() => {
    let isActive = true;

    setLoading(true);
    setProperty(null);
    setSimilarProperties([]);
    setSelectedImageIndex(0);

    apiFetch(`/api/property/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Property not found");
        return res.json();
      })
      .then((data) => {
        if (!isActive) return;
        setProperty(data);
      })
      .catch(() => {
        if (!isActive) return;
        setProperty(null);
      })
      .finally(() => {
        if (isActive) setLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [id]);

  useEffect(() => {
    if (!property?._id) return;

    const params = new URLSearchParams({
      limit: "4",
      sort: "createdAt",
    });

    if (property.propertyType) {
      params.set("type", property.propertyType);
    }

    apiFetch(`/api/property?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        const related = Array.isArray(data)
          ? data.filter((item) => item._id !== property._id).slice(0, 3)
          : [];
        setSimilarProperties(related);
      })
      .catch(() => setSimilarProperties([]));
  }, [property?._id, property?.propertyType]);

  useEffect(() => {
    if (!user || !property?._id) {
      setIsFavorite(false);
      return;
    }

    authFetch("/api/auth/favorites")
      .then((res) => res.json())
      .then((data) => {
        setIsFavorite(
          Boolean(data.favorites?.some((item) => item._id === property._id))
        );
      })
      .catch(() => setIsFavorite(false));
  }, [property?._id, user]);

  useEffect(() => {
    if (isMobile) {
      setAgentCardHeight(null);
      return undefined;
    }

    const card = agentCardRef.current;
    if (!card) return undefined;

    const updateHeight = () => {
      setAgentCardHeight(Math.ceil(card.getBoundingClientRect().height));
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);

    if (typeof ResizeObserver === "undefined") {
      return () => window.removeEventListener("resize", updateHeight);
    }

    const observer = new ResizeObserver(updateHeight);
    observer.observe(card);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, [isMobile, agentName, property?._id]);

  const images = useMemo(() => {
    if (!property) return [];
    const sourceImages = property.images?.length
      ? property.images
      : [property.imageUrl];
    return sourceImages.filter(Boolean);
  }, [property]);

  const selectedImage = images[selectedImageIndex] || images[0];

  const whatsappMessage = property
    ? `Hi BlinkStar Properties, I would like more information about ${property.title} in ${property.location}. ${propertyUrl}`
    : "Hi BlinkStar Properties, I would like more information about a property.";
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${normalizeWhatsAppPhone(
    contactPhone
  )}&text=${encodeURIComponent(whatsappMessage)}`;

  const handleImageClick = (index) => {
    setSelectedImageIndex(index);
    setOpenModal(true);
  };

  const handlePrev = () => {
    if (!images.length) return;
    setSelectedImageIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    if (!images.length) return;
    setSelectedImageIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const handleContactIntent = (intent) => {
    setContactIntent(intent);
    window.setTimeout(() => {
      contactSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  };

  const trackContactAction = (source) => {
    if (!property?._id) return;

    apiFetch(`/api/property/${property._id}/contact-click`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source, pageUrl: propertyUrl }),
    }).catch(() => {});
  };

  const handleShare = async () => {
    if (!propertyUrl) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: property.title,
          text: `${property.title} - ${formatPrice(property.price)}`,
          url: propertyUrl,
        });
      } else {
        await navigator.clipboard.writeText(propertyUrl);
        setShareMessage("Link copied");
        window.setTimeout(() => setShareMessage(""), 2200);
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        setShareMessage("Share unavailable");
        window.setTimeout(() => setShareMessage(""), 2200);
      }
    }
  };

  const handleFavorite = async () => {
    if (!user) {
      navigate("/signin");
      return;
    }

    const res = await authFetch(`/api/auth/favorites/${property._id}`, {
      method: "POST",
    });

    if (res.ok) {
      setIsFavorite((current) => !current);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this property?")) {
      return;
    }

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

  if (loading) {
    return (
      <>
        <Header />
        <Box display="flex" justifyContent="center" alignItems="center" py={8}>
          <Loader size="large" />
        </Box>
      </>
    );
  }

  if (!property) {
    return (
      <>
        <Header />
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)}>
            Back
          </Button>
          <Typography variant="h5" sx={{ mt: 3 }}>
            Property not found.
          </Typography>
        </Container>
      </>
    );
  }

  const quickFacts = [
    {
      icon: <KingBed />,
      label: "Bedrooms",
      value: property.bedrooms || "N/A",
    },
    {
      icon: <Bathtub />,
      label: "Bathrooms",
      value: property.bathrooms || "N/A",
    },
    {
      icon: <AspectRatio />,
      label: "Area",
      value: property.area ? `${Number(property.area).toLocaleString()} sq ft` : "N/A",
    },
    {
      icon: <HomeWork />,
      label: "Type",
      value: formatLabel(property.propertyType),
    },
  ];
  const thumbnailImages = images.slice(1, 5);
  const extraImageCount = Math.max(images.length - 5, 0);

  return (
    <>
      <Header />
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2}
          sx={{ mb: 3 }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate(-1)}
              sx={{ mb: 1 }}
            >
              Back
            </Button>
            <Typography
              variant="h4"
              component="h1"
              fontWeight={800}
              sx={{
                fontSize: { xs: "1.75rem", sm: "2.125rem" },
                overflowWrap: "anywhere",
              }}
            >
              {property.title}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
              <LocationOn color="action" fontSize="small" />
              <Typography color="text.secondary" sx={{ overflowWrap: "anywhere" }}>
                {property.location}
              </Typography>
            </Stack>
          </Box>

          <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
            <Tooltip title={isFavorite ? "Remove saved property" : "Save property"}>
              <IconButton onClick={handleFavorite} aria-label="save property">
                {isFavorite ? <Favorite color="error" /> : <FavoriteBorder />}
              </IconButton>
            </Tooltip>
            <Tooltip title={shareMessage || "Share property"}>
              <IconButton onClick={handleShare} aria-label="share property">
                <Share />
              </IconButton>
            </Tooltip>
            {isOwner && (
              <>
                <Tooltip title="Edit property">
                  <IconButton
                    onClick={() => navigate(`/property/edit/${property._id}`)}
                    aria-label="edit property"
                  >
                    <Edit />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete property">
                  <IconButton
                    color="error"
                    onClick={handleDelete}
                    aria-label="delete property"
                  >
                    <Delete />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Stack>
        </Stack>

        <Paper
          elevation={0}
          sx={{
            border: "1px solid #e5e7eb",
            borderRadius: 2,
            p: { xs: 0.75, sm: 1 },
            mb: 4,
            bgcolor: "background.paper",
          }}
        >
          {images.length > 0 ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: thumbnailImages.length
                    ? "minmax(0, 2fr) minmax(260px, 1fr)"
                    : "1fr",
                },
                gap: { xs: 0.75, sm: 1 },
                alignItems: "stretch",
              }}
            >
              <GalleryTile
                image={images[0]}
                alt={property.title}
                onOpen={() => handleImageClick(0)}
                sx={{
                  aspectRatio: {
                    xs: "4 / 3",
                    sm: "16 / 10",
                    md: thumbnailImages.length ? "16 / 11" : "16 / 7",
                  },
                  minHeight: { xs: 230, sm: 340 },
                  maxHeight: { md: 560 },
                }}
              >
                <Chip
                  icon={<PhotoLibrary />}
                  label={`${images.length} photo${images.length === 1 ? "" : "s"}`}
                  sx={{
                    position: "absolute",
                    left: { xs: 10, sm: 16 },
                    bottom: { xs: 10, sm: 16 },
                    bgcolor: "rgba(255,255,255,0.94)",
                    fontWeight: 800,
                    boxShadow: "0 8px 20px rgba(15, 23, 42, 0.18)",
                    maxWidth: "calc(100% - 20px)",
                  }}
                />
              </GalleryTile>

              {thumbnailImages.length > 0 && (
                <Box
                  sx={{
                    display: { xs: "flex", md: "grid" },
                    gridTemplateColumns: { md: "repeat(2, minmax(0, 1fr))" },
                    gridTemplateRows: {
                      md: `repeat(${Math.min(
                        2,
                        Math.ceil(thumbnailImages.length / 2)
                      )}, minmax(0, 1fr))`,
                    },
                    gap: { xs: 0.75, sm: 1 },
                    overflowX: { xs: "auto", md: "visible" },
                    pb: { xs: 0.25, md: 0 },
                    scrollbarWidth: "thin",
                  }}
                >
                  {thumbnailImages.map((img, idx) => {
                    const imageIndex = idx + 1;
                    const showMoreOverlay =
                      idx === thumbnailImages.length - 1 && extraImageCount > 0;

                    return (
                      <GalleryTile
                        key={`${img}-${idx}`}
                        image={img}
                        alt={`${property.title} ${imageIndex + 1}`}
                        onOpen={() => handleImageClick(imageIndex)}
                        sx={{
                          aspectRatio: { xs: "4 / 3", md: "auto" },
                          flex: {
                            xs: "0 0 min(72vw, 220px)",
                            sm: "0 0 210px",
                            md: "initial",
                          },
                          minHeight: { xs: 126, sm: 140, md: 0 },
                          height: { md: "100%" },
                        }}
                      >
                        {showMoreOverlay && (
                          <Box
                            sx={{
                              position: "absolute",
                              inset: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              bgcolor: "rgba(15, 23, 42, 0.58)",
                              color: "common.white",
                              fontWeight: 900,
                              fontSize: { xs: "1.1rem", sm: "1.35rem" },
                            }}
                          >
                            +{extraImageCount} More
                          </Box>
                        )}
                      </GalleryTile>
                    );
                  })}
                </Box>
              )}
            </Box>
          ) : (
            <Box
              sx={{
                minHeight: { xs: 240, md: 420 },
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "grey.100",
                borderRadius: 2,
              }}
            >
              <Typography color="text.secondary">No photos available</Typography>
            </Box>
          )}
        </Paper>

        <Dialog
          open={openModal}
          onClose={() => setOpenModal(false)}
          maxWidth="lg"
          fullWidth
          fullScreen={isMobile}
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
              onClick={() => setOpenModal(false)}
              aria-label="close gallery"
              sx={{
                position: "absolute",
                right: 12,
                top: 12,
                color: "white",
                backgroundColor: "rgba(0, 0, 0, 0.55)",
                zIndex: 1,
                "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.75)" },
              }}
            >
              <Close />
            </IconButton>

            {images.length > 1 && (
              <>
                <IconButton
                  onClick={handlePrev}
                  aria-label="previous photo"
                  sx={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    color: "white",
                    backgroundColor: "rgba(0, 0, 0, 0.55)",
                    zIndex: 1,
                    "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.75)" },
                  }}
                >
                  <NavigateBefore />
                </IconButton>
                <IconButton
                  onClick={handleNext}
                  aria-label="next photo"
                  sx={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    color: "white",
                    backgroundColor: "rgba(0, 0, 0, 0.55)",
                    zIndex: 1,
                    "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.75)" },
                  }}
                >
                  <NavigateNext />
                </IconButton>
              </>
            )}

            {selectedImage && (
              <Box
                component="img"
                src={getImageUrl(selectedImage)}
                alt={`${property.title} ${selectedImageIndex + 1}`}
                sx={{
                  width: "100%",
                  maxHeight: isMobile ? "100vh" : "82vh",
                  objectFit: "contain",
                  display: "block",
                  bgcolor: "rgba(0,0,0,0.92)",
                }}
              />
            )}
          </DialogContent>
          {images.length > 0 && (
            <DialogActions
              sx={{
                justifyContent: "center",
                backgroundColor: "rgba(0, 0, 0, 0.6)",
                color: "white",
              }}
            >
              <Typography>
                {selectedImageIndex + 1} / {images.length}
              </Typography>
            </DialogActions>
          )}
        </Dialog>

        <Box
          ref={contactSectionRef}
          sx={{
            mb: 4,
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
            gap: 3,
            alignItems: "start",
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Paper
              ref={agentCardRef}
              elevation={3}
              sx={{
                p: { xs: 2.5, md: 3 },
                borderRadius: 2,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Typography
                variant="h6"
                fontWeight={800}
                sx={{ mb: 0.5, overflowWrap: "anywhere" }}
              >
                {agentName}
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                Property Consultant
              </Typography>

              <Stack spacing={1.5}>
                <Button
                  variant="contained"
                  color="success"
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  startIcon={<WhatsApp />}
                  onClick={() => trackContactAction("whatsapp")}
                  fullWidth
                >
                  WhatsApp
                </Button>
                <Button
                  variant="outlined"
                  href={`tel:${contactPhone}`}
                  startIcon={<Phone />}
                  onClick={() => trackContactAction("phone")}
                  fullWidth
                >
                  Call
                </Button>
                <Button
                  variant="outlined"
                  href={`mailto:${contactEmail}?subject=${encodeURIComponent(
                    `Property Inquiry: ${property.title}`
                  )}`}
                  startIcon={<Email />}
                  onClick={() => trackContactAction("email")}
                  fullWidth
                >
                  Email
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<EventAvailable />}
                  onClick={() => handleContactIntent("viewing")}
                  fullWidth
                >
                  Schedule Viewing
                </Button>
              </Stack>
            </Paper>
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <ContactForm
              key={`${property._id}-${contactIntent}`}
              propertyTitle={property.title}
              propertyId={property._id}
              defaultInquiryType={contactIntent}
              sx={{
                mt: 0,
                height: { xs: "auto", md: agentCardHeight || "auto" },
                overflowY: { xs: "visible", md: "auto" },
                boxSizing: "border-box",
                boxShadow: "0 10px 28px rgba(15, 23, 42, 0.12)",
                "& .MuiInputBase-input": {
                  py: 1.15,
                },
                "& textarea.MuiInputBase-input": {
                  py: 0,
                },
              }}
            />
          </Box>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} sx={{ minWidth: 0 }}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, md: 3 },
                mb: 3,
                borderRadius: 2,
                border: "1px solid #e5e7eb",
              }}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
                spacing={2}
                sx={{ mb: 3 }}
              >
                <Box>
                  <Typography
                    variant="h4"
                    color="primary"
                    fontWeight={800}
                    sx={{
                      fontSize: { xs: "1.75rem", sm: "2.125rem" },
                      overflowWrap: "anywhere",
                    }}
                  >
                    {formatPrice(property.price)}
                  </Typography>
                  <Typography color="text.secondary">
                    Listed {formatDate(property.createdAt)}
                  </Typography>
                </Box>
                {property.propertyType && (
                  <Chip
                    label={formatLabel(property.propertyType)}
                    color="primary"
                    sx={{ fontWeight: 700 }}
                  />
                )}
              </Stack>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                {quickFacts.map((fact) => (
                  <Grid item xs={6} sm={3} key={fact.label}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        border: "1px solid #e5e7eb",
                        height: "100%",
                        bgcolor: "grey.50",
                        minHeight: 116,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        gap: 1,
                        overflow: "hidden",
                      }}
                    >
                      <Box color="primary.main" sx={{ lineHeight: 0 }}>
                        {fact.icon}
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {fact.label}
                      </Typography>
                      <Typography
                        fontWeight={800}
                        sx={{ overflowWrap: "anywhere", lineHeight: 1.25 }}
                      >
                        {fact.value}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              <Divider sx={{ mb: 3 }} />

              <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
                Description
              </Typography>
              <Typography
                variant="body1"
                sx={{ lineHeight: 1.85, overflowWrap: "anywhere" }}
              >
                {property.description}
              </Typography>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, md: 3 },
                borderRadius: 2,
                border: "1px solid #e5e7eb",
              }}
            >
              <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
                Property Highlights
              </Typography>
              <Grid container spacing={2}>
                {[
                  ["Property Type", formatLabel(property.propertyType)],
                  ["Location", property.location || "N/A"],
                  ["Bedrooms", property.bedrooms || "N/A"],
                  ["Bathrooms", property.bathrooms || "N/A"],
                  [
                    "Area",
                    property.area
                      ? `${Number(property.area).toLocaleString()} sq ft`
                      : "N/A",
                  ],
                  ["Listed", formatDate(property.createdAt)],
                ].map(([label, value]) => (
                  <Grid item xs={12} sm={6} key={label}>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      gap={2}
                      sx={{
                        py: 1,
                        borderBottom: "1px solid #eef0f3",
                        flexWrap: "wrap",
                      }}
                    >
                      <Typography color="text.secondary">{label}</Typography>
                      <Typography
                        fontWeight={700}
                        textAlign="right"
                        sx={{ overflowWrap: "anywhere", minWidth: 0 }}
                      >
                        {value}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>

        </Grid>

        {similarProperties.length > 0 && (
          <Box sx={{ mt: { xs: 5, md: 7 } }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "center" }}
              spacing={2}
              sx={{ mb: 3 }}
            >
              <Typography variant="h5" fontWeight={800}>
                Similar Properties
              </Typography>
              <Button onClick={() => navigate("/properties")}>
                View All Properties
              </Button>
            </Stack>
            <Grid container spacing={3}>
              {similarProperties.map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item._id}>
                  <PropertyCard property={item} />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Container>
    </>
  );
};

export default PropertyDetail;
