import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { BookOpenText, LogOut, Menu, PenSquare, UserCircle, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Avatar from "./Avatar";

const navLinkClass = ({ isActive }) =>
  `rounded-md px-3 py-2 text-sm font-semibold transition ${
    isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
  }`;

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 font-bold text-slate-950" onClick={() => setOpen(false)}>
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-950 text-white">
            <BookOpenText className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="text-lg">BlogSpace</span>
        </Link>

        <button
          type="button"
          className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 md:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label="Toggle navigation"
        >
          {open ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
        </button>

        <div className="hidden items-center gap-2 md:flex">
          <NavLink to="/" className={navLinkClass}>
            Home
          </NavLink>
          {user ? (
            <>
              <NavLink to="/create-post" className={navLinkClass}>
                New Post
              </NavLink>
              <NavLink to="/profile" className={navLinkClass}>
                Profile
              </NavLink>
            </>
          ) : null}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <Avatar user={user} size="sm" />
                <span className="max-w-32 truncate text-sm font-semibold text-slate-800">{user.name}</span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="btn-outline inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="btn-outline inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold"
              >
                <UserCircle className="h-4 w-4" aria-hidden="true" />
                Login
              </Link>
              <Link
                to="/register"
                className="btn-ombre inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold"
              >
                <PenSquare className="h-4 w-4" aria-hidden="true" />
                Register
              </Link>
            </>
          )}
        </div>
      </nav>

      {open ? (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-2">
            <NavLink to="/" className={navLinkClass} onClick={() => setOpen(false)}>
              Home
            </NavLink>
            {user ? (
              <>
                <NavLink to="/create-post" className={navLinkClass} onClick={() => setOpen(false)}>
                  New Post
                </NavLink>
                <NavLink to="/profile" className={navLinkClass} onClick={() => setOpen(false)}>
                  Profile
                </NavLink>
                <div className="mt-2 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <Avatar user={user} size="sm" />
                  <span className="truncate text-sm font-semibold text-slate-800">{user.name}</span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn-outline mt-2 inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Logout
                </button>
              </>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="btn-outline inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold"
                >
                  <UserCircle className="h-4 w-4" aria-hidden="true" />
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setOpen(false)}
                  className="btn-ombre inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold"
                >
                  <PenSquare className="h-4 w-4" aria-hidden="true" />
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
};

export default Navbar;
