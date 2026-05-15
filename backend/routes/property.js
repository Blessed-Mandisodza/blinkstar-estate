const express = require("express");
const router = express.Router();
const { body, param } = require("express-validator");
const Property = require("../models/Property");
const Inquiry = require("../models/Inquiry");
const SavedSearch = require("../models/SavedSearch");
const auth = require("../middleware/auth");
const validateRequest = require("../middleware/validateRequest");
const createRateLimiter = require("../middleware/rateLimiter");
const multer = require("multer");
const nodemailer = require("nodemailer");
const { uploadImages } = require("../utils/imageUpload");

const REVIEW_STATUSES = ["pending", "approved", "rejected"];
const PROPERTY_STATUSES = [
  "Available",
  "For Sale",
  "For Rent",
  "Sold",
  "Rented",
  "Pending",
];
const FURNISHED_OPTIONS = ["Furnished", "Unfurnished", "Partly Furnished"];
const INQUIRY_STATUSES = ["New", "Contacted", "Closed", "Archived"];
const CONTACT_SOURCES = ["whatsapp", "phone", "email"];
const CONTACT_FORM_SOURCES = ["contact_form", ...CONTACT_SOURCES];
const CONTACT_INQUIRY_TYPES = ["general", "viewing", "offer"];

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

const isAdmin = (user) => user?.role === "admin";

const requireAdmin = (req, res, next) => {
  if (!isAdmin(req.user)) {
    return res.status(403).json({ error: "Admin access required" });
  }

  return next();
};

const getFrontendUrl = () =>
  (process.env.FRONTEND_URL || process.env.CLIENT_URL || "").replace(/\/+$/, "");

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

const getPublicReviewFilter = () => ({
  $or: [{ reviewStatus: "approved" }, { reviewStatus: { $exists: false } }],
});

const contactRateLimiter = createRateLimiter({
  keyPrefix: "property-contact",
  windowMs: 10 * 60 * 1000,
  max: 12,
  message: "Too many inquiry submissions. Please wait a few minutes and try again.",
});

const contactClickRateLimiter = createRateLimiter({
  keyPrefix: "property-contact-click",
  windowMs: 10 * 60 * 1000,
  max: 30,
  message: "Too many contact attempts. Please wait a moment and try again.",
});

const validatePropertyCreate = [
  body("title").trim().notEmpty().isLength({ max: 140 }),
  body("description").trim().notEmpty().isLength({ min: 20, max: 5000 }),
  body("price").notEmpty().isFloat({ min: 0 }).toFloat(),
  body("location").trim().notEmpty().isLength({ max: 120 }),
  body("propertyType").trim().notEmpty().isLength({ max: 80 }),
  body("status").optional().isIn(PROPERTY_STATUSES),
  body("furnished").optional({ checkFalsy: true }).isIn(FURNISHED_OPTIONS),
  body("bedrooms").notEmpty().isInt({ min: 0, max: 100 }).toInt(),
  body("bathrooms").notEmpty().isInt({ min: 0, max: 100 }).toInt(),
  body("area").notEmpty().isFloat({ min: 0 }).toFloat(),
  body("latitude").optional({ checkFalsy: true }).isFloat({ min: -90, max: 90 }).toFloat(),
  body("longitude")
    .optional({ checkFalsy: true })
    .isFloat({ min: -180, max: 180 })
    .toFloat(),
  body("contactName").optional({ checkFalsy: true }).trim().isLength({ max: 100 }),
  body("contactPhone").optional({ checkFalsy: true }).trim().isLength({ max: 30 }),
  body("contactEmail").optional({ checkFalsy: true }).isEmail().normalizeEmail(),
];

const validatePropertyUpdate = [
  param("id").isMongoId(),
  body("title").optional().trim().notEmpty().isLength({ max: 140 }),
  body("description").optional().trim().notEmpty().isLength({ min: 20, max: 5000 }),
  body("price").optional().isFloat({ min: 0 }).toFloat(),
  body("location").optional().trim().notEmpty().isLength({ max: 120 }),
  body("propertyType").optional().trim().notEmpty().isLength({ max: 80 }),
  body("status").optional().isIn(PROPERTY_STATUSES),
  body("furnished").optional({ checkFalsy: true }).isIn(FURNISHED_OPTIONS),
  body("bedrooms").optional().isInt({ min: 0, max: 100 }).toInt(),
  body("bathrooms").optional().isInt({ min: 0, max: 100 }).toInt(),
  body("area").optional().isFloat({ min: 0 }).toFloat(),
  body("latitude").optional({ checkFalsy: true }).isFloat({ min: -90, max: 90 }).toFloat(),
  body("longitude")
    .optional({ checkFalsy: true })
    .isFloat({ min: -180, max: 180 })
    .toFloat(),
  body("contactName").optional({ checkFalsy: true }).trim().isLength({ max: 100 }),
  body("contactPhone").optional({ checkFalsy: true }).trim().isLength({ max: 30 }),
  body("contactEmail").optional({ checkFalsy: true }).isEmail().normalizeEmail(),
  body("reviewStatus").optional().isIn(REVIEW_STATUSES),
  body("reviewNotes").optional({ checkFalsy: true }).trim().isLength({ max: 1000 }),
];

const validateInquiryUpdate = [
  param("id").isMongoId(),
  body("status").optional().isIn(INQUIRY_STATUSES),
  body("followUpNotes").optional().trim().isLength({ max: 2000 }),
  body("assignedTo")
    .optional()
    .custom((value) => !value || /^[a-f\d]{24}$/i.test(String(value))),
];

const validateContactClick = [
  param("id").isMongoId(),
  body("source").optional().isIn(CONTACT_SOURCES),
  body("pageUrl").optional({ checkFalsy: true }).isString().isLength({ max: 500 }),
  body("name").optional({ checkFalsy: true }).trim().isLength({ max: 100 }),
  body("email").optional({ checkFalsy: true }).isEmail().normalizeEmail(),
  body("phone").optional({ checkFalsy: true }).trim().isLength({ max: 30 }),
  body("message").optional({ checkFalsy: true }).trim().isLength({ max: 2000 }),
  body("phone").custom((value, { req }) => {
    if (req.body.source === "whatsapp" && !String(value || "").trim()) {
      throw new Error("Phone number is required to save a WhatsApp lead.");
    }

    return true;
  }),
];

const validateContactForm = [
  body("name").trim().notEmpty().isLength({ max: 100 }),
  body("email").isEmail().normalizeEmail(),
  body("phone").optional({ checkFalsy: true }).trim().isLength({ max: 30 }),
  body("message").trim().notEmpty().isLength({ min: 10, max: 2000 }),
  body("propertyId").isMongoId(),
  body("inquiryType").optional({ checkFalsy: true }).isIn(CONTACT_INQUIRY_TYPES),
  body("source").optional({ checkFalsy: true }).isIn(CONTACT_FORM_SOURCES),
  body("preferredDate").optional({ checkFalsy: true }).isISO8601().toDate(),
  body("preferredTime").optional({ checkFalsy: true }).trim().isLength({ max: 20 }),
  body("pageUrl").optional({ checkFalsy: true }).isString().isLength({ max: 500 }),
];

const validateSavedSearchCreate = [
  body("name").trim().notEmpty().isLength({ max: 100 }),
  body("filters").optional().isObject(),
  body("alertsEnabled").optional().isBoolean(),
];

const validateSavedSearchUpdate = [
  param("id").isMongoId(),
  body("name").optional().trim().notEmpty().isLength({ max: 100 }),
  body("filters").optional().isObject(),
  body("alertsEnabled").optional().isBoolean(),
];

const buildPropertyQuery = (filters = {}, options = {}) => {
  const {
    location,
    type,
    propertyType,
    search,
    minPrice,
    maxPrice,
    minBedrooms,
    maxBedrooms,
    bedrooms,
    minBathrooms,
    maxBathrooms,
    bathrooms,
    minArea,
    maxArea,
    status,
    featured,
    furnished,
    reviewStatus,
  } = filters;
  const query = {};
  const andFilters = [];

  if (search) {
    const searchRegex = { $regex: escapeRegex(search), $options: "i" };
    andFilters.push({
      $or: [
        { title: searchRegex },
        { description: searchRegex },
        { location: searchRegex },
        { propertyType: searchRegex },
      ],
    });
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

  if (featured === "true" || featured === true) {
    query.featured = true;
  }

  if (furnished) {
    query.furnished = { $regex: `^${escapeRegex(furnished)}$`, $options: "i" };
  }

  if (reviewStatus && REVIEW_STATUSES.includes(reviewStatus)) {
    query.reviewStatus = reviewStatus;
  }

  applyNumberFilter(query, "price", minPrice, maxPrice);
  applyNumberFilter(query, "bedrooms", minBedrooms || bedrooms, maxBedrooms);
  applyNumberFilter(query, "bathrooms", minBathrooms || bathrooms, maxBathrooms);
  applyNumberFilter(query, "area", minArea, maxArea);

  if (options.onlyApproved) {
    andFilters.push(getPublicReviewFilter());
  }

  if (andFilters.length) {
    query.$and = andFilters;
  }

  return query;
};

const getSortObject = (sort) => {
  if (sort === "oldest") {
    return { createdAt: 1 };
  }

  if (sort === "price" || sort === "price-asc") {
    return { price: 1 };
  }

  if (sort === "price-desc") {
    return { price: -1 };
  }

  if (sort === "bedrooms-desc") {
    return { bedrooms: -1, createdAt: -1 };
  }

  if (sort === "area-desc") {
    return { area: -1, createdAt: -1 };
  }

  return { createdAt: -1 };
};

const notifySavedSearchMatches = async (property) => {
  if (property.reviewStatus && property.reviewStatus !== "approved") {
    return { matched: 0, sent: 0 };
  }

  const transporter = getMailTransporter();

  if (!transporter) {
    return { matched: 0, sent: 0, skipped: "email_not_configured" };
  }

  const searches = await SavedSearch.find({ alertsEnabled: true }).populate(
    "user",
    "email name"
  );
  const matchingSearches = [];

  for (const search of searches) {
    if (!search.user?.email) continue;

    const query = {
      _id: property._id,
      ...buildPropertyQuery(search.filters || {}, { onlyApproved: false }),
    };
    const matches = await Property.exists(query);

    if (matches) {
      matchingSearches.push(search);
    }
  }

  const frontendUrl = getFrontendUrl();
  const propertyUrl = frontendUrl
    ? `${frontendUrl}/property/${property._id}`
    : `/property/${property._id}`;
  let sent = 0;

  for (const search of matchingSearches) {
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: search.user.email,
        subject: `New BlinkStar match: ${property.title}`,
        text: [
          `Hi ${search.user.name || "there"},`,
          "",
          `A property matching your saved search "${search.name}" is now available.`,
          "",
          `${property.title}`,
          `${property.location || ""}`,
          property.price ? `$${Number(property.price).toLocaleString()}` : "Price on request",
          "",
          propertyUrl,
        ].join("\n"),
      });

      search.lastNotifiedAt = new Date();
      await search.save();
      sent += 1;
    } catch (error) {
      console.error("Saved search alert email error:", error);
    }
  }

  return { matched: matchingSearches.length, sent };
};

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
router.post(
  "/",
  auth,
  upload.array("images", 10),
  validatePropertyCreate,
  validateRequest,
  async (req, res) => {
  try {
    const imagePaths = await uploadImages(req.files);
    const reviewStatus = isAdmin(req.user) ? "approved" : "pending";
    const property = new Property({
      ...req.body,
      images: imagePaths,
      listedBy: req.user._id,
      reviewStatus,
      publishedAt: reviewStatus === "approved" ? new Date() : undefined,
    });
    await property.save();
    if (property.reviewStatus === "approved") {
      notifySavedSearchMatches(property).catch((error) =>
        console.error("Saved search notification error:", error)
      );
    }
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
      maxBedrooms,
      maxBathrooms,
      minArea,
      maxArea,
      status,
      featured,
      furnished,
    } = req.query;

    const query = buildPropertyQuery(
      {
        location,
        type,
        propertyType,
        search,
        minPrice,
        maxPrice,
        minBedrooms,
        maxBedrooms,
        bedrooms,
        minBathrooms,
        maxBathrooms,
        bathrooms,
        minArea,
        maxArea,
        status,
        featured,
        furnished,
      },
      { onlyApproved: true }
    );
    const sortObj = getSortObject(sort);

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
        "title price location images imageUrl propertyType status featured furnished reviewStatus bedrooms bathrooms area latitude longitude createdAt listedBy"
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

// Admin moderation queue for approving/rejecting submitted listings
router.get("/admin/moderation", auth, requireAdmin, async (req, res) => {
  try {
    const { reviewStatus = "pending", limit = 24, page = 1 } = req.query;
    const pageNumber = Math.max(toNumber(page) || 1, 1);
    const pageSize = Math.min(toNumber(limit) || 24, 100);
    const query =
      reviewStatus === "all"
        ? {}
        : { reviewStatus: REVIEW_STATUSES.includes(reviewStatus) ? reviewStatus : "pending" };

    const [properties, total, counts] = await Promise.all([
      Property.find(query)
        .select(
          "title price location images imageUrl propertyType status featured furnished reviewStatus reviewNotes bedrooms bathrooms area createdAt listedBy"
        )
        .populate("listedBy", "name email role verified")
        .sort({ createdAt: -1 })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize),
      Property.countDocuments(query),
      Promise.all(
        REVIEW_STATUSES.map(async (statusName) => [
          statusName,
          await Property.countDocuments({ reviewStatus: statusName }),
        ])
      ),
    ]);

    res.json({
      properties,
      total,
      page: pageNumber,
      totalPages: Math.max(Math.ceil(total / pageSize), 1),
      counts: Object.fromEntries(counts),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/:id/review", auth, requireAdmin, async (req, res) => {
  try {
    const { reviewStatus, reviewNotes = "" } = req.body;

    if (!REVIEW_STATUSES.includes(reviewStatus)) {
      return res.status(400).json({ error: "Invalid review status" });
    }

    const update = {
      reviewStatus,
      reviewNotes,
      reviewedBy: req.user._id,
      reviewedAt: new Date(),
    };

    if (reviewStatus === "approved") {
      update.publishedAt = new Date();
    }

    const property = await Property.findByIdAndUpdate(req.params.id, update, {
      new: true,
    }).populate("listedBy", "name email role verified");

    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    if (reviewStatus === "approved") {
      notifySavedSearchMatches(property).catch((error) =>
        console.error("Saved search notification error:", error)
      );
    }

    res.json({ property });
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
router.patch(
  "/inquiries/:id",
  auth,
  validateInquiryUpdate,
  validateRequest,
  async (req, res) => {
  try {
    const { status, followUpNotes, assignedTo } = req.body;
    const query =
      req.user.role === "admin"
        ? { _id: req.params.id }
        : { _id: req.params.id, propertyOwner: req.user._id };

    const update = {};

    if (status !== undefined) {
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

router.delete("/inquiries/:id", auth, async (req, res) => {
  try {
    const query =
      req.user.role === "admin"
        ? { _id: req.params.id }
        : { _id: req.params.id, propertyOwner: req.user._id };

    const inquiry = await Inquiry.findOneAndDelete(query);

    if (!inquiry) {
      return res
        .status(404)
        .json({ error: "Inquiry not found or not authorized" });
    }

    res.json({ message: "Inquiry removed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Track contact action clicks such as WhatsApp, call, and email
router.post(
  "/:id/contact-click",
  contactClickRateLimiter,
  validateContactClick,
  validateRequest,
  async (req, res) => {
  try {
    const {
      source = "whatsapp",
      pageUrl,
      name,
      email,
      phone,
      message,
    } = req.body;
    const trimmedPhone = String(phone || "").trim();

    const property = await Property.findById(req.params.id).populate(
      "listedBy",
      "name email phone whatsapp role verified"
    );

    if (!property) return res.status(404).json({ error: "Property not found" });

    const ownerId = property.listedBy?._id || property.listedBy;

    const inquiry = await Inquiry.create({
      property: property._id,
      propertyOwner: ownerId,
      name: String(name || "").trim() || "Website Visitor",
      email: String(email || "").trim().toLowerCase() || undefined,
      phone: trimmedPhone || undefined,
      inquiryType: source,
      source,
      message:
        String(message || "").trim() ||
        `Visitor clicked ${source} on ${property.title}.`,
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

router.post(
  "/saved-searches",
  auth,
  validateSavedSearchCreate,
  validateRequest,
  async (req, res) => {
  try {
    const { name, filters = {}, alertsEnabled = true } = req.body;

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

router.patch(
  "/saved-searches/:id",
  auth,
  validateSavedSearchUpdate,
  validateRequest,
  async (req, res) => {
  try {
    const updates = {};

    if (req.body.name !== undefined) {
      updates.name = req.body.name;
    }

    if (req.body.filters !== undefined) {
      updates.filters = req.body.filters;
    }

    if (req.body.alertsEnabled !== undefined) {
      updates.alertsEnabled = Boolean(req.body.alertsEnabled);
    }

    const search = await SavedSearch.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updates,
      { new: true }
    );

    if (!search) {
      return res.status(404).json({ error: "Saved search not found" });
    }

    res.json({ search });
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
    const ownsStats = req.user._id.toString() === userId;

    if (!ownsStats && !isAdmin(req.user)) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const listingQuery = isAdmin(req.user) && req.query.scope === "all" ? {} : { listedBy: userId };
    const totalProperties = await Property.countDocuments(listingQuery);
    const activeListings = await Property.countDocuments({
      ...listingQuery,
      status: { $in: ["Available", "For Sale", "For Rent"] },
    });
    const totalViews = totalProperties * 15;
    const newInquiries = await Inquiry.countDocuments({
      ...(isAdmin(req.user) && req.query.scope === "all"
        ? {}
        : { propertyOwner: userId }),
      status: "New",
    });
    const pendingApprovals = isAdmin(req.user)
      ? await Property.countDocuments({ reviewStatus: "pending" })
      : await Property.countDocuments({ listedBy: userId, reviewStatus: "pending" });

    res.json({
      totalProperties,
      activeListings,
      totalViews,
      newInquiries,
      pendingApprovals,
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
    const ownsListings = req.user._id.toString() === userId;

    if (!ownsListings && !isAdmin(req.user)) {
      return res.status(403).json({ error: "Not authorized" });
    }

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
      "name email phone whatsapp role verified"
    );
    if (!property) return res.status(404).json({ error: "Property not found" });
    res.json(property);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a property (auth required)
router.put(
  "/:id",
  auth,
  upload.array("images", 10),
  validatePropertyUpdate,
  validateRequest,
  async (req, res) => {
  try {
    let update = { ...req.body };
    const query = isAdmin(req.user)
      ? { _id: req.params.id }
      : { _id: req.params.id, listedBy: req.user._id };

    if (!isAdmin(req.user)) {
      delete update.reviewStatus;
      delete update.reviewNotes;
      delete update.reviewedAt;
      delete update.reviewedBy;
      delete update.publishedAt;
    } else if (
      update.reviewStatus !== undefined &&
      !REVIEW_STATUSES.includes(update.reviewStatus)
    ) {
      return res.status(400).json({ error: "Invalid review status" });
    }

    if (update.reviewStatus === "approved") {
      update.reviewedBy = req.user._id;
      update.reviewedAt = new Date();
      update.publishedAt = update.publishedAt || new Date();
    }

    if (req.files && req.files.length > 0) {
      update.images = await uploadImages(req.files);
    }
    const property = await Property.findOneAndUpdate(query, update, { new: true });
    if (!property)
      return res
        .status(404)
        .json({ error: "Property not found or not authorized" });
    if (update.reviewStatus === "approved") {
      notifySavedSearchMatches(property).catch((error) =>
        console.error("Saved search notification error:", error)
      );
    }
    res.json(property);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a property (auth required)
router.delete("/:id", auth, async (req, res) => {
  try {
    const property = await Property.findOneAndDelete(
      isAdmin(req.user)
        ? { _id: req.params.id }
        : { _id: req.params.id, listedBy: req.user._id }
    );
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
router.post(
  "/contact",
  contactRateLimiter,
  validateContactForm,
  validateRequest,
  async (req, res) => {
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

    const transporter = getMailTransporter();

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
      await transporter
        .sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: `We received your inquiry: ${property.title}`,
          text: [
            `Hi ${name},`,
            "",
            `Thanks for contacting BlinkStar Properties about "${property.title}".`,
            "Your inquiry has been saved and the property contact has been notified.",
            "",
            "We will follow up soon.",
          ].join("\n"),
        })
        .catch((autoReplyError) => {
          console.error("Inquiry auto-reply email error:", autoReplyError);
        });
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
