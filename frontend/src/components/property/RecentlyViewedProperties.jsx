import React, { useEffect, useState } from "react";
import { Box, Button, Container, Grid, Stack, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import PropertyCard from "./PropertyCard";
import { readRecentlyViewedProperties } from "../../utils/recentlyViewed";

export default function RecentlyViewedProperties({
  excludePropertyId,
  showContactInfo = true,
}) {
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    const nextProperties = readRecentlyViewedProperties().filter(
      (item) => item._id !== excludePropertyId
    );
    setProperties(nextProperties);
  }, [excludePropertyId]);

  if (!properties.length) {
    return null;
  }

  return (
    <Box sx={{ py: { xs: 4.5, md: 6 }, backgroundColor: "#ffffff" }}>
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2}
          sx={{ mb: 3 }}
        >
          <Box>
            <Typography variant="overline" color="primary" fontWeight={900}>
              Keep Browsing
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 900,
                color: "#0f172a",
                fontSize: { xs: "1.5rem", sm: "1.8rem", md: "2rem" },
              }}
            >
              Recently Viewed
            </Typography>
          </Box>
          <Button component={Link} to="/properties" variant="outlined">
            Browse All Properties
          </Button>
        </Stack>

        <Grid container spacing={3}>
          {properties.slice(0, 4).map((property) => (
            <Grid item xs={12} sm={6} md={3} key={property._id}>
              <PropertyCard
                property={property}
                showContactInfo={showContactInfo}
              />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
