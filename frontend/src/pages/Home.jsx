import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import api from "../api/axios";
import EmptyState from "../components/EmptyState";
import PostCard, { PostCardSkeleton } from "../components/PostCard";
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
  const toast = useToast();
  const debouncedSearch = useDebounce(search);

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
            limit: 6,
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
  }, [page, debouncedSearch, category, toast]);

  return (
    <section>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-sky-700">Community posts</p>
          <h1 className="mt-3 text-3xl font-bold leading-tight text-slate-950 sm:text-4xl">Latest articles</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Search by title, filter by category, and open a post to join the discussion.
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm">
          <p className="font-semibold text-slate-950">{total} posts</p>
          <p className="text-slate-500">Page {page} of {totalPages}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[minmax(0,1fr)_15rem]">
        <label className="relative block">
          <span className="sr-only">Search posts</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title"
            className="h-12 w-full rounded-lg border border-slate-300 bg-white pl-11 pr-4 text-slate-950 shadow-sm placeholder:text-slate-400 focus:border-sky-500"
          />
        </label>

        <label>
          <span className="sr-only">Filter by category</span>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-slate-950 shadow-sm focus:border-sky-500"
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

      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }, (_, index) => <PostCardSkeleton key={index} />)
          : posts.map((post) => <PostCard key={post._id} post={post} />)}
      </div>

      {!loading && posts.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="No posts found" description="Try a different search phrase or category filter." />
        </div>
      ) : null}

      {totalPages > 1 ? (
        <div className="mt-8 flex flex-col items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row">
          <p className="text-sm font-medium text-slate-600">
            Showing page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page === 1 || loading}
              onClick={() => setPage((value) => Math.max(value - 1, 1))}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page === totalPages || loading}
              onClick={() => setPage((value) => Math.min(value + 1, totalPages))}
              className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
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
