import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Flag, Heart, Loader2, MessageCircle, MoreHorizontal, Pencil, Send, Trash2 } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { formatDate } from "../utils/formatDate";
import { getErrorMessage } from "../utils/error";
import Avatar from "./Avatar";

const actionClass =
  "inline-flex h-9 items-center gap-1.5 rounded-full px-2.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-950";

const getEntityId = (entity) => {
  if (!entity) {
    return "";
  }

  if (typeof entity === "string") {
    return entity;
  }

  return entity._id || entity.id || "";
};

const PostCard = ({ post, canManage = false, deleting = false, onDelete }) => {
  const [likedByMe, setLikedByMe] = useState(Boolean(post.likedByMe));
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);
  const [likeLoading, setLikeLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef(null);

  useEffect(() => {
    setLikedByMe(Boolean(post.likedByMe));
    setLikeCount(post.likeCount || 0);
  }, [post._id, post.likedByMe, post.likeCount]);

  useEffect(() => {
    if (!menuOpen) {
      return undefined;
    }

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  const title = post.title?.trim() || "Untitled post";
  const excerpt = post.content.length > 280 ? `${post.content.slice(0, 280)}...` : post.content;
  const shouldShowExcerpt = excerpt.trim() && excerpt.trim() !== title;
  const commentCount = post.commentCount || 0;
  const authorName = post.author?.name || "Unknown";
  const postUrl = `${window.location.origin}/posts/${post._id}`;
  const currentUserId = getEntityId(user);
  const authorId = getEntityId(post.author);
  const isSameUserId = currentUserId && authorId && String(currentUserId) === String(authorId);
  const isSameEmail = user?.email && post.author?.email && user.email === post.author.email;
  const isOwner = canManage || isSameUserId || isSameEmail;

  const requireUser = () => {
    if (user) {
      return true;
    }

    toast.error("Please login first");
    navigate("/login", { state: { from: location } });
    return false;
  };

  const handleLike = async () => {
    if (!requireUser() || likeLoading) {
      return;
    }

    setLikeLoading(true);

    try {
      const { data } = await api.post(`/posts/${post._id}/like`);
      setLikedByMe(Boolean(data.post.likedByMe));
      setLikeCount(data.post.likeCount || 0);
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not update like"));
    } finally {
      setLikeLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      toast.success("Post link copied");
    } catch (error) {
      toast.error("Could not copy post link");
    }
  };

  const handleReport = () => {
    setMenuOpen(false);
    toast.info("Đã ghi nhận báo cáo bài viết");
  };

  const handleDeleteFromMenu = () => {
    setMenuOpen(false);
    onDelete?.(post._id);
  };

  return (
    <article className="group flex gap-3 border-b border-slate-200 bg-white px-4 py-5 last:border-b-0 sm:px-5">
      <div className="shrink-0">
        <Avatar user={post.author} size="md" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <p className="max-w-44 truncate text-sm font-bold text-slate-950 sm:max-w-xs">{authorName}</p>
              <span className="text-sm font-medium text-slate-400">{formatDate(post.createdAt)}</span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
                {post.category}
              </span>
            </div>

          </div>

          <div ref={menuRef} className="relative shrink-0">
            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Post options"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              {deleting ? (
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              ) : (
                <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
              )}
            </button>

            {menuOpen ? (
              <div
                className="absolute right-0 top-full z-30 mt-2 w-44 rounded-lg border border-slate-200 bg-white p-1 shadow-soft"
                role="menu"
              >
                {isOwner ? (
                  <>
                    <Link
                      to={`/edit-post/${post._id}`}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
                      role="menuitem"
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                      Chỉnh sửa
                    </Link>
                    <button
                      type="button"
                      disabled={deleting}
                      onClick={handleDeleteFromMenu}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                      role="menuitem"
                    >
                      {deleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      ) : (
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      )}
                      Xoá
                    </button>
                  </>
                ) : null}

                <button
                  type="button"
                  onClick={handleReport}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
                  role="menuitem"
                >
                  <Flag className="h-4 w-4" aria-hidden="true" />
                  Báo cáo
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <Link to={`/posts/${post._id}`} className="mt-2 block">
          <h2 className="text-xl font-extrabold leading-snug text-slate-950 transition group-hover:text-sky-700 sm:text-2xl">
            {title}
          </h2>
          {shouldShowExcerpt ? (
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{excerpt}</p>
          ) : null}
        </Link>

        <div className="mt-3 flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={handleLike}
            disabled={likeLoading}
            aria-pressed={likedByMe}
            className={`${actionClass} ${
              likedByMe ? "text-rose-500 hover:text-rose-600" : ""
            } disabled:cursor-not-allowed disabled:opacity-70`}
          >
            {likeLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            ) : (
              <Heart
                className={`h-5 w-5 ${
                  likedByMe ? "fill-rose-500 text-rose-500" : "text-slate-500"
                }`}
                aria-hidden="true"
               />
            )}
            <span>{likeCount}</span>
          </button>

          <Link to={`/posts/${post._id}`} className={actionClass} aria-label="Open comments">
            <MessageCircle className="h-5 w-5" aria-hidden="true" />
            <span>{commentCount}</span>
          </Link>

          <button type="button" onClick={handleShare} className={actionClass} aria-label="Share post">
            <Send className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
};

export const PostCardSkeleton = () => (
  <div className="flex gap-3 border-b border-slate-200 bg-white px-4 py-5 last:border-b-0 sm:px-5">
    <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-slate-200" />
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-2">
        <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-16 animate-pulse rounded bg-slate-200" />
      </div>
      <div className="mt-3 h-5 w-3/4 animate-pulse rounded bg-slate-200" />
      <div className="mt-4 space-y-2">
        <div className="h-4 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-slate-200" />
      </div>
      <div className="mt-4 flex gap-3">
        <div className="h-7 w-12 animate-pulse rounded-full bg-slate-200" />
        <div className="h-7 w-12 animate-pulse rounded-full bg-slate-200" />
        <div className="h-7 w-9 animate-pulse rounded-full bg-slate-200" />
      </div>
    </div>
  </div>
);

export default PostCard;
