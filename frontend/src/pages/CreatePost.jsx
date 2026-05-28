import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import PostForm from "../components/PostForm";
import { useToast } from "../context/ToastContext";
import { getErrorMessage } from "../utils/error";

const CreatePost = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (values) => {
    try {
      const { data } = await api.post("/posts", values);
      toast.success("Post created");
      navigate(`/posts/${data.post._id}`);
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not create post"));
    }
  };

  return (
    <section className="mx-auto max-w-3xl rounded-lg border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
      <h1 className="text-2xl font-bold text-slate-950">Create post</h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">Publish a new article with a title, category, and content.</p>
      <div className="mt-6">
        <PostForm submitLabel="Create post" onSubmit={handleSubmit} />
      </div>
    </section>
  );
};

export default CreatePost;
