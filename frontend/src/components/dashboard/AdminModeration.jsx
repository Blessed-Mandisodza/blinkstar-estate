import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import RefreshIcon from "@mui/icons-material/Refresh";
import { authFetch } from "../../utils/authFetch";

const reviewStatuses = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "all", label: "All" },
];

const formatPrice = (price) => {
  const amount = Number(price);
  if (!Number.isFinite(amount)) return "Price on request";
  return `$${amount.toLocaleString()}`;
};

const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function AdminModeration() {
  const [properties, setProperties] = useState([]);
  const [counts, setCounts] = useState({});
  const [reviewStatus, setReviewStatus] = useState("pending");
  const [notesById, setNotesById] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [message, setMessage] = useState("");

  const fetchQueue = useCallback(() => {
    setLoading(true);
    setMessage("");

    authFetch(`/api/property/admin/moderation?reviewStatus=${reviewStatus}`)
      .then((res) => res.json())
      .then((data) => {
        setProperties(data.properties || []);
        setCounts(data.counts || {});
        setNotesById(
          (data.properties || []).reduce(
            (next, property) => ({
              ...next,
              [property._id]: property.reviewNotes || "",
            }),
            {}
          )
        );
      })
      .catch((err) => setMessage(err.message || "Could not load moderation queue"))
      .finally(() => setLoading(false));
  }, [reviewStatus]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const reviewListing = async (propertyId, nextStatus) => {
    setSavingId(propertyId);
    setMessage("");
    const previousStatus =
      properties.find((property) => property._id === propertyId)?.reviewStatus ||
      "pending";

    try {
      const res = await authFetch(`/api/property/${propertyId}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewStatus: nextStatus,
          reviewNotes: notesById[propertyId] || "",
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Could not update listing");
      }

      setProperties((current) =>
        reviewStatus === "all"
          ? current.map((property) =>
              property._id === propertyId ? data.property : property
            )
          : current.filter((property) => property._id !== propertyId)
      );
      setCounts((current) =>
        previousStatus === nextStatus
          ? current
          : {
              ...current,
              [previousStatus]: Math.max((current[previousStatus] || 1) - 1, 0),
              [nextStatus]: (current[nextStatus] || 0) + 1,
            }
      );
      setMessage(`Listing ${nextStatus}.`);
    } catch (err) {
      setMessage(err.message || "Could not update listing");
    } finally {
      setSavingId("");
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={1.5}
        sx={{ mb: 2 }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Listing Moderation
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap", rowGap: 1 }}>
            <Chip size="small" label={`Pending ${counts.pending || 0}`} />
            <Chip size="small" color="success" label={`Approved ${counts.approved || 0}`} />
            <Chip size="small" color="error" label={`Rejected ${counts.rejected || 0}`} />
          </Stack>
        </Box>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ width: { xs: "100%", sm: "auto" } }}>
          <TextField
            select
            size="small"
            label="Queue"
            value={reviewStatus}
            onChange={(event) => setReviewStatus(event.target.value)}
            sx={{ minWidth: { xs: "100%", sm: 160 } }}
          >
            {reviewStatuses.map((status) => (
              <MenuItem key={status.value} value={status.value}>
                {status.label}
              </MenuItem>
            ))}
          </TextField>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchQueue}>
            Refresh
          </Button>
        </Stack>
      </Stack>

      {message && (
        <Alert
          severity={message.includes("Could not") ? "error" : "success"}
          sx={{ mb: 2 }}
        >
          {message}
        </Alert>
      )}

      {loading ? (
        <Card sx={{ borderRadius: 2, border: "1px solid #e5e7eb" }}>
          <CardContent>
            <Typography color="text.secondary">Loading moderation queue...</Typography>
          </CardContent>
        </Card>
      ) : properties.length === 0 ? (
        <Card sx={{ borderRadius: 2, border: "1px solid #e5e7eb" }}>
          <CardContent>
            <Typography color="text.secondary">No listings in this queue.</Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {properties.map((property) => (
            <Grid item xs={12} md={6} lg={4} key={property._id}>
              <Card
                sx={{
                  height: "100%",
                  borderRadius: 2,
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)",
                }}
              >
                <CardContent>
                  <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: "wrap", rowGap: 1 }}>
                    <Chip label={property.reviewStatus || "pending"} size="small" />
                    {property.status && <Chip label={property.status} size="small" color="primary" />}
                  </Stack>
                  <Typography
                    variant="h6"
                    fontWeight={800}
                    sx={{
                      display: "-webkit-box",
                      WebkitBoxOrient: "vertical",
                      WebkitLineClamp: 2,
                      overflow: "hidden",
                    }}
                  >
                    {property.title}
                  </Typography>
                  <Typography color="primary" fontWeight={800}>
                    {formatPrice(property.price)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: "anywhere" }}>
                    {property.location} | {property.propertyType}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Submitted {formatDate(property.createdAt)} by{" "}
                    {property.listedBy?.name || property.listedBy?.email || "Unknown"}
                  </Typography>
                  <TextField
                    size="small"
                    label="Review notes"
                    value={notesById[property._id] || ""}
                    fullWidth
                    multiline
                    minRows={2}
                    sx={{ mt: 2 }}
                    onChange={(event) =>
                      setNotesById((current) => ({
                        ...current,
                        [property._id]: event.target.value,
                      }))
                    }
                  />
                  <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      startIcon={<CheckCircleIcon />}
                      disabled={savingId === property._id}
                      onClick={() => reviewListing(property._id, "approved")}
                    >
                      Approve
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      startIcon={<HighlightOffIcon />}
                      disabled={savingId === property._id}
                      onClick={() => reviewListing(property._id, "rejected")}
                    >
                      Reject
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
