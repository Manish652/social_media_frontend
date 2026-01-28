import { useEffect, useMemo, useState } from "react";
import { Bookmark, Film, Grid, Heart, MessageCircle, Share2, Sparkles } from "lucide-react";
import ReelCard from "../components/reel/ReelCard.jsx";
import { useParams } from "react-router-dom";
import api from "../api/axios.js";
import FollowListModal from "../components/common/FollowListModal.jsx";
import PostCard from "../components/post/PostCard.jsx";
import { userAuth } from "../context/AuthContext.jsx";

export default function ProfilePublicView() {
  const { id } = useParams();
  const { user, updateFollowing } = userAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [reels, setReels] = useState([]);
  const [activeTab, setActiveTab] = useState("posts");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [followModalType, setFollowModalType] = useState("followers");

  const isMe = useMemo(() => user?._id && id && String(user._id) === String(id), [user?._id, id]);
  const isFollowing = useMemo(() => {
    if (!user?._id || !id || !Array.isArray(user?.following)) return false;
    return user.following.map(String).includes(String(id));
  }, [user, id]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get(`/user/profile/${id}`);
        setProfile(data);
      } catch (e) {
        setError(e?.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const { data } = await api.get("/post");
        const all = Array.isArray(data?.posts) ? data.posts : [];
        const userPosts = all.filter((p) => {
          const uid = p?.userId?._id || p?.userId || p?.userID?._id || p?.userID;
          return uid && String(uid) === String(id);
        });
        setPosts(userPosts);
      } catch (error) {
        console.log(error);
      }
    };

    const loadReels = async () => {
      try {
        const { data } = await api.get("/reel/all");
        const all = Array.isArray(data?.reels) ? data.reels : [];
        const userReels = all.filter((r) => {
          const uid = r?.userId?._id || r?.userId;
          return uid && String(uid) === String(id);
        });
        setReels(userReels);
      } catch (error) {
        console.log(error);
      }
    };

    if (id) {
      loadPosts();
      loadReels();
    }
  }, [id]);

  const handleFollow = async () => {
    updateFollowing(id, "follow");
    setProfile(prev => ({
      ...prev,
      followers: [...(prev.followers || []), user._id]
    }));
    try {
      await api.post(`/follow/${id}/follow`);
      const { data } = await api.get(`/user/profile/${id}`);
      setProfile(data);
    } catch (e) {
      console.log(e);
      updateFollowing(id, "unfollow");
      const { data } = await api.get(`/user/profile/${id}`);
      setProfile(data);
    }
  };

  const handleUnfollow = async () => {
    updateFollowing(id, "unfollow");
    setProfile(prev => ({
      ...prev,
      followers: (prev.followers || []).filter(fid => String(fid) !== String(user._id))
    }));
    try {
      await api.post(`/follow/${id}/unfollow`);
      const { data } = await api.get(`/user/profile/${id}`);
      setProfile(data);
    } catch (e) {
      console.error(e);
      updateFollowing(id, "follow");
      const { data } = await api.get(`/user/profile/${id}`);
      setProfile(data);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 border-4 border-purple-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-purple-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md text-center border border-red-100">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">⚠️</span>
          </div>
          <p className="text-red-600 font-semibold mb-2">Oops!</p>
          <p className="text-gray-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md text-center border">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-gray-400 text-2xl">👤</span>
          </div>
          <p className="text-gray-600 font-semibold">Profile not found</p>
        </div>
      </div>
    );
  }

  const followersCount = Array.isArray(profile.followers) ? profile.followers.length : 0;
  const followingCount = Array.isArray(profile.following) ? profile.following.length : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
      <FollowListModal
        isOpen={showFollowModal}
        onClose={() => setShowFollowModal(false)}
        userId={id}
        type={followModalType}
        currentUserId={user?._id}
      />

      {/* Animated Background Pattern */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-300/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-300/10 rounded-full blur-3xl"></div>
      </div>

      {/* Hero Header */}
      <div className="relative">
        <div className="h-64 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 relative overflow-hidden">
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/50 via-transparent to-pink-600/50 animate-gradient"></div>
          
          {/* Decorative elements */}
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        </div>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 -mt-32 pb-12 z-10">
        {/* Main Profile Card */}
        <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
          <div className="p-6 sm:p-10">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Avatar Section */}
              <div className="relative flex-shrink-0 group">
                {/* Gradient ring animation */}
                <div className="absolute -inset-3 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 rounded-full opacity-75 blur-lg group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Avatar container */}
                <div className="relative">
                  <img
                    src={profile.profilePicture || "/user.png"}
                    alt={profile.username}
                    className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-white shadow-xl"
                  />
                  
                  {/* Status badge */}
                  {!isMe && (
                    <button
                      onClick={isFollowing ? handleUnfollow : handleFollow}
                      className="absolute -bottom-2 -right-2 group/btn"
                    >
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full blur-md opacity-75"></div>
                        <div className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                          isFollowing 
                            ? 'bg-white border-2 border-purple-300' 
                            : 'bg-gradient-to-r from-purple-600 to-pink-500'
                        }`}>
                          {isFollowing ? (
                            <span className="text-purple-600 text-xl font-bold">✓</span>
                          ) : (
                            <span className="text-white text-2xl font-light">+</span>
                          )}
                        </div>
                      </div>
                    </button>
                  )}
                </div>
              </div>

              {/* Profile Information */}
              <div className="flex-1 w-full text-center sm:text-left">
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent mb-1">
                      {profile.username}
                    </h1>
                    <p className="text-gray-500 font-medium">@{profile.username}</p>
                  </div>

                  {/* Action Button */}
                  {!isMe && (
                    <div className="flex justify-center sm:justify-start">
                      {!isFollowing ? (
                        <button
                          onClick={handleFollow}
                          className="group relative px-8 py-3 rounded-full font-bold text-white overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400"></div>
                          <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          <span className="relative flex items-center gap-2">
                            <Sparkles size={16} />
                            Follow
                          </span>
                        </button>
                      ) : (
                        <button
                          onClick={handleUnfollow}
                          className="px-8 py-3 rounded-full font-bold bg-white border-2 border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200 shadow-md"
                        >
                          Following
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Bio */}
                {profile.bio && (
                  <div className="mb-6 bg-gradient-to-br from-purple-50/50 to-pink-50/50 rounded-2xl p-4 border border-purple-100/50">
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {profile.bio}
                    </p>
                  </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  <button
                    onClick={() => {
                      setFollowModalType("followers");
                      setShowFollowModal(true);
                    }}
                    className="group relative bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl p-4 hover:from-purple-100 hover:to-purple-200/50 transition-all duration-300"
                  >
                    <div className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {followersCount}
                    </div>
                    <div className="text-xs text-gray-600 font-semibold uppercase tracking-wide mt-1">
                      Followers
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setFollowModalType("following");
                      setShowFollowModal(true);
                    }}
                    className="group relative bg-gradient-to-br from-pink-50 to-pink-100/50 rounded-2xl p-4 hover:from-pink-100 hover:to-pink-200/50 transition-all duration-300"
                  >
                    <div className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-pink-600 to-orange-500 bg-clip-text text-transparent">
                      {followingCount}
                    </div>
                    <div className="text-xs text-gray-600 font-semibold uppercase tracking-wide mt-1">
                      Following
                    </div>
                  </button>

                  <div className="relative bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-2xl p-4">
                    <div className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent">
                      {posts.length}
                    </div>
                    <div className="text-xs text-gray-600 font-semibold uppercase tracking-wide mt-1">
                      Posts
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="mt-6">
          {/* Tab Navigation */}
          <div className="bg-white/90 backdrop-blur-2xl rounded-2xl shadow-lg border border-white/50 overflow-hidden mb-4">
            <div className="grid grid-cols-3">
              <button
                onClick={() => setActiveTab("posts")}
                className={`relative py-4 flex items-center justify-center gap-2 font-semibold transition-all duration-300 ${
                  activeTab === "posts"
                    ? "text-purple-600"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {activeTab === "posts" && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-pink-500"></div>
                )}
                <Grid size={20} strokeWidth={2.5} />
                <span className="hidden sm:inline">Posts</span>
              </button>

              <button
                onClick={() => setActiveTab("reels")}
                className={`relative py-4 flex items-center justify-center gap-2 font-semibold transition-all duration-300 ${
                  activeTab === "reels"
                    ? "text-purple-600"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {activeTab === "reels" && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-pink-500"></div>
                )}
                <Film size={20} strokeWidth={2.5} />
                <span className="hidden sm:inline">Reels</span>
              </button>

              <button
                onClick={() => setActiveTab("saved")}
                className={`relative py-4 flex items-center justify-center gap-2 font-semibold transition-all duration-300 ${
                  activeTab === "saved"
                    ? "text-purple-600"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {activeTab === "saved" && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-pink-500"></div>
                )}
                <Bookmark size={20} strokeWidth={2.5} />
                <span className="hidden sm:inline">Saved</span>
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-lg border border-white/50 overflow-hidden">
            {/* Posts Tab */}
            {activeTab === "posts" && (
              <>
                {posts.length === 0 ? (
                  <div className="p-16 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Grid size={32} className="text-purple-600" strokeWidth={2} />
                    </div>
                    <p className="text-gray-600 font-semibold text-lg">No posts yet</p>
                    <p className="text-gray-400 text-sm mt-1">
                      {isMe ? "Share your first post!" : "Check back later for updates"}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {posts.map((post) => (
                      <div
                        key={post._id}
                        className="p-6 hover:bg-gradient-to-r hover:from-purple-50/30 hover:to-pink-50/30 transition-all duration-200"
                      >
                        <PostCard
                          post={post}
                          isLiked={false}
                          isSaved={false}
                          onLike={() => {}}
                          onSave={() => {}}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Reels Tab */}
            {activeTab === "reels" && (
              <>
                {reels.length === 0 ? (
                  <div className="p-16 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Film size={32} className="text-purple-600" strokeWidth={2} />
                    </div>
                    <p className="text-gray-600 font-semibold text-lg">No reels yet</p>
                    <p className="text-gray-400 text-sm mt-1">
                      {isMe ? "Create your first reel!" : "Check back later for reels"}
                    </p>
                  </div>
                ) : (
                  <div className="p-4 grid grid-cols-3 gap-2">
                    {reels.map((reel) => (
                      <ReelCard
                        key={reel._id}
                        reel={reel}
                        onClick={() => {
                          window.location.href = `/reels`;
                        }}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Saved Tab */}
            {activeTab === "saved" && (
              <div className="p-16 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bookmark size={32} className="text-purple-600" strokeWidth={2} />
                </div>
                <p className="text-gray-600 font-semibold text-lg">Saved posts are private</p>
                <p className="text-gray-400 text-sm mt-1">Only you can see your saved posts</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 15s ease infinite;
        }
      `}</style>
    </div>
  );
}