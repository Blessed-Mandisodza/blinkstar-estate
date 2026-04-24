import { useAuth } from "../../context/AuthContext";
import React, { useEffect, useState } from "react";
import Header from "./Header";
import SeoHead from "./SeoHead";
import PropertyList from "../property/PropertyList";
import {
  Button,
  Box,
  TextField,
  MenuItem,
  Grid,
  Typography,
  Paper,
  InputAdornment,
  Alert,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import AddHomeWorkIcon from "@mui/icons-material/AddHomeWork";
import BookmarkAddIcon from "@mui/icons-material/BookmarkAdd";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SearchIcon from "@mui/icons-material/Search";
import { authFetch } from "../../utils/authFetch";

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

const sortOptions = [
  { value: "createdAt", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "bedrooms-desc", label: "Most Bedrooms" },
  { value: "area-desc", label: "Largest Area" },
  { value: "oldest", label: "Oldest" },
];

const roomOptions = ["", "1", "2", "3", "4", "5"];
const furnishedOptions = ["", "Furnished", "Unfurnished", "Partly Furnished"];
const statusOptions = ["", "Available", "For Sale", "For Rent", "Sold", "Rented"];

const defaultFilters = {
  search: "",
  type: "",
  minPrice: "",
  maxPrice: "",
  location: "",
  minBedrooms: "",
  maxBedrooms: "",
  minBathrooms: "",
  maxBathrooms: "",
  minArea: "",
  maxArea: "",
  sort: "createdAt",
  status: "",
  furnished: "",
};

const readFiltersFromSearch = (search) => {
  const params = new URLSearchParams(search);

  return Object.keys(defaultFilters).reduce(
    (nextFilters, key) => ({
      ...nextFilters,
      [key]: params.get(key) || defaultFilters[key],
    }),
    {}
  );
};

const buildSearchFromFilters = (filters) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (!value || value === defaultFilters[key]) return;
    params.set(key, value);
  });

  return params.toString();
};

const Properties = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [filters, setFilters] = useState(() =>
    readFiltersFromSearch(location.search)
  );
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    setFilters(readFiltersFromSearch(location.search));
  }, [location.search]);

  const updateFilters = (nextFilters) => {
    setFilters(nextFilters);

    const search = buildSearchFromFilters(nextFilters);
    navigate(
      {
        pathname: location.pathname,
        search: search ? `?${search}` : "",
      },
      { replace: true }
    );
  };

  const handleChange = (e) => {
    updateFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleClear = () => {
    updateFilters(defaultFilters);
  };

  const handleSaveSearch = async () => {
    setSaveMessage("");

    try {
      const labelParts = [
        filters.location,
        filters.type,
        filters.minBedrooms ? `${filters.minBedrooms}+ beds` : "",
      ].filter(Boolean);
      const name = labelParts.length ? labelParts.join(" / ") : "Property Search";
      const res = await authFetch("/api/property/saved-searches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, filters, alertsEnabled: true }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Could not save search");
      }

      setSaveMessage("Search saved.");
    } catch (err) {
      setSaveMessage(err.message || "Could not save search");
    }
  };

  return (
    <Box sx={{ background: "#f7f9fb", minHeight: "100vh" }}>
      <SeoHead
        title="Browse Properties | BlinkStar Properties"
        description="Search BlinkStar property listings by location, price, bedrooms, bathrooms, furnished status, and listing type."
      />
      <Header />
      <Box sx={{ py: { xs: 2, sm: 6 } }}>
        <Box maxWidth="lg" mx="auto" px={{ xs: 1, sm: 2, md: 0 }}>
          <Box
            display="flex"
            flexDirection={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", sm: "center" }}
            mb={4}
            gap={2}
          >
            <Typography
              variant="h4"
              fontWeight={700}
              textAlign={{ xs: "left", sm: "center" }}
              flex={1}
            >
              Browse Properties
            </Typography>
            {user && (
              <Button
                variant="contained"
                color="primary"
                size="large"
                sx={{ fontWeight: 600, width: { xs: "100%", sm: "auto" } }}
                onClick={() => navigate("/property/add")}
                startIcon={<AddHomeWorkIcon />}
              >
                Add Property
              </Button>
            )}
          </Box>
          {saveMessage && (
            <Alert severity={saveMessage.includes("saved") ? "success" : "error"} sx={{ mb: 2 }}>
              {saveMessage}
            </Alert>
          )}
          <Paper
            elevation={2}
            sx={{ p: { xs: 2, sm: 3 }, mb: 5, borderRadius: 2 }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Search"
                  name="search"
                  value={filters.search}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  select
                  label="Type"
                  name="type"
                  value={filters.type}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                >
                  {propertyTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type || "All Types"}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="Location"
                  name="location"
                  value={filters.location}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  select
                  label="Sort"
                  name="sort"
                  value={filters.sort}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                >
                  {sortOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={6} sm={3} md={2}>
                <TextField
                  label="Min Price"
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleChange}
                  type="number"
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={6} sm={3} md={2}>
                <TextField
                  label="Max Price"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleChange}
                  type="number"
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={6} sm={3} md={2}>
                <TextField
                  select
                  label="Min Beds"
                  name="minBedrooms"
                  value={filters.minBedrooms}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                >
                  {roomOptions.map((value) => (
                    <MenuItem key={`beds-${value || "any"}`} value={value}>
                      {value ? `${value}+` : "Any"}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={6} sm={3} md={2}>
                <TextField
                  select
                  label="Max Beds"
                  name="maxBedrooms"
                  value={filters.maxBedrooms}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                >
                  {roomOptions.map((value) => (
                    <MenuItem key={`max-beds-${value || "any"}`} value={value}>
                      {value || "Any"}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={6} sm={3} md={2}>
                <TextField
                  select
                  label="Min Baths"
                  name="minBathrooms"
                  value={filters.minBathrooms}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                >
                  {roomOptions.map((value) => (
                    <MenuItem key={`baths-${value || "any"}`} value={value}>
                      {value ? `${value}+` : "Any"}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={6} sm={3} md={2}>
                <TextField
                  select
                  label="Max Baths"
                  name="maxBathrooms"
                  value={filters.maxBathrooms}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                >
                  {roomOptions.map((value) => (
                    <MenuItem key={`max-baths-${value || "any"}`} value={value}>
                      {value || "Any"}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={6} sm={3} md={2}>
                <TextField
                  label="Min Area"
                  name="minArea"
                  value={filters.minArea}
                  onChange={handleChange}
                  type="number"
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={6} sm={3} md={2}>
                <TextField
                  label="Max Area"
                  name="maxArea"
                  value={filters.maxArea}
                  onChange={handleChange}
                  type="number"
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  select
                  label="Furnished"
                  name="furnished"
                  value={filters.furnished}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                >
                  {furnishedOptions.map((value) => (
                    <MenuItem key={value || "all-furnished"} value={value}>
                      {value || "Any"}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  select
                  label="Status"
                  name="status"
                  value={filters.status}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                >
                  {statusOptions.map((value) => (
                    <MenuItem key={value || "all-statuses"} value={value}>
                      {value || "Any"}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Button
                  variant="outlined"
                  color="inherit"
                  fullWidth
                  startIcon={<RestartAltIcon />}
                  onClick={handleClear}
                  sx={{ height: 40, fontWeight: 600 }}
                >
                  Reset
                </Button>
              </Grid>
              {user && (
                <Grid item xs={12} sm={6} md={2}>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<BookmarkAddIcon />}
                    onClick={handleSaveSearch}
                    sx={{ height: 40, fontWeight: 600 }}
                  >
                    Save
                  </Button>
                </Grid>
              )}
            </Grid>
          </Paper>
          <Box mt={4}>
            <PropertyList filters={filters} desktopColumns={3} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Properties;
