import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { categories } from "../utils/categories";
import { ButtonSpinner } from "./Spinner";

const postSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(140, "Title is too long"),
  category: z.string().trim().min(2, "Choose a category").max(40, "Category is too long"),
  content: z.string().trim().min(10, "Content must be at least 10 characters").max(8000, "Content is too long")
});

const PostForm = ({ initialValues, submitLabel = "Save Post", onSubmit }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(postSchema),
    defaultValues: initialValues || {
      title: "",
      category: categories[0],
      content: ""
    }
  });

  useEffect(() => {
    if (initialValues) {
      reset(initialValues);
    }
  }, [initialValues, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label htmlFor="title" className="text-sm font-semibold text-slate-800">
          Title
        </label>
        <input
          id="title"
          type="text"
          className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-950 shadow-sm transition placeholder:text-slate-400 focus:border-sky-500"
          placeholder="A clear, searchable title"
          {...register("title")}
        />
        {errors.title ? <p className="mt-2 text-sm font-medium text-rose-600">{errors.title.message}</p> : null}
      </div>

      <div>
        <label htmlFor="category" className="text-sm font-semibold text-slate-800">
          Category
        </label>
        <select
          id="category"
          className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-950 shadow-sm transition focus:border-sky-500"
          {...register("category")}
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        {errors.category ? <p className="mt-2 text-sm font-medium text-rose-600">{errors.category.message}</p> : null}
      </div>

      <div>
        <label htmlFor="content" className="text-sm font-semibold text-slate-800">
          Content
        </label>
        <textarea
          id="content"
          rows={12}
          className="mt-2 w-full resize-y rounded-lg border border-slate-300 bg-white px-4 py-3 leading-7 text-slate-950 shadow-sm transition placeholder:text-slate-400 focus:border-sky-500"
          placeholder="Write the full post content"
          {...register("content")}
        />
        {errors.content ? <p className="mt-2 text-sm font-medium text-rose-600">{errors.content.message}</p> : null}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-ombre inline-flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
      >
        {isSubmitting ? <ButtonSpinner /> : <Save className="h-4 w-4" aria-hidden="true" />}
        {isSubmitting ? "Saving" : submitLabel}
      </button>
    </form>
  );
};

export default PostForm;
