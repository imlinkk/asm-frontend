const User = require("../models/User");
const generateToken = require("../utils/generateToken");

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

    const user = await User.create({ name, email, password, avatar });
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

    sendAuthResponse(res, 200, user);
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res) => {
  res.status(200).json({ user: req.user.toSafeJSON() });
};

module.exports = { register, login, getMe };
