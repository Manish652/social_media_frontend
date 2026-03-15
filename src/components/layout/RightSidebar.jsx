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
    <aside className="hidden xl:block fixed right-0 top-16 h-[calc(100vh-4rem)] w-80 border-l border-gray-100 bg-white overflow-y-auto">
      <div className="sticky top-0 p-4">
        {/* Suggested Users */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Suggested for you</h3>
            <Link to="/search" className="text-sm text-purple-600 hover:text-purple-700">
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
                    className="block font-medium text-sm text-gray-900 hover:text-purple-600 truncate"
                  >
                    {user.fullName || user.username}
                  </Link>
                  <p className="text-xs text-gray-500 truncate">@{user.username}</p>
                </div>
                <button
                  onClick={() => handleFollow(user._id)}
                  disabled={followingStates[user._id]}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${followingStates[user._id]
                    ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                    : "bg-purple-600 text-white hover:bg-purple-700"
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
          <h3 className="font-semibold text-gray-900 mb-4">Trending</h3>
          <div className="space-y-3">
            {trendingTags.map((item) => (
              <Link
                key={item.tag}
                to={`/search?q=${item.tag}`}
                className="block p-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <p className="font-medium text-gray-900">#{item.tag}</p>
                <p className="text-xs text-gray-500 mt-0.5">{item.posts} posts</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Footer Links */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex flex-wrap gap-2 text-xs text-gray-500">
            <a href="#" className="hover:text-gray-700">About</a>
            <span>·</span>
            <a href="#" className="hover:text-gray-700">Help</a>
            <span>·</span>
            <a href="#" className="hover:text-gray-700">Privacy</a>
            <span>·</span>
            <a href="#" className="hover:text-gray-700">Terms</a>
          </div>
          <p className="text-xs text-gray-400 mt-3">© 2024 Vibe</p>
        </div>
      </div>
    </aside>
  );
}
