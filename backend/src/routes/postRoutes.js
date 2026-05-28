const express = require("express");
const { body, param, query } = require("express-validator");
const {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  toggleLike
} = require("../controllers/postController");
const { getComments, createComment } = require("../controllers/commentController");
const { protect, optionalAuth } = require("../middleware/auth");
const validate = require("../middleware/validate");

const router = express.Router();

const mongoIdParam = (name) => param(name).isMongoId().withMessage(`${name} must be a valid MongoDB id`);

const postBodyRules = [
  body("title")
    .trim()
    .isLength({ min: 3, max: 140 })
    .withMessage("Title must be between 3 and 140 characters"),
  body("content")
    .trim()
    .isLength({ min: 10, max: 8000 })
    .withMessage("Content must be between 10 and 8000 characters"),
  body("category")
    .trim()
    .isLength({ min: 2, max: 40 })
    .withMessage("Category must be between 2 and 40 characters")
];

const listQueryRules = [
  query("page").optional().isInt({ min: 1 }).withMessage("page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 50 }).withMessage("limit must be between 1 and 50"),
  query("search").optional().trim().isLength({ max: 100 }).withMessage("search must be at most 100 characters"),
  query("category").optional().trim().isLength({ max: 40 }).withMessage("category must be at most 40 characters"),
  query("author")
    .optional()
    .custom((value) => value === "me" || /^[0-9a-fA-F]{24}$/.test(value))
    .withMessage("author must be 'me' or a valid MongoDB id")
];

const commentBodyRules = [
  body("content")
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage("Comment must be between 1 and 1000 characters")
];

router
  .route("/")
  .get(optionalAuth, listQueryRules, validate, getPosts)
  .post(protect, postBodyRules, validate, createPost);

router.post("/:id/like", protect, mongoIdParam("id"), validate, toggleLike);

router.get("/:postId/comments", mongoIdParam("postId"), validate, getComments);
router.post(
  "/:postId/comments",
  protect,
  mongoIdParam("postId"),
  commentBodyRules,
  validate,
  createComment
);

router
  .route("/:id")
  .get(optionalAuth, mongoIdParam("id"), validate, getPostById)
  .put(protect, mongoIdParam("id"), postBodyRules, validate, updatePost)
  .delete(protect, mongoIdParam("id"), validate, deletePost);

module.exports = router;
