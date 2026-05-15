import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import SearchIcon from "@mui/icons-material/Search";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import Header from "../ui/Header";
import Footer from "../ui/Footer";
import SeoHead from "../ui/SeoHead";
import { apiFetch } from "../../utils/authFetch";
import { useAuth } from "../../context/AuthContext";

const propertyTypes = [
  "",
  "House",
  "Apartment",
  "Condo",
  "Townhouse",
  "Land",
  "Commercial",
  "Office",
  "Retail",
  "Industrial",
  "Other",
];

const listingTypeOptions = ["Any", "For Sale", "For Rent"];
const furnishedOptions = ["Any", "Furnished", "Unfurnished", "Partly Furnished"];
const bedroomOptions = ["", "1", "2", "3", "4", "5+"];
const bathroomOptions = ["", "1", "2", "3", "4+"];
const timelineOptions = [
  "",
  "As soon as possible",
  "Within 1 month",
  "Within 3 months",
  "Just researching",
];

const buildInitialForm = (user) => ({
  name: user?.name || "",
  email: user?.email || "",
  phone: user?.phone || user?.whatsapp || "",
  listingType: "Any",
  propertyType: "",
  preferredLocation: "",
  maxPrice: "",
  minBedrooms: "",
  minBathrooms: "",
  furnishedPreference: "Any",
  timeline: "",
  message: "",
});

export default function RequestProperty() {
  const { user } = useAuth();
  const [form, setForm] = useState(() => buildInitialForm(user));
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  useEffect(() => {
    setForm((current) => ({
      ...current,
      name: current.name || user?.name || "",
      email: current.email || user?.email || "",
      phone: current.phone || user?.phone || user?.whatsapp || "",
    }));
  }, [user]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setAlert({ type: "", message: "" });

    try {
      const payload = {
        ...form,
        minBedrooms: form.minBedrooms ? Number.parseInt(form.minBedrooms, 10) : undefined,
        minBathrooms: form.minBathrooms ? Number.parseInt(form.minBathrooms, 10) : undefined,
        maxPrice: form.maxPrice ? Number(form.maxPrice) : undefined,
        pageUrl: typeof window !== "undefined" ? window.location.href : "",
      };

      const response = await apiFetch("/api/property/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not submit your property request");
      }

      setAlert({
        type: data.warning ? "warning" : "success",
        message:
          data.warning ||
          "Your request has been sent. We can now follow up with matching properties.",
      });
      setForm({
        ...buildInitialForm(user),
        name: user?.name || form.name,
        email: user?.email || form.email,
        phone: user?.phone || user?.whatsapp || form.phone,
      });
    } catch (err) {
      setAlert({
        type: "error",
        message: err.message || "Could not submit your property request",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc" }}>
      <SeoHead
        title="Request A Property | BlinkStar Properties"
        description="Tell BlinkStar Properties what kind of home, rental, or investment property you are looking for."
      />
      <Header />
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
        <Box
          sx={{
            mb: 4,
            p: { xs: 2.5, md: 4 },
            borderRadius: 3,
            color: "common.white",
            background:
              "linear-gradient(135deg, #0f172a 0%, #1d4ed8 55%, #16a34a 100%)",
          }}
        >
          <Chip
            icon={<ManageSearchIcon />}
            label="Buyer Request"
            sx={{
              mb: 2,
              color: "common.white",
              bgcolor: "rgba(255,255,255,0.12)",
              fontWeight: 800,
            }}
          />
          <Typography
            variant="h3"
            sx={{
              fontWeight: 900,
              fontSize: { xs: "2rem", md: "2.8rem" },
              lineHeight: 1.08,
              maxWidth: 760,
            }}
          >
            Tell us what you want and we will look out for the right property.
          </Typography>
          <Typography
            sx={{
              mt: 1.5,
              color: "rgba(255,255,255,0.86)",
              maxWidth: 680,
              fontSize: { xs: "1rem", md: "1.06rem" },
            }}
          >
            Share your budget, area, property type, and must-haves. This helps
            BlinkStar Properties follow up with listings that fit better than a
            generic inquiry.
          </Typography>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.25}
            sx={{ mt: 2.5 }}
          >
            <Button
              href="/properties"
              variant="contained"
              startIcon={<SearchIcon />}
              sx={{ fontWeight: 800 }}
            >
              Browse Current Listings
            </Button>
            <Button
              href="https://api.whatsapp.com/send?phone=263782931905"
              target="_blank"
              rel="noopener noreferrer"
              variant="outlined"
              startIcon={<WhatsAppIcon />}
              sx={{
                color: "common.white",
                borderColor: "rgba(255,255,255,0.6)",
                fontWeight: 800,
              }}
            >
              WhatsApp Instead
            </Button>
          </Stack>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, md: 3 },
                borderRadius: 3,
                border: "1px solid #e5e7eb",
                height: "100%",
              }}
            >
              <Typography variant="h5" fontWeight={900} sx={{ mb: 1.5 }}>
                What to include
              </Typography>
              <Stack spacing={1.4}>
                {[
                  "The area or suburb you prefer",
                  "Whether you want to buy or rent",
                  "Your budget range or maximum budget",
                  "How many bedrooms and bathrooms you need",
                  "Anything important like furnished, quiet road, or close to schools",
                ].map((item) => (
                  <Stack direction="row" spacing={1.1} key={item} alignItems="flex-start">
                    <CheckCircleOutlineIcon
                      sx={{ color: "#16a34a", fontSize: 20, mt: "2px" }}
                    />
                    <Typography color="text.secondary">{item}</Typography>
                  </Stack>
                ))}
              </Stack>

              <Box
                sx={{
                  mt: 3,
                  p: 2,
                  borderRadius: 2,
                  bgcolor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                }}
              >
                <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 0.75 }}>
                  Good example
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Looking for a 3-bedroom house to rent in Borrowdale or Mount
                  Pleasant, budget up to $1,500, preferably furnished, moving
                  within 1 month.
                </Typography>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={8}>
            <Paper
              component="form"
              onSubmit={handleSubmit}
              elevation={0}
              sx={{
                p: { xs: 2.5, md: 3 },
                borderRadius: 3,
                border: "1px solid #e5e7eb",
              }}
            >
              <Typography variant="h5" fontWeight={900} sx={{ mb: 1 }}>
                Request A Property
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                Fill in the details below and our team can follow up with better
                matches.
              </Typography>

              {alert.message && (
                <Alert severity={alert.type || "info"} sx={{ mb: 2.5 }}>
                  {alert.message}
                </Alert>
              )}

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Full Name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Phone Number"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    label="Looking To"
                    name="listingType"
                    value={form.listingType}
                    onChange={handleChange}
                    fullWidth
                  >
                    {listingTypeOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    label="Property Type"
                    name="propertyType"
                    value={form.propertyType}
                    onChange={handleChange}
                    fullWidth
                  >
                    {propertyTypes.map((option) => (
                      <MenuItem key={option || "any-type"} value={option}>
                        {option || "Any Type"}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Preferred Location"
                    name="preferredLocation"
                    value={form.preferredLocation}
                    onChange={handleChange}
                    fullWidth
                    required
                    placeholder="Borrowdale, Avondale, Harare..."
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Maximum Budget"
                    name="maxPrice"
                    type="number"
                    value={form.maxPrice}
                    onChange={handleChange}
                    fullWidth
                    InputProps={{
                      inputProps: { min: 0 },
                    }}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    select
                    label="Min Beds"
                    name="minBedrooms"
                    value={form.minBedrooms}
                    onChange={handleChange}
                    fullWidth
                  >
                    {bedroomOptions.map((option) => (
                      <MenuItem key={option || "any-beds"} value={option}>
                        {option || "Any"}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    select
                    label="Min Baths"
                    name="minBathrooms"
                    value={form.minBathrooms}
                    onChange={handleChange}
                    fullWidth
                  >
                    {bathroomOptions.map((option) => (
                      <MenuItem key={option || "any-baths"} value={option}>
                        {option || "Any"}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    label="Furnished"
                    name="furnishedPreference"
                    value={form.furnishedPreference}
                    onChange={handleChange}
                    fullWidth
                  >
                    {furnishedOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    label="Timeline"
                    name="timeline"
                    value={form.timeline}
                    onChange={handleChange}
                    fullWidth
                  >
                    {timelineOptions.map((option) => (
                      <MenuItem key={option || "any-timeline"} value={option}>
                        {option || "No rush / not specified"}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Tell us more"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    fullWidth
                    required
                    multiline
                    minRows={5}
                    placeholder="Describe what matters most so we can look out for better matches."
                  />
                </Grid>
              </Grid>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "stretch", sm: "center" }}
                spacing={1.5}
                sx={{ mt: 3 }}
              >
                <Typography variant="body2" color="text.secondary">
                  We will save this request and follow up with matching options.
                </Typography>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  startIcon={<ManageSearchIcon />}
                  disabled={submitting}
                  sx={{ fontWeight: 800, minWidth: 220 }}
                >
                  {submitting ? "Submitting..." : "Send Property Request"}
                </Button>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Container>
      <Footer />
    </Box>
  );
}
