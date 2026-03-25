import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios.js";

export default function RightSidebar() {
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [followingStates, setFollowingStates] = useState({});

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const { data } = await api.get("/user/suggestions");
        setSuggestedUsers(data?.users?.slice(0, 5) || []);
      } catch (err) {
        console.error("Failed to load suggestions", err);
      }
    };
    fetchSuggestions();
  }, []);

  const handleFollow = async (userId) => {
    try {
      setFollowingStates((prev) => ({ ...prev, [userId]: true }));
      await api.post(`/user/${userId}/follow`);
    } catch (err) {
      setFollowingStates((prev) => ({ ...prev, [userId]: false }));
      console.error("Follow failed", err);
    }
  };

  const trendingTags = [
    { tag: "WebDevelopment", posts: "2.5k" },
    { tag: "AI", posts: "1.8k" },
    { tag: "StartupLife", posts: "1.2k" },
    { tag: "ReactJS", posts: "980" },
    { tag: "Design", posts: "750" },
  ];

  return (
    <aside className="hidden xl:block fixed right-0 top-16 h-[calc(100vh-4rem)] w-80 border-l border-base-300 bg-base-100 overflow-y-auto">
      <div className="sticky top-0 p-4">
        {/* Suggested Users */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-base-content">Suggested for you</h3>
            <Link to="/search" className="text-sm text-primary hover:text-primary-focus">
              See All
            </Link>
          </div>
          <div className="space-y-3">
            {suggestedUsers.map((user) => (
              <div key={user._id} className="flex items-center gap-3">
                <Link to={`/u/${user._id}`}>
                  <img
                    src={user.profilePicture || "/user.png"}
                    alt={user.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/u/${user._id}`}
                    className="block font-medium text-sm text-base-content hover:text-primary truncate"
                  >
                    {user.fullName || user.username}
                  </Link>
                  <p className="text-xs text-base-content/70 truncate">@{user.username}</p>
                </div>
                <button
                  onClick={() => handleFollow(user._id)}
                  disabled={followingStates[user._id]}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${followingStates[user._id]
                    ? "bg-base-200 text-base-content/70 cursor-not-allowed"
                    : "bg-primary text-primary-content hover:bg-primary-focus"
                    }`}
                >
                  {followingStates[user._id] ? "Following" : "Follow"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Trending Topics */}
        <div className="mb-6">
          <h3 className="font-semibold text-base-content mb-4">Trending</h3>
          <div className="space-y-3">
            {trendingTags.map((item) => (
              <Link
                key={item.tag}
                to={`/search?q=${item.tag}`}
                className="block p-3 rounded-xl hover:bg-base-200 transition-colors"
              >
                <p className="font-medium text-base-content">#{item.tag}</p>
                <p className="text-xs text-base-content/70 mt-0.5">{item.posts} posts</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Footer Links */}
        <div className="pt-4 border-t border-base-300">
          <div className="flex flex-wrap gap-2 text-xs text-base-content/70">
            <a href="#" className="hover:text-base-content">About</a>
            <span>·</span>
            <a href="#" className="hover:text-base-content">Help</a>
            <span>·</span>
            <a href="#" className="hover:text-base-content">Privacy</a>
            <span>·</span>
            <a href="#" className="hover:text-base-content">Terms</a>
          </div>
          <p className="text-xs text-base-content/50 mt-3">© 2024 Vibe</p>
        </div>
      </div>
    </aside>
  );
}
