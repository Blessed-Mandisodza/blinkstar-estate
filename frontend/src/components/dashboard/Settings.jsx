import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import LockIcon from "@mui/icons-material/Lock";
import PersonIcon from "@mui/icons-material/Person";
import { Link as RouterLink } from "react-router-dom";
import Header from "../ui/Header";
import { useAuth } from "../../context/AuthContext";
import { authFetch } from "../../utils/authFetch";

export default function Settings() {
  const { logout } = useAuth();
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswords((current) => ({ ...current, [name]: value }));
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setMessage({ type: "", text: "" });

    if (passwords.newPassword !== passwords.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match." });
      return;
    }

    setSaving(true);
    try {
      const res = await authFetch("/api/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Could not update password");

      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setMessage({ type: "success", text: "Password updated." });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Could not update password.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const res = await authFetch("/api/users/me", { method: "DELETE" });
      if (!res.ok) throw new Error("Could not delete account");
      logout();
    } catch (error) {
      setDeleteOpen(false);
      setMessage({
        type: "error",
        text: error.message || "Could not delete account.",
      });
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f6f8fb" }}>
      <Header />
      <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
        <Typography variant="h4" fontWeight={900}>
          Settings
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5, mb: 3 }}>
          Manage your account security and profile access.
        </Typography>

        {message.text && (
          <Alert severity={message.type || "info"} sx={{ mb: 2 }}>
            {message.text}
          </Alert>
        )}

        <Stack spacing={2.5}>
          <Paper
            elevation={0}
            sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2, border: "1px solid #e5e7eb" }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "center" }}
              spacing={2}
            >
              <Box>
                <Typography variant="h6" fontWeight={900}>
                  Profile Information
                </Typography>
                <Typography color="text.secondary">
                  Update your photo, contact details, and public bio.
                </Typography>
              </Box>
              <Button
                component={RouterLink}
                to="/profile"
                variant="outlined"
                startIcon={<PersonIcon />}
                sx={{ width: { xs: "100%", sm: "auto" }, fontWeight: 800 }}
              >
                Edit Profile
              </Button>
            </Stack>
          </Paper>

          <Paper
            elevation={0}
            sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2, border: "1px solid #e5e7eb" }}
          >
            <Typography variant="h6" fontWeight={900}>
              Change Password
            </Typography>
            <Box component="form" onSubmit={handlePasswordSubmit} sx={{ mt: 2 }}>
              <Stack spacing={2}>
                <TextField
                  label="Current Password"
                  name="currentPassword"
                  value={passwords.currentPassword}
                  onChange={handlePasswordChange}
                  type="password"
                  required
                  fullWidth
                />
                <TextField
                  label="New Password"
                  name="newPassword"
                  value={passwords.newPassword}
                  onChange={handlePasswordChange}
                  type="password"
                  required
                  fullWidth
                />
                <TextField
                  label="Confirm New Password"
                  name="confirmPassword"
                  value={passwords.confirmPassword}
                  onChange={handlePasswordChange}
                  type="password"
                  required
                  fullWidth
                />
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<LockIcon />}
                  disabled={saving}
                  sx={{ alignSelf: { sm: "flex-start" }, fontWeight: 800 }}
                >
                  {saving ? "Saving..." : "Update Password"}
                </Button>
              </Stack>
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2, border: "1px solid #fecaca" }}
          >
            <Typography variant="h6" fontWeight={900} color="error">
              Danger Zone
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
              Delete your account profile permanently.
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Button
              color="error"
              variant="outlined"
              startIcon={<DeleteIcon />}
              onClick={() => setDeleteOpen(true)}
            >
              Delete Account
            </Button>
          </Paper>
        </Stack>
      </Container>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Delete account?</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            This permanently deletes your profile. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDeleteAccount}>
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
