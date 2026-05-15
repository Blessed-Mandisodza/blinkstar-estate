import React from "react";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Container,
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
        <Box sx={{ textAlign: "center", maxWidth: 760, mx: "auto", mb: 4 }}>
          <Typography
            variant="overline"
            color="primary"
            fontWeight={900}
            fontSize={30}
            sx={{ mb: 1.5 }}
          >
            Browse by Category
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              md: "repeat(4, minmax(0, 1fr))",
            },
            gap: { xs: 2, md: 2.5 },
          }}
        >
          {categories.map((category) => (
            <Box key={category.label} sx={{ display: "flex" }}>
              <Card
                sx={{
                  width: "100%",
                  height: "100%",
                  minHeight: { xs: 142, sm: 150, md: 156 },
                  borderRadius: 4,
                  border: "1px solid rgba(226, 232, 240, 0.95)",
                  boxShadow: "0 18px 34px rgba(15, 23, 42, 0.08)",
                  position: "relative",
                  overflow: "hidden",
                  background:
                    "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)",
                  transition:
                    "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    inset: 0,
                    background: `radial-gradient(circle at top right, ${category.accent}18, transparent 48%)`,
                    pointerEvents: "none",
                  },
                  "&:hover": {
                    transform: "translateY(-6px)",
                    boxShadow: "0 24px 42px rgba(15, 23, 42, 0.12)",
                    borderColor: `${category.accent}55`,
                  },
                }}
              >
                <CardActionArea
                  component={Link}
                  to={buildCategoryLink(category.filters)}
                  sx={{
                    height: "100%",
                    display: "flex",
                    alignItems: "stretch",
                  }}
                >
                  <CardContent
                    sx={{
                      p: { xs: 1.75, md: 2 },
                      height: "100%",
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    <Box
                      sx={{
                        width: 52,
                        height: 52,
                        borderRadius: 2,
                        display: "grid",
                        placeItems: "center",
                        color: "#ffffff",
                        background: `linear-gradient(135deg, ${category.accent}, ${category.accent}cc)`,
                        boxShadow: `0 16px 28px ${category.accent}30`,
                        "& svg": {
                          fontSize: 26,
                        },
                      }}
                    >
                      {category.icon}
                    </Box>
                    <Typography
                      variant="h6"
                      fontWeight={800}
                      sx={{
                        mt: 1.5,
                        minHeight: 28,
                        display: "flex",
                        alignItems: "center",
                        fontSize: { xs: "1rem", md: "1.05rem" },
                      }}
                    >
                      {category.label}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default PropertyCategories;
