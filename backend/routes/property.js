const express = require("express");
const router = express.Router();
const Property = require("../models/Property");
const Inquiry = require("../models/Inquiry");
const SavedSearch = require("../models/SavedSearch");
const auth = require("../middleware/auth");
const multer = require("multer");
const nodemailer = require("nodemailer");

const escapeRegex = (value = "") =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const toNumber = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const applyNumberFilter = (query, field, minValue, maxValue) => {
  const min = toNumber(minValue);
  const max = toNumber(maxValue);

  if (min === null && max === null) return;

  query[field] = {};
  if (min !== null) query[field].$gte = min;
  if (max !== null) query[field].$lte = max;
};

const fileToDataUrl = (file) =>
  `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

// Vercel/serverless filesystems are not persistent, so image uploads are kept
// with the property record instead of being written to /uploads.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: 10,
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter(req, file, cb) {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image uploads are allowed"));
    }

    return cb(null, true);
  },
});

// Create a property (auth required)
router.post("/", auth, upload.array("images", 10), async (req, res) => {
  try {
    const imagePaths = req.files ? req.files.map(fileToDataUrl) : [];
    const property = new Property({
      ...req.body,
      images: imagePaths,
      listedBy: req.user._id,
    });
    await property.save();
    res.status(201).json(property);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all properties
router.get("/", async (req, res) => {
  try {
    const {
      limit,
      page,
      includeMeta,
      sort,
      location,
      type,
      propertyType,
      search,
      minPrice,
      maxPrice,
      minBedrooms,
      bedrooms,
      minBathrooms,
      bathrooms,
      minArea,
      maxArea,
      status,
      featured,
      furnished,
    } = req.query;

    // Build query object
    let query = {};
    if (search) {
      const searchRegex = { $regex: escapeRegex(search), $options: "i" };
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { location: searchRegex },
        { propertyType: searchRegex },
      ];
    }

    if (location) query.location = { $regex: escapeRegex(location), $options: "i" };

    const selectedType = propertyType || type;
    if (selectedType) {
      query.propertyType = {
        $regex: `^${escapeRegex(selectedType)}$`,
        $options: "i",
      };
    }

    if (status) {
      query.status = { $regex: `^${escapeRegex(status)}$`, $options: "i" };
    }

    if (featured === "true") {
      query.featured = true;
    }

    if (furnished) {
      query.furnished = { $regex: `^${escapeRegex(furnished)}$`, $options: "i" };
    }

    applyNumberFilter(query, "price", minPrice, maxPrice);
    applyNumberFilter(query, "bedrooms", minBedrooms || bedrooms, null);
    applyNumberFilter(query, "bathrooms", minBathrooms || bathrooms, null);
    applyNumberFilter(query, "area", minArea, maxArea);

    // Build sort object
    let sortObj = { createdAt: -1 };
    if (sort === "oldest") {
      sortObj = { createdAt: 1 };
    } else if (sort === "price" || sort === "price-asc") {
      sortObj = { price: 1 };
    } else if (sort === "price-desc") {
      sortObj = { price: -1 };
    } else if (sort === "bedrooms-desc") {
      sortObj = { bedrooms: -1, createdAt: -1 };
    } else if (sort === "area-desc") {
      sortObj = { area: -1, createdAt: -1 };
    }

    const requestedLimit = toNumber(limit);
    const pageNumber = Math.max(toNumber(page) || 1, 1);
    const shouldReturnMeta = includeMeta === "true";
    const pageSize = shouldReturnMeta
      ? Math.min(requestedLimit || 16, 48)
      : requestedLimit
      ? Math.min(requestedLimit, 100)
      : null;

    // List views only need summary fields. Keep full image galleries for /:id.
    let propertiesQuery = Property.find(query)
      .select(
        "title price location images imageUrl propertyType status featured furnished bedrooms bathrooms area latitude longitude createdAt listedBy"
      )
      .slice("images", 1)
      .lean();

    // Apply sorting
    propertiesQuery = propertiesQuery.sort(sortObj);

    if (shouldReturnMeta) {
      propertiesQuery = propertiesQuery.skip((pageNumber - 1) * pageSize);
    }

    if (pageSize) {
      propertiesQuery = propertiesQuery.limit(pageSize);
    }

    if (shouldReturnMeta) {
      const [properties, total] = await Promise.all([
        propertiesQuery,
        Property.countDocuments(query),
      ]);

      return res.json({
        properties,
        total,
        page: pageNumber,
        totalPages: Math.max(Math.ceil(total / pageSize), 1),
      });
    }

    const properties = await propertiesQuery;
    res.json(properties);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get enquiries for the signed-in property owner
router.get("/inquiries", auth, async (req, res) => {
  try {
    const { limit = 10, status } = req.query;
    const query =
      req.user.role === "admin" ? {} : { propertyOwner: req.user._id };

    if (status) {
      query.status = status;
    }

    const requestedLimit = toNumber(limit) || 10;
    const inquiries = await Inquiry.find(query)
      .populate("property", "title location price images propertyType")
      .populate("assignedTo", "name email role")
      .sort({ createdAt: -1 })
      .limit(Math.min(requestedLimit, 50));

    res.json({ inquiries });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update lead status/follow-up fields for the signed-in property owner
router.patch("/inquiries/:id", auth, async (req, res) => {
  try {
    const { status, followUpNotes, assignedTo } = req.body;
    const allowedStatuses = ["New", "Contacted", "Closed", "Archived"];
    const query =
      req.user.role === "admin"
        ? { _id: req.params.id }
        : { _id: req.params.id, propertyOwner: req.user._id };

    const update = {};

    if (status !== undefined) {
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid inquiry status" });
      }

      update.status = status;
      if (status === "Contacted") {
        update.lastContactedAt = new Date();
      }
    }

    if (followUpNotes !== undefined) {
      update.followUpNotes = followUpNotes;
    }

    if (assignedTo !== undefined && req.user.role === "admin") {
      update.assignedTo = assignedTo || undefined;
    }

    const inquiry = await Inquiry.findOneAndUpdate(query, update, {
      new: true,
    })
      .populate("property", "title location price images propertyType")
      .populate("assignedTo", "name email role");

    if (!inquiry) {
      return res
        .status(404)
        .json({ error: "Inquiry not found or not authorized" });
    }

    res.json({ inquiry });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Track contact action clicks such as WhatsApp, call, and email
router.post("/:id/contact-click", async (req, res) => {
  try {
    const { source = "whatsapp", pageUrl } = req.body;
    const allowedSources = ["whatsapp", "phone", "email"];

    if (!allowedSources.includes(source)) {
      return res.status(400).json({ error: "Invalid contact source" });
    }

    const property = await Property.findById(req.params.id).populate(
      "listedBy",
      "name email role"
    );

    if (!property) return res.status(404).json({ error: "Property not found" });

    const ownerId = property.listedBy?._id || property.listedBy;

    const inquiry = await Inquiry.create({
      property: property._id,
      propertyOwner: ownerId,
      name: "Website Visitor",
      inquiryType: source,
      source,
      message: `Visitor clicked ${source} on ${property.title}.`,
      pageUrl,
      userAgent: req.get("user-agent"),
    });

    res.status(201).json({ success: true, inquiryId: inquiry._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Saved searches for signed-in users
router.get("/saved-searches", auth, async (req, res) => {
  try {
    const searches = await SavedSearch.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.json({ searches });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/saved-searches", auth, async (req, res) => {
  try {
    const { name, filters = {}, alertsEnabled = true } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Saved search name is required" });
    }

    const savedSearch = await SavedSearch.create({
      user: req.user._id,
      name,
      filters,
      alertsEnabled,
    });

    res.status(201).json({ search: savedSearch });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/saved-searches/:id", auth, async (req, res) => {
  try {
    const deleted = await SavedSearch.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!deleted) {
      return res.status(404).json({ error: "Saved search not found" });
    }

    res.json({ message: "Saved search deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get dashboard statistics for a user
router.get("/stats/:userId", auth, async (req, res) => {
  try {
    const userId = req.params.userId;

    const totalProperties = await Property.countDocuments({ listedBy: userId });
    const activeListings = await Property.countDocuments({
      listedBy: userId,
      status: { $in: ["Available", "For Sale", "For Rent"] },
    });
    const totalViews = totalProperties * 15;
    const newInquiries = await Inquiry.countDocuments({
      propertyOwner: userId,
      status: "New",
    });

    res.json({
      totalProperties,
      activeListings,
      totalViews,
      newInquiries,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user's properties with pagination
router.get("/user/:userId", auth, async (req, res) => {
  try {
    const userId = req.params.userId;
    const { page = 1, limit = 10 } = req.query;

    const properties = await Property.find({ listedBy: userId })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("listedBy", "email name role");

    const total = await Property.countDocuments({ listedBy: userId });

    res.json({
      properties,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single property by ID
router.get("/:id", async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate(
      "listedBy",
      "name email role"
    );
    if (!property) return res.status(404).json({ error: "Property not found" });
    res.json(property);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a property (auth required)
router.put("/:id", auth, upload.array("images", 10), async (req, res) => {
  try {
    let update = { ...req.body };
    if (req.files && req.files.length > 0) {
      update.images = req.files.map(fileToDataUrl);
    }
    const property = await Property.findOneAndUpdate(
      { _id: req.params.id, listedBy: req.user._id },
      update,
      { new: true }
    );
    if (!property)
      return res
        .status(404)
        .json({ error: "Property not found or not authorized" });
    res.json(property);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a property (auth required)
router.delete("/:id", auth, async (req, res) => {
  try {
    const property = await Property.findOneAndDelete({
      _id: req.params.id,
      listedBy: req.user._id,
    });
    if (!property)
      return res
        .status(404)
        .json({ error: "Property not found or not authorized" });
    res.json({ message: "Property deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Contact form endpoint
router.post("/contact", async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      message,
      propertyId,
      inquiryType,
      preferredDate,
      preferredTime,
      source = "contact_form",
      pageUrl,
    } = req.body;
    if (!name || !email || !message || !propertyId) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const property = await Property.findById(propertyId).populate("listedBy");
    if (!property) return res.status(404).json({ error: "Property not found" });
    const ownerId = property.listedBy?._id || property.listedBy;
    const ownerEmail =
      property.listedBy?.email || process.env.EMAIL_TO || process.env.EMAIL_USER;

    const inquiry = await Inquiry.create({
      property: property._id,
      propertyOwner: ownerId,
      name,
      email,
      phone,
      message,
      inquiryType: inquiryType || "general",
      source,
      preferredDate: preferredDate || undefined,
      preferredTime,
      pageUrl,
      userAgent: req.get("user-agent"),
    });

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !ownerEmail) {
      return res.status(202).json({
        success: true,
        inquiryId: inquiry._id,
        warning: "Inquiry saved, but email notification is not configured.",
      });
    }

    // Set up Nodemailer (Gmail config, use .env for credentials)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Set in .env
        pass: process.env.EMAIL_PASS, // Set in .env
      },
    });

    const mailText = [
      `You have a new ${inquiryType || "property inquiry"} for "${property.title}".`,
      "",
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${phone || "N/A"}`,
      `Preferred date: ${preferredDate || "N/A"}`,
      `Preferred time: ${preferredTime || "N/A"}`,
      "",
      "Message:",
      message,
    ].join("\n");

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: ownerEmail,
      replyTo: email,
      subject: `Property Inquiry: ${property.title}`,
      text: mailText,
    };

    try {
      await transporter.sendMail(mailOptions);
      return res.json({ success: true, inquiryId: inquiry._id });
    } catch (emailError) {
      console.error("Inquiry email notification error:", emailError);
      return res.status(202).json({
        success: true,
        inquiryId: inquiry._id,
        warning: "Inquiry saved, but email notification could not be sent.",
      });
    }
  } catch (err) {
    console.error("Contact form error:", err);
    res.status(500).json({ error: "Failed to save inquiry" });
  }
});

module.exports = router;
