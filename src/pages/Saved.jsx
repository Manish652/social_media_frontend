import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import Skaliton from "../components/layout/Skaliton.jsx";
import PostCard from "../components/post/PostCard.jsx";
import { userAuth } from "../context/AuthContext.jsx";
import { Bookmark } from "lucide-react";

export default function Saved() {
  const navigate = useNavigate();
  const { user } = userAuth();
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savedPosts, setSavedPosts] = useState(new Set());

  useEffect(() => {
    if (user?.savedPosts) {
      setSavedPosts(new Set(user.savedPosts.map(p => typeof p === 'object' ? p._id : p)));
    }
  }, [user?.savedPosts]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/post");
        setPosts(data?.posts || []);
      } catch (err) {
        console.error("Failed to load posts", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

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

  const mySavedPosts = posts.filter(p => savedPosts.has(p._id || p.id));

  return (
    <div className="min-h-screen pb-24 lg:pb-8 bg-base-200 lg:ml-64 xl:mr-80">
      <div className="max-w-[700px] mx-auto px-4 py-8">
        
        <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl text-primary">
                <Bookmark size={28} strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Saved Posts</h1>
        </div>

        {loading && (
          <div className="space-y-4">
            <Skaliton />
            <Skaliton />
          </div>
        )}
        
        {!loading && mySavedPosts.length === 0 && (
          <div className="bg-base-100 rounded-3xl shadow-lg border border-base-300 p-16 text-center mt-8">
            <div className="w-20 h-20 bg-base-200 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
              <Bookmark size={40} />
            </div>
            <p className="text-base-content font-bold text-xl">No saved posts yet</p>
            <p className="text-base-content/50 mt-2">Posts you save will securely appear here!</p>
          </div>
        )}

        {mySavedPosts.map((post) => {
          const id = post._id || post.id;
          const isLiked = Array.isArray(post.likes) && user?._id
              ? post.likes.map(String).includes(String(user._id))
              : false;
          return (
            <div key={id} className="mb-6">
                <PostCard
                post={post}
                isLiked={isLiked}
                isSaved={true}
                onLike={() => { /* needs central like context, ignoring for now */ }}
                onSave={() => toggleSave(id)}
                onMediaClick={() => navigate(`/post/${id}`)}
                />
            </div>
          );
        })}
      </div>
    </div>
  );
}
