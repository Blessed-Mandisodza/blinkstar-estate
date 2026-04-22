const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();

const normalizeOrigin = (origin) =>
  typeof origin === "string" ? origin.trim().replace(/\/+$/, "") : null;

const getMongoUri = () => process.env.MONGO_URI || process.env.MONGODB_URI;

const getAllowedOrigins = () => {
  const configuredOrigins = [
    process.env.FRONTEND_URL,
    ...(process.env.CORS_ORIGINS || "")
      .split(",")
      .map((origin) => normalizeOrigin(origin))
      .filter(Boolean),
    process.env.VERCEL_URL ? normalizeOrigin(`https://${process.env.VERCEL_URL}`) : null,
    process.env.NODE_ENV !== "production"
      ? normalizeOrigin("http://localhost:3000")
      : null,
  ]
    .map((origin) => normalizeOrigin(origin))
    .filter(Boolean);

  return [...new Set(configuredOrigins)];
};

const allowedOrigins = getAllowedOrigins();
const isDevLocalhostOrigin = (origin) =>
  process.env.NODE_ENV !== "production" &&
  /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin || "");

app.use(
  cors({
    origin(origin, callback) {
      const normalizedOrigin = normalizeOrigin(origin);

      if (
        !normalizedOrigin ||
        allowedOrigins.length === 0 ||
        allowedOrigins.includes(normalizedOrigin) ||
        isDevLocalhostOrigin(normalizedOrigin)
      ) {
        return callback(null, true);
      }

      return callback(new Error(`Origin ${normalizedOrigin} not allowed by CORS`));
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

let connectionPromise = null;

const connectToDatabase = async () => {
  const mongoUri = getMongoUri();

  if (!mongoUri) {
    throw new Error(
      "Missing required environment variable: MONGO_URI or MONGODB_URI"
    );
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (mongoose.connection.readyState === 2 && connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = mongoose
    .connect(mongoUri)
    .then(() => {
      console.log("Connected to MongoDB successfully");
      return mongoose.connection;
    })
    .catch((error) => {
      connectionPromise = null;
      throw error;
    });

  return connectionPromise;
};

mongoose.connection.on("error", (error) => {
  console.error("MongoDB connection error:", error);
});

connectToDatabase().catch((error) => {
  console.error("MongoDB connection error:", error);
});

app.get("/api/test", (req, res) => {
  res.json({
    message: "Server is working!",
    databaseConfigured: Boolean(getMongoUri()),
    databaseConnected: mongoose.connection.readyState === 1,
  });
});

app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    next(error);
  }
});

app.use("/api/auth", require("./routes/auth"));
app.use("/api/property", require("./routes/property"));
app.use("/api/users", require("./routes/users"));
app.use("/api/messages", require("./routes/message"));

app.get("/", (req, res) => {
  res.json({
    message: "Blinkstar Properties backend is running.",
  });
});

app.use((err, req, res, next) => {
  console.error("Error details:", err);
  console.error("Stack trace:", err.stack);

  const isCorsError =
    err && typeof err.message === "string" && err.message.includes("not allowed by CORS");

  res.status(isCorsError ? 403 : 500).json({
    message: isCorsError ? "Request blocked by CORS" : "Something went wrong!",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : isCorsError
          ? "CORS error"
          : "Internal server error",
  });
});

if (require.main === module) {
  const PORT = process.env.PORT || 5000;

  connectToDatabase()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch((error) => {
      console.error("Failed to start server:", error);
      process.exit(1);
    });
}

module.exports = app;
module.exports.connectToDatabase = connectToDatabase;
