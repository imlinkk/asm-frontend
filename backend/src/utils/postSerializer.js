const serializePost = (post, currentUserId = null, extras = {}) => {
  const plainPost = post.toObject ? post.toObject({ virtuals: true }) : post;
  const likes = plainPost.likes || [];
  const likedByMe = currentUserId
    ? likes.some((like) => String(like._id || like) === String(currentUserId))
    : false;

  return {
    ...plainPost,
    likes: undefined,
    likeCount: likes.length,
    likedByMe,
    ...extras
  };
};

module.exports = serializePost;
