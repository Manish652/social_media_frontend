import { Bookmark, ChevronDown, ChevronUp, CornerDownRight, Heart, MessageCircle, MoreHorizontal, Pencil, Send, Trash2 } from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";
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

// Recursive reply component
function CommentItem({ comment, postId, depth = 0, onCommentDeleted, currentUserId }) {
  const [replyText, setReplyText] = useState("");
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState(comment.replies || []);
  const [liked, setLiked] = useState((comment.likes || []).map(String).includes(String(currentUserId)));
  const [likeCount, setLikeCount] = useState((comment.likes || []).length);
  const [submitting, setSubmitting] = useState(false);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || submitting) return;
    setSubmitting(true);
    try {
      const { data } = await api.post(`/comment/reply/${comment._id}`, { text: replyText.trim() });
      if (data?.reply) {
        setReplies(prev => [...prev, data.reply]);
        setShowReplies(true);
      }
      setReplyText("");
      setShowReplyInput(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to post reply");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this comment?")) return;
    try {
      await api.delete(`/comment/${postId}/comment/${comment._id}`);
      onCommentDeleted(comment._id);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete");
    }
  };

  const toggleLike = async () => {
    setLiked(prev => !prev);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);
    try {
      await api.post(`/comment/like/${comment._id}`);
    } catch {
      setLiked(prev => !prev);
      setLikeCount(prev => liked ? prev + 1 : prev - 1);
    }
  };

  const handleReplyDeleted = useCallback((deletedId) => {
    setReplies(prev => prev.filter(r => r._id !== deletedId));
  }, []);

  const isOwner = String(comment.user?._id) === String(currentUserId);
  const paddingLeft = depth > 0 ? `${Math.min(depth * 16, 48)}px` : "0";

  return (
    <div style={{ paddingLeft }} className={depth > 0 ? "border-l-2 border-base-300 mt-2" : ""}>
      <div className="flex items-start gap-2.5 p-3 hover:bg-base-200/40 rounded-xl transition-colors group">
        <Link to={`/u/${comment.user?._id}`} className="flex-shrink-0">
          <img
            src={comment.user?.profilePicture || "/user.png"}
            alt={comment.user?.username || "User"}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-base-200"
          />
        </Link>

        <div className="flex-1 min-w-0">
          <div className="bg-base-200 rounded-2xl px-3.5 py-2.5">
            <Link to={`/u/${comment.user?._id}`} className="text-xs font-bold text-base-content hover:text-primary transition-colors">
              {comment.user?.username || "User"}
            </Link>
            <p className="text-sm text-base-content/90 leading-relaxed mt-0.5">{comment.text}</p>
          </div>

          {/* Comment actions */}
          <div className="flex items-center gap-3 mt-1 px-1">
            <span className="text-[10px] text-base-content/50">{formatTimeAgo(comment.createdAt)}</span>
            <button onClick={toggleLike} className={`text-xs font-semibold flex items-center gap-0.5 transition-colors ${liked ? "text-red-500" : "text-base-content/50 hover:text-base-content"}`}>
              <Heart size={12} fill={liked ? "currentColor" : "none"} />
              {likeCount > 0 && <span>{likeCount}</span>}
            </button>
            <button
              onClick={() => setShowReplyInput(prev => !prev)}
              className="text-xs font-semibold text-base-content/50 hover:text-primary transition-colors"
            >
              Reply
            </button>
            {isOwner && (
              <button onClick={handleDelete} className="text-xs text-error/70 hover:text-error opacity-0 group-hover:opacity-100 transition-all">
                <Trash2 size={12} />
              </button>
            )}
          </div>

          {/* Reply input */}
          {showReplyInput && (
            <form onSubmit={handleReply} className="mt-2 flex gap-2 items-center">
              <div className="flex-1 bg-base-100 border border-base-300 rounded-full px-3 py-1 text-sm">
                <VibeInputEditor
                  value={replyText}
                  onChange={setReplyText}
                  placeholder={`Reply to @${comment.user?.username}…`}
                  height="24px"
                  borderHidden={true}
                  fontSize={13}
                />
              </div>
              <button type="submit" disabled={!replyText.trim() || submitting} className="p-2 bg-primary text-white rounded-full disabled:opacity-40 hover:bg-primary/90 transition-colors">
                <Send size={14} />
              </button>
            </form>
          )}

          {/* Show replies toggle */}
          {replies.length > 0 && (
            <button
              onClick={() => setShowReplies(prev => !prev)}
              className="mt-1.5 flex items-center gap-1 text-xs text-primary font-semibold hover:underline px-1"
            >
              <CornerDownRight size={12} />
              {showReplies ? (
                <><ChevronUp size={12} /> Hide {replies.length} {replies.length === 1 ? "reply" : "replies"}</>
              ) : (
                <><ChevronDown size={12} /> View {replies.length} {replies.length === 1 ? "reply" : "replies"}</>
              )}
            </button>
          )}

          {/* Nested replies */}
          {showReplies && replies.length > 0 && (
            <div className="mt-1.5 space-y-1">
              {replies.map(reply => (
                <CommentItem
                  key={reply._id}
                  comment={reply}
                  postId={postId}
                  depth={depth + 1}
                  onCommentDeleted={handleReplyDeleted}
                  currentUserId={currentUserId}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const PostCard = React.memo(function PostCard({ post, isLiked, isSaved, onLike, onSave, onMediaClick, showOwnerActions = false, onEdit, onDelete }) {
  const { user, updateFollowing } = userAuth();
  const populatedUser = post?.userId || post?.userID;
  const authorId = populatedUser?._id || populatedUser;
  const username = populatedUser?.username || post?.username || "User";
  const avatar = populatedUser?.profilePicture || post?.avatar || "/user.png";
  const timeAgo = post?.createdAt ? formatTimeAgo(post.createdAt) : post?.timeAgo || "";
  const likesCount = Array.isArray(post?.likes) ? post.likes.length : post?.likes || 0;

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

  const handleCommentDeleted = useCallback((commentId) => {
    setComments((prev) => prev.filter((c) => c._id !== commentId));
    setCommentCount((c) => Math.max(0, c - 1));
  }, []);

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

  // Can show owner actions if it's my post - either via prop or autodetect
  const canEdit = showOwnerActions || isMe;

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
                className="btn btn-primary btn-xs rounded-full px-3"
              >
                Follow
              </button>
            )}
            {!isMe && authorId && isFollowing && (
              <button
                onClick={handleUnfollow}
                className="btn btn-outline btn-xs rounded-full px-3"
              >
                Following
              </button>
            )}
            {/* Owner actions menu */}
            {canEdit && (
              <div className="flex items-center gap-1">
                {onEdit && (
                  <button
                    onClick={() => onEdit(post)}
                    title="Edit post"
                    className="btn btn-ghost btn-circle btn-sm text-info hover:bg-info/10"
                  >
                    <Pencil size={15} />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(postId)}
                    title="Delete post"
                    className="btn btn-ghost btn-circle btn-sm text-error hover:bg-error/10"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
                {!onEdit && !onDelete && (
                  <button className="btn btn-ghost btn-circle btn-sm">
                    <MoreHorizontal size={18} />
                  </button>
                )}
              </div>
            )}
            {!canEdit && (
              <button className="btn btn-ghost btn-circle btn-sm">
                <MoreHorizontal size={18} />
              </button>
            )}
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

      {/* Comments Section - Nested / YouTube-style */}
      {open && (
        <div className="mx-4 mb-4">
          <div className="card bg-base-100 shadow-lg border border-base-200">
            <div className="card-body p-0">
              <div className="bg-gradient-to-r from-primary to-secondary text-primary-content px-5 py-3 flex items-center justify-between rounded-t-2xl">
                <p className="text-sm font-bold">Comments ({commentCount})</p>
                <button onClick={toggleComments} className="text-white/70 hover:text-white text-xs">Close</button>
              </div>

              {/* Add new comment */}
              <form onSubmit={addComment} className="p-4 border-b border-base-200">
                <div className="flex items-center gap-2">
                  <img
                    src={user?.profilePicture || "/user.png"}
                    alt="me"
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1 bg-base-200 border border-base-300 rounded-full px-3 py-1">
                    <VibeInputEditor
                      value={newComment}
                      onChange={setNewComment}
                      placeholder="Write a comment…"
                      height="28px"
                      borderHidden={true}
                      fontSize={14}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!newComment.trim()}
                    className="p-2 bg-primary text-white rounded-full disabled:opacity-40 hover:bg-primary/90 transition-colors"
                  >
                    <Send size={15} />
                  </button>
                </div>
              </form>

              {/* Comments list */}
              <div className="max-h-96 overflow-y-auto p-2">
                {loading ? (
                  <div className="p-6 text-center">
                    <span className="loading loading-spinner loading-md text-primary"></span>
                  </div>
                ) : comments.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-base-200 rounded-full flex items-center justify-center mx-auto mb-3">
                      <MessageCircle size={28} className="text-base-content/60" />
                    </div>
                    <p className="text-sm text-base-content/60 font-medium">Be the first to comment!</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {comments.map((c) => (
                      <CommentItem
                        key={c._id}
                        comment={c}
                        postId={postId}
                        depth={0}
                        onCommentDeleted={handleCommentDeleted}
                        currentUserId={user?._id}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default PostCard;
