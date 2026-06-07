import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import api from "../api/axios";
import EmptyState from "../components/EmptyState";
import PostCard, { PostCardSkeleton } from "../components/PostCard";
import ThreadComposer from "../components/ThreadComposer";
import { useToast } from "../context/ToastContext";
import { useDebounce } from "../hooks/useDebounce";
import { categories } from "../utils/categories";
import { getErrorMessage } from "../utils/error";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deletingPostId, setDeletingPostId] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const toast = useToast();
  const debouncedSearch = useDebounce(search);

  const handlePostCreated = (post) => {
    setPage(1);
    setTotal((value) => value + 1);
    setTotalPages((value) => Math.max(value, 1));

    if (!debouncedSearch && (category === "all" || category === post.category)) {
      setPosts((current) => [post, ...current].slice(0, 8));
    }

    setReloadKey((value) => value + 1);
  };

  const handleDelete = async (postId) => {
    if (deletingPostId) {
      return;
    }

    const confirmed = window.confirm("Delete this post and its comments?");

    if (!confirmed) {
      return;
    }

    setDeletingPostId(postId);

    try {
      await api.delete(`/posts/${postId}`);
      setPosts((current) => current.filter((post) => post._id !== postId));
      setTotal((value) => Math.max(value - 1, 0));
      setReloadKey((value) => value + 1);
      toast.success("Post deleted");
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not delete post"));
    } finally {
      setDeletingPostId(null);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, category]);

  useEffect(() => {
    const controller = new AbortController();

    const loadPosts = async () => {
      setLoading(true);

      try {
        const { data } = await api.get("/posts", {
          signal: controller.signal,
          params: {
            page,
            limit: 8,
            search: debouncedSearch || undefined,
            category: category === "all" ? undefined : category
          }
        });

        setPosts(data.posts);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      } catch (error) {
        if (error.name !== "CanceledError") {
          toast.error(getErrorMessage(error, "Could not load posts"));
        }
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
    return () => controller.abort();
  }, [page, debouncedSearch, category, reloadKey, toast]);

  return (
    <section className="mx-auto max-w-3xl">
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-950">Trang chủ</h1>
            <p className="mt-1 text-sm font-medium text-slate-500">{total} posts</p>
          </div>
          <p className="text-sm font-semibold text-slate-500">
            {page}/{totalPages}
          </p>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_13rem]">
          <label className="relative block">
            <span className="sr-only">Search posts</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search"
              className="h-11 w-full rounded-full border border-slate-300 bg-white pl-11 pr-4 text-slate-950 shadow-sm placeholder:text-slate-400 focus:border-sky-500"
            />
          </label>

          <label>
            <span className="sr-only">Filter by category</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="h-11 w-full rounded-full border border-slate-300 bg-white px-4 text-slate-950 shadow-sm focus:border-sky-500"
            >
              <option value="all">All categories</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-slate-200 bg-white shadow-sm">
        <ThreadComposer
          defaultCategory={category === "all" ? "Other" : category}
          onCreated={handlePostCreated}
        />
        {loading
          ? Array.from({ length: 6 }, (_, index) => <PostCardSkeleton key={index} />)
          : posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                deleting={deletingPostId === post._id}
                onDelete={handleDelete}
              />
            ))}
      </div>

      {!loading && posts.length === 0 ? (
        <div className="mt-5">
          <EmptyState title="No posts found" description="Try a different search phrase or category filter." />
        </div>
      ) : null}

      {totalPages > 1 ? (
        <div className="mt-5 flex flex-col items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row">
          <p className="text-sm font-medium text-slate-600">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page === 1 || loading}
              onClick={() => setPage((value) => Math.max(value - 1, 1))}
              className="btn-outline rounded-lg px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page === totalPages || loading}
              onClick={() => setPage((value) => Math.min(value + 1, totalPages))}
              className="btn-ombre rounded-lg px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default Home;
