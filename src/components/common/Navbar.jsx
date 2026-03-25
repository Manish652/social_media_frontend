import { LogOut, Search } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { userAuth } from "../../context/AuthContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import Notification from "./Notification";
import ThemeSelector from "./ThemeSelector";
import { MessageCircle, Sun, Moon } from "lucide-react";
export function Navbar() {
  const { user, token, logout } = userAuth();
  const { theme, toggleTheme } = useTheme();
  const isAuthed = Boolean(token);
  const avatar = user?.profilePicture || "/user.png";
  const [isScrolled, setIsScrolled] = useState(false);

  // Optional: Add scroll effect
  // useEffect(() => {
  //   const handleScroll = () => setIsScrolled(window.scrollY > 10);
  //   window.addEventListener('scroll', handleScroll);
  //   return () => window.removeEventListener('scroll', handleScroll);
  // }, []);

  return (
    <nav className="navbar sticky top-0 z-50 bg-base-100 shadow-sm border-b border-base-200">
      <div className="navbar-start">
        <Link
          to="/"
          className="btn btn-ghost normal-case text-xl font-black bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent"
        >
          Vibe
        </Link>
      </div>

      <div className="navbar-center hidden lg:flex">
        {/* You can add search here if needed */}
      </div>

      <div className="navbar-end gap-2">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="btn btn-ghost btn-circle"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? (
            <Moon size={20} />
          ) : (
            <Sun size={20} />
          )}
        </button>

        {/* Theme Selector */}
        <ThemeSelector />

        {/* Search Button */}
        <Link
          to="/search"
          className="btn btn-ghost btn-circle"
          aria-label="Search"
        >
          <Search size={20} />
        </Link>

        {/* Notifications */}
        {isAuthed && <Notification token={token} />}

        {/* Messages */}
        {isAuthed && (
          <Link
            to="/messages"
            className="btn btn-ghost btn-circle"
            aria-label="Messages"
          >
            <MessageCircle size={20} />
          </Link>
        )}

        {isAuthed ? (
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full">
                <img src={avatar} alt="Profile" />
              </div>
            </label>
            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
              <li>
                <Link to="/profile" className="justify-between">
                  Profile
                </Link>
              </li>
              <li>
                <button onClick={logout}>
                  <LogOut size={16} />
                  Logout
                </button>
              </li>
            </ul>
          </div>
        ) : (
          <div className="flex gap-2">
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