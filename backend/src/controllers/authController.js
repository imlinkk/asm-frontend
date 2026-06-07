const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const shouldBeAdmin = (email) => {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  return Boolean(adminEmail && email?.toLowerCase() === adminEmail);
};

const sendAuthResponse = (res, statusCode, user) => {
  res.status(statusCode).json({
    token: generateToken(user._id),
    user: user.toSafeJSON()
  });
};

const register = async (req, res, next) => {
  try {
    const { name, email, password, avatar } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      const error = new Error("Email is already registered");
      error.statusCode = 400;
      throw error;
    }

    const user = await User.create({
      name,
      email,
      password,
      avatar,
      role: shouldBeAdmin(email) ? "admin" : "user"
    });
    sendAuthResponse(res, 201, user);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }

    if (shouldBeAdmin(user.email) && user.role !== "admin") {
      user.role = "admin";
      await user.save();
    }

    sendAuthResponse(res, 200, user);
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    if (shouldBeAdmin(req.user.email) && req.user.role !== "admin") {
      req.user.role = "admin";
      await req.user.save();
    }

    res.status(200).json({ user: req.user.toSafeJSON() });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, avatar } = req.body;

    const user = req.user;

    if (name) {
      user.name = name;
    }

    // allow clearing avatar by sending empty string
    if (typeof avatar !== "undefined") {
      user.avatar = avatar;
    }

    await user.save();

    res.status(200).json({ user: user.toSafeJSON() });
  } catch (error) {
    next(error);
  }
};

const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      const error = new Error("No file uploaded");
      error.statusCode = 400;
      throw error;
    }

    const filename = req.file.filename;
    const host = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`;
    const url = `${host}/uploads/avatars/${filename}`;

    const user = req.user;
    user.avatar = url;
    await user.save();

    res.status(200).json({ url: user.avatar });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, updateProfile, uploadAvatar };
