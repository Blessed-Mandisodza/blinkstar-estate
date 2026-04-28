import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import CssBaseline from "@mui/material/CssBaseline";
import FormControlLabel from "@mui/material/FormControlLabel";
import Divider from "@mui/material/Divider";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import MuiCard from "@mui/material/Card";
import Container from "@mui/material/Container";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { styled } from "@mui/material/styles";
import ForgotPassword from "./ForgotPassword";
import { GoogleIcon } from "./CustomIcons";
import { authFetch, buildApiRedirectUrl } from "../../utils/authFetch";
import { useAuth } from "../../context/AuthContext";

// Styled Card component for sign-in form
const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  width: "100%",
  padding: theme.spacing(2),
  gap: theme.spacing(0.5),
  maxWidth: "400px",
  boxShadow:
    "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1.5),
    maxHeight: "calc(100vh - 32px)", // Account for container padding
    overflowY: "auto",
  },
}));

// Styled container for the sign-in layout
const SignInContainer = styled(Container)(({ theme }) => ({
  minHeight: "100dvh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(2),
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2),
  },
}));

// Styled form fields container
const FormFields = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1.5),
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(1),
  width: "100%",
}));

// Styled button
const StyledButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1.5),
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(1),
  fontWeight: 600,
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1),
  },
}));

// Styled social buttons container
const SocialButtons = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1),
  marginTop: theme.spacing(1),
}));

// Styled heading
const StyledHeading = styled(Typography)(({ theme }) => ({
  fontSize: "1.5rem",
  fontWeight: 600,
  marginBottom: theme.spacing(0.5),
  [theme.breakpoints.down("sm")]: {
    fontSize: "1.25rem",
  },
}));

// Styled brand name
const BrandName = styled(Typography)(({ theme }) => ({
  fontSize: "1rem",
  fontWeight: 500,
  color: theme.palette.primary.main,
  marginBottom: theme.spacing(0.5),
}));

// Styled form control
const StyledFormControl = styled(FormControl)(({ theme }) => ({
  "& .MuiFormLabel-root": {
    marginBottom: theme.spacing(0.5),
  },
  "& .MuiInputBase-root": {
    marginBottom: theme.spacing(0.5),
  },
}));

export default function SignIn() {
  const { login } = useAuth();
  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState("");
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [alert, setAlert] = React.useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleAlertClose = () => {
    setAlert({ ...alert, open: false });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (emailError || passwordError) {
      return;
    }

    const data = new FormData(event.currentTarget);
    const email = data.get("email");
    const password = data.get("password");

    if (!validateInputs()) {
      return;
    }

    setLoading(true);
    try {
      const response = await authFetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Login failed");
      }

      // Use the login function from AuthContext
      login(result.user, result.token);

      setAlert({
        open: true,
        message: "Login successful!",
        severity: "success",
      });

      // Redirect to home page
      window.location.href = "/";
    } catch (error) {
      setAlert({
        open: true,
        message: error.message || "Login failed",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const validateInputs = () => {
    const email = document.getElementById("email");
    const password = document.getElementById("password");

    let isValid = true;

    if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
      setEmailError(true);
      setEmailErrorMessage("Please enter a valid email address.");
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage("");
    }

    if (!password.value || password.value.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage("Password must be at least 6 characters long.");
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage("");
    }

    return isValid;
  };

  const handleGoogleSignIn = async () => {
    window.location.href = buildApiRedirectUrl("/api/auth/google?next=/");
  };

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        bgcolor: (theme) => theme.palette.background.default,
      }}
    >
      <CssBaseline />
      <SignInContainer maxWidth="sm">
        <Card variant="outlined">
          <BrandName variant="h6">BlinkStar Properties</BrandName>
          <StyledHeading variant="h1">Sign in</StyledHeading>
          <FormFields component="form" onSubmit={handleSubmit} noValidate>
            <StyledFormControl>
              <FormLabel htmlFor="email">Email</FormLabel>
              <TextField
                error={emailError}
                helperText={emailErrorMessage}
                id="email"
                type="email"
                name="email"
                placeholder="your@email.com"
                autoComplete="email"
                autoFocus
                required
                fullWidth
                size="small"
                variant="outlined"
                disabled={loading}
              />
            </StyledFormControl>
            <StyledFormControl>
              <FormLabel htmlFor="password">Password</FormLabel>
              <TextField
                error={passwordError}
                helperText={passwordErrorMessage}
                name="password"
                placeholder="••••••"
                type="password"
                id="password"
                autoComplete="current-password"
                required
                fullWidth
                size="small"
                variant="outlined"
                disabled={loading}
              />
            </StyledFormControl>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    value="remember"
                    color="primary"
                    disabled={loading}
                    size="small"
                  />
                }
                label={<Typography variant="body2">Remember me</Typography>}
              />
              <Link
                component="button"
                type="button"
                onClick={handleClickOpen}
                variant="body2"
                sx={{
                  textDecoration: "none",
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
                disabled={loading}
              >
                Forgot password?
              </Link>
            </Box>
            <StyledButton
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Sign in"}
            </StyledButton>
          </FormFields>

          <Divider sx={{ my: 1 }}>or</Divider>

          <SocialButtons>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleGoogleSignIn}
              startIcon={<GoogleIcon />}
              disabled={loading}
              size="medium"
            >
              Continue with Google
            </Button>
            <Typography
              variant="body2"
              sx={{
                textAlign: "center",
                mt: 1,
              }}
            >
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                variant="body2"
                sx={{
                  fontWeight: 500,
                  textDecoration: "none",
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                Sign up
              </Link>
            </Typography>
          </SocialButtons>
        </Card>
      </SignInContainer>
      <ForgotPassword open={open} handleClose={handleClose} />
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleAlertClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        sx={{
          position: "fixed",
          top: { xs: 0, sm: 24 },
        }}
      >
        <Alert
          onClose={handleAlertClose}
          severity={alert.severity}
          variant="filled"
          elevation={6}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
