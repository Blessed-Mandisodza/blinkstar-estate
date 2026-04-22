import React from "react";
import {
  Box,
  Button,
  Container,
  Grid,
  IconButton,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import {
  Email,
  Facebook,
  Instagram,
  LocationOn,
  Phone,
  WhatsApp,
} from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import Reveal from "./Reveal";

const footerLinks = [
  ["Properties", "/properties"],
  ["Map Search", "/map"],
  ["Mortgage", "/mortgage"],
  ["Agents", "/agents"],
];

const buyerLinks = [
  ["Houses", "/properties?type=House"],
  ["Apartments", "/properties?type=Apartment"],
  ["Land", "/properties?type=Land"],
  ["For Rent", "/properties?status=For%20Rent"],
];

const FooterLink = ({ to, children }) => (
  <Link
    component={RouterLink}
    to={to}
    underline="none"
    sx={{
      color: "rgba(255,255,255,0.74)",
      fontWeight: 600,
      "&:hover": { color: "common.white" },
    }}
  >
    {children}
  </Link>
);

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        mt: "auto",
        bgcolor: "#0f172a",
        color: "common.white",
        pt: { xs: 5, md: 7 },
        pb: 3,
      }}
    >
      <Container maxWidth="lg">
        <Reveal>
          <Box
            sx={{
              mb: 5,
              p: { xs: 2.5, md: 3 },
              borderRadius: 2,
              bgcolor: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr auto" },
              gap: 2,
              alignItems: "center",
            }}
          >
          <Box>
            <Typography variant="h5" fontWeight={900}>
              Ready to find the right property?
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.72)", mt: 0.5 }}>
              Search listings or speak to BlinkStar Properties directly.
            </Typography>
          </Box>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
            <Button
              component={RouterLink}
              to="/properties"
              variant="contained"
              sx={{ fontWeight: 800 }}
            >
              Browse Properties
            </Button>
            <Button
              href="https://api.whatsapp.com/send?phone=263782931905"
              target="_blank"
              rel="noopener noreferrer"
              variant="outlined"
              startIcon={<WhatsApp />}
              sx={{
                color: "common.white",
                borderColor: "rgba(255,255,255,0.5)",
                fontWeight: 800,
              }}
            >
              WhatsApp
            </Button>
          </Stack>
          </Box>
        </Reveal>

        <Reveal delay={120}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" fontWeight={900} sx={{ mb: 1.5 }}>
              BlinkStar Properties
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.72)", maxWidth: 360 }}>
              Property listings, agent connections, and inquiry tools for buyers,
              renters, owners, and agents in Zimbabwe.
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <IconButton
                href="https://www.facebook.com/profile.php?id=61559780460174"
                target="_blank"
                aria-label="Facebook"
                sx={{ color: "common.white", bgcolor: "rgba(255,255,255,0.08)" }}
              >
                <Facebook />
              </IconButton>
              <IconButton
                href="https://www.instagram.com"
                target="_blank"
                aria-label="Instagram"
                sx={{ color: "common.white", bgcolor: "rgba(255,255,255,0.08)" }}
              >
                <Instagram />
              </IconButton>
            </Stack>
          </Grid>

          <Grid item xs={6} sm={4} md={2}>
            <Typography fontWeight={900} sx={{ mb: 1.5 }}>
              Explore
            </Typography>
            <Stack spacing={1.1}>
              {footerLinks.map(([label, to]) => (
                <FooterLink key={label} to={to}>
                  {label}
                </FooterLink>
              ))}
            </Stack>
          </Grid>

          <Grid item xs={6} sm={4} md={2}>
            <Typography fontWeight={900} sx={{ mb: 1.5 }}>
              Popular
            </Typography>
            <Stack spacing={1.1}>
              {buyerLinks.map(([label, to]) => (
                <FooterLink key={label} to={to}>
                  {label}
                </FooterLink>
              ))}
            </Stack>
          </Grid>

          <Grid item xs={12} sm={4} md={4}>
            <Typography fontWeight={900} sx={{ mb: 1.5 }}>
              Contact
            </Typography>
            <Stack spacing={1.3} sx={{ color: "rgba(255,255,255,0.76)" }}>
              <Stack direction="row" spacing={1.1}>
                <LocationOn fontSize="small" />
                <Typography variant="body2">
                  7401 1st Crescent, Warren Park 1, Harare
                </Typography>
              </Stack>
              <Link
                href="tel:+263782931905"
                underline="none"
                sx={{ color: "rgba(255,255,255,0.76)", display: "flex", gap: 1.1 }}
              >
                <Phone fontSize="small" />
                +263 78 293 1905
              </Link>
              <Link
                href="mailto:info@blinkstarprop.co.zw"
                underline="none"
                sx={{ color: "rgba(255,255,255,0.76)", display: "flex", gap: 1.1 }}
              >
                <Email fontSize="small" />
                info@blinkstarprop.co.zw
              </Link>
            </Stack>
          </Grid>
        </Grid>
        </Reveal>

        <Box
          sx={{
            mt: 4,
            pt: 2.5,
            borderTop: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            gap: 1,
            color: "rgba(255,255,255,0.62)",
          }}
        >
          <Typography variant="body2">
            © {new Date().getFullYear()} BlinkStar Properties.
          </Typography>
          <Typography variant="body2">Built for better property discovery.</Typography>
        </Box>
      </Container>
    </Box>
  );
}
