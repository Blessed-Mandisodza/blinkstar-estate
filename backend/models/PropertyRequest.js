const mongoose = require("mongoose");

const propertyRequestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    listingType: {
      type: String,
      enum: ["For Sale", "For Rent", "Any"],
      default: "Any",
      index: true,
    },
    propertyType: {
      type: String,
      trim: true,
    },
    preferredLocation: {
      type: String,
      required: true,
      trim: true,
    },
    maxPrice: {
      type: Number,
      min: 0,
    },
    minBedrooms: {
      type: Number,
      min: 0,
    },
    minBathrooms: {
      type: Number,
      min: 0,
    },
    furnishedPreference: {
      type: String,
      enum: ["Any", "Furnished", "Unfurnished", "Partly Furnished"],
      default: "Any",
    },
    timeline: {
      type: String,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["New", "Reviewed", "Matched", "Closed", "Archived"],
      default: "New",
      index: true,
    },
    followUpNotes: {
      type: String,
      trim: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    lastContactedAt: Date,
    pageUrl: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

propertyRequestSchema.index({ createdAt: -1 });
propertyRequestSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("PropertyRequest", propertyRequestSchema);
