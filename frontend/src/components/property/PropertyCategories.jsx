import React from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardActionArea,
  CardContent,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import ApartmentIcon from "@mui/icons-material/Apartment";

const categories = [
  {
    label: "For Sale",
    icon: <HomeIcon fontSize="large" color="primary" />,
    link: "/properties?type=sale",
  },
  {
    label: "For Rent",
    icon: <ApartmentIcon fontSize="large" color="secondary" />,
    link: "/properties?type=rent",
  },
];

const PropertyCategories = () => {
  return (
    <Box sx={{ py: 6, px: { xs: 2, md: 8 }, background: "#f9f9f9" }}>
      <Typography variant="h4" fontWeight={700} align="center" mb={4}>
        Browse by Category
      </Typography>
      <Grid container spacing={4} justifyContent="center">
        {categories.map((cat) => (
          <Grid item xs={12} sm={6} md={3} key={cat.label}>
            <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
              <CardActionArea href={cat.link}>
                <CardContent
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  {cat.icon}
                  <Typography variant="h6" fontWeight={600} mt={2}>
                    {cat.label}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default PropertyCategories;
