const User = require("../models/User");
const jwt = require("jsonwebtoken");

const getJwtSecret = () => {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("Missing required environment variable: JWT_SECRET");
  }

  return jwtSecret;
};

module.exports = async function (req, res, next) {
  const authHeader = req.headers.authorization;
  let token = null;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err && err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }

    if (err && (err.name === "JsonWebTokenError" || err.name === "NotBeforeError")) {
      return res.status(401).json({ message: "Invalid token" });
    }

    console.error("Authentication error:", err);
    res.status(401).json({ message: "Token is not valid" });
  }
};
