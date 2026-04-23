const crypto = require("crypto");

const toDataUrl = (file) =>
  `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

const hasCloudinaryConfig = () =>
  Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );

const signCloudinaryParams = (params) => {
  const payload = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return crypto
    .createHash("sha1")
    .update(`${payload}${process.env.CLOUDINARY_API_SECRET}`)
    .digest("hex");
};

const uploadToCloudinary = async (file) => {
  if (typeof fetch !== "function" || typeof FormData !== "function") {
    throw new Error("Cloudinary uploads require Node fetch/FormData support");
  }

  const timestamp = Math.round(Date.now() / 1000);
  const folder = process.env.CLOUDINARY_FOLDER || "blinkstar-properties";
  const params = { folder, timestamp };
  const signature = signCloudinaryParams(params);
  const formData = new FormData();
  const blob = new Blob([file.buffer], { type: file.mimetype });

  formData.append("file", blob, file.originalname || "property-image");
  formData.append("api_key", process.env.CLOUDINARY_API_KEY);
  formData.append("timestamp", String(timestamp));
  formData.append("folder", folder);
  formData.append("signature", signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error?.message || "Cloudinary upload failed");
  }

  return data.secure_url;
};

const uploadImages = async (files = []) => {
  if (!files.length) return [];

  if (!hasCloudinaryConfig()) {
    return files.map(toDataUrl);
  }

  try {
    return await Promise.all(files.map(uploadToCloudinary));
  } catch (error) {
    console.error("Image upload provider error:", error);
    return files.map(toDataUrl);
  }
};

module.exports = {
  hasCloudinaryConfig,
  uploadImages,
};
