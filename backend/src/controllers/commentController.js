const Comment = require("../models/Comment");
const Post = require("../models/Post");

const getComments = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      const error = new Error("Post not found");
      error.statusCode = 404;
      throw error;
    }

    const comments = await Comment.find({ post: req.params.postId })
      .populate("author", "name email avatar")
      .sort({ createdAt: -1 });

    res.status(200).json({ comments });
  } catch (error) {
    next(error);
  }
};

const createComment = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      const error = new Error("Post not found");
      error.statusCode = 404;
      throw error;
    }

    const comment = await Comment.create({
      content: req.body.content,
      post: post._id,
      author: req.user._id
    });

    const populatedComment = await comment.populate("author", "name email avatar");
    res.status(201).json({ comment: populatedComment });
  } catch (error) {
    next(error);
  }
};

const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id).populate("post", "author");

    if (!comment) {
      const error = new Error("Comment not found");
      error.statusCode = 404;
      throw error;
    }

    const isCommentAuthor = String(comment.author) === String(req.user._id);
    const isPostOwner = String(comment.post.author) === String(req.user._id);

    if (!isCommentAuthor && !isPostOwner) {
      const error = new Error("You can only delete your own comment or comments on your post");
      error.statusCode = 403;
      throw error;
    }

    await Comment.deleteOne({ _id: comment._id });
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getComments, createComment, deleteComment };
