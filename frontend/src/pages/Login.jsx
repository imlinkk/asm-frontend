import { useForm } from "react-hook-form";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { getErrorMessage } from "../utils/error";
import { ButtonSpinner } from "../components/Spinner";

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(1, "Password is required")
});

const Login = () => {
  const { user, login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" }
  });

  if (user) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (values) => {
    try {
      await login(values);
      toast.success("Logged in successfully");
      navigate(from, { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error, "Login failed"));
    }
  };

  return (
    <section className="mx-auto max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
      <h1 className="text-2xl font-bold text-slate-950">Login</h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">Access your account to create, edit, like, and comment.</p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
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
            autoComplete="current-password"
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
          {isSubmitting ? <ButtonSpinner /> : <LogIn className="h-4 w-4" aria-hidden="true" />}
          {isSubmitting ? "Logging in" : "Login"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-slate-600">
        No account?{" "}
        <Link to="/register" className="font-bold text-sky-700 hover:text-sky-800">
          Register
        </Link>
      </p>
    </section>
  );
};

export default Login;
