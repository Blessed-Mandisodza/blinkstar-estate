const path = require("path");
const { randomUUID } = require("crypto");

const toDataUrl = (file) =>
  `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

const hasImageKitConfig = () => Boolean(process.env.IMAGEKIT_PRIVATE_KEY);

const getImageExtension = (file) => {
  const ext = path.extname(file.originalname || "").toLowerCase();
  if (ext && ext.length <= 8) return ext;

  const mimeExt = String(file.mimetype || "").split("/")[1];
  return mimeExt ? `.${mimeExt.replace(/[^a-z0-9]/gi, "")}` : ".jpg";
};

const normalizeFolder = (folder = "property-images") => {
  const cleaned = folder
    .replace(/\\/g, "/")
    .replace(/^\/+|\/+$/g, "")
    .replace(/[^a-z0-9/_-]/gi, "-");

  return cleaned ? `/${cleaned}` : "";
};

const buildImageKitUrl = (filePath, fallbackUrl) => {
  if (fallbackUrl) return fallbackUrl;
  if (!filePath || !process.env.IMAGEKIT_URL_ENDPOINT) return "";

  const baseUrl = process.env.IMAGEKIT_URL_ENDPOINT.replace(/\/+$/, "");
  return `${baseUrl}${filePath.startsWith("/") ? filePath : `/${filePath}`}`;
};

const buildBasicAuthHeader = () =>
  `Basic ${Buffer.from(`${process.env.IMAGEKIT_PRIVATE_KEY}:`).toString("base64")}`;

const uploadToImageKit = async (file) => {
  const formData = new FormData();
  const extension = getImageExtension(file);
  const fileName = `${randomUUID()}${extension}`;

  formData.append(
    "file",
    new Blob([file.buffer], { type: file.mimetype }),
    file.originalname || fileName
  );
  formData.append("fileName", fileName);
  formData.append("useUniqueFileName", "true");

  const folder = normalizeFolder(process.env.IMAGEKIT_UPLOAD_FOLDER);
  if (folder) {
    formData.append("folder", folder);
  }

  const response = await fetch("https://upload.imagekit.io/api/v2/files/upload", {
    method: "POST",
    headers: {
      Authorization: buildBasicAuthHeader(),
    },
    body: formData,
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "ImageKit upload failed");
  }

  return buildImageKitUrl(data.filePath, data.url);
};

const uploadImages = async (files = []) => {
  if (!files.length) return [];

  if (!hasImageKitConfig()) {
    return files.map(toDataUrl);
  }

  try {
    return await Promise.all(files.map(uploadToImageKit));
  } catch (error) {
    console.error("ImageKit upload error:", error);
    return files.map(toDataUrl);
  }
};

module.exports = {
  hasImageKitConfig,
  uploadImages,
};
