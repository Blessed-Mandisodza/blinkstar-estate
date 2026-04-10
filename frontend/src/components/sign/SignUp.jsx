import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
// import Stack from "@mui/material/Stack";
import MuiCard from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Container from "@mui/material/Container";
import { styled } from "@mui/material/styles";
import { GoogleIcon, FacebookIcon } from "./CustomIcons";
import { useAuth } from "../../context/AuthContext";
import { apiFetch, buildApiUrl } from "../../utils/authFetch";

// Styled Card component for sign-up form
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

// Styled container for the sign-up layout
const SignUpContainer = styled(Container)(({ theme }) => ({
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

// Styled form control for more compact layout
const StyledFormControl = styled(FormControl)(({ theme }) => ({
  "& .MuiFormLabel-root": {
    marginBottom: theme.spacing(0.5),
  },
  "& .MuiInputBase-root": {
    marginBottom: theme.spacing(0.5),
  },
}));

export default function SignUp() {
  const { login } = useAuth();
  const [formErrors, setFormErrors] = React.useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = React.useState(false);
  const [alert, setAlert] = React.useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleAlertClose = () => {
    setAlert({ ...alert, open: false });
  };

  const validateInputs = (data) => {
    const errors = {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    };
    let isValid = true;

    // Validate name
    if (!data.name || data.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters long";
      isValid = false;
    }

    // Validate email
    if (!data.email || !/\S+@\S+\.\S+/.test(data.email)) {
      errors.email = "Please enter a valid email address";
      isValid = false;
    }

    // Validate password
    if (!data.password || data.password.length < 6) {
      errors.password = "Password must be at least 6 characters long";
      isValid = false;
    }

    // Validate confirm password
    if (data.password !== data.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    };

    if (!validateInputs(data)) {
      return;
    }

    setLoading(true);
    try {
      const response = await apiFetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Registration failed");
      }

      // Use the login function from AuthContext
      login(result.user, result.token);

      setAlert({
        open: true,
        message: "Registration successful! Redirecting...",
        severity: "success",
      });

      // Redirect to home page after 2 seconds
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } catch (error) {
      setAlert({
        open: true,
        message: error.message || "Registration failed",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    window.location.href = buildApiUrl("/api/auth/google");
  };

  const handleFacebookSignUp = async () => {
    window.location.href = buildApiUrl("/api/auth/facebook");
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
      <SignUpContainer maxWidth="sm">
        <Card variant="outlined">
          <BrandName variant="h6">BlinkStar Properties</BrandName>
          <StyledHeading variant="h1">Create Account</StyledHeading>
          <FormFields component="form" onSubmit={handleSubmit} noValidate>
            <StyledFormControl>
              <FormLabel htmlFor="name">Full Name</FormLabel>
              <TextField
                error={!!formErrors.name}
                helperText={formErrors.name}
                id="name"
                name="name"
                type="text"
                placeholder="Your Name"
                autoComplete="name"
                autoFocus
                required
                fullWidth
                size="small"
                variant="outlined"
                disabled={loading}
              />
            </StyledFormControl>
            <StyledFormControl>
              <FormLabel htmlFor="email">Email</FormLabel>
              <TextField
                error={!!formErrors.email}
                helperText={formErrors.email}
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                autoComplete="email"
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
                error={!!formErrors.password}
                helperText={formErrors.password}
                id="password"
                name="password"
                type="password"
                placeholder="••••••"
                autoComplete="new-password"
                required
                fullWidth
                size="small"
                variant="outlined"
                disabled={loading}
              />
            </StyledFormControl>
            <StyledFormControl>
              <FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
              <TextField
                error={!!formErrors.confirmPassword}
                helperText={formErrors.confirmPassword}
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••"
                autoComplete="new-password"
                required
                fullWidth
                size="small"
                variant="outlined"
                disabled={loading}
              />
            </StyledFormControl>
            <StyledButton
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Sign up"}
            </StyledButton>
          </FormFields>

          <Divider sx={{ my: 1 }}>or</Divider>

          <SocialButtons>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleGoogleSignUp}
              startIcon={<GoogleIcon />}
              disabled={loading}
              size="medium"
            >
              Sign up with Google
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleFacebookSignUp}
              startIcon={<FacebookIcon />}
              disabled={loading}
              size="medium"
            >
              Sign up with Facebook
            </Button>
            <Typography
              variant="body2"
              sx={{
                textAlign: "center",
                mt: 1,
              }}
            >
              Already have an account?{" "}
              <Link
                href="/signin"
                variant="body2"
                sx={{
                  fontWeight: 500,
                  textDecoration: "none",
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                Sign in
              </Link>
            </Typography>
          </SocialButtons>
        </Card>
      </SignUpContainer>
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
