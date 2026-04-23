import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Switch,
  Stack,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import Header from "../ui/Header";
import Loader from "../ui/Loader";
import { authFetch } from "../../utils/authFetch";

const buildSearchUrl = (filters = {}) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });

  return `/properties${params.toString() ? `?${params.toString()}` : ""}`;
};

const formatDate = (date) => {
  if (!date) return "Not sent yet";
  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function SavedSearches() {
  const [searches, setSearches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSearches = () => {
    setLoading(true);
    setError("");

    authFetch("/api/property/saved-searches")
      .then((res) => res.json())
      .then((data) => setSearches(data.searches || []))
      .catch((err) => setError(err.message || "Could not load saved searches"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSearches();
  }, []);

  const deleteSearch = async (id) => {
    const res = await authFetch(`/api/property/saved-searches/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setSearches((current) => current.filter((search) => search._id !== id));
    }
  };

  const toggleAlerts = async (search) => {
    const nextAlertsEnabled = !search.alertsEnabled;
    setSearches((current) =>
      current.map((item) =>
        item._id === search._id
          ? { ...item, alertsEnabled: nextAlertsEnabled }
          : item
      )
    );

    const res = await authFetch(`/api/property/saved-searches/${search._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alertsEnabled: nextAlertsEnabled }),
    });

    if (res.ok) {
      const data = await res.json();
      setSearches((current) =>
        current.map((item) => (item._id === search._id ? data.search : item))
      );
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f6f8fb" }}>
      <Header />
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight={800}>
            Saved Searches
          </Typography>
          <Typography color="text.secondary">
            {searches.length} alert{searches.length === 1 ? "" : "s"}
          </Typography>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" py={8}>
            <Loader size="large" />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : searches.length === 0 ? (
          <Box textAlign="center" py={8}>
            <SearchIcon color="disabled" sx={{ fontSize: 64, mb: 2 }} />
            <Typography variant="h6" fontWeight={700}>
              No saved searches yet.
            </Typography>
            <Button href="/properties" variant="contained" sx={{ mt: 2 }}>
              Browse Properties
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {searches.map((search) => (
              <Grid item xs={12} md={6} key={search._id}>
                <Card sx={{ height: "100%", borderRadius: 2 }}>
                  <CardContent>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      spacing={2}
                      sx={{ mb: 1 }}
                    >
                      <Typography variant="h6" fontWeight={800}>
                        {search.name}
                      </Typography>
                      <Chip
                        size="small"
                        color={search.alertsEnabled ? "success" : "default"}
                        label={search.alertsEnabled ? "Alerts On" : "Alerts Off"}
                      />
                    </Stack>
                    <Stack direction="row" spacing={1} flexWrap="wrap" rowGap={1}>
                      {Object.entries(search.filters || {})
                        .filter(([, value]) => Boolean(value))
                        .map(([key, value]) => (
                          <Chip key={key} size="small" label={`${key}: ${value}`} />
                        ))}
                    </Stack>
                    <Stack
                      direction="row"
                      spacing={1}
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ mt: 2, flexWrap: "wrap", rowGap: 1 }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Last alert: {formatDate(search.lastNotifiedAt)}
                      </Typography>
                      <Switch
                        checked={Boolean(search.alertsEnabled)}
                        onChange={() => toggleAlerts(search)}
                        inputProps={{ "aria-label": "Toggle saved search alerts" }}
                      />
                    </Stack>
                    <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                      <Button
                        href={buildSearchUrl(search.filters)}
                        variant="contained"
                        size="small"
                      >
                        Open
                      </Button>
                      <Button
                        color="error"
                        variant="outlined"
                        size="small"
                        onClick={() => deleteSearch(search._id)}
                      >
                        Delete
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}
