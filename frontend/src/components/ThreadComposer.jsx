import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { categories } from "../utils/categories";
import { getErrorMessage } from "../utils/error";
import Avatar from "./Avatar";

const buildTitle = (content) => {
  const compact = content.replace(/\s+/g, " ").trim();
  return compact.length > 140 ? `${compact.slice(0, 137)}...` : compact;
};

const getDefaultCategory = (category) => (categories.includes(category) ? category : "Other");

const ThreadComposer = ({ defaultCategory = "Other", showCategoryInitially = false, onCreated }) => {
  const { user } = useAuth();
  const toast = useToast();
  const location = useLocation();
  const [content, setContent] = useState("");
  const [category, setCategory] = useState(getDefaultCategory(defaultCategory));
  const [focused, setFocused] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const trimmedContent = content.trim();
  const showCategory = showCategoryInitially || focused || content;
  const canSubmit = trimmedContent.length >= 10 && !submitting;

  useEffect(() => {
    setCategory(getDefaultCategory(defaultCategory));
  }, [defaultCategory]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!canSubmit) {
      toast.error("Post content must be at least 10 characters");
      return;
    }

    setSubmitting(true);

    try {
      const { data } = await api.post("/posts", {
        title: buildTitle(trimmedContent),
        content: trimmedContent,
        category
      });

      setContent("");
      setFocused(false);
      onCreated?.({ ...data.post, commentCount: 0 });
      toast.success("Post created");
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not create post"));
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-4 sm:px-5">
        <Avatar user={null} size="md" />
        <Link
          to="/login"
          state={{ from: location }}
          className="flex-1 rounded-full bg-slate-100 px-4 py-3 text-left text-sm font-semibold text-slate-500 transition hover:bg-slate-200"
        >
          Đăng nhập để đăng bài
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border-b border-slate-200 bg-white px-4 py-4 sm:px-5">
      <div className="flex items-start gap-3">
        <Avatar user={user} size="md" />
        <div className="min-w-0 flex-1">
          <label htmlFor="thread-content" className="sr-only">
            New post content
          </label>
          <textarea
            id="thread-content"
            value={content}
            rows={showCategory ? 3 : 1}
            onFocus={() => setFocused(true)}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Có gì mới?"
            disabled={submitting}
            className="block w-full resize-none border-0 bg-transparent px-0 py-1 text-base leading-7 text-slate-950 placeholder:text-slate-400 focus:ring-0 disabled:cursor-not-allowed disabled:opacity-70"
          />

          {showCategory ? (
            <label
              htmlFor="thread-category"
              className="mt-3 inline-flex w-full flex-col gap-2 text-xs font-bold uppercase tracking-wide text-slate-500 sm:w-auto sm:flex-row sm:items-center"
            >
              Category
              <select
                id="thread-category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                disabled={submitting}
                className="h-9 rounded-full border border-slate-300 bg-white px-3 text-sm font-semibold normal-case tracking-normal text-slate-700 focus:border-sky-500 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex h-10 shrink-0 items-center justify-center rounded-full border border-slate-300 px-5 text-sm font-bold text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : "Đăng"}
        </button>
      </div>
    </form>
  );
};

export default ThreadComposer;
