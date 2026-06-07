import { useNavigate } from "react-router-dom";
import ThreadComposer from "../components/ThreadComposer";

const CreatePost = () => {
  const navigate = useNavigate();

  return (
    <section className="mx-auto max-w-3xl">
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <ThreadComposer
          showCategoryInitially
          onCreated={(post) => {
            navigate(`/posts/${post._id}`);
          }}
        />
      </div>
    </section>
  );
};

export default CreatePost;
