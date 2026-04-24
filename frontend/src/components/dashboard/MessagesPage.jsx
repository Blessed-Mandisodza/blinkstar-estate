import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import SendIcon from "@mui/icons-material/Send";
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

const buildThread = (message) => {
  if (!message) return [];

  const initial = {
    id: `${message._id}-initial`,
    senderRole: "client",
    senderName: message.name || "Website visitor",
    message: message.message || "No message body",
    sentAt: message.createdAt,
  };

  return [initial, ...(message.replies || []).map((reply, index) => ({
    id: `${message._id}-reply-${index}`,
    ...reply,
  }))];
};

export default function MessagesPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [messages, setMessages] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [mobileView, setMobileView] = useState("list");
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState("");

  useEffect(() => {
    authFetch("/api/messages?limit=50")
      .then((res) => res.json())
      .then((data) => {
        const nextMessages = data.messages || [];
        setMessages(nextMessages);
        setSelectedId((current) => current || nextMessages[0]?._id || "");
      })
      .catch((err) => setError(err.message || "Could not load messages"))
      .finally(() => setLoading(false));
  }, []);

  const selectedMessage = useMemo(
    () => messages.find((message) => message._id === selectedId) || messages[0] || null,
    [messages, selectedId]
  );

  const thread = useMemo(() => buildThread(selectedMessage), [selectedMessage]);

  useEffect(() => {
    if (!isMobile) {
      setMobileView("list");
    }
  }, [isMobile]);

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

  const sendReply = async () => {
    if (!selectedMessage?._id || !replyText.trim()) return;

    const isWhatsAppThread = selectedMessage.source === "whatsapp";
    const whatsappPhone = normalizeWhatsAppPhone(selectedMessage.phone);

    if (isWhatsAppThread && !whatsappPhone) {
      setError(
        "This WhatsApp lead does not include the client's phone number, so the reply cannot be sent directly to WhatsApp."
      );
      return;
    }

    setSavingId(selectedMessage._id);
    setError("");

    try {
      const res = await authFetch(`/api/messages/${selectedMessage._id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: replyText.trim(),
          channel: isWhatsAppThread ? "whatsapp" : "inbox",
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Could not send reply");
      }

      setMessages((current) =>
        current.map((message) =>
          message._id === selectedMessage._id ? data.messageThread : message
        )
      );
      if (isWhatsAppThread) {
        const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappPhone}&text=${encodeURIComponent(
          replyText.trim()
        )}`;
        window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      }
      setReplyText("");
    } catch (err) {
      setError(err.message || "Could not send reply");
    } finally {
      setSavingId("");
    }
  };

  const handleSelectMessage = (messageId) => {
    setSelectedId(messageId);
    if (isMobile) {
      setMobileView("thread");
    }
  };

  const inboxPanel = (
    <Paper
      sx={{
        borderRadius: 2,
        border: "1px solid #e5e7eb",
        overflow: "hidden",
      }}
    >
      <Box sx={{ p: 2, borderBottom: "1px solid #e5e7eb" }}>
        <Typography fontWeight={800}>Inbox</Typography>
      </Box>
      <Stack divider={<Divider flexItem />}>
        {messages.map((message) => (
          <Box
            key={message._id}
            onClick={() => handleSelectMessage(message._id)}
            sx={{
              p: 2,
              cursor: "pointer",
              bgcolor:
                message._id === selectedMessage?._id
                  ? "#eef6ff"
                  : "transparent",
            }}
          >
            <Stack direction="row" spacing={1} sx={{ mb: 0.75, flexWrap: "wrap", rowGap: 0.75 }}>
              <Chip size="small" label={message.status || "New"} />
              <Chip
                size="small"
                color="primary"
                label={message.source || "contact"}
              />
            </Stack>
            <Typography fontWeight={800} noWrap>
              {message.name || "Website visitor"}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {message.property?.title || "Property inquiry"}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                mt: 0.75,
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 2,
                overflow: "hidden",
              }}
            >
              {message.message || "No message body"}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Paper>
  );

  const threadPanel = selectedMessage ? (
    <Paper
      sx={{
        borderRadius: 2,
        border: "1px solid #e5e7eb",
        p: { xs: 2, md: 2.5 },
      }}
    >
      <Stack
        direction={{ xs: "column", lg: "row" }}
        justifyContent="space-between"
        spacing={2}
      >
        <Box sx={{ minWidth: 0 }}>
          {isMobile && (
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <IconButton
                edge="start"
                onClick={() => setMobileView("list")}
                sx={{ ml: -1 }}
                aria-label="Back to inbox"
              >
                <ArrowBackIcon />
              </IconButton>
              <Typography fontWeight={800}>Inbox</Typography>
            </Stack>
          )}
          <Typography variant="h6" fontWeight={900} sx={{ overflowWrap: "anywhere" }}>
            {selectedMessage.property?.title || "Property inquiry"}
          </Typography>
          <Typography color="text.secondary" sx={{ overflowWrap: "anywhere" }}>
            {selectedMessage.name || "Website visitor"}
            {selectedMessage.email ? ` | ${selectedMessage.email}` : ""}
            {selectedMessage.phone ? ` | ${selectedMessage.phone}` : ""}
          </Typography>
        </Box>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          sx={{ width: { xs: "100%", lg: "auto" } }}
        >
          <TextField
            select
            size="small"
            label="Status"
            value={selectedMessage.status || "New"}
            onChange={(event) =>
              updateStatus(selectedMessage._id, event.target.value)
            }
            sx={{ minWidth: { sm: 150 } }}
          >
            {statuses.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </TextField>
          {selectedMessage.phone && (
            <Button
              href={`tel:${selectedMessage.phone}`}
              variant="outlined"
              startIcon={<PhoneIcon />}
            >
              Call
            </Button>
          )}
          {selectedMessage.email && (
            <Button
              href={`mailto:${selectedMessage.email}`}
              variant="outlined"
              startIcon={<EmailIcon />}
            >
              Email
            </Button>
          )}
          {selectedMessage.phone && (
            <Button
              href={`https://api.whatsapp.com/send?phone=${normalizeWhatsAppPhone(
                selectedMessage.phone
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
        </Stack>
      </Stack>

      <Divider sx={{ my: 2 }} />

      <Stack spacing={1.5} sx={{ mb: 2.5 }}>
        {thread.map((item) => {
          const isStaff = item.senderRole !== "client";

          return (
            <Box
              key={item.id}
              sx={{
                alignSelf: isStaff ? "flex-end" : "flex-start",
                maxWidth: { xs: "100%", sm: "78%" },
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: isStaff ? "#0f172a" : "#ffffff",
                  color: isStaff ? "#ffffff" : "text.primary",
                  border: isStaff ? "none" : "1px solid #e5e7eb",
                }}
              >
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  {item.senderName || (isStaff ? "BlinkStar Team" : "Client")}
                </Typography>
                <Typography sx={{ mt: 0.5, overflowWrap: "anywhere" }}>
                  {item.message}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ display: "block", mt: 0.75, opacity: 0.75 }}
                >
                  {formatDate(item.sentAt)}
                </Typography>
              </Paper>
            </Box>
          );
        })}
      </Stack>

      <TextField
        fullWidth
        label="Reply"
        value={replyText}
        onChange={(event) => setReplyText(event.target.value)}
        multiline
        minRows={3}
      />
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "stretch", sm: "center" }}
                  spacing={1}
                  sx={{ mt: 1.5 }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {savingId === selectedMessage._id ? "Sending..." : `Last updated ${formatDate(selectedMessage.updatedAt || selectedMessage.createdAt)}`}
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={
                      selectedMessage.source === "whatsapp" ? (
                        <WhatsAppIcon />
                      ) : (
                        <SendIcon />
                      )
                    }
                    onClick={sendReply}
                    disabled={!replyText.trim() || savingId === selectedMessage._id}
                  >
                    {selectedMessage.source === "whatsapp"
                      ? "Send on WhatsApp"
                      : "Send Reply"}
                  </Button>
                </Stack>
              </Paper>
  ) : null;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f6f8fb" }}>
      <SeoHead
        title="Messages | BlinkStar Properties"
        description="Review property inquiries and manage conversations with clients."
      />
      <Header />
      <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
        <Typography variant="h4" fontWeight={900}>
          Messages
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5, mb: 3 }}>
          Manage inquiries like an inbox and reply directly from the thread.
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
        ) : isMobile ? (
          mobileView === "list" ? (
            inboxPanel
          ) : (
            threadPanel
          )
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "340px minmax(0, 1fr)" },
              gap: 2,
              alignItems: "start",
            }}
          >
            {inboxPanel}
            {threadPanel}
          </Box>
        )}
      </Container>
    </Box>
  );
}
