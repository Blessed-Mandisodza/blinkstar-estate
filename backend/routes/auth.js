const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const Property = require("../models/Property");
const crypto = require("crypto");
const auth = require("../middleware/auth");

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

    const token = jwt.sign({ userId: user._id }, getJwtSecret(), {
      expiresIn: "30d",
    });

    res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        id: user._id,
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
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

    const token = jwt.sign({ userId: user._id }, getJwtSecret(), {
      expiresIn: "30d",
    });

    res.json({
      token,
      user: {
        id: user._id,
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
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
