import { Link } from "react-router-dom";
import { ArrowRight, Heart, Loader2, Pencil, Trash2 } from "lucide-react";
import Avatar from "./Avatar";
import { formatDate } from "../utils/formatDate";

const PostCard = ({ post, canManage = false, deleting = false, onDelete }) => {
  const excerpt = post.content.length > 170 ? `${post.content.slice(0, 170)}...` : post.content;

  return (
    <article className="flex h-full flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-md bg-sky-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-sky-700">
          {post.category}
        </span>
        <span className="text-xs font-medium text-slate-500">{formatDate(post.createdAt)}</span>
      </div>

      <div className="mt-4 flex-1">
        <Link to={`/posts/${post._id}`} className="group">
          <h2 className="text-xl font-bold leading-7 text-slate-950 group-hover:text-sky-700">{post.title}</h2>
        </Link>
        <p className="mt-3 text-sm leading-6 text-slate-600">{excerpt}</p>
      </div>

      <div className="mt-5 flex items-center justify-between gap-4 border-t border-slate-100 pt-4">
        <div className="flex min-w-0 items-center gap-2">
          <Avatar user={post.author} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-800">{post.author?.name || "Unknown"}</p>
            <p className="flex items-center gap-1 text-xs font-medium text-slate-500">
              <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" aria-hidden="true" />
              {post.likeCount || 0}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {canManage ? (
            <>
              <Link
                to={`/edit-post/${post._id}`}
                className="btn-outline rounded-lg p-2"
                aria-label="Edit post"
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
              </Link>
              <button
                type="button"
                disabled={deleting}
                onClick={() => onDelete?.(post._id)}
                className="rounded-lg border border-rose-200 p-2 text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label={deleting ? "Deleting post" : "Delete post"}
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </>
          ) : null}
          <Link
            to={`/posts/${post._id}`}
            className="btn-ombre inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold"
          >
            Read
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
};

export const PostCardSkeleton = () => (
  <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex justify-between">
      <div className="h-6 w-24 animate-pulse rounded-md bg-slate-200" />
      <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
    </div>
    <div className="mt-5 h-7 w-4/5 animate-pulse rounded bg-slate-200" />
    <div className="mt-4 space-y-2">
      <div className="h-4 animate-pulse rounded bg-slate-200" />
      <div className="h-4 w-5/6 animate-pulse rounded bg-slate-200" />
      <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
    </div>
    <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-4">
      <div className="h-8 w-8 animate-pulse rounded-full bg-slate-200" />
      <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
    </div>
  </div>
);

export default PostCard;
