import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios.js";
import Skaliton from "../components/layout/Skaliton.jsx";
import PostCard from "../components/post/PostCard.jsx";
import EditPostModal from "../components/post/EditPostModal.jsx";
import StoriesSection from "../components/story/StoriesSection.jsx";
import { userAuth } from "../context/AuthContext.jsx";

export default function Home() {
  const navigate = useNavigate();

  const [likedPosts, setLikedPosts] = useState(new Set());
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = userAuth();
  const [savedPosts, setSavedPosts] = useState(new Set());

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user?.savedPosts) {
      setSavedPosts(new Set(user.savedPosts.map(p => typeof p === 'object' ? p._id : p)));
    }
  }, [user?.savedPosts]);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/post");
      setPosts(data?.posts || []);
    } catch (err) {
      console.error("Failed to load posts", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const toggleLike = useCallback(async (post) => {
    const id = post._id || post.id;
    const isLiked =
      Array.isArray(post.likes) && user?._id
        ? post.likes.map(String).includes(String(user._id))
        : likedPosts.has(id);

    try {
      setPosts((prev) =>
        prev.map((p) => {
          if ((p._id || p.id) !== id) return p;
          const likesArr = Array.isArray(p.likes) ? [...p.likes] : [];
          if (isLiked) {
            const idx = likesArr.map(String).indexOf(String(user?._id));
            if (idx >= 0) likesArr.splice(idx, 1);
            return { ...p, likes: likesArr };
          } else {
            if (user?._id) likesArr.push(user._id);
            return { ...p, likes: likesArr };
          }
        })
      );

      if (isLiked) {
        await api.post(`/like/${id}/dislike`);
      } else {
        await api.post(`/like/${id}/like`);
      }
    } catch (err) {
      try {
        const { data } = await api.get("/post");
        setPosts(data?.posts || []);
      } catch (err) {
        console.error("Failed to load posts", err);
      }
      console.error("toggle like failed", err);
    }
  }, [user?._id, likedPosts]);

  const toggleSave = useCallback(async (postId) => {
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
  }, [savedPosts]);

  const handleMediaClick = useCallback((id) => {
    navigate(`/post/${id}`);
  }, [navigate]);

  // Owner actions from feed
  const handleEditPost = useCallback((post) => {
    setEditingPost(post);
    setShowEditModal(true);
  }, []);

  const handleDeletePost = useCallback(async (postId) => {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    try {
      await api.delete(`/post/delete/${postId}`);
      setPosts(prev => prev.filter(p => (p._id || p.id) !== postId));
      toast.success("Post deleted!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete post");
    }
  }, []);

  const handleSavePostEdit = async ({ caption, tags }) => {
    try {
      setUpdating(true);
      await api.put(`/post/update/${editingPost._id}`, { caption, tags });
      setPosts(prev => prev.map(p => (p._id || p.id) === editingPost._id ? { ...p, caption, tags } : p));
      toast.success("Post updated!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update post");
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      <div className="min-h-screen pb-24 lg:pb-8 bg-base-200 lg:ml-64 xl:mr-80">
        {/* Stories Section */}
        <StoriesSection showCreateButton={false} />

        {/* Feed */}
        <div className="max-w-[700px] mx-auto px-4">
          {loading && (
            <div className="space-y-4">
              <Skaliton />
              <Skaliton />
              <Skaliton />
            </div>
          )}
          {!loading && posts.length === 0 && (
            <div className="text-center py-8 text-base-content/60">No posts yet</div>
          )}
          {posts.map((post) => {
            const id = post._id || post.id;
            const postAuthorId = post?.userId?._id || post?.userId || post?.userID?._id || post?.userID;
            const isMyPost = user?._id && postAuthorId && String(user._id) === String(postAuthorId);
            const isLiked =
              Array.isArray(post.likes) && user?._id
                ? post.likes.map(String).includes(String(user._id))
                : likedPosts.has(id);
            return (
              <PostCard
                key={id}
                post={post}
                isLiked={isLiked}
                isSaved={savedPosts.has(id)}
                onLike={toggleLike}
                onSave={toggleSave}
                onMediaClick={handleMediaClick}
                onEdit={isMyPost ? handleEditPost : undefined}
                onDelete={isMyPost ? handleDeletePost : undefined}
              />
            );
          })}
        </div>
      </div>

      <EditPostModal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setEditingPost(null); }}
        post={editingPost}
        onSave={handleSavePostEdit}
      />
    </>
  );
}
