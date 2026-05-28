const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 140
    },
    content: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 8000
    },
    category: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 40
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

postSchema.virtual("likeCount").get(function getLikeCount() {
  return this.likes.length;
});

postSchema.index({ title: 1 });
postSchema.index({ category: 1 });

module.exports = mongoose.model("Post", postSchema);
