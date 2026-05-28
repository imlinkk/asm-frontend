const jwt = require("jsonwebtoken");
const User = require("../models/User");

const readToken = (req) => {
  const authHeader = req.headers.authorization || "";

  if (!authHeader.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.split(" ")[1];
};

const attachUserFromToken = async (req, token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id).select("-password");

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 401;
    throw error;
  }

  req.user = user;
};

const protect = async (req, res, next) => {
  try {
    const token = readToken(req);

    if (!token) {
      const error = new Error("Authentication token is required");
      error.statusCode = 401;
      throw error;
    }

    await attachUserFromToken(req, token);
    next();
  } catch (error) {
    error.statusCode = 401;
    error.message = error.message || "Invalid or expired token";
    next(error);
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const token = readToken(req);

    if (token) {
      await attachUserFromToken(req, token);
    }

    next();
  } catch (error) {
    error.statusCode = 401;
    error.message = "Invalid or expired token";
    next(error);
  }
};

module.exports = { protect, optionalAuth };
