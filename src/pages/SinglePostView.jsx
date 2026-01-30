import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios.js";
import PostCard from "../components/post/PostCard.jsx";
import { userAuth } from "../context/AuthContext.jsx";

export default function SinglePostView() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = userAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await api.get(`/post/${postId}`);
      setPost(data.post);

      // Check if user liked this post
      if (data.post?.likes && user?._id) {
        setIsLiked(data.post.likes.map(String).includes(String(user._id)));
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load post");
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async () => {
    if (!post) return;
    const id = post._id;

    try {
      // Optimistic UI update
      setPost((prev) => {
        if (!prev) return prev;
        const likesArr = Array.isArray(prev.likes) ? [...prev.likes] : [];
        if (isLiked) {
          const idx = likesArr.map(String).indexOf(String(user?._id));
          if (idx >= 0) likesArr.splice(idx, 1);
          return { ...prev, likes: likesArr };
        } else {
          if (user?._id) likesArr.push(user._id);
          return { ...prev, likes: likesArr };
        }
      });
      setIsLiked(!isLiked);

      // Backend like/unlike
      if (isLiked) {
        await api.post(`/like/${id}/dislike`);
      } else {
        await api.post(`/like/${id}/like`);
      }
    } catch (err) {
      // Revert on error
      await fetchPost();
      console.error("toggle like failed", err);
    }
  };

  const toggleSave = () => {
    setIsSaved(!isSaved);
    // TODO: Implement save functionality with backend
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-pink-50/30 pb-24">
        <div className="max-w-2xl mx-auto px-4 pt-6">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-white rounded-full transition-all"
            >
              <ArrowLeft size={24} className="text-gray-700" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Post</h1>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            <div className="flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
            </div>
            <p className="text-center text-gray-500 mt-4">Loading post...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-pink-50/30 pb-24">
        <div className="max-w-2xl mx-auto px-4 pt-6">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-white rounded-full transition-all"
            >
              <ArrowLeft size={24} className="text-gray-700" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Post</h1>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">😕</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Post Not Found</h2>
            <p className="text-gray-500 mb-6">{error || "This post may have been deleted or doesn't exist."}</p>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-pink-50/30 pb-24">
      <div className="max-w-2xl mx-auto px-4 pt-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white rounded-full transition-all hover:scale-105 active:scale-95"
          >
            <ArrowLeft size={24} className="text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Post</h1>
        </div>

        {/* Post Card */}
        <PostCard
          post={post}
          isLiked={isLiked}
          isSaved={isSaved}
          onLike={toggleLike}
          onSave={toggleSave}
        />
      </div>
    </div>
  );
}
