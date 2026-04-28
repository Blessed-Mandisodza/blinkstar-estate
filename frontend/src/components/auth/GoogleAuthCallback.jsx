import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  CssBaseline,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const parseGoogleCallbackParams = () => {
  const rawParams = window.location.hash
    ? window.location.hash.slice(1)
    : window.location.search.slice(1);
  const params = new URLSearchParams(rawParams);
  const token = params.get("token");
  const next = params.get("next") || "/";
  const error = params.get("error");
  const userValue = params.get("user");
  let user = null;

  if (userValue) {
    try {
      user = JSON.parse(userValue);
    } catch {
      user = null;
    }
  }

  return { token, next, error, user };
};

export default function GoogleAuthCallback() {
  const { login } = useAuth();
  const [status, setStatus] = useState({
    loading: true,
    error: "",
  });
  const callbackParams = useMemo(parseGoogleCallbackParams, []);

  useEffect(() => {
    if (callbackParams.error) {
      setStatus({
        loading: false,
        error: callbackParams.error,
      });
      return;
    }

    if (!callbackParams.token || !callbackParams.user) {
      setStatus({
        loading: false,
        error: "Google sign-in could not be completed. Please try again.",
      });
      return;
    }

    login(callbackParams.user, callbackParams.token);
    window.history.replaceState(null, "", "/auth/google/callback");
    window.location.replace(callbackParams.next || "/");
  }, [callbackParams, login]);

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        px: 2,
        bgcolor: (theme) => theme.palette.background.default,
      }}
    >
      <CssBaseline />
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 420,
          p: { xs: 3, sm: 4 },
          borderRadius: 2,
          border: "1px solid #e5e7eb",
        }}
      >
        <Stack spacing={2} alignItems="center" textAlign="center">
          {status.loading ? (
            <>
              <CircularProgress />
              <Typography variant="h6" fontWeight={800}>
                Finishing Google sign-in
              </Typography>
              <Typography color="text.secondary">
                We are bringing your account in now.
              </Typography>
            </>
          ) : (
            <>
              <Alert severity="error" sx={{ width: "100%" }}>
                {status.error}
              </Alert>
              <Button component={RouterLink} to="/signin" variant="contained">
                Back to Sign In
              </Button>
            </>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}
