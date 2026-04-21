const mongoose = require("mongoose");

const inquirySchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
      index: true,
    },
    propertyOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    message: { type: String, trim: true },
    inquiryType: {
      type: String,
      enum: ["general", "viewing", "offer", "whatsapp", "phone", "email"],
      default: "general",
    },
    source: {
      type: String,
      enum: ["contact_form", "whatsapp", "phone", "email"],
      default: "contact_form",
      index: true,
    },
    status: {
      type: String,
      enum: ["New", "Contacted", "Closed", "Archived"],
      default: "New",
      index: true,
    },
    followUpNotes: { type: String, trim: true },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    lastContactedAt: Date,
    preferredDate: Date,
    preferredTime: { type: String, trim: true },
    pageUrl: { type: String, trim: true },
    userAgent: { type: String, trim: true },
  },
  { timestamps: true }
);

inquirySchema.index({ propertyOwner: 1, createdAt: -1 });
inquirySchema.index({ property: 1, createdAt: -1 });

module.exports = mongoose.model("Inquiry", inquirySchema);
