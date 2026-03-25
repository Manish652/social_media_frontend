import { BookHeart, Bookmark, Film, Grid, Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import api from "../api/axios";
import FollowListModal from "../components/common/FollowListModal.jsx";
import Layout from "../components/layout/Layout.jsx";
import EditPostModal from "../components/post/EditPostModal.jsx";
import PostCard from "../components/post/PostCard.jsx";
import ReelCard from "../components/reel/ReelCard.jsx";
import { userAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, login, logout, token } = userAuth();
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
  const [savedPosts, setSavedPosts] = useState(new Set());
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
        login(data, token);
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
      return {
        ...prev,
        followers: Array.isArray(user.followers) ? user.followers : prev.followers,
        following: Array.isArray(user.following) ? user.following : prev.following,
      };
    });
  }, [user?._id, user?.followers?.length, user?.following?.length]);
  
  useEffect(() => {
    if (user?.savedPosts) {
      setSavedPosts(new Set(user.savedPosts.map(p => typeof p === 'object' ? p._id : p)));
    }
  }, [user?.savedPosts]);

  const toggleSave = async (postId) => {
    const isSaved = savedPosts.has(postId);
    setSavedPosts((prev) => {
      const newSet = new Set(prev);
      if (isSaved) newSet.delete(postId);
      else newSet.add(postId);
      return newSet;
    });

    try {
      const { data } = await api.post(`/post/${postId}/save`);
      if (data.type === "saved") {
          toast.success("Post saved to Saved Tab ✔️");
      } else {
          toast.success("Post removed from saved");
      }
    } catch (err) {
      console.error("Save toggle failed", err);
      toast.error("Failed to save post");
      setSavedPosts((prev) => {
        const newSet = new Set(prev);
        if (isSaved) newSet.add(postId);
        else newSet.delete(postId);
        return newSet;
      });
    }
  };

  const refreshPosts = async () => {
    try {
      const { data } = await api.get("/post");
      setPosts(data?.posts || []);
    } catch (err) {}
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
      toast.error(err?.response?.data?.message || "Failed to update post");
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
      login(updatedProfile, token);
      toast.success("Profile updated!");
      setProfileImageFile(null);
      setPreview("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="max-w-2xl mx-auto p-6"><Layout /></div>;

  const followersArr = Array.isArray(user?.followers) ? user.followers : (profile.followers || []);
  const followingArr = Array.isArray(user?.following) ? user.following : (profile.following || []);

  const myPosts = posts.filter((p) => {
    const uid = p?.userId?._id || p?.userId || p?.userID?._id || p?.userID;
    const me = profile?._id || user?._id;
    return uid && me && String(uid) === String(me);
  });

  const mySavedPosts = posts.filter((p) => savedPosts.has(p._id || p.id));

  const myReels = reels.filter((r) => {
    const uid = r?.userId?._id || r?.userId;
    const me = profile?._id || user?._id;
    return uid && me && String(uid) === String(me);
  });

  return (
    <div className="min-h-screen bg-base-200 pb-24 lg:pb-8 lg:ml-64 xl:mr-80 transition-colors duration-300">
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

      <div className="relative max-w-2xl mx-auto px-4 py-6">
        {/* Profile Header Card */}
        <div className="bg-base-100 rounded-3xl shadow-xl border border-base-300 overflow-hidden">
          <div className="p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <img
                  src={preview || profile.profilePicture || "/user.png"}
                  alt="avatar"
                  className="w-28 h-28 rounded-full border-4 border-base-100 object-cover shadow-xl bg-base-300"
                />
              </div>

              {/* Profile Info */}
              <div className="flex-1 min-w-0 text-center md:text-left">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                  <div className="flex-1 min-w-0">
                    <h1 className="text-2xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent break-words">
                      {profile.username}
                    </h1>
                    <p className="text-base-content/60 text-sm break-all">
                      {profile.email}
                    </p>
                  </div>

                  <Link
                    to="/create-story"
                    className="flex-shrink-0 group relative px-6 py-2.5 rounded-full overflow-hidden shadow-lg hover:shadow-xl transition-all"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400"></div>
                    <span className="relative flex items-center gap-2 text-white font-bold text-sm">
                      <BookHeart size={16} />
                      Create Story
                    </span>
                  </Link>
                </div>

                {profile.bio && (
                  <div className="mb-4 bg-base-200 rounded-xl p-3 border border-base-300">
                    <p className="text-base-content/80 text-sm leading-relaxed">{profile.bio}</p>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => { setFollowModalType("followers"); setShowFollowModal(true); }}
                    className="bg-base-200 rounded-xl p-3 hover:bg-base-300 transition-all border border-base-300"
                  >
                    <div className="text-xl font-black text-base-content">
                      {followersArr.length}
                    </div>
                    <div className="text-[10px] text-base-content/50 font-bold uppercase tracking-widest">
                      Followers
                    </div>
                  </button>

                  <button
                    onClick={() => { setFollowModalType("following"); setShowFollowModal(true); }}
                    className="bg-base-200 rounded-xl p-3 hover:bg-base-300 transition-all border border-base-300"
                  >
                    <div className="text-xl font-black text-base-content">
                      {followingArr.length}
                    </div>
                    <div className="text-[10px] text-base-content/50 font-bold uppercase tracking-widest">
                      Following
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Profile Form */}
          <form onSubmit={handleSave} className="border-t border-base-300 bg-base-100/50 p-6 space-y-4">
            <h3 className="text-xs font-bold text-base-content/50 uppercase tracking-widest mb-2">Settings</h3>

            <div>
              <label className="block text-xs font-bold text-base-content/70 mb-2 ml-1">Profile Picture</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    setProfileImageFile(f);
                    setPreview(URL.createObjectURL(f));
                  }
                }}
                className="file-input file-input-bordered file-input-primary file-input-sm w-full"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-base-content/70 mb-2 ml-1">Username</label>
              <input
                name="username"
                value={profile.username}
                onChange={handleChange}
                className="input input-bordered w-full text-sm focus:ring-2 focus:ring-primary/20"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-base-content/70 mb-2 ml-1">Bio</label>
              <textarea
                name="bio"
                value={profile.bio}
                onChange={handleChange}
                rows="3"
                className="textarea textarea-bordered w-full text-sm resize-none focus:ring-2 focus:ring-primary/20"
                placeholder="Tell us about yourself..."
              />
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary btn-sm h-11 text-white shadow-lg"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>

              <Link
                to="/create-post"
                className="btn btn-success btn-sm h-11 text-white shadow-lg"
              >
                New Post
              </Link>

              <button
                type="button"
                onClick={logout}
                className="btn btn-ghost btn-sm h-11 bg-base-300 hover:bg-error/20 hover:text-error"
              >
                Logout
              </button>
            </div>
          </form>
        </div>

        {/* Tabs */}
        <div className="mt-6 bg-base-100 rounded-2xl shadow-lg border border-base-300 overflow-hidden">
          <div className="grid grid-cols-3">
            {[
              { id: "posts", icon: Grid, label: "Posts" },
              { id: "reels", icon: Film, label: "Reels" },
              { id: "saved", icon: Bookmark, label: "Saved" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative py-4 flex items-center justify-center gap-2 font-semibold transition-all ${
                  activeTab === tab.id ? "text-primary" : "text-base-content/40 hover:text-base-content/70"
                }`}
              >
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary"></div>
                )}
                <tab.icon size={20} />
                <span className="hidden sm:inline text-sm">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="mt-6 space-y-6">
          {activeTab === "posts" && (
            myPosts.length === 0 ? (
              <EmptyState icon={Grid} label="No posts yet" sub="Start sharing your moments!" link="/create-post" btn="Create Post" />
            ) : (
              myPosts.map((post) => {
                const id = post._id || post.id;
                const isLiked = Array.isArray(post.likes) && user?._id ? post.likes.map(String).includes(String(user._id)) : false;
                return (
                  <div key={id} className="bg-base-100 rounded-2xl shadow-lg border border-base-300 overflow-hidden mb-6">
                    <PostCard 
                      post={post} 
                      isLiked={isLiked} 
                      isSaved={savedPosts.has(id)} 
                      onLike={() => { /* Optional: add full like toggle later */ }} 
                      onSave={() => toggleSave(id)} 
                    />
                  <div className="flex gap-4 px-6 py-3 bg-base-200/50 border-t border-base-300">
                    <button onClick={() => handleUpdatePost(post)} className="flex items-center gap-2 text-sm text-info hover:underline font-bold">
                      <Pencil size={16} /> Edit
                    </button>
                    <button onClick={() => handleDeletePost(post._id)} className="flex items-center gap-2 text-sm text-error hover:underline font-bold">
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </div>
              );
            })
          )
          )}

          {activeTab === "reels" && (
            myReels.length === 0 ? (
              <EmptyState icon={Film} label="No reels yet" sub="Create your first reel!" link="/create-reel" btn="Create Reel" />
            ) : (
              <div className="bg-base-100 rounded-2xl shadow-lg border border-base-300 p-4">
                <div className="grid grid-cols-3 gap-2">
                  {myReels.map((reel) => (
                    <ReelCard key={reel._id} reel={reel} showDelete={true} onDelete={handleDeleteReel} onClick={() => window.location.href = `/reels`} />
                  ))}
                </div>
              </div>
            )
          )}

          {activeTab === "saved" && (
            mySavedPosts.length === 0 ? (
              <EmptyState icon={Bookmark} label="No saved posts yet" sub="Save posts to see them here!" />
            ) : (
              mySavedPosts.map((post) => {
                const id = post._id || post.id;
                const isLiked = Array.isArray(post.likes) && user?._id ? post.likes.map(String).includes(String(user._id)) : false;
                return (
                  <div key={id} className="bg-base-100 rounded-2xl shadow-lg border border-base-300 overflow-hidden mb-6">
                    <PostCard 
                      post={post} 
                      isLiked={isLiked} 
                      isSaved={true} 
                      onLike={() => {}} 
                      onSave={() => toggleSave(id)} 
                    />
                  </div>
                );
              })
            )
          )}
        </div>
      </div>
    </div>
  );
}

// Helper component for Empty States to keep code clean
function EmptyState({ icon: Icon, label, sub, link, btn }) {
  return (
    <div className="bg-base-100 rounded-3xl shadow-lg border border-base-300 p-16 text-center">
      <div className="w-16 h-16 bg-base-200 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
        <Icon size={32} />
      </div>
      <p className="text-base-content font-bold text-lg">{label}</p>
      <p className="text-base-content/50 text-sm mt-1">{sub}</p>
      {link && (
        <Link to={link} className="btn btn-primary btn-sm mt-6 rounded-full px-8">{btn}</Link>
      )}
    </div>
  );
}