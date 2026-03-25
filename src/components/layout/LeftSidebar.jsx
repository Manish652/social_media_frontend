import { Bell, Bookmark, Film, Home, MessageCircle, Plus, Search, User, Stamp, CreativeCommonsIcon } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { userAuth } from "../../context/AuthContext.jsx";

export default function LeftSidebar() {
  const { pathname } = useLocation();
  const { user } = userAuth();

  const NavItem = ({ to, icon: Icon, label, active }) => (
    <Link
      to={to}
      className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${active
        ? "bg-gradient-to-r from-primary/10 to-secondary/10 text-primary font-semibold"
        : "text-base-content hover:bg-base-200"
        }`}
    >
      <Icon size={24} strokeWidth={active ? 2.5 : 2} />
      <span className="text-base">{label}</span>
    </Link>
  );

  return (
    <aside className="hidden lg:block fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 border-r border-base-300 bg-base-100 overflow-y-auto">
      <div className="sticky top-0 p-4">
        {/* User Profile Section */}
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10">
          <Link to="/profile" className="flex items-center gap-3 group">
            <img
              src={user?.profilePicture || "/user.png"}
              alt={user?.username}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-base-100 group-hover:ring-primary/20 transition-all"
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-base-content truncate">
                {user?.fullName || "User"}
              </p>
              <p className="text-sm text-base-content/70 truncate">@{user?.username}</p>
            </div>
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1 mb-6">
          <NavItem to="/" icon={Home} label="Home" active={pathname === "/"} />
          <NavItem
            to="/search"
            icon={Search}
            label="Explore"
            active={pathname.startsWith("/search")}
          />
          <NavItem
            to="/create-reel"
            icon={CreativeCommonsIcon}
            label="CreateReels"
            active={pathname.startsWith("/createreels")}


          />
          <NavItem
            to="/reels"
            icon={Film}
            label="Reels"
            active={pathname.startsWith("/reels")}
          />
          <NavItem
            to="create-story"
            icon={Stamp}
            label="AddStory"
            active={pathname.startsWith("/create-story")}
          />
          <NavItem
            to="/messages"
            icon={MessageCircle}
            label="Messages"
            active={pathname.startsWith("/messages")}
          />
          {/* <NavItem
            to="/notifications"
            icon={Bell}
            label="notifications"
            active={pathname.startsWith("/notifications")}
          /> */}
          <NavItem
            to="/saved"
            icon={Bookmark}
            label="Saved"
            active={pathname.startsWith("/saved")}
          />
          <NavItem
            to="/profile"
            icon={User}
            label="Profile"
            active={pathname.startsWith("/profile")}
          />
        </nav>

        {/* Create Post Button */}
        <Link
          to="/create-post"
          className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-primary-content font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
        >
          <Plus size={20} strokeWidth={2.5} />
          <span>Create Post</span>
        </Link>
      </div>
    </aside>
  );
}
