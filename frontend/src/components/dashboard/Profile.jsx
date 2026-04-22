import React, { useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  Cancel as CancelIcon,
  Delete as DeleteIcon,
  PhotoCamera as PhotoCameraIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import Header from "../ui/Header";
import { useAuth } from "../../context/AuthContext";
import { authFetch } from "../../utils/authFetch";

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const getUserForm = (user) => ({
  name: user?.name || "",
  email: user?.email || "",
  phone: user?.phone || "",
  whatsapp: user?.whatsapp || "",
  location: user?.location || "",
  avatarUrl: user?.avatarUrl || "",
  bio: user?.bio || "",
});

export default function Profile() {
  const { user, setUser, logout } = useAuth();
  const [formData, setFormData] = useState(() => getUserForm(user));
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    authFetch("/api/users/me")
      .then((res) => res.json())
      .then((freshUser) => {
        setUser(freshUser);
        setFormData(getUserForm(freshUser));
      })
      .catch(() => {});
  }, [setUser]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "Please choose an image file." });
      return;
    }

    if (file.size > 900 * 1024) {
      setMessage({
        type: "error",
        text: "Please choose an image smaller than 900KB.",
      });
      return;
    }

    const avatarUrl = await readFileAsDataUrl(file);
    setFormData((current) => ({ ...current, avatarUrl }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await authFetch("/api/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const updatedUser = await res.json();
      if (!res.ok) throw new Error(updatedUser.message || "Failed to update profile");

      setUser(updatedUser);
      setFormData(getUserForm(updatedUser));
      setMessage({ type: "success", text: "Profile updated." });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Failed to update profile.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setFormData(getUserForm(user));
    setMessage({ type: "", text: "" });
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
        <Stack spacing={0.5} sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight={900}>
            Profile
          </Typography>
          <Typography color="text.secondary">
            Keep your contact details fresh so people can reach you.
          </Typography>
        </Stack>

        {message.text && (
          <Alert severity={message.type || "info"} sx={{ mb: 2 }}>
            {message.text}
          </Alert>
        )}

        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 3 },
            borderRadius: 2,
            border: "1px solid #e5e7eb",
          }}
        >
          <Box component="form" onSubmit={handleSubmit}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2.5}
              alignItems={{ xs: "center", sm: "flex-start" }}
              sx={{ mb: 3 }}
            >
              <Avatar
                src={formData.avatarUrl}
                sx={{ width: 110, height: 110, bgcolor: "primary.main" }}
              >
                {(formData.name?.[0] || formData.email?.[0] || "U").toUpperCase()}
              </Avatar>
              <Box sx={{ flex: 1, width: "100%" }}>
                <Typography variant="h6" fontWeight={900}>
                  {formData.name || "Your profile"}
                </Typography>
                <Typography color="text.secondary" sx={{ overflowWrap: "anywhere" }}>
                  {formData.email}
                </Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mt: 2 }}>
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<PhotoCameraIcon />}
                    sx={{ fontWeight: 800 }}
                  >
                    Upload Photo
                    <input
                      hidden
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </Button>
                  <Button
                    variant="text"
                    color="inherit"
                    onClick={() =>
                      setFormData((current) => ({ ...current, avatarUrl: "" }))
                    }
                  >
                    Remove
                  </Button>
                </Stack>
              </Box>
            </Stack>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={formData.email}
                  disabled
                  type="email"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="WhatsApp"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  multiline
                  rows={4}
                />
              </Grid>
            </Grid>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.25}
              justifyContent="space-between"
              sx={{ mt: 3 }}
            >
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setDeleteOpen(true)}
              >
                Delete Account
              </Button>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={<CancelIcon />}
                  onClick={handleReset}
                >
                  Reset
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  type="submit"
                  disabled={saving}
                  sx={{ fontWeight: 800 }}
                >
                  {saving ? "Saving..." : "Save Profile"}
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Paper>
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
