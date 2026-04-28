const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const Property = require("../models/Property");
const crypto = require("crypto");
const auth = require("../middleware/auth");
const GOOGLE_STATE_COOKIE = "blinkstar_google_state";

const normalizeUrl = (value) =>
  typeof value === "string" ? value.trim().replace(/\/+$/, "") : "";

const getFrontendOrigin = () =>
  normalizeUrl(
    process.env.FRONTEND_URL ||
      (process.env.NODE_ENV !== "production" ? "http://localhost:3000" : "")
  );

const getBackendOrigin = (req) =>
  normalizeUrl(
    process.env.BACKEND_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
      `${req.headers["x-forwarded-proto"] || req.protocol}://${req.get("host")}`
  );

const getGoogleConfig = (req) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = normalizeUrl(
    process.env.GOOGLE_REDIRECT_URI ||
      `${getBackendOrigin(req)}/api/auth/google/callback`
  );
  const frontendOrigin = getFrontendOrigin();

  if (!clientId || !clientSecret) {
    throw new Error(
      "Missing required environment variables: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET"
    );
  }

  if (!frontendOrigin) {
    throw new Error("Missing required environment variable: FRONTEND_URL");
  }

  return { clientId, clientSecret, redirectUri, frontendOrigin };
};

const signAppToken = (user) =>
  jwt.sign({ userId: user._id }, getJwtSecret(), {
    expiresIn: "30d",
  });

const buildAuthUser = (user) => ({
  id: user._id,
  _id: user._id,
  email: user.email,
  name: user.name,
  role: user.role,
  avatarUrl: user.avatarUrl || "",
});

const getSafeNextPath = (value) =>
  typeof value === "string" && value.startsWith("/") ? value : "/";

const parseCookies = (cookieHeader = "") =>
  cookieHeader.split(";").reduce((acc, cookiePart) => {
    const [rawName, ...rawValue] = cookiePart.trim().split("=");

    if (!rawName) {
      return acc;
    }

    acc[rawName] = decodeURIComponent(rawValue.join("="));
    return acc;
  }, {});

const encodeState = (payload) =>
  Buffer.from(JSON.stringify(payload)).toString("base64url");

const decodeState = (value) => {
  try {
    return JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
  } catch {
    return null;
  }
};

const buildFrontendCallbackUrl = ({ frontendOrigin, token, user, next, error }) => {
  const params = new URLSearchParams();

  if (token) {
    params.set("token", token);
  }

  if (user) {
    params.set("user", JSON.stringify(user));
  }

  if (next) {
    params.set("next", next);
  }

  if (error) {
    params.set("error", error);
  }

  return `${frontendOrigin}/auth/google/callback#${params.toString()}`;
};

const redirectGoogleResult = (req, res, options) => {
  const { frontendOrigin } = getGoogleConfig(req);
  const redirectUrl = buildFrontendCallbackUrl({
    frontendOrigin,
    ...options,
  });

  return res.redirect(redirectUrl);
};

const sendGoogleResult = (req, res, options) => {
  try {
    return redirectGoogleResult(req, res, options);
  } catch (error) {
    console.error("Google redirect error:", error);
    return res.status(500).json({
      message:
        options.error || error.message || "Google sign-in could not be completed.",
    });
  }
};

const getJwtSecret = () => {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("Missing required environment variable: JWT_SECRET");
  }

  return jwtSecret;
};

const validateRegistration = [
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 6 }),
  body("name").trim().notEmpty(),
];

const validateLogin = [
  body("email").isEmail().normalizeEmail(),
  body("password").notEmpty(),
];

router.get("/google", (req, res) => {
  try {
    const { clientId, redirectUri } = getGoogleConfig(req);
    const next = getSafeNextPath(req.query.next);
    const state = encodeState({
      nonce: crypto.randomBytes(16).toString("hex"),
      next,
      issuedAt: Date.now(),
    });

    res.cookie(GOOGLE_STATE_COOKIE, state, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 10 * 60 * 1000,
      path: "/api/auth/google",
    });

    const query = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      prompt: "select_account",
      state,
    });

    return res.redirect(
      `https://accounts.google.com/o/oauth2/v2/auth?${query.toString()}`
    );
  } catch (error) {
    console.error("Google auth start error:", error);
    return res.status(500).json({ message: error.message || "Google sign-in failed" });
  }
});

router.get("/google/callback", async (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  const storedState = cookies[GOOGLE_STATE_COOKIE];
  const incomingState = typeof req.query.state === "string" ? req.query.state : "";

  res.clearCookie(GOOGLE_STATE_COOKIE, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/api/auth/google",
  });

  try {
    if (typeof req.query.error === "string") {
      return sendGoogleResult(req, res, {
        error: req.query.error_description || req.query.error,
      });
    }

    if (!incomingState || !storedState || incomingState !== storedState) {
      return sendGoogleResult(req, res, {
        error: "Google sign-in session expired. Please try again.",
      });
    }

    const statePayload = decodeState(incomingState);
    const next = getSafeNextPath(statePayload?.next);

    if (
      !statePayload ||
      typeof statePayload.issuedAt !== "number" ||
      Date.now() - statePayload.issuedAt > 10 * 60 * 1000
    ) {
      return sendGoogleResult(req, res, {
        error: "Google sign-in session expired. Please try again.",
      });
    }

    const code = typeof req.query.code === "string" ? req.query.code : "";

    if (!code) {
      return sendGoogleResult(req, res, {
        error: "Google sign-in did not return an authorization code.",
      });
    }

    const { clientId, clientSecret, redirectUri } = getGoogleConfig(req);
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });
    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      throw new Error(
        tokenData.error_description ||
          tokenData.error ||
          "Could not complete Google sign-in."
      );
    }

    const googleProfileResponse = await fetch(
      "https://openidconnect.googleapis.com/v1/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      }
    );
    const googleProfile = await googleProfileResponse.json();

    if (!googleProfileResponse.ok || !googleProfile.email) {
      throw new Error("Could not read your Google account details.");
    }

    if (googleProfile.email_verified === false) {
      throw new Error("Your Google email address is not verified.");
    }

    const normalizedEmail = googleProfile.email.trim().toLowerCase();
    let user = await User.findOne({
      $or: [
        { socialProvider: "google", socialId: googleProfile.sub },
        { email: normalizedEmail },
      ],
    });

    if (!user) {
      user = new User({
        email: normalizedEmail,
        name: googleProfile.name || normalizedEmail.split("@")[0],
        password: crypto.randomBytes(24).toString("hex"),
        avatarUrl: googleProfile.picture || "",
        verified: true,
        socialProvider: "google",
        socialId: googleProfile.sub,
      });
    } else {
      user.email = normalizedEmail;
      user.name = user.name || googleProfile.name || normalizedEmail.split("@")[0];
      user.avatarUrl = googleProfile.picture || user.avatarUrl;
      user.verified = user.verified || googleProfile.email_verified !== false;
      user.socialProvider = "google";
      user.socialId = googleProfile.sub;
    }

    await user.save();

    const token = signAppToken(user);

    return sendGoogleResult(req, res, {
      token,
      user: buildAuthUser(user),
      next,
    });
  } catch (error) {
    console.error("Google auth callback error:", error);
    return sendGoogleResult(req, res, {
      error: error.message || "Google sign-in failed. Please try again.",
    });
  }
});

router.post("/register", validateRegistration, async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = new User({
      email,
      password,
      name,
    });

    await user.save();

    const token = signAppToken(user);

    res.status(201).json({
      message: "User created successfully",
      token,
      user: buildAuthUser(user),
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      message: "Registration failed",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
});

router.post("/login", validateLogin, async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = signAppToken(user);

    res.json({
      token,
      user: buildAuthUser(user),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    res.json({ message: "Password reset email sent" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/reset-password/:token", async (req, res) => {
  try {
    const { password } = req.body;
    const { token } = req.params;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/favorites/:propertyId", auth, async (req, res) => {
  try {
    const user = req.user;
    const propertyId = req.params.propertyId;
    const index = user.favorites.findIndex((fav) => fav.toString() === propertyId);

    if (index > -1) {
      user.favorites.splice(index, 1);
    } else {
      user.favorites.push(propertyId);
    }

    await user.save();
    res.json({ favorites: user.favorites });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/favorites", auth, async (req, res) => {
  try {
    const favoriteIds = req.user.favorites || [];
    const favoriteOrder = new Map(
      favoriteIds.map((id, index) => [id.toString(), index])
    );
    const favorites = await Property.find({ _id: { $in: favoriteIds } })
      .select(
        "title price location images imageUrl propertyType status bedrooms bathrooms area createdAt"
      )
      .slice("images", 1)
      .lean();

    favorites.sort(
      (a, b) =>
        (favoriteOrder.get(a._id.toString()) ?? 0) -
        (favoriteOrder.get(b._id.toString()) ?? 0)
    );

    res.json({ favorites });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
