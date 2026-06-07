const Post = require("../models/Post");
const Comment = require("../models/Comment");
const serializePost = require("../utils/postSerializer");

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getPagination = (query) => {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || 6, 1), 50);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

const getPosts = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = {};

    if (req.query.search) {
      filter.title = { $regex: escapeRegex(req.query.search.trim()), $options: "i" };
    }

    if (req.query.category && req.query.category !== "all") {
      filter.category = req.query.category;
    }

    if (req.query.author) {
      if (req.query.author === "me") {
        if (!req.user) {
          const error = new Error("Authentication is required for author=me");
          error.statusCode = 401;
          throw error;
        }

        filter.author = req.user._id;
      } else {
        filter.author = req.query.author;
      }
    }

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .populate("author", "name email avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Post.countDocuments(filter)
    ]);

    const commentCounts = await Comment.aggregate([
      { $match: { post: { $in: posts.map((post) => post._id) } } },
      { $group: { _id: "$post", count: { $sum: 1 } } }
    ]);
    const commentCountByPostId = new Map(commentCounts.map((item) => [String(item._id), item.count]));

    res.status(200).json({
      posts: posts.map((post) =>
        serializePost(post, req.user?._id, {
          commentCount: commentCountByPostId.get(String(post._id)) || 0
        })
      ),
      totalPages: Math.ceil(total / limit) || 1,
      currentPage: page,
      total
    });
  } catch (error) {
    next(error);
  }
};

const getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate("author", "name email avatar");

    if (!post) {
      const error = new Error("Post not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({ post: serializePost(post, req.user?._id) });
  } catch (error) {
    next(error);
  }
};

const createPost = async (req, res, next) => {
  try {
    const { title, content, category } = req.body;
    const post = await Post.create({
      title,
      content,
      category,
      author: req.user._id
    });

    const populatedPost = await post.populate("author", "name email avatar");
    res.status(201).json({ post: serializePost(populatedPost, req.user._id) });
  } catch (error) {
    next(error);
  }
};

const updatePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      const error = new Error("Post not found");
      error.statusCode = 404;
      throw error;
    }

    if (String(post.author) !== String(req.user._id)) {
      const error = new Error("You can only update your own posts");
      error.statusCode = 403;
      throw error;
    }

    post.title = req.body.title;
    post.content = req.body.content;
    post.category = req.body.category;
    await post.save();

    const populatedPost = await post.populate("author", "name email avatar");
    res.status(200).json({ post: serializePost(populatedPost, req.user._id) });
  } catch (error) {
    next(error);
  }
};

const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      const error = new Error("Post not found");
      error.statusCode = 404;
      throw error;
    }

    if (String(post.author) !== String(req.user._id)) {
      const error = new Error("You can only delete your own posts");
      error.statusCode = 403;
      throw error;
    }

    await Promise.all([
      Comment.deleteMany({ post: post._id }),
      Post.deleteOne({ _id: post._id })
    ]);

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    next(error);
  }
};

const toggleLike = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      const error = new Error("Post not found");
      error.statusCode = 404;
      throw error;
    }

    const userId = String(req.user._id);
    const liked = post.likes.some((like) => String(like) === userId);

    if (liked) {
      post.likes = post.likes.filter((like) => String(like) !== userId);
    } else {
      post.likes.push(req.user._id);
    }

    await post.save();
    const populatedPost = await post.populate("author", "name email avatar");

    res.status(200).json({
      post: serializePost(populatedPost, req.user._id),
      liked: !liked
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  toggleLike
};
