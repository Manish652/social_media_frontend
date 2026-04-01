import { Bookmark, Heart, MessageCircle, MoreHorizontal, Trash2 } from "lucide-react";
import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import api from "../../api/axios.js";
import { userAuth } from "../../context/AuthContext.jsx";
import VideoPlayer from "./VideoPlayer.jsx";
import { optimizeCloudinaryVideo } from "../../utils/optimizeMedia.js";
import VibeInputEditor from "../common/VibeInputEditor.jsx";

function formatTimeAgo(dateStr) {
  try {
    const d = new Date(dateStr);
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60) return `${Math.floor(diff)}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  } catch {
    return "";
  }
}

const PostCard = React.memo(function PostCard({ post, isLiked, isSaved, onLike, onSave, onMediaClick }) {
  const { user, updateFollowing } = userAuth();
  const populatedUser = post?.userId || post?.userID;
  const authorId = populatedUser?._id || populatedUser;
  const username = populatedUser?.username || post?.username || "User";
  const avatar = populatedUser?.profilePicture || post?.avatar || "/user.png";
  const timeAgo = post?.createdAt ? formatTimeAgo(post.createdAt) : post?.timeAgo || "";
  const likesCount = Array.isArray(post?.likes) ? post.likes.length : post?.likes || 0;

  // Handle both old (image/video) and new (mediaUrl/mediaType) field structures
  const mediaImage = post?.mediaType === "image" ? post?.mediaUrl : post?.image;
  const mediaVideo = post?.mediaType === "video" ? post?.mediaUrl : post?.video;

  const isMe = user?._id && authorId && String(user._id) === String(authorId);
  const isFollowing = useMemo(() => {
    if (!user?._id || !authorId || !Array.isArray(user?.following)) return false;
    return user.following.map(String).includes(String(authorId));
  }, [user, authorId]);

  // Comments
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [commentCount, setCommentCount] = useState(
    Array.isArray(post?.comments) ? post.comments.length : post?.commentsCount || 0
  );

  const postId = post?._id || post?.id;

  const fetchComments = async () => {
    if (!postId) return;
    try {
      setLoading(true);
      const { data } = await api.get(`/comment/${postId}/comments`);
      const list = Array.isArray(data?.comments) ? data.comments : data;
      setComments(list);
      setCommentCount(list.length);
    } catch {
      toast.error("load comments failed");
    } finally {
      setLoading(false);
    }
  };

  const toggleComments = async () => {
    const willOpen = !open;
    setOpen(willOpen);
    if (willOpen && comments.length === 0) {
      await fetchComments();
    }
  };

  const addComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const { data } = await api.post(`/comment/${postId}/comment`, { text: newComment.trim() });
      if (data?.comment) {
        setComments((prev) => [data.comment, ...prev]);
        setCommentCount((c) => c + 1);
      } else {
        await fetchComments();
      }
      setNewComment("");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add comment");
    }
  };

  const deleteComment = async (commentId) => {
    if (!confirm("Delete this comment?")) return;
    try {
      await api.delete(`/comment/${postId}/comment/${commentId}`);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      setCommentCount((c) => Math.max(0, c - 1));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete comment");
    }
  };

  //  Updated Follow / Unfollow with Socket emit
  const handleFollow = async () => {
    updateFollowing(authorId, "follow");
    try {
      await api.post(`/follow/${authorId}/follow`);
    } catch {

      updateFollowing(authorId, "unfollow");
    }
  };

  const handleUnfollow = async () => {
    updateFollowing(authorId, "unfollow");
    try {
      await api.post(`/follow/${authorId}/unfollow`);
    } catch {
      updateFollowing(authorId, "follow");
    }
  };

  const handleLikeClick = () => {
    if (onLike) onLike(post);
  };
  
  const handleSaveClick = () => {
    if (onSave) onSave(postId);
  };
  
  const handleMediaClickInternal = () => {
    if (onMediaClick) onMediaClick(postId);
  };

  return (
    <div className="card bg-base-100 shadow-xl border border-base-200 hover:shadow-2xl transition-all duration-300">
      {/* Header */}
      <div className="card-body p-5 bg-gradient-to-r from-base-100 via-primary/5 to-secondary/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to={authorId ? `/u/${authorId}` : "#"} className="avatar placeholder group">
              <div className="bg-neutral text-neutral-content rounded-full w-11 h-11 ring ring-primary ring-offset-base-100 ring-offset-2 group-hover:ring-secondary">
                <img
                  src={avatar}
                  alt={username}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
            </Link>
            <div>
              <Link to={authorId ? `/u/${authorId}` : "#"} className="font-bold text-base-content hover:text-primary transition-colors">
                {username}
              </Link>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1 h-1 rounded-full bg-primary" />
                <p className="text-xs text-base-content/60 font-medium">{timeAgo}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isMe && authorId && !isFollowing && (
              <button
                onClick={handleFollow}
                className="btn btn-primary btn-sm"
              >
                Follow
              </button>
            )}
            {!isMe && authorId && isFollowing && (
              <button
                onClick={handleUnfollow}
                className="btn btn-outline btn-sm"
              >
                Following
              </button>
            )}
            <button className="btn btn-ghost btn-circle btn-sm">
              <MoreHorizontal size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Media */}
      <div className="bg-base-200/30">
        {mediaImage ? (
          <img
            src={optimizeCloudinaryVideo(mediaImage)}
            alt="Post"
            className="w-full max-h-[550px] object-cover cursor-pointer select-none"
            draggable="false"
            onContextMenu={(e) => e.preventDefault()}
            onClick={handleMediaClickInternal}
          />
        ) : mediaVideo ? (
          <VideoPlayer src={mediaVideo} />
        ) : null}
      </div>

      {/* Actions Bar */}
      <div className="card-body p-5 bg-gradient-to-r from-primary/5 via-base-100 to-secondary/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <button
              onClick={handleLikeClick}
              className={`btn btn-ghost btn-circle ${isLiked ? "btn-error" : ""}`}
            >
              <Heart
                size={24}
                fill={isLiked ? "currentColor" : "none"}
                strokeWidth={2}
              />
            </button>

            <button
              className="btn btn-ghost btn-circle relative"
              onClick={toggleComments}
            >
              <MessageCircle size={24} strokeWidth={2} />
              {commentCount > 0 && (
                <span className="badge badge-primary badge-sm absolute -top-1 -right-1">
                  {commentCount}
                </span>
              )}
            </button>
          </div>

          <button
            onClick={handleSaveClick}
            className={`btn btn-ghost btn-circle ${isSaved ? "btn-warning" : ""}`}
          >
            <Bookmark
              size={24}
              fill={isSaved ? "currentColor" : "none"}
              strokeWidth={2}
            />
          </button>
        </div>
      </div>

      {/* Caption & Likes */}
      <div className="card-body p-5 pt-0">
        <div className="flex items-center gap-2">
          <div className="avatar-group -space-x-2">
            <div className="avatar placeholder">
              <div className="bg-red-400 text-white rounded-full w-6">
                <span className="text-xs">+</span>
              </div>
            </div>
            <div className="avatar placeholder">
              <div className="bg-blue-400 text-white rounded-full w-6">
                <span className="text-xs">+</span>
              </div>
            </div>
            <div className="avatar placeholder">
              <div className="bg-yellow-400 text-white rounded-full w-6">
                <span className="text-xs">+</span>
              </div>
            </div>
          </div>
          <p className="text-sm font-bold text-base-content">
            {likesCount.toLocaleString()} <span className="font-normal text-base-content/70">likes</span>
          </p>
        </div>

        {post?.caption && (
          <p className="text-sm text-base-content leading-relaxed">
            <Link to={authorId ? `/profile/${authorId}` : "#"} className="font-bold text-primary hover:underline mr-2">
              {username}
            </Link>
            {post.caption}
          </p>
        )}
      </div>

      {/* Comments Section */}
      {open && (
        <div className="mx-4 mb-4">
          <div className="card bg-base-100 shadow-lg border border-base-200">
            <div className="card-body p-0">
              <div className="bg-primary text-primary-content px-5 py-3 flex items-center justify-between">
                <p className="text-sm font-bold">Comments</p>
                <div className="badge badge-primary badge-sm">
                  {commentCount}
                </div>
              </div>

              <div className="max-h-72 overflow-y-auto">
                {loading ? (
                  <div className="p-6 text-center">
                    <span className="loading loading-spinner loading-md text-primary"></span>
                    <p className="text-sm text-base-content/60 mt-2">Loading comments...</p>
                  </div>
                ) : comments.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-base-200 rounded-full flex items-center justify-center mx-auto mb-3">
                      <MessageCircle size={28} className="text-base-content/60" />
                    </div>
                    <p className="text-sm text-base-content/60 font-medium">Be the first to comment!</p>
                  </div>
                ) : (
                  comments.map((c, idx) => (
                    <div
                      key={c._id}
                      className={`p-5 flex items-start gap-3 hover:bg-base-200/50 transition-colors ${idx !== comments.length - 1 ? "border-b border-base-200" : ""}`}
                    >
                      <div className="avatar placeholder">
                        <div className="bg-neutral text-neutral-content rounded-full w-8">
                          <img
                            src={c.user?.profilePicture || "/user.png"}
                            alt={c.user?.username || "User"}
                            className="w-full h-full object-cover rounded-full"
                          />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="bg-base-200 rounded-2xl px-4 py-2.5">
                          <p className="text-sm font-bold text-base-content mb-1">
                            {c.user?.username || "User"}
                          </p>
                          <p className="text-sm text-base-content leading-relaxed">{c.text}</p>
                        </div>
                        <p className="text-xs text-base-content/50 mt-1.5 ml-4 font-medium">
                          {c.createdAt ? formatTimeAgo(c.createdAt) : ""}
                        </p>
                      </div>

                      {user?._id && c.user && String(c.user._id) === String(user._id) && (
                        <button
                          className="btn btn-ghost btn-sm text-error hover:bg-error/10"
                          onClick={() => deleteComment(c._id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={addComment} className="p-4 bg-base-200/50 border-t border-base-200">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-base-100 border border-base-300 rounded-2xl px-3 py-1">
                    <VibeInputEditor
                      value={newComment}
                      onChange={setNewComment}
                      placeholder="Write a comment..."
                      height="36px"
                      borderHidden={true}
                      fontSize={14}
                      borderRadius={16}
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm rounded-xl"
                  >
                    Post
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default PostCard;
