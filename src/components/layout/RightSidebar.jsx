import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios.js";
import { userAuth } from "../../context/AuthContext.jsx";


export default function RightSidebar() {
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [trendingTags, setTrendingTags] = useState([]);
  const [followingStates, setFollowingStates] = useState({});
  const [loading, setLoading] = useState(true);
  const { updateFollowing } = userAuth();
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.get("/user/suggested").catch(() => ({ data: [] })),
      api.get("/search/trending").catch(() => ({ data: { tags: [] } }))
    ])
    .then(([usersRes, tagsRes]) => {
      setSuggestedUsers((usersRes.data || []).slice(0, 4));
      setTrendingTags((tagsRes.data?.tags || []));
    })
    .finally(() => setLoading(false));
  }, []);

  const handleFollow = async (userId) => {
    setFollowingStates(prev => ({ ...prev, [userId]: true }));
    updateFollowing(userId, "follow");
    try {
      await api.post(`/follow/${userId}/follow`);
    } catch {
      setFollowingStates(prev => ({ ...prev, [userId]: false }));
      updateFollowing(userId, "unfollow");
    }
  };

  return (
    <aside className="hidden xl:block fixed right-0 top-16 h-[calc(100vh-4rem)] w-80 border-l border-base-300 bg-base-100 overflow-y-auto">
      <div className="sticky top-0 p-4">
        {/* Suggested Users */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-base-content text-sm">Suggested for you</h3>
            <Link to="/search" className="text-xs text-primary hover:underline">See All</Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-base-200" />
                  <div className="flex-1"><div className="h-3 bg-base-200 rounded w-3/4 mb-1.5" /><div className="h-2.5 bg-base-200 rounded w-1/2" /></div>
                  <div className="w-14 h-6 bg-base-200 rounded-full" />
                </div>
              ))}
            </div>
          ) : suggestedUsers.length === 0 ? (
            <p className="text-xs text-base-content/50 text-center py-4">No suggestions right now</p>
          ) : (
            <div className="space-y-3">
              {suggestedUsers.map(u => (
                <div key={u._id} className="flex items-center gap-3">
                  <Link to={`/u/${u._id}`}>
                    <img src={u.profilePicture || "/user.png"} alt={u.username} className="w-10 h-10 rounded-full object-cover ring-2 ring-base-200" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/u/${u._id}`} className="block font-medium text-sm text-base-content hover:text-primary truncate">{u.username}</Link>
                    {u.bio && <p className="text-xs text-base-content/60 truncate">{u.bio}</p>}
                  </div>
                  {followingStates[u._id] ? (
                    <span className="text-xs text-base-content/50 font-medium">Following</span>
                  ) : (
                    <button onClick={() => handleFollow(u._id)}
                      className="text-xs text-primary font-semibold hover:underline transition-colors">
                      Follow
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mb-6">
          <h3 className="font-semibold text-base-content text-sm mb-3">Trending</h3>
          <div className="space-y-2">
            {trendingTags.length === 0 && <p className="text-xs text-base-content/50 py-2">No trending tags yet</p>}
            {trendingTags.map(item => (
              <Link key={item.tag} to={`/search?q=${item.tag}`} className="block p-2.5 rounded-xl hover:bg-base-200 transition-colors">
                <p className="font-medium text-sm text-base-content">#{item.tag}</p>
                <p className="text-xs text-base-content/60 mt-0.5">{item.count} posts</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-base-300">
          <div className="flex flex-wrap gap-2 text-xs text-base-content/60">
            <a href="#" className="hover:text-base-content">About</a>
            <span>·</span>
            <a href="#" className="hover:text-base-content">Help</a>
            <span>·</span>
            <a href="#" className="hover:text-base-content">Privacy</a>
            <span>·</span>
            <a href="#" className="hover:text-base-content">Terms</a>
          </div>
          <p className="text-xs text-base-content/40 mt-2">© 2024 Vibe</p>
        </div>
      </div>
    </aside>
  );
}
