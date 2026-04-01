import { LogOut, Search, Menu, MessageCircle, Sun, Moon } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { userAuth } from "../../context/AuthContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import Notification from "./Notification";
import ThemeSelector from "./ThemeSelector";

export function Navbar() {
  const { user, token, logout } = userAuth();
  const { theme, toggleTheme } = useTheme();
  const isAuthed = Boolean(token);
  const avatar = user?.profilePicture || "/user.png";

  return (
    <nav className="navbar sticky top-0 z-50 bg-base-100 shadow-sm border-b border-base-200 px-2 lg:px-6">

      {/* 🔹 LEFT */}
      <div className="navbar-start">

        {/* ✅ Mobile Menu */}
        <div className="dropdown lg:hidden">
          <label tabIndex={0} className="btn btn-ghost btn-circle">
            <Menu size={22} />
          </label>

          <ul className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
            
            <li>
              <Link to="/search">Search</Link>
            </li>

            {isAuthed && (
              <>
                <li>
                  <Link to="/messages">Messages</Link>
                </li>
                <li>
                  <Link to="/profile">Profile</Link>
                </li>
                <li>
                  <button onClick={logout}>Logout</button>
                </li>
              </>
            )}

            {!isAuthed && (
              <>
                <li>
                  <Link to="/login">Login</Link>
                </li>
                <li>
                  <Link to="/signup">Sign Up</Link>
                </li>
              </>
            )}
          </ul>
        </div>

        {/* 🔹 Logo */}
        <Link
          to="/"
          className="btn btn-ghost text-xl font-black bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent"
        >
          Vibe
        </Link>
      </div>

      {/* 🔹 CENTER (optional for desktop) */}
      <div className="navbar-center hidden lg:flex">
        {/* future search bar */}
      </div>

      {/* 🔹 RIGHT */}
      <div className="navbar-end gap-1 lg:gap-2">

        {/* 🌗 Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="btn btn-ghost btn-circle"
        >
          {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        {/* 🎨 Theme Selector (hide on small screens if needed) */}
        <div className="hidden sm:block">
          <ThemeSelector />
        </div>

        {/* 🔍 Search (hide on mobile, moved into menu) */}
        <Link
          to="/search"
          className="btn btn-ghost btn-circle hidden lg:flex"
        >
          <Search size={20} />
        </Link>

        {/* 🔔 Notifications */}
        {isAuthed && <Notification token={token} />}

        {/* 💬 Messages */}
        {isAuthed && (
          <Link
            to="/messages"
            className="btn btn-ghost btn-circle hidden sm:flex"
          >
            <MessageCircle size={20} />
          </Link>
        )}

        {/* 👤 Profile / Auth */}
        {isAuthed ? (
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
              <div className="w-9 lg:w-10 rounded-full">
                <img src={avatar} alt="Profile" />
              </div>
            </label>

            <ul className="menu menu-sm dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52">
              <li>
                <Link to="/profile">Profile</Link>
              </li>
              <li>
                <button onClick={logout} className="flex gap-2 items-center">
                  <LogOut size={16} />
                  Logout
                </button>
              </li>
            </ul>
          </div>
        ) : (
          <div className="hidden sm:flex gap-2">
            <Link to="/login" className="btn btn-ghost">
              Login
            </Link>
            <Link to="/signup" className="btn btn-primary">
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;