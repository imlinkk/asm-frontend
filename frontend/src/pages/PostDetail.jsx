import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Heart, MessageCircle, Pencil, Send, Trash2 } from "lucide-react";
import api from "../api/axios";
import Avatar from "../components/Avatar";
import Spinner, { ButtonSpinner } from "../components/Spinner";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { formatDate } from "../utils/formatDate";
import { getErrorMessage } from "../utils/error";

const commentSchema = z.object({
  content: z.string().trim().min(1, "Comment is required").max(1000, "Comment is too long")
});

const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likeLoading, setLikeLoading] = useState(false);
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(commentSchema),
    defaultValues: { content: "" }
  });

  useEffect(() => {
    const controller = new AbortController();

    const loadPost = async () => {
      setLoading(true);

      try {
        const [postResponse, commentResponse] = await Promise.all([
          api.get(`/posts/${id}`, { signal: controller.signal }),
          api.get(`/posts/${id}/comments`, { signal: controller.signal })
        ]);

        setPost(postResponse.data.post);
        setComments(commentResponse.data.comments);
      } catch (error) {
        if (error.name !== "CanceledError") {
          toast.error(getErrorMessage(error, "Could not load post"));
        }
      } finally {
        setLoading(false);
      }
    };

    loadPost();
    return () => controller.abort();
  }, [id, toast]);

  const requireUser = () => {
    if (user) {
      return true;
    }

    toast.error("Please login first");
    navigate("/login", { state: { from: location } });
    return false;
  };

  const handleLike = async () => {
    if (!requireUser()) {
      return;
    }

    setLikeLoading(true);

    try {
      const { data } = await api.post(`/posts/${id}/like`);
      setPost(data.post);
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not update like"));
    } finally {
      setLikeLoading(false);
    }
  };

  const onCommentSubmit = async (values) => {
    if (!requireUser()) {
      return;
    }

    try {
      const { data } = await api.post(`/posts/${id}/comments`, values);
      setComments((current) => [data.comment, ...current]);
      reset();
      toast.success("Comment added");
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not add comment"));
    }
  };

  const handleDeleteComment = async (commentId) => {
    const confirmed = window.confirm("Delete this comment?");

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/comments/${commentId}`);
      setComments((current) => current.filter((comment) => comment._id !== commentId));
      toast.success("Comment deleted");
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not delete comment"));
    }
  };

  if (loading) {
    return <Spinner fullPage label="Loading post" />;
  }

  if (!post) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-8 text-center">
        <h1 className="text-2xl font-bold text-slate-950">Post not found</h1>
        <Link to="/" className="mt-4 inline-flex rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
          Back home
        </Link>
      </section>
    );
  }

  const isOwner = user?._id === post.author?._id;

  return (
    <article className="mx-auto max-w-4xl">
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <span className="rounded-md bg-amber-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-amber-700">
              {post.category}
            </span>
            <h1 className="mt-4 text-3xl font-bold leading-tight text-slate-950 sm:text-4xl">{post.title}</h1>
          </div>

          {isOwner ? (
            <Link
              to={`/edit-post/${post._id}`}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              <Pencil className="h-4 w-4" aria-hidden="true" />
              Edit
            </Link>
          ) : null}
        </div>

        <div className="mt-6 flex flex-col gap-4 border-y border-slate-100 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Avatar user={post.author} />
            <div>
              <p className="font-semibold text-slate-950">{post.author?.name || "Unknown"}</p>
              <p className="text-sm text-slate-500">{formatDate(post.createdAt)}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLike}
            disabled={likeLoading}
            className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-70 ${
              post.likedByMe ? "bg-rose-600 text-white hover:bg-rose-700" : "border border-rose-200 text-rose-700 hover:bg-rose-50"
            }`}
          >
            {likeLoading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <Heart className={`h-4 w-4 ${post.likedByMe ? "fill-white" : ""}`} aria-hidden="true" />
            )}
            {post.likeCount || 0}
          </button>
        </div>

        <div className="prose prose-slate mt-8 max-w-none whitespace-pre-wrap text-base leading-8 text-slate-700">
          {post.content}
        </div>
      </div>

      <section className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-sky-600" aria-hidden="true" />
          <h2 className="text-xl font-bold text-slate-950">Comments</h2>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">{comments.length}</span>
        </div>

        <form className="mt-5 space-y-3" onSubmit={handleSubmit(onCommentSubmit)}>
          <textarea
            rows={4}
            placeholder={user ? "Write a comment" : "Login to comment"}
            disabled={!user || isSubmitting}
            className="w-full resize-y rounded-lg border border-slate-300 px-4 py-3 leading-6 shadow-sm placeholder:text-slate-400 focus:border-sky-500 disabled:cursor-not-allowed disabled:bg-slate-100"
            {...register("content")}
          />
          {errors.content ? <p className="text-sm font-medium text-rose-600">{errors.content.message}</p> : null}
          <button
            type="submit"
            disabled={!user || isSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {isSubmitting ? <ButtonSpinner /> : <Send className="h-4 w-4" aria-hidden="true" />}
            {isSubmitting ? "Posting" : "Post comment"}
          </button>
        </form>

        <div className="mt-7 space-y-4">
          {comments.length === 0 ? (
            <p className="rounded-lg bg-slate-50 px-4 py-6 text-center text-sm font-medium text-slate-500">
              No comments yet.
            </p>
          ) : (
            comments.map((comment) => {
              const canDelete = user && (comment.author?._id === user._id || post.author?._id === user._id);

              return (
                <div key={comment._id} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar user={comment.author} size="sm" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-950">
                          {comment.author?.name || "Unknown"}
                        </p>
                        <p className="text-xs text-slate-500">{formatDate(comment.createdAt)}</p>
                      </div>
                    </div>

                    {canDelete ? (
                      <button
                        type="button"
                        onClick={() => handleDeleteComment(comment._id)}
                        className="rounded-lg border border-rose-200 p-2 text-rose-600 transition hover:bg-rose-50"
                        aria-label="Delete comment"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    ) : null}
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{comment.content}</p>
                </div>
              );
            })
          )}
        </div>
      </section>
    </article>
  );
};

export default PostDetail;
