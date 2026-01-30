import { Bookmark, Film, Grid, Menu, Pencil, PlusCircle, BookHeart, Trash2, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import FollowListModal from "../components/common/FollowListModal.jsx";
import Layout from "../components/layout/Layout.jsx";
import PostCard from "../components/post/PostCard.jsx";
import ReelCard from "../components/reel/ReelCard.jsx";
import { userAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import EditPostModal from "../components/post/EditPostModal.jsx";
export default function Profile() {
  const { user, login, logout } = userAuth();
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    bio: "",
    profilePicture: "",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [posts, setPosts] = useState([]);
  const [reels, setReels] = useState([]);
  const [activeTab, setActiveTab] = useState("posts");
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [followModalType, setFollowModalType] = useState("followers");
    const [showEditModal, setShowEditModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/user/profile");
        setProfile(data);
        login(data, localStorage.getItem("token"));
      } catch (err) {
        console.log("Profile fetch failed:", err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchPosts = async () => {
      try {
        const { data } = await api.get("/post");
        setPosts(data?.posts || []);
      } catch (err) {
        console.log("Posts fetch failed:", err.message);
      }
    };

    const fetchReels = async () => {
      try {
        const { data } = await api.get("/reel/all");
        setReels(data?.reels || []);
      } catch (err) {
        console.log("Reels fetch failed:", err.message);
      }
    };

    fetchProfile();
    fetchPosts();
    fetchReels();
  }, []);

  useEffect(() => {
    if (!user?._id) return;
    setProfile((prev) => {
      if (!prev?._id) return prev;
      if (String(prev._id) !== String(user._id)) return prev;
      const next = {
        ...prev,
        followers: Array.isArray(user.followers) ? user.followers : prev.followers,
        following: Array.isArray(user.following) ? user.following : prev.following,
      };
      return next;
    });
  }, [user?._id, Array.isArray(user?.followers) ? user.followers.length : 0, Array.isArray(user?.following) ? user.following.length : 0]);

  useEffect(() => {
    if (!user?._id) return;
    const fetchFresh = async () => {
      try {
        const { data } = await api.get("/user/profile");
        setProfile(data);
        login(data, localStorage.getItem("token"));
      } catch {
        // Ignore errors
      }
    };
    fetchFresh();
  }, [Array.isArray(user?.following) ? user.following.length : 0]);

  const refreshPosts = async () => {
    try {
      const { data } = await api.get("/post");
      setPosts(data?.posts || []);
    } catch {
      // Ignore errors
    }
  };

  const handleDeletePost = async (postId) => {
    if (!confirm("Delete this post?")) return;
    try {
      setDeleting(true);
      await api.delete(`/post/delete/${postId}`);
      await refreshPosts();
      toast.success("Post deleted successfully!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete post");
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteReel = async (reelId) => {
    if (!confirm("Delete this reel?")) return;
    try {
      setDeleting(true);
      await api.delete(`/reel/delete/${reelId}`);
      const { data: reelsData } = await api.get("/reel/all");
      setReels(reelsData?.reels || []);
      await refreshPosts();
      toast.success("Reel deleted successfully!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete reel");
    } finally {
      setDeleting(false);
    }
  };
    const handleUpdatePost = (post) => {
    setEditingPost(post);
    setShowEditModal(true);
  };

  const handleSavePostEdit = async (caption) => {
    try {
      setUpdating(true);
      await api.put(`/post/update/${editingPost._id}`, { caption });
      await refreshPosts();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update post");
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  const handleChange = (e) =>
    setProfile({ ...profile, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      let profilePictureUrl = null;

      if (profileImageFile) {
        const { uploadToCloudinary } = await import("../utils/cloudinaryUpload.js");
        const result = await uploadToCloudinary(profileImageFile, "user_profiles");
        profilePictureUrl = result.url;
      }

      const { data } = await api.put("/user/editProfile", {
        username: profile.username || "",
        bio: profile.bio || "",
        profilePictureUrl: profilePictureUrl,
      });

      const updatedProfile = {
        ...profile,
        ...data,
        profilePicture: data.profilePicture || profilePictureUrl || profile.profilePicture
      };

      setProfile(updatedProfile);
      login(updatedProfile, localStorage.getItem("token"));
      toast.success("Profile updated!");

      setProfileImageFile(null);
      setPreview("");
    } catch (err) {
      console.error("Profile update error:", err);
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="max-w-2xl mx-auto p-6"><Layout /></div>;

  const followersArr = Array.isArray(user?.followers) ? user.followers : (Array.isArray(profile.followers) ? profile.followers : []);
  const followingArr = Array.isArray(user?.following) ? user.following : (Array.isArray(profile.following) ? profile.following : []);

  const myPosts = posts.filter((p) => {
    const uid = p?.userId?._id || p?.userId || p?.userID?._id || p?.userID;
    const me = profile?._id || user?._id;
    return uid && me && String(uid) === String(me);
  });

  const myReels = reels.filter((r) => {
    const uid = r?.userId?._id || r?.userId;
    const me = profile?._id || user?._id;
    return uid && me && String(uid) === String(me);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      <FollowListModal
        isOpen={showFollowModal}
        onClose={() => setShowFollowModal(false)}
        userId={user?._id}
        type={followModalType}
        currentUserId={user?._id}
      />

        <EditPostModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingPost(null);
        }}
        post={editingPost}
        onSave={handleSavePostEdit}
      />
      {/* Decorative background elements */}


      <div className="relative max-w-2xl mx-auto px-4 py-6">
        {/* Profile Header Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 overflow-hidden">
          {/* Top Section with Avatar and Quick Actions */}
          <div className="p-8">
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <div className="relative flex-shrink-0 group">
                <img
                  src={preview || profile.profilePicture || "/user.png"}
                  alt="avatar"
                  className="relative w-28 h-28 rounded-full border-4 border-white object-cover shadow-xl"
                />
              </div>

              {/* Profile Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">

                  <div className="flex-1 min-w-0">
                    <h1 className="
  text-xl sm:text-2xl 
  font-black 
  bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 
  bg-clip-text text-transparent
  break-words
">
                      {profile.username}
                    </h1>
                    <p className="text-gray-500 text-xs sm:text-sm break-all">
                      {profile.email}
                    </p>
                  </div>

                  {/* Create Story Button */}
                  <Link
                    to="/create-story"
                    className="flex-shrink-0 group relative px-4 py-2.5 rounded-full overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400"></div>
                    <span className="relative flex items-center gap-2 text-white font-bold text-sm">
                      <BookHeart size={16} strokeWidth={2} />
                      Create Story
                    </span>
                  </Link>
                </div>

                {/* Bio */}
                {profile.bio && (
                  <div className="mb-4 bg-gradient-to-br from-purple-50/50 to-pink-50/50 rounded-xl p-3 border border-purple-100/50">
                    <p className="text-gray-700 text-sm leading-relaxed line-clamp-2">{profile.bio}</p>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                  <button
                    onClick={() => {
                      setFollowModalType("followers");
                      setShowFollowModal(true);
                    }}
                    className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-3 hover:from-purple-100 hover:to-purple-200/50 transition-all"
                  >
                    <div className="text-2xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {followersArr.length}
                    </div>
                    <div className="text-xs text-gray-600 font-semibold uppercase tracking-wide">
                      Followers
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setFollowModalType("following");
                      setShowFollowModal(true);
                    }}
                    className="bg-gradient-to-br from-pink-50 to-pink-100/50 rounded-xl p-3 hover:from-pink-100 hover:to-pink-200/50 transition-all"
                  >
                    <div className="text-2xl sm:text-sm font-black bg-gradient-to-r from-pink-600 to-orange-500 bg-clip-text text-transparent">
                      {followingArr.length}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 font-semibold uppercase tracking-wide">
                      Following
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Profile Form */}
          <form onSubmit={handleSave} className="border-t border-gray-100 bg-gradient-to-br from-gray-50/50 to-white p-6 space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">Edit Profile</h3>

            {/* Profile Picture Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Profile Picture</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    setProfileImageFile(f);
                    try {
                      setPreview(URL.createObjectURL(f));
                    } catch {
                      setPreview("");
                    }
                  }
                }}
                className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 file:cursor-pointer cursor-pointer"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
              <input
                name="username"
                value={profile.username}
                onChange={handleChange}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all outline-none"
                placeholder="Enter your username"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
              <textarea
                name="bio"
                value={profile.bio}
                onChange={handleChange}
                rows="3"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all outline-none resize-none"
                placeholder="Tell us about yourself..."
              />
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="relative px-5 py-2.5 rounded-xl font-bold text-white overflow-hidden shadow-lg hover:shadow-xl disabled:opacity-60 transition-all group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span className="relative text-sm">{saving ? "Saving..." : "Save"}</span>
              </button>

              <Link
                to="/create-post"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold shadow-lg hover:shadow-xl transition-all text-center text-sm"
              >
                New Post
              </Link>

              <button
                type="button"
                onClick={logout}
                className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold transition-all text-sm"
              >
                Logout
              </button>
            </div>
          </form>
        </div>

        {/* Tabs */}
        <div className="mt-6 bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 overflow-hidden">
          <div className="grid grid-cols-3">
            <button
              onClick={() => setActiveTab("posts")}
              className={`relative py-4 flex items-center justify-center gap-2 font-semibold transition-all ${activeTab === "posts" ? "text-purple-600" : "text-gray-400 hover:text-gray-600"
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
              className={`relative py-4 flex items-center justify-center gap-2 font-semibold transition-all ${activeTab === "reels" ? "text-purple-600" : "text-gray-400 hover:text-gray-600"
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
              className={`relative py-4 flex items-center justify-center gap-2 font-semibold transition-all ${activeTab === "saved" ? "text-purple-600" : "text-gray-400 hover:text-gray-600"
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
        <div className="mt-6 space-y-4">
          {/* Posts Tab */}
          {activeTab === "posts" && (
            <>
              {myPosts.length === 0 ? (
                <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-lg border border-white/50 p-16 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Grid size={32} className="text-purple-600" strokeWidth={2} />
                  </div>
                  <p className="text-gray-600 font-semibold text-lg">No posts yet</p>
                  <p className="text-gray-400 text-sm mt-1">Start sharing your moments!</p>
                  <Link
                    to="/create-post"
                    className="inline-block mt-4 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-bold shadow-lg hover:shadow-xl transition-all text-sm"
                  >
                    Create Your First Post
                  </Link>
                </div>
              ) : (
                myPosts.map((post) => {
                  const isOwner = String(post?.userId?._id || post?.userId || post?.userID?._id || post?.userID) === String(profile?._id || user?._id);
                  return (
                    <div
                      key={post._id}
                      className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 overflow-hidden"
                    >
                      <PostCard post={post} isLiked={false} isSaved={false} onLike={() => { }} onSave={() => { }} />
                      {isOwner && (
                        <div className="flex gap-4 px-6 py-3 bg-gradient-to-r from-gray-50/80 to-purple-50/30 border-t border-gray-100">
                          <button
                            onClick={() => handleUpdatePost(post)}
                            disabled={updating}
                            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-semibold transition-colors disabled:opacity-50"
                          >
                            <Pencil size={16} /> Edit
                          </button>
                          <button
                            onClick={() => handleDeletePost(post._id)}
                            disabled={deleting}
                            className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-semibold transition-colors disabled:opacity-50"
                          >
                            <Trash2 size={16} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </>
          )}

          {/* Reels Tab */}
          {activeTab === "reels" && (
            <>
              {myReels.length === 0 ? (
                <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-lg border border-white/50 p-16 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Film size={32} className="text-purple-600" strokeWidth={2} />
                  </div>
                  <p className="text-gray-600 font-semibold text-lg">No reels yet</p>
                  <p className="text-gray-400 text-sm mt-1">Create your first reel!</p>
                  <Link
                    to="/create-reel"
                    className="inline-block mt-4 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-bold shadow-lg hover:shadow-xl transition-all text-sm"
                  >
                    Create Your First Reel
                  </Link>
                </div>
              ) : (
                <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 p-4">
                  <div className="grid grid-cols-3 gap-2">
                    {myReels.map((reel) => (
                      <ReelCard
                        key={reel._id}
                        reel={reel}
                        showDelete={true}
                        onDelete={handleDeleteReel}
                        onClick={() => {
                          window.location.href = `/reels`;
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Saved Tab */}
          {activeTab === "saved" && (
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-lg border border-white/50 p-16 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bookmark size={32} className="text-purple-600" strokeWidth={2} />
              </div>
              <p className="text-gray-600 font-semibold text-lg">No saved posts yet</p>
              <p className="text-gray-400 text-sm mt-1">Save posts to see them here!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}