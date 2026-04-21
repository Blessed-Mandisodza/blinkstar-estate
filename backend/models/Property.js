const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    location: { type: String, required: true },
    images: [{ type: String }],
    propertyType: { type: String, required: true },
    status: { type: String, default: "Available" },
    featured: { type: Boolean, default: false },
    furnished: { type: String, enum: ["", "Furnished", "Unfurnished", "Partly Furnished"], default: "" },
    bedrooms: { type: Number, required: true },
    bathrooms: { type: Number, required: true },
    area: { type: Number, required: true },
    latitude: Number,
    longitude: Number,
    listedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Property", propertySchema);
