const express = require("express");
const path = require("path");
const fs = require("fs");
let multer;
try {
  multer = require("multer");
} catch (err) {
  multer = null;
}
const { body } = require("express-validator");
const { register, login, getMe, updateProfile, uploadAvatar } = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");

const router = express.Router();
const avatarUrlValidator = () =>
  body("avatar")
    .optional({ checkFalsy: true })
    .isURL({ require_protocol: true, protocols: ["http", "https"], require_tld: false })
    .withMessage("Avatar must be a valid URL");

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
    avatarUrlValidator()
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
router.put(
  "/me",
  protect,
  [
    body("name").optional().trim().isLength({ min: 2, max: 80 }).withMessage("Name must be between 2 and 80 characters"),
    avatarUrlValidator()
  ],
  validate,
  updateProfile
);

// Ensure upload directory exists
const avatarsDir = path.resolve(__dirname, "../../uploads/avatars");
fs.mkdirSync(avatarsDir, { recursive: true });

let upload = null;
if (multer) {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, avatarsDir),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`)
  });

  const fileFilter = (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"), false);
    }
    cb(null, true);
  };

  upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

  router.post("/me/avatar", protect, upload.single("avatar"), uploadAvatar);
} else {
  // If multer not installed, provide a helpful error response instead of crashing at startup
  router.post("/me/avatar", protect, (req, res) => {
    res.status(500).json({ message: "File upload is not available: multer is not installed on the server. Run 'npm install multer' in backend." });
  });
}

module.exports = router;
