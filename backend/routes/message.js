const express = require("express");
const router = express.Router();
const Inquiry = require("../models/Inquiry");
const auth = require("../middleware/auth");
const nodemailer = require("nodemailer");

const getMailTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

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

router.post("/:id/reply", auth, async (req, res) => {
  try {
    const { message } = req.body;

    if (!String(message || "").trim()) {
      return res.status(400).json({ error: "Reply message is required" });
    }

    const query =
      req.user.role === "admin"
        ? { _id: req.params.id }
        : { _id: req.params.id, propertyOwner: req.user._id };

    const inquiry = await Inquiry.findOne(query).populate(
      "property",
      "title location"
    );

    if (!inquiry) {
      return res.status(404).json({ error: "Message thread not found" });
    }

    inquiry.replies.push({
      senderRole: req.user.role === "admin" ? "admin" : "agent",
      senderName: req.user.name || req.user.email,
      message: String(message).trim(),
      sentAt: new Date(),
    });
    inquiry.status = inquiry.status === "New" ? "Contacted" : inquiry.status;
    inquiry.lastContactedAt = new Date();
    await inquiry.save();

    const transporter = getMailTransporter();

    if (transporter && inquiry.email) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: inquiry.email,
          replyTo: process.env.EMAIL_USER,
          subject: `Reply about ${inquiry.property?.title || "your property inquiry"}`,
          text: [
            `Hi ${inquiry.name || "there"},`,
            "",
            String(message).trim(),
            "",
            `Property: ${inquiry.property?.title || "Listing"}`,
            inquiry.property?.location || "",
          ]
            .filter(Boolean)
            .join("\n"),
        });
      } catch (emailError) {
        console.error("Inquiry reply email error:", emailError);
      }
    }

    await inquiry.populate("property", "title location price images propertyType");

    res.status(201).json({ messageThread: inquiry });
  } catch (error) {
    res.status(500).json({ error: error.message || "Could not send reply" });
  }
});

module.exports = router;
