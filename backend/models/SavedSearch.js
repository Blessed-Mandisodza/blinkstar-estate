const mongoose = require("mongoose");

const savedSearchSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      trim: true,
      required: true,
    },
    filters: {
      search: String,
      type: String,
      location: String,
      minPrice: String,
      maxPrice: String,
      minBedrooms: String,
      maxBedrooms: String,
      minBathrooms: String,
      maxBathrooms: String,
      minArea: String,
      maxArea: String,
      status: String,
      furnished: String,
      sort: String,
    },
    alertsEnabled: {
      type: Boolean,
      default: true,
    },
    lastNotifiedAt: Date,
  },
  { timestamps: true }
);

savedSearchSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("SavedSearch", savedSearchSchema);
