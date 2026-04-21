const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Property = require("../models/Property");
const authMiddleware = require("../middleware/auth");
const bcrypt = require("bcryptjs");

router.get("/agents", async (req, res) => {
  try {
    const agents = await User.find({ role: { $in: ["agent", "admin"] } })
      .select("name email phone whatsapp bio location avatarUrl role createdAt")
      .sort({ createdAt: -1 });

    res.json({ agents });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/agents/:id", async (req, res) => {
  try {
    const agent = await User.findById(req.params.id).select(
      "name email phone whatsapp bio location avatarUrl role createdAt"
    );

    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    const properties = await Property.find({ listedBy: agent._id })
      .sort({ createdAt: -1 })
      .limit(12)
      .populate("listedBy", "name email role");

    res.json({ agent, properties });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/me", authMiddleware, async (req, res) => {
  try {
    const updates = {};

    if (req.body.name) {
      updates.name = req.body.name;
    }

    if (req.body.email) {
      updates.email = req.body.email;
    }

    ["phone", "whatsapp", "bio", "location", "avatarUrl"].forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(req.body.password, salt);
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
    }).select("-password");

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/me", authMiddleware, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.json({ message: "Account deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
