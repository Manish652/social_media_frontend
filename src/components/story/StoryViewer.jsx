import { ChevronLeft, ChevronRight, Pause, Play, Send, Volume2, VolumeX, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import api from "../../api/axios.js";
import { userAuth } from "../../context/AuthContext.jsx";

export default function StoryViewer({ items = [], startIndex = 0, onClose }) {
  const [index, setIndex] = useState(startIndex || 0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);

  const videoRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const { user } = userAuth();

  const current = items[index] || null;
  const total = items.length;

  const next = () => { if (index + 1 < total) { setIndex(index + 1); setProgress(0); } else { onClose(); } };
  const prev = () => { if (index > 0) { setIndex(index - 1); setProgress(0); } };

  const getTimeRemaining = (story) => {
    if (!story?.expiresAt) return "24h";
    const diff = new Date(story.expiresAt) - new Date();
    if (diff <= 0) return "Expired";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return hours > 0 ? `${hours}h` : `${minutes}m`;
  };

  useEffect(() => {
    if (!current || isPaused || showReplyInput) return;
    const duration = current.mediaType === "video" ? 0 : 5000;
    if (duration > 0) {
      const startTime = Date.now();
      progressIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const p = (elapsed / duration) * 100;
        setProgress(p);
        if (p >= 100) { clearInterval(progressIntervalRef.current); next(); }
      }, 50);
      return () => clearInterval(progressIntervalRef.current);
    }
  }, [current, index, isPaused, showReplyInput]);

  useEffect(() => {
    if (current?.mediaType === "video" && videoRef.current) {
      const video = videoRef.current;
      video.muted = isMuted;
      const updateProgress = () => { if (video.duration) setProgress((video.currentTime / video.duration) * 100); };
      const handleEnded = () => next();
      video.addEventListener("timeupdate", updateProgress);
      video.addEventListener("ended", handleEnded);
      if (!isPaused) video.play().catch(() => {});
      else video.pause();
      return () => { video.removeEventListener("timeupdate", updateProgress); video.removeEventListener("ended", handleEnded); };
    }
  }, [current?.mediaType, current?.mediaUrl, index, isPaused, isMuted]);

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || sendingReply) return;
    setSendingReply(true);
    try {
      // Create or get DM with story owner, send reply
      const storyOwner = current?.user;
      if (!storyOwner?._id) { toast.error("Cannot identify story owner"); return; }

      // Create chat with story owner
      const { data: chatData } = await api.post("/chat/create", { userId: storyOwner._id });
      const chatId = chatData?._id || chatData?.chat?._id;
      if (!chatId) { toast.error("Failed to open DM"); return; }

      // Send message referencing the story
      await api.post("/message/send", {
        chatId,
        receiverId: storyOwner._id,
        text: `📸 Replied to your story: "${replyText.trim()}"`,
      });

      toast.success("Reply sent to DM! 📩");
      setReplyText("");
      setShowReplyInput(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to send reply");
    } finally {
      setSendingReply(false);
    }
  };

  if (!current) return null;

  const isMyStory = String(current.user?._id) === String(user?._id);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
      {/* Progress Bars */}
      <div className="absolute top-0 left-0 right-0 z-50 flex gap-1 p-2">
        {items.map((_, i) => (
          <div key={i} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
            <div className="h-full bg-white transition-all duration-100" style={{ width: i < index ? "100%" : i === index ? `${progress}%` : "0%" }} />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-4 left-0 right-0 z-50 px-4 mt-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={current.user?.profilePicture || "/user.png"} alt="user" className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-lg" />
            <div>
              <div className="text-white font-semibold text-sm drop-shadow-lg">{current.user?.username || "User"}</div>
              <div className="text-white/70 text-xs">{getTimeRemaining(current)} remaining</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsPaused(p => !p)} className="p-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition-all">
              {isPaused ? <Play size={16} className="text-white" /> : <Pause size={16} className="text-white" />}
            </button>
            {current.mediaType === "video" && (
              <button onClick={() => setIsMuted(m => !m)} className="p-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition-all">
                {isMuted ? <VolumeX size={16} className="text-white" /> : <Volume2 size={16} className="text-white" />}
              </button>
            )}
            <button onClick={onClose} className="p-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition-all">
              <X size={16} className="text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Story Content */}
      <div className="relative w-full max-w-md h-[85vh] flex items-center justify-center">
        <div className="absolute inset-0 flex z-10">
          <div className="w-1/3 h-full cursor-pointer" onClick={prev} />
          <div className="w-1/3 h-full cursor-pointer" onClick={() => setIsPaused(p => !p)} />
          <div className="w-1/3 h-full cursor-pointer" onClick={next} />
        </div>

        <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl">
          {current.mediaType === "image" && <img src={current.mediaUrl} alt="story" className="w-full h-full object-cover" />}
          {current.mediaType === "video" && <video ref={videoRef} src={current.mediaUrl} className="w-full h-full object-cover" playsInline loop={false} />}
          {current.mediaType === "text" && (
            <div className="w-full h-full flex items-center justify-center p-8" style={{ backgroundColor: current.bgColor || "#000" }}>
              <p className="text-white text-center text-2xl font-bold leading-relaxed drop-shadow-lg">{current.text}</p>
            </div>
          )}
          {current.caption && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6">
              <p className="text-white text-sm leading-relaxed">{current.caption}</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Arrows */}
      {index > 0 && <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition-all"><ChevronLeft size={22} className="text-white" /></button>}
      {index < total - 1 && <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition-all"><ChevronRight size={22} className="text-white" /></button>}

      {/* Reply to Story - only for other users' stories */}
      {!isMyStory && (
        <div className="absolute bottom-6 left-0 right-0 z-50 px-4">
          {showReplyInput ? (
            <form onSubmit={handleSendReply} className="flex items-center gap-2">
              <input
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder={`Reply to @${current.user?.username}…`}
                className="flex-1 bg-white/10 backdrop-blur-md border border-white/30 text-white placeholder-white/60 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-white/60"
                autoFocus
                onKeyDown={e => e.key === "Escape" && setShowReplyInput(false)}
              />
              <button type="submit" disabled={!replyText.trim() || sendingReply}
                className="p-2.5 bg-white/20 hover:bg-white/30 rounded-full disabled:opacity-40 transition-all">
                {sendingReply ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Send size={16} className="text-white" />}
              </button>
              <button type="button" onClick={() => setShowReplyInput(false)} className="p-2.5 bg-white/20 rounded-full">
                <X size={16} className="text-white" />
              </button>
            </form>
          ) : (
            <div className="flex items-center justify-between">
              <button onClick={() => { setShowReplyInput(true); setIsPaused(true); }}
                className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/30 text-white/80 hover:text-white rounded-full px-5 py-2.5 text-sm transition-all hover:bg-white/20">
                <Send size={14} />
                Reply to story...
              </button>
              <div className="px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-full">
                <span className="text-white text-xs font-semibold">{index + 1} / {total}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {isMyStory && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full">
          <span className="text-white text-sm font-semibold">{index + 1} / {total}</span>
        </div>
      )}
    </div>
  );
}
