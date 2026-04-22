import React from "react";
import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";
import VerifiedIcon from "@mui/icons-material/Verified";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import SearchIcon from "@mui/icons-material/Search";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import GroupsIcon from "@mui/icons-material/Groups";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AddHomeWorkIcon from "@mui/icons-material/AddHomeWork";
import Reveal from "./Reveal";
import banner2 from "../../img/banner2.jpg";
import house1 from "../../img/house1.jpg";
import accommo from "../../img/accommo.jpg";

const trustItems = [
  {
    icon: <VerifiedIcon />,
    title: "Verified Listings",
    text: "Cleaner property details and direct owner or agent contact.",
  },
  {
    icon: <GroupsIcon />,
    title: "Local Agents",
    text: "Talk to people who know the neighborhoods and price ranges.",
  },
  {
    icon: <WhatsAppIcon />,
    title: "Fast Follow Up",
    text: "Send inquiries, call, email, or WhatsApp from each listing.",
  },
];

const locations = [
  "Harare",
  "Borrowdale",
  "Avondale",
  "Mount Pleasant",
  "Bulawayo",
  "Victoria Falls",
];

const steps = [
  {
    icon: <SearchIcon />,
    title: "Search Simply",
    text: "Filter by location, property type, price, rooms, and status.",
  },
  {
    icon: <HomeWorkIcon />,
    title: "Compare Homes",
    text: "Open galleries, check details, and save properties you like.",
  },
  {
    icon: <GroupsIcon />,
    title: "Contact Directly",
    text: "Send an inquiry or reach the agent from the property page.",
  },
];

const sectionTitleSx = {
  fontWeight: 900,
  color: "#0f172a",
  fontSize: { xs: "1.75rem", sm: "2.1rem", md: "2.5rem" },
  lineHeight: 1.15,
};

export default function HomeHighlights() {
  return (
    <>
      <Box sx={{ bgcolor: "#ffffff", py: { xs: 2.5, md: 3 } }}>
        <Container maxWidth="lg">
          <Reveal>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(3, minmax(0, 1fr))",
              },
              gap: { xs: 1, sm: 1.25 },
              p: { xs: 1, sm: 1.25 },
              borderRadius: 2,
              border: "1px solid #e5e7eb",
              bgcolor: "#f8fafc",
            }}
          >
            {trustItems.map((item) => (
              <Box
                key={item.title}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.25,
                  minWidth: 0,
                  px: { xs: 1.25, sm: 1.5 },
                  py: { xs: 1.25, sm: 1.5 },
                  borderRadius: 1.5,
                  bgcolor: "common.white",
                  boxShadow: "0 8px 18px rgba(15, 23, 42, 0.05)",
                }}
              >
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: 1.5,
                    bgcolor: "primary.main",
                    color: "common.white",
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                    "& svg": { fontSize: 19 },
                  }}
                >
                  {item.icon}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    fontWeight={900}
                    sx={{ fontSize: { xs: "0.95rem", md: "1rem" } }}
                    noWrap
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: { xs: "none", md: "block" },
                      lineHeight: 1.35,
                    }}
                  >
                    {item.text}
                  </Typography>
                </Box>
              </Box>
              ))}
          </Box>
          </Reveal>
        </Container>
      </Box>

      <Box sx={{ bgcolor: "#f6f8fb", py: { xs: 4.5, md: 6 } }}>
        <Container maxWidth="lg">
          <Reveal>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "flex-end" }}
            spacing={2}
            sx={{ mb: 2.5 }}
          >
            <Box>
              <Typography variant="overline" color="primary" fontWeight={900}>
                Popular Areas
              </Typography>
              <Typography variant="h3" sx={sectionTitleSx}>
                Start With A Neighborhood You Know
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
              gridAutoColumns: { xs: "minmax(132px, 42vw)", sm: "160px" },
              gridTemplateColumns: { md: "repeat(6, minmax(0, 1fr))" },
              gap: { xs: 1.25, md: 1.5 },
              overflowX: { xs: "auto", md: "visible" },
              pb: { xs: 0.75, md: 0 },
              scrollbarWidth: "thin",
            }}
          >
            {locations.map((location, index) => (
              <Box
                key={location}
                component={Link}
                to={`/properties?location=${encodeURIComponent(location)}`}
                sx={{
                  height: { xs: 132, sm: 146, md: 150 },
                  borderRadius: 2,
                  overflow: "hidden",
                  textDecoration: "none",
                  color: "common.white",
                  display: "flex",
                  alignItems: "flex-end",
                  p: { xs: 1.5, md: 1.75 },
                  backgroundImage: `linear-gradient(180deg, rgba(15, 23, 42, 0.05), rgba(15, 23, 42, 0.76)), url(${
                    index % 2 === 0 ? banner2 : house1
                  })`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  boxShadow: "0 10px 22px rgba(15, 23, 42, 0.12)",
                  transition: "transform 180ms ease, box-shadow 180ms ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 14px 28px rgba(15, 23, 42, 0.18)",
                  },
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <LocationOnIcon sx={{ fontSize: 18 }} />
                    <Typography
                      fontWeight={900}
                      sx={{
                        fontSize: { xs: "0.98rem", md: "1rem" },
                        lineHeight: 1.15,
                      }}
                    >
                      {location}
                    </Typography>
                  </Stack>
                  <Typography
                    variant="caption"
                    sx={{ display: "block", mt: 0.35, opacity: 0.86 }}
                  >
                    View listings
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
          </Reveal>
        </Container>
      </Box>

      <Box sx={{ bgcolor: "#ffffff", py: { xs: 5, md: 7 } }}>
        <Container maxWidth="lg">
          <Reveal>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1.35fr) minmax(320px, 0.85fr)" },
              gap: { xs: 2, md: 2.5 },
              alignItems: "stretch",
            }}
          >
            <Box>
              <Box
                sx={{
                  minHeight: { xs: 330, md: 430 },
                  height: "100%",
                  borderRadius: 2,
                  overflow: "hidden",
                  p: { xs: 2.5, sm: 4 },
                  color: "common.white",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  backgroundImage: `linear-gradient(180deg, rgba(15, 23, 42, 0.12), rgba(15, 23, 42, 0.86)), url(${accommo})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <Typography variant="overline" fontWeight={900}>
                  Need Help Choosing?
                </Typography>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 900,
                    fontSize: { xs: "1.75rem", sm: "2rem", md: "2.45rem" },
                    lineHeight: 1.1,
                    maxWidth: 620,
                  }}
                >
                  Tell us what you are looking for and we will help you narrow it
                  down.
                </Typography>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.5}
                  sx={{ mt: 3 }}
                >
                  <Button
                    component={Link}
                    to="/properties"
                    variant="contained"
                    size="large"
                    startIcon={<SearchIcon />}
                    sx={{ fontWeight: 800 }}
                  >
                    Find A Property
                  </Button>
                  <Button
                    href="https://api.whatsapp.com/send?phone=263782931905"
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="outlined"
                    size="large"
                    startIcon={<WhatsAppIcon />}
                    sx={{
                      fontWeight: 800,
                      color: "common.white",
                      borderColor: "rgba(255,255,255,0.8)",
                      "&:hover": { borderColor: "common.white" },
                    }}
                  >
                    WhatsApp Us
                  </Button>
                </Stack>
              </Box>
            </Box>

            <Box>
              <Paper
                elevation={0}
                sx={{
                  height: "100%",
                  p: { xs: 2.5, sm: 3 },
                  borderRadius: 2,
                  border: "1px solid #e5e7eb",
                  bgcolor: "#0f172a",
                  color: "common.white",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 3,
                }}
              >
                <Box>
                  <Typography variant="overline" color="#93c5fd" fontWeight={900}>
                    Owners And Agents
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 900,
                      lineHeight: 1.15,
                      fontSize: { xs: "1.55rem", sm: "1.75rem", md: "1.95rem" },
                    }}
                  >
                    List your property and start receiving inquiries.
                  </Typography>
                  <Typography sx={{ mt: 1.5, color: "#cbd5e1" }}>
                    Add photos, price, location, map coordinates, and contact
                    details so buyers can reach you faster.
                  </Typography>
                </Box>
                <Button
                  component={Link}
                  to="/property/add"
                  variant="contained"
                  size="large"
                  startIcon={<AddHomeWorkIcon />}
                  sx={{ alignSelf: { xs: "stretch", sm: "flex-start" }, fontWeight: 800 }}
                >
                  List Property
                </Button>
              </Paper>
            </Box>
          </Box>
          </Reveal>
        </Container>
      </Box>

      <Box sx={{ bgcolor: "#f6f8fb", py: { xs: 5, md: 7 } }}>
        <Container maxWidth="lg">
          <Reveal>
          <Box sx={{ textAlign: "center", maxWidth: 720, mx: "auto", mb: 4 }}>
            <Typography variant="overline" color="primary" fontWeight={900}>
              How It Works
            </Typography>
            <Typography variant="h3" sx={sectionTitleSx}>
              A Simpler Way To Move From Search To Viewing
            </Typography>
          </Box>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" },
              gap: { xs: 2, sm: 1.5, md: 2 },
            }}
          >
            {steps.map((step, index) => (
              <Box key={step.title}>
                <Paper
                  elevation={0}
                  sx={{
                    height: "100%",
                    p: { xs: 2.5, sm: 2, md: 3 },
                    borderRadius: 2,
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      bgcolor: index === 1 ? "#16a34a" : "primary.main",
                      color: "common.white",
                      display: "grid",
                      placeItems: "center",
                      mb: 2,
                    }}
                  >
                    {step.icon}
                  </Box>
                  <Typography variant="h6" fontWeight={900}>
                    {step.title}
                  </Typography>
                  <Typography
                    color="text.secondary"
                    sx={{ mt: 1, fontSize: { sm: "0.9rem", md: "1rem" } }}
                  >
                    {step.text}
                  </Typography>
                </Paper>
              </Box>
            ))}
          </Box>
          </Reveal>
        </Container>
      </Box>
    </>
  );
}
