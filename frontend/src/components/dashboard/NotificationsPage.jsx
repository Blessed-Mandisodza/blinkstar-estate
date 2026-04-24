import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Chip,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import Header from "../ui/Header";
import SeoHead from "../ui/SeoHead";
import Loader from "../ui/Loader";
import { authFetch } from "../../utils/authFetch";
import { useAuth } from "../../context/AuthContext";

const formatDate = (date) =>
  new Date(date).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

export default function NotificationsPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?._id) return;

    Promise.all([
      authFetch("/api/messages?limit=20").then((res) => res.json()),
      authFetch(`/api/property/stats/${user._id}`).then((res) => res.json()),
    ])
      .then(([messagesData, statsData]) => {
        setMessages(messagesData.messages || []);
        setStats(statsData);
      })
      .catch((err) => setError(err.message || "Could not load notifications"))
      .finally(() => setLoading(false));
  }, [user?._id]);

  const items = useMemo(() => {
    const nextItems = [];

    if (stats?.newInquiries) {
      nextItems.push({
        id: "new-inquiries",
        label: "Leads",
        title: `${stats.newInquiries} new lead${stats.newInquiries === 1 ? "" : "s"} waiting for follow-up`,
        timestamp: new Date().toISOString(),
      });
    }

    if (stats?.pendingApprovals) {
      nextItems.push({
        id: "pending-approvals",
        label: "Listings",
        title: `${stats.pendingApprovals} listing${stats.pendingApprovals === 1 ? "" : "s"} pending approval`,
        timestamp: new Date().toISOString(),
      });
    }

    messages
      .filter((message) => message.status === "New")
      .forEach((message) => {
        nextItems.push({
          id: message._id,
          label: "Message",
          title: `${message.name || "Website visitor"} sent a new inquiry for ${message.property?.title || "a property"}`,
          timestamp: message.createdAt,
        });
      });

    return nextItems.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [messages, stats]);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f6f8fb" }}>
      <SeoHead
        title="Notifications | BlinkStar Properties"
        description="Stay on top of new inquiries and listing activity."
      />
      <Header />
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
        <Typography variant="h4" fontWeight={900}>
          Notifications
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5, mb: 3 }}>
          A quick view of the latest activity on your account.
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
        ) : items.length === 0 ? (
          <Paper sx={{ p: 3, borderRadius: 2, border: "1px solid #e5e7eb" }}>
            <Typography color="text.secondary">No notifications yet.</Typography>
          </Paper>
        ) : (
          <Stack spacing={2}>
            {items.map((item) => (
              <Paper
                key={item.id}
                sx={{
                  p: { xs: 2, sm: 2.5 },
                  borderRadius: 2,
                  border: "1px solid #e5e7eb",
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      bgcolor: "#e0f2fe",
                      color: "#0369a1",
                      display: "grid",
                      placeItems: "center",
                      flexShrink: 0,
                    }}
                  >
                    <NotificationsActiveIcon fontSize="small" />
                  </Box>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Chip size="small" label={item.label} sx={{ mb: 1 }} />
                    <Typography fontWeight={800} sx={{ overflowWrap: "anywhere" }}>
                      {item.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(item.timestamp)}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}
      </Container>
    </Box>
  );
}
