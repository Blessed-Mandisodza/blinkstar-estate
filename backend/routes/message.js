const express = require("express");
const router = express.Router();
const Inquiry = require("../models/Inquiry");
const auth = require("../middleware/auth");

router.get("/", auth, async (req, res) => {
  try {
    const { limit = 50, status } = req.query;
    const query =
      req.user.role === "admin" ? {} : { propertyOwner: req.user._id };

    if (status) {
      query.status = status;
    }

    const messages = await Inquiry.find(query)
      .populate("property", "title location price images propertyType")
      .sort({ createdAt: -1 })
      .limit(Math.min(Number(limit) || 50, 100));

    res.json({ messages });
  } catch (error) {
    res.status(500).json({ error: error.message || "Could not load messages" });
  }
});

router.get("/summary", auth, async (req, res) => {
  try {
    const query =
      req.user.role === "admin" ? {} : { propertyOwner: req.user._id };
    const [total, unread] = await Promise.all([
      Inquiry.countDocuments(query),
      Inquiry.countDocuments({ ...query, status: "New" }),
    ]);

    res.json({ total, unread });
  } catch (error) {
    res.status(500).json({ error: error.message || "Could not load summary" });
  }
});

module.exports = router;
