import { Search, LogOut, Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import Notification from "./Notification";
import { userAuth } from "../../context/AuthContext.jsx";

export function Navbar() {
  const { user, token, logout } = userAuth();
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
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/80 backdrop-blur-xl shadow-sm' : 'bg-white'
    } border-b border-gray-100`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="group flex items-center gap-2 transition-transform hover:scale-105"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-lg blur-sm opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative block text-2xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent px-3 py-1">
                Vibe
              </span>
            </div>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Search Button */}
            <Link 
              to="/search" 
              className="p-2.5 rounded-full hover:bg-gray-100 transition-all duration-200 group relative"
              aria-label="Search"
            >
              <Search 
                size={20} 
                className="text-gray-600 group-hover:text-purple-600 transition-colors" 
              />
              <span className="absolute inset-0 rounded-full bg-purple-100 scale-0 group-hover:scale-100 transition-transform duration-200 -z-10"></span>
            </Link>

            {/* Notifications */}
            {isAuthed && <Notification token={token} />}

            {isAuthed ? (
              <div className="flex items-center gap-3 ml-2">
                {/* Profile */}
                <Link 
                  to="/profile" 
                  className="group relative"
                  aria-label="Profile"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur opacity-0 group-hover:opacity-75 transition-opacity duration-300"></div>
                  <img
                    src={avatar}
                    alt="Profile"
                    className="relative w-9 h-9 rounded-full object-cover ring-2 ring-white group-hover:ring-purple-200 transition-all duration-200"
                  />
                </Link>

                {/* Logout Button */}
                <button 
                  onClick={logout} 
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-700 hover:text-gray-900 transition-all duration-200 text-sm font-medium group"
                >
                  <LogOut 
                    size={16} 
                    className="group-hover:rotate-6 transition-transform duration-200" 
                  />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                {/* Login Button */}
                <Link 
                  to="/login"
                  className="px-4 py-2 rounded-full text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200 text-sm font-medium"
                >
                  Login
                </Link>

                {/* Sign Up Button */}
                <Link 
                  to="/signup"
                  className="relative px-5 py-2 rounded-full text-white font-medium text-sm overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-[length:200%_100%] group-hover:bg-[position:100%_0] transition-all duration-500"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-300"></div>
                  <span className="relative">Sign Up</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;