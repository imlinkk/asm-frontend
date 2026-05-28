const express = require("express");
const { body } = require("express-validator");
const { register, login, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");

const router = express.Router();

router.post(
  "/register",
  [
    body("name")
      .trim()
      .isLength({ min: 2, max: 80 })
      .withMessage("Name must be between 2 and 80 characters"),
    body("email").isEmail().withMessage("Email is invalid").normalizeEmail(),
    body("password")
      .isLength({ min: 6, max: 128 })
      .withMessage("Password must be between 6 and 128 characters"),
    body("avatar").optional({ checkFalsy: true }).isURL().withMessage("Avatar must be a valid URL")
  ],
  validate,
  register
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Email is invalid").normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required")
  ],
  validate,
  login
);

router.get("/me", protect, getMe);

module.exports = router;
