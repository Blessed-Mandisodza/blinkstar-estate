import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Button, Container, Grid, Typography } from "@mui/material";
import Header from "../ui/Header";
import Loader from "../ui/Loader";
import SeoHead from "../ui/SeoHead";
import PropertyCard from "./PropertyCard";
import { apiFetch } from "../../utils/authFetch";

const titleCase = (value = "") =>
  value
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function SeoListings() {
  const { type, location } = useParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const filters = useMemo(
    () => ({
      type: titleCase(type),
      location: titleCase(location),
    }),
    [location, type]
  );

  useEffect(() => {
    const params = new URLSearchParams({
      type: filters.type,
      location: filters.location,
      sort: "createdAt",
    });

    setLoading(true);
    apiFetch(`/api/property?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => setProperties(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [filters]);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f6f8fb" }}>
      <SeoHead
        title={`${filters.type} Properties in ${filters.location} | BlinkStar Properties`}
        description={`Browse ${filters.type.toLowerCase()} property listings in ${filters.location} with BlinkStar Properties.`}
      />
      <Header />
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
        <Typography variant="h4" fontWeight={900} sx={{ mb: 1 }}>
          {filters.type} Properties in {filters.location}
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          {properties.length} listing{properties.length === 1 ? "" : "s"}
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" py={8}>
            <Loader size="large" />
          </Box>
        ) : properties.length === 0 ? (
          <Box textAlign="center" py={8}>
            <Typography variant="h6" fontWeight={700}>
              No matching properties found.
            </Typography>
            <Button href="/properties" variant="contained" sx={{ mt: 2 }}>
              Browse All Properties
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {properties.map((property) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={property._id}>
                <PropertyCard property={property} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}
