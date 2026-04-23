import React from "react";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import Header from "./Header";
import SeoHead from "./SeoHead";

export default function NotFound() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f6f8fb" }}>
      <SeoHead
        title="Page Not Found | BlinkStar Properties"
        description="The BlinkStar Properties page you requested could not be found."
      />
      <Header />
      <Container maxWidth="md" sx={{ py: { xs: 7, md: 10 }, textAlign: "center" }}>
        <Typography variant="overline" color="text.secondary" fontWeight={800}>
          404
        </Typography>
        <Typography
          variant="h3"
          component="h1"
          fontWeight={900}
          sx={{ mt: 1, fontSize: { xs: "2rem", md: "3rem" } }}
        >
          Page not found
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1.5, mb: 3 }}>
          The page may have moved, or the listing may no longer be available.
        </Typography>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          justifyContent="center"
        >
          <Button href="/" variant="outlined" startIcon={<HomeIcon />}>
            Home
          </Button>
          <Button href="/properties" variant="contained" startIcon={<SearchIcon />}>
            Browse Properties
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}
