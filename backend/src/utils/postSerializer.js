const serializePost = (post, currentUserId = null) => {
  const plainPost = post.toObject ? post.toObject({ virtuals: true }) : post;
  const likes = plainPost.likes || [];
  const likedByMe = currentUserId
    ? likes.some((like) => String(like._id || like) === String(currentUserId))
    : false;

  return {
    ...plainPost,
    likes: undefined,
    likeCount: likes.length,
    likedByMe
  };
};

module.exports = serializePost;
