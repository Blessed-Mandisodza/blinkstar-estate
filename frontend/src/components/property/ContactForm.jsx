import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Grid,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import SendIcon from "@mui/icons-material/Send";
import { apiFetch } from "../../utils/authFetch";

const inquiryTypes = [
  { value: "general", label: "General Inquiry" },
  { value: "viewing", label: "Schedule Viewing" },
  { value: "offer", label: "Make an Offer" },
];

const getDefaultMessage = (propertyTitle, inquiryType) => {
  const title = propertyTitle || "this property";

  if (inquiryType === "viewing") {
    return `Hi, I would like to schedule a viewing for ${title}.`;
  }

  if (inquiryType === "offer") {
    return `Hi, I would like to discuss an offer for ${title}.`;
  }

  return `Hi, I would like more information about ${title}.`;
};

const ContactForm = ({
  propertyTitle,
  propertyId,
  defaultInquiryType = "general",
  sx = {},
}) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    inquiryType: defaultInquiryType,
    preferredDate: "",
    preferredTime: "",
    message: "",
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  useEffect(() => {
    setForm((current) => ({
      ...current,
      inquiryType: defaultInquiryType,
      message:
        current.message || getDefaultMessage(propertyTitle, defaultInquiryType),
    }));
  }, [defaultInquiryType, propertyTitle]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((current) => {
      if (name !== "inquiryType") {
        return { ...current, [name]: value };
      }

      const currentDefaultMessage = getDefaultMessage(
        propertyTitle,
        current.inquiryType
      );
      const shouldUseNewDefault =
        !current.message || current.message === currentDefaultMessage;

      return {
        ...current,
        inquiryType: value,
        preferredDate: value === "viewing" ? current.preferredDate : "",
        preferredTime: value === "viewing" ? current.preferredTime : "",
        message: shouldUseNewDefault
          ? getDefaultMessage(propertyTitle, value)
          : current.message,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const pageUrl = typeof window !== "undefined" ? window.location.href : "";
      const res = await apiFetch("/api/property/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          propertyId,
          source: "contact_form",
          pageUrl,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send message");
      }
      setSuccess(true);
      setForm((current) => ({
        ...current,
        name: "",
        email: "",
        phone: "",
        preferredDate: "",
        preferredTime: "",
        message: getDefaultMessage(propertyTitle, current.inquiryType),
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mt: 3, borderRadius: 2, ...sx }}>
      <Typography variant="h6" fontWeight={700} mb={2}>
        Contact Agent
      </Typography>
      {propertyTitle && (
        <Typography variant="body2" color="text.secondary" mb={2}>
          Inquiring about: <b>{propertyTitle}</b>
        </Typography>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Your inquiry has been sent.
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              select
              label="Inquiry Type"
              name="inquiryType"
              value={form.inquiryType}
              onChange={handleChange}
              fullWidth
              required
            >
              {inquiryTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Name"
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
              value={form.email}
              onChange={handleChange}
              fullWidth
              required
              type="email"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          {form.inquiryType === "viewing" && (
            <>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Preferred Date"
                  name="preferredDate"
                  value={form.preferredDate}
                  onChange={handleChange}
                  fullWidth
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: today }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Preferred Time"
                  name="preferredTime"
                  value={form.preferredTime}
                  onChange={handleChange}
                  fullWidth
                  type="time"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </>
          )}
        </Grid>
        <TextField
          label="Message"
          name="message"
          value={form.message}
          onChange={handleChange}
          fullWidth
          required
          multiline
          rows={2}
          sx={{ mt: 2, mb: 2 }}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={loading}
          startIcon={
            form.inquiryType === "viewing" ? <EventAvailableIcon /> : <SendIcon />
          }
          sx={{ py: 1.2, fontWeight: 600 }}
        >
          {loading
            ? "Sending..."
            : form.inquiryType === "viewing"
            ? "Request Viewing"
            : "Send Inquiry"}
        </Button>
      </Box>
    </Paper>
  );
};

export default ContactForm; 
