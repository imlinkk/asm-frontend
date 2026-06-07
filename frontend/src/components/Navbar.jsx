import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  BookOpenText,
  ChevronDown,
  Home as HomeIcon,
  LogOut,
  Menu,
  PenSquare,
  UserCircle,
  X
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Avatar from "./Avatar";

const navLinkClass = ({ isActive }) =>
  `inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition ${
    isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
  }`;

const iconNavLinkClass = ({ isActive }) =>
  `inline-flex h-10 w-10 items-center justify-center rounded-full transition ${
    isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
  }`;

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const profileMenuRef = useRef(null);

  useEffect(() => {
    if (!profileMenuOpen) {
      return undefined;
    }

    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [profileMenuOpen]);

  const closeMenus = () => {
    setOpen(false);
    setProfileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMenus();
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 font-bold text-slate-950" onClick={closeMenus}>
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-950 text-white">
            <BookOpenText className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="text-lg">Blog Chát Chít</span>
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
          <NavLink to="/" className={iconNavLinkClass} aria-label="Trang chủ" title="Trang chủ">
            <HomeIcon className="h-5 w-5" aria-hidden="true" />
          </NavLink>
          {user ? (
            <NavLink to="/create-post" className={navLinkClass}>
              <PenSquare className="h-4 w-4" aria-hidden="true" />
              New Post
            </NavLink>
          ) : null}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <div ref={profileMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setProfileMenuOpen((value) => !value)}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 py-1 pl-1 pr-3 text-slate-800 transition hover:border-slate-300 hover:bg-white"
                aria-haspopup="menu"
                aria-expanded={profileMenuOpen}
              >
                <Avatar user={user} size="sm" />
                <span className="max-w-32 truncate text-sm font-semibold">{user.name}</span>
                <ChevronDown
                  className={`h-4 w-4 text-slate-500 transition ${profileMenuOpen ? "rotate-180" : ""}`}
                  aria-hidden="true"
                />
              </button>

              {profileMenuOpen ? (
                <div
                  className="absolute right-0 top-full mt-3 w-72 rounded-lg border border-slate-200 bg-white p-2 shadow-soft"
                  role="menu"
                >
                  <div className="flex items-center gap-3 border-b border-slate-100 px-3 py-3">
                    <Avatar user={user} size="md" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-950">{user.name}</p>
                      <p className="truncate text-xs font-medium text-slate-500">{user.email}</p>
                    </div>
                  </div>
                  <Link
                    to="/profile"
                    onClick={closeMenus}
                    className="mt-2 flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
                    role="menuitem"
                  >
                    <UserCircle className="h-4 w-4" aria-hidden="true" />
                    Profile
                  </Link>
                  <Link
                    to="/create-post"
                    onClick={closeMenus}
                    className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
                    role="menuitem"
                  >
                    <PenSquare className="h-4 w-4" aria-hidden="true" />
                    New Post
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                    role="menuitem"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    Logout
                  </button>
                </div>
              ) : null}
            </div>
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
            <NavLink to="/" className={navLinkClass} onClick={closeMenus}>
              <HomeIcon className="h-4 w-4" aria-hidden="true" />
              Trang chủ
            </NavLink>
            {user ? (
              <>
                <NavLink to="/create-post" className={navLinkClass} onClick={closeMenus}>
                  <PenSquare className="h-4 w-4" aria-hidden="true" />
                  New Post
                </NavLink>
                <Link
                  to="/profile"
                  onClick={closeMenus}
                  className="mt-2 flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                >
                  <Avatar user={user} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">{user.name}</p>
                    <p className="truncate text-xs font-medium text-slate-500">View profile</p>
                  </div>
                </Link>
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
                  onClick={closeMenus}
                  className="btn-outline inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold"
                >
                  <UserCircle className="h-4 w-4" aria-hidden="true" />
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={closeMenus}
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
