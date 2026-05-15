import React from "react";
import {
  Box,
  Button,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import SellIcon from "@mui/icons-material/Sell";
import KeyIcon from "@mui/icons-material/Key";
import HomeIcon from "@mui/icons-material/Home";
import ApartmentIcon from "@mui/icons-material/Apartment";
import { Link } from "react-router-dom";

const categories = [
  {
    label: "For Sale",
    filters: { status: "For Sale" },
    icon: <SellIcon fontSize="large" />,
    accent: "#0284c7",
  },
  {
    label: "For Rent",
    filters: { status: "For Rent" },
    icon: <KeyIcon fontSize="large" />,
    accent: "#16a34a",
  },
  {
    label: "Houses",
    filters: { type: "House" },
    icon: <HomeIcon fontSize="large" />,
    accent: "#f97316",
  },
  {
    label: "Apartments",
    filters: { type: "Apartment" },
    icon: <ApartmentIcon fontSize="large" />,
    accent: "#7c3aed",
  },
];

const buildCategoryLink = (filters = {}) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (!value) return;
    params.set(key, value);
  });

  const query = params.toString();
  return query ? `/properties?${query}` : "/properties";
};

const PropertyCategories = () => {
  return (
    <Box sx={{ py: { xs: 4.5, md: 6 }, backgroundColor: "#ffffff" }}>
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "flex-end" }}
          spacing={2}
          sx={{ mb: 2.5 }}
        >
          <Box>
            <Typography variant="overline" color="primary" fontWeight={900}>
              Browse by Category
            </Typography>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 900,
                color: "#0f172a",
                fontSize: { xs: "1.75rem", sm: "2.1rem", md: "2.4rem" },
                lineHeight: 1.12,
              }}
            >
              Start With The Property Type You Want
            </Typography>
          </Box>
          <Button
            component={Link}
            to="/properties"
            variant="outlined"
            sx={{ width: { xs: "100%", sm: "auto" }, fontWeight: 800 }}
          >
            Browse All
          </Button>
        </Stack>

        <Box
          sx={{
            display: "grid",
            gridAutoFlow: { xs: "column", md: "row" },
            gridAutoColumns: { xs: "minmax(146px, 46vw)", sm: "170px" },
            gridTemplateColumns: {
              md: "repeat(4, minmax(0, 1fr))",
            },
            gap: { xs: 1.25, md: 2 },
            overflowX: { xs: "auto", md: "visible" },
            pb: { xs: 0.75, md: 0 },
            scrollbarWidth: "thin",
            scrollSnapType: { xs: "x mandatory", md: "none" },
            scrollPaddingLeft: { xs: 0, md: 0 },
            WebkitOverflowScrolling: "touch",
          }}
        >
          {categories.map((category) => (
            <Box
              key={category.label}
              component={Link}
              to={buildCategoryLink(category.filters)}
              sx={{
                minHeight: { xs: 132, sm: 142, md: 156 },
                borderRadius: 2,
                overflow: "hidden",
                textDecoration: "none",
                color: "common.white",
                display: "flex",
                alignItems: "flex-end",
                position: "relative",
                scrollSnapAlign: { xs: "start", md: "unset" },
                scrollSnapStop: { xs: "always", md: "normal" },
                p: { xs: 1.5, md: 1.75 },
                background: `linear-gradient(180deg, rgba(15, 23, 42, 0.08), rgba(15, 23, 42, 0.78)), linear-gradient(135deg, ${category.accent}, ${category.accent}cc)`,
                boxShadow: "0 10px 22px rgba(15, 23, 42, 0.12)",
                transition: "transform 180ms ease, box-shadow 180ms ease",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  inset: 0,
                  background:
                    "radial-gradient(circle at top right, rgba(255,255,255,0.2), transparent 36%)",
                  pointerEvents: "none",
                },
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 14px 28px rgba(15, 23, 42, 0.18)",
                },
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: { xs: 14, md: 16 },
                  right: { xs: 14, md: 16 },
                  width: { xs: 42, md: 46 },
                  height: { xs: 42, md: 46 },
                  borderRadius: 1.75,
                  display: "grid",
                  placeItems: "center",
                  color: "#ffffff",
                  bgcolor: "rgba(255,255,255,0.16)",
                  backdropFilter: "blur(4px)",
                  "& svg": {
                    fontSize: { xs: 22, md: 24 },
                  },
                }}
              >
                {category.icon}
              </Box>
              <Box
                sx={{
                  minWidth: 0,
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <Typography
                  fontWeight={900}
                  sx={{
                    fontSize: { xs: "1rem", md: "1.05rem" },
                    lineHeight: 1.15,
                  }}
                >
                  {category.label}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ display: "block", mt: 0.35, opacity: 0.88 }}
                >
                  View listings
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default PropertyCategories;
