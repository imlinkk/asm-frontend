import { Link } from "react-router-dom";

const NotFound = () => (
  <section className="mx-auto max-w-xl rounded-lg border border-slate-200 bg-white p-8 text-center shadow-soft">
    <p className="text-sm font-bold uppercase tracking-wide text-sky-700">404</p>
    <h1 className="mt-3 text-3xl font-bold text-slate-950">Page not found</h1>
    <p className="mt-3 text-sm leading-6 text-slate-600">The page you opened does not exist or was moved.</p>
    <Link to="/" className="btn-ombre mt-6 inline-flex rounded-lg px-4 py-2 text-sm font-bold">
      Back home
    </Link>
  </section>
);

export default NotFound;
