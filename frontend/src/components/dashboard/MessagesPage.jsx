import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import Header from "../ui/Header";
import SeoHead from "../ui/SeoHead";
import Loader from "../ui/Loader";
import { authFetch } from "../../utils/authFetch";

const statuses = ["New", "Contacted", "Closed", "Archived"];

const formatDate = (date) =>
  new Date(date).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

const normalizeWhatsAppPhone = (phone) => {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return "";
  return digits.startsWith("0") ? `263${digits.slice(1)}` : digits;
};

export default function MessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState("");

  useEffect(() => {
    authFetch("/api/messages?limit=40")
      .then((res) => res.json())
      .then((data) => setMessages(data.messages || []))
      .catch((err) => setError(err.message || "Could not load messages"))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (messageId, status) => {
    setSavingId(messageId);
    setError("");

    try {
      const res = await authFetch(`/api/property/inquiries/${messageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Could not update message");
      }

      setMessages((current) =>
        current.map((message) =>
          message._id === messageId ? data.inquiry : message
        )
      );
    } catch (err) {
      setError(err.message || "Could not update message");
    } finally {
      setSavingId("");
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f6f8fb" }}>
      <SeoHead
        title="Messages | BlinkStar Properties"
        description="Review property inquiries and manage message follow-ups."
      />
      <Header />
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
        <Typography variant="h4" fontWeight={900}>
          Messages
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5, mb: 3 }}>
          Follow up with everyone who has contacted you about a property.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" py={8}>
            <Loader size="large" />
          </Box>
        ) : messages.length === 0 ? (
          <Paper sx={{ p: 3, borderRadius: 2, border: "1px solid #e5e7eb" }}>
            <Typography color="text.secondary">No messages yet.</Typography>
          </Paper>
        ) : (
          <Stack spacing={2}>
            {messages.map((message) => (
              <Paper
                key={message._id}
                sx={{
                  p: { xs: 2, sm: 2.5 },
                  borderRadius: 2,
                  border: "1px solid #e5e7eb",
                }}
              >
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  justifyContent="space-between"
                  spacing={2}
                >
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: "wrap", rowGap: 1 }}>
                      <Chip size="small" label={message.status || "New"} />
                      <Chip size="small" color="primary" label={message.source || "contact"} />
                    </Stack>
                    <Typography variant="h6" fontWeight={800} sx={{ overflowWrap: "anywhere" }}>
                      {message.property?.title || "Property inquiry"}
                    </Typography>
                    <Typography color="text.secondary" sx={{ overflowWrap: "anywhere" }}>
                      {message.name || "Website visitor"}
                      {message.email ? ` | ${message.email}` : ""}
                      {message.phone ? ` | ${message.phone}` : ""}
                    </Typography>
                    <Typography sx={{ mt: 1.25, overflowWrap: "anywhere" }}>
                      {message.message || "No message body"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.5 }}>
                      {formatDate(message.createdAt)}
                    </Typography>
                  </Box>

                  <Divider flexItem orientation="vertical" sx={{ display: { xs: "none", md: "block" } }} />

                  <Stack spacing={1.25} sx={{ width: { xs: "100%", md: 220 } }}>
                    <TextField
                      select
                      size="small"
                      label="Status"
                      value={message.status || "New"}
                      onChange={(event) => updateStatus(message._id, event.target.value)}
                    >
                      {statuses.map((status) => (
                        <MenuItem key={status} value={status}>
                          {status}
                        </MenuItem>
                      ))}
                    </TextField>
                    {message.phone && (
                      <Button
                        href={`tel:${message.phone}`}
                        variant="outlined"
                        startIcon={<PhoneIcon />}
                      >
                        Call
                      </Button>
                    )}
                    {message.email && (
                      <Button
                        href={`mailto:${message.email}`}
                        variant="outlined"
                        startIcon={<EmailIcon />}
                      >
                        Email
                      </Button>
                    )}
                    {message.phone && (
                      <Button
                        href={`https://api.whatsapp.com/send?phone=${normalizeWhatsAppPhone(
                          message.phone
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="contained"
                        color="success"
                        startIcon={<WhatsAppIcon />}
                      >
                        WhatsApp
                      </Button>
                    )}
                    {savingId === message._id && (
                      <Typography variant="caption" color="text.secondary">
                        Saving...
                      </Typography>
                    )}
                  </Stack>
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}
      </Container>
    </Box>
  );
}
