import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import PostForm from "../components/PostForm";
import Spinner from "../components/Spinner";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { getErrorMessage } from "../utils/error";

const EditPost = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();

    const loadPost = async () => {
      setLoading(true);

      try {
        const { data } = await api.get(`/posts/${id}`, { signal: controller.signal });
        setPost(data.post);
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

  const handleSubmit = async (values) => {
    try {
      const { data } = await api.put(`/posts/${id}`, values);
      toast.success("Post updated");
      navigate(`/posts/${data.post._id}`);
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not update post"));
    }
  };

  if (loading) {
    return <Spinner fullPage label="Loading editor" />;
  }

  if (!post) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-8 text-center">
        <h1 className="text-2xl font-bold text-slate-950">Post not found</h1>
        <Link to="/" className="btn-ombre mt-4 inline-flex rounded-lg px-4 py-2 text-sm font-semibold">
          Back home
        </Link>
      </section>
    );
  }

  if (post.author?._id !== user?._id) {
    return (
      <section className="rounded-lg border border-rose-200 bg-rose-50 p-8 text-center text-rose-950">
        <h1 className="text-2xl font-bold">Access denied</h1>
        <p className="mt-2 text-sm">Only the post owner can edit this article.</p>
        <Link
          to={`/posts/${post._id}`}
          className="mt-4 inline-flex rounded-lg bg-rose-700 px-4 py-2 text-sm font-semibold text-white"
        >
          View post
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl rounded-lg border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
      <h1 className="text-2xl font-bold text-slate-950">Edit post</h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">Update the title, category, or content for this article.</p>
      <div className="mt-6">
        <PostForm
          submitLabel="Update post"
          initialValues={{
            title: post.title,
            category: post.category,
            content: post.content
          }}
          onSubmit={handleSubmit}
        />
      </div>
    </section>
  );
};

export default EditPost;
