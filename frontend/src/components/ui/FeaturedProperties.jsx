import React, { useState, useEffect } from "react";
import { Box, Container, Typography, Grid, Button } from "@mui/material";
import { ArrowForward } from "@mui/icons-material";
import PropertyCard from "../property/PropertyCard";
import Loader from "./Loader";
import { apiFetch } from "../../utils/authFetch";

export default function FeaturedProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecentProperties = async () => {
      try {
        setLoading(true);
        const response = await apiFetch("/api/property?limit=8&sort=createdAt");

        if (!response.ok) {
          throw new Error("Failed to fetch properties");
        }

        const data = await response.json();
        setProperties(data);
      } catch (err) {
        console.error("Error fetching recent properties:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentProperties();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          py: { xs: 4, sm: 6, md: 8 },
          backgroundColor: "background.default",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "300px",
        }}
      >
        <Loader size="large" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          py: { xs: 4, sm: 6, md: 8 },
          backgroundColor: "background.default",
          textAlign: "center",
        }}
      >
        <Typography color="error" variant="h6">
          Error loading properties: {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        py: { xs: 4, sm: 6, md: 8 },
        backgroundColor: "background.default",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <Box
          sx={{
            mb: { xs: 4, sm: 5, md: 6 },
            textAlign: "center",
            maxWidth: "800px",
            mx: "auto",
          }}
        >
          <Typography
            variant="h3"
            component="h2"
            sx={{
              mb: 2,
              fontWeight: 700,
              fontSize: { xs: "1.75rem", sm: "2rem", md: "2.5rem" },
            }}
          >
            Recent Properties
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{
              mb: { xs: 3, sm: 4 },
              fontSize: { xs: "0.875rem", sm: "1rem", md: "1.25rem" },
              px: { xs: 2, sm: 0 },
            }}
          >
            Discover our latest property listings
          </Typography>
        </Box>

        {properties.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: 8,
            }}
          >
            <Typography variant="h6" color="text.secondary">
              No properties available at the moment
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Check back soon for new listings
            </Typography>
          </Box>
        ) : (
          <Grid
            container
            spacing={{ xs: 2, sm: 3, md: 4 }}
            justifyContent="center"
            alignItems="stretch"
          >
            {properties.slice(0, 8).map((property) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                lg={3}
                key={property._id}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Box
                  sx={{
                    width: "100%",
                    maxWidth: { xs: "400px", sm: "100%" },
                  }}
                >
                  <PropertyCard property={property} />
                </Box>
              </Grid>
            ))}
          </Grid>
        )}

        <Box
          sx={{
            mt: { xs: 4, sm: 5, md: 6 },
            textAlign: "center",
          }}
        >
          <Button
            variant="outlined"
            size="large"
            endIcon={<ArrowForward />}
            href="/properties"
            sx={{
              px: { xs: 3, sm: 4 },
              py: { xs: 1, sm: 1.5 },
              borderRadius: 2,
              fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" },
            }}
          >
            View All Properties
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
