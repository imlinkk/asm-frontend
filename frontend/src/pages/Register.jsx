import { useForm } from "react-hook-form";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
import { ButtonSpinner } from "../components/Spinner";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { getErrorMessage } from "../utils/error";

const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80, "Name is too long"),
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters").max(128, "Password is too long")
});

const Register = () => {
  const { user, register: registerAccount } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" }
  });

  if (user) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (values) => {
    try {
      await registerAccount(values);
      toast.success("Account created");
      navigate("/", { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error, "Registration failed"));
    }
  };

  return (
    <section className="mx-auto max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
      <h1 className="text-2xl font-bold text-slate-950">Register</h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">Create an account to publish posts and join discussions.</p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="name" className="text-sm font-semibold text-slate-800">
            Name
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 shadow-sm focus:border-sky-500"
            {...register("name")}
          />
          {errors.name ? <p className="mt-2 text-sm font-medium text-rose-600">{errors.name.message}</p> : null}
        </div>

        <div>
          <label htmlFor="email" className="text-sm font-semibold text-slate-800">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 shadow-sm focus:border-sky-500"
            {...register("email")}
          />
          {errors.email ? <p className="mt-2 text-sm font-medium text-rose-600">{errors.email.message}</p> : null}
        </div>

        <div>
          <label htmlFor="password" className="text-sm font-semibold text-slate-800">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 shadow-sm focus:border-sky-500"
            {...register("password")}
          />
          {errors.password ? (
            <p className="mt-2 text-sm font-medium text-rose-600">{errors.password.message}</p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? <ButtonSpinner /> : <UserPlus className="h-4 w-4" aria-hidden="true" />}
          {isSubmitting ? "Creating account" : "Create account"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-slate-600">
        Already registered?{" "}
        <Link to="/login" className="font-bold text-sky-700 hover:text-sky-800">
          Login
        </Link>
      </p>
    </section>
  );
};

export default Register;
