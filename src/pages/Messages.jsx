import { ArrowLeft, Image, MessageSquarePlus, Send, Trash2, Video, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import NewChatModal from ".././components/message/NewChatModal.jsx";
import api from "../api/axios.js";
import { userAuth } from "../context/AuthContext.jsx";
import socket from "../lib/socket.js";
import VibeInputEditor from "../components/common/VibeInputEditor.jsx";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";

export default function Messages() {
  const { user, token } = userAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const chatIdFromUrl = searchParams.get("chatId");

  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  // Media state
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState("");
  const [mediaType, setMediaType] = useState(null); // "image" | "video"
  const [viewerMedia, setViewerMedia] = useState(null); // {url, type}

  const messagesEndRef = useRef(null);
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  // Online user tracking (socket is already connected via AuthContext)
  useEffect(() => {
    if (!user) return;

    const handleGetOnlineUsers = (users) => setOnlineUsers(new Set(users));
    const handleUserOnline = (userId) => setOnlineUsers((prev) => { const s = new Set(prev); s.add(userId); return s; });
    const handleUserOffline = (userId) => setOnlineUsers((prev) => { const s = new Set(prev); s.delete(userId); return s; });

    socket.on("getOnlineUsers", handleGetOnlineUsers);
    socket.on("userOnline", handleUserOnline);
    socket.on("userOffline", handleUserOffline);

    return () => {
      socket.off("getOnlineUsers", handleGetOnlineUsers);
      socket.off("userOnline", handleUserOnline);
      socket.off("userOffline", handleUserOffline);
      // ❌ DO NOT disconnect socket here — AuthContext manages it globally
    };
  }, [user]);

  useEffect(() => {
    const handleNewMessage = (newMessage) => {
      setMessages((prev) => {
        if (selectedChat && newMessage.chatId === selectedChat._id) {
          if (prev.some((msg) => msg._id === newMessage._id)) return prev;
          const withoutTemp = prev.filter(msg => !msg.temp);
          return [...withoutTemp, newMessage];
        }
        return prev;
      });
      setChats((prevChats) => {
        const updated = prevChats.map((chat) =>
          chat._id === newMessage.chatId ? { ...chat, lastMessage: newMessage, updatedAt: new Date().toISOString() } : chat
        );
        return updated.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
      });
    };
    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [selectedChat]);

  useEffect(() => { fetchChats(); }, []);

  useEffect(() => {
    if (chatIdFromUrl && chats.length > 0) {
      const chat = chats.find((c) => c._id === chatIdFromUrl);
      if (chat) handleSelectChat(chat);
    }
  }, [chatIdFromUrl, chats]);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat._id);
      fetchParticipants(selectedChat._id);
    }
  }, [selectedChat]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const fetchChats = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/chat");
      setChats(Array.isArray(data) ? data : data.chats || []);
    } catch (err) { console.error("Failed to fetch chats:", err); } finally { setLoading(false); }
  };

  const fetchMessages = async (chatId) => {
    try {
      const { data } = await api.get(`/message/chat/${chatId}`);
      setMessages(Array.isArray(data) ? data : data.messages || []);
    } catch { setMessages([]); }
  };

  const fetchParticipants = async (chatId) => {
    try {
      const { data } = await api.get(`/message/participants/${chatId}`);
      setParticipants(Array.isArray(data) ? data : data.participants || []);
    } catch { setParticipants([]); }
  };

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    navigate(`/messages?chatId=${chat._id}`, { replace: true });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!messageText.trim() && !mediaFile) || !selectedChat || sending) return;
    const otherParticipant = selectedChat.participants?.find(p => String(p._id || p) !== String(user._id));
    const receiverId = otherParticipant?._id || otherParticipant;
    if (!receiverId) return;

    const tempId = `temp-${Date.now()}`;
    const tempMessage = {
      _id: tempId, text: messageText, image: mediaType === "image" ? mediaPreview : null,
      video: mediaType === "video" ? mediaPreview : null, mediaType,
      senderId: user._id, chatId: selectedChat._id, createdAt: new Date().toISOString(), temp: true,
    };
    setMessages((prev) => [...prev, tempMessage]);
    const textToSend = messageText;
    const fileToSend = mediaFile;
    const typeToSend = mediaType;
    setMessageText(""); setMediaFile(null); setMediaPreview(""); setMediaType(null);

    try {
      setSending(true);
      let mediaUrl = null;
      if (fileToSend) {
        const folder = typeToSend === "video" ? "social_chat_videos" : "social_chat_images";
        const result = await uploadToCloudinary(fileToSend, folder);
        mediaUrl = result.url;
      }

      const payload = { chatId: selectedChat._id, receiverId, text: textToSend, mediaType: typeToSend };
      if (typeToSend === "video") payload.video = mediaUrl;
      else if (typeToSend === "image") payload.image = mediaUrl;

      const { data } = await api.post("/message/send", payload);
      setMessages((prev) => prev.map((msg) => (msg._id === tempId ? data : msg)));
      setChats((prev) => {
        const updated = prev.map(c => c._id === selectedChat._id ? { ...c, lastMessage: data, updatedAt: new Date().toISOString() } : c);
        return updated.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
      });
    } catch (err) {
      console.error("Send failed:", err);
      setMessages((prev) => prev.filter((msg) => msg._id !== tempId));
      setMessageText(textToSend);
    } finally { setSending(false); }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!confirm("Delete this message?")) return;
    try {
      await api.delete(`/message/delete/${messageId}`);
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
    } catch { }
  };

  const handleDeleteChat = async (chatId) => {
    if (!confirm("Delete this conversation?")) return;
    try {
      await api.delete(`/chat/${chatId}`);
      setChats((prev) => prev.filter((chat) => chat._id !== chatId));
      if (selectedChat?._id === chatId) { setSelectedChat(null); navigate("/messages"); }
    } catch { }
  };

  const handleMediaSelect = (e, type) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(file);
      setMediaType(type);
      setMediaPreview(URL.createObjectURL(file));
    }
    e.target.value = "";
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const h = date.getHours(), m = date.getMinutes();
    const t = `${h % 12 || 12}:${m.toString().padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
    if (diff < 86400000) return t;
    if (diff < 172800000) return `Yesterday ${t}`;
    return date.toLocaleDateString();
  };

  const getOtherParticipant = (chat) => {
    if (!chat?.participants) return null;
    return chat.participants.find(p => String(p._id || p) !== String(user._id));
  };
  const getChatName = (chat) => { const o = getOtherParticipant(chat); return o?.username || "User"; };
  const getChatAvatar = (chat) => { const o = getOtherParticipant(chat); return o?.profilePicture || "/user.png"; };

  return (
    <div className="fixed inset-0 flex bg-base-100 overflow-hidden pt-16 pb-16 lg:pb-0 lg:left-64 xl:right-80">
      {/* Chats List */}
      <div className={`${selectedChat ? "hidden md:flex" : "flex"} w-full md:w-[360px] bg-base-100 shadow-xl flex-col overflow-hidden border-r border-base-300`}>
        <div className="p-4 bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-between flex-shrink-0">
          <h2 className="text-xl font-bold text-white">Messages</h2>
          <button onClick={() => setShowNewChatModal(true)} className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-all hover:scale-110">
            <MessageSquarePlus size={20} className="text-white" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-3 space-y-2">
              {[1,2,3,4].map(i => (
                <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                  <div className="w-12 h-12 rounded-full bg-base-200" />
                  <div className="flex-1"><div className="h-4 bg-base-200 rounded w-3/4 mb-2" /><div className="h-3 bg-base-200 rounded w-1/2" /></div>
                </div>
              ))}
            </div>
          ) : chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="text-5xl mb-4">💬</div>
              <p className="font-semibold text-base-content text-lg mb-1">No messages yet</p>
              <p className="text-sm text-base-content/70">Start a new conversation!</p>
              <button onClick={() => setShowNewChatModal(true)} className="mt-4 btn btn-primary btn-sm rounded-full">New Chat</button>
            </div>
          ) : (
            chats.map((chat) => {
              const otherUser = getOtherParticipant(chat);
              const isOnline = otherUser?._id && onlineUsers.has(otherUser._id.toString());
              const lastMsg = chat.lastMessage;
              return (
                <button key={chat._id} onClick={() => handleSelectChat(chat)}
                  className={`w-full p-3 flex items-center gap-3 transition-all border-l-4 ${selectedChat?._id === chat._id ? "bg-primary/10 border-primary" : "border-transparent hover:bg-base-200"}`}>
                  <div className="relative flex-shrink-0">
                    <img src={getChatAvatar(chat)} alt={getChatName(chat)} className="w-12 h-12 rounded-full object-cover" />
                    {isOnline && <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-success rounded-full border-2 border-base-100" />}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-semibold text-base-content truncate text-sm">{getChatName(chat)}</p>
                    <p className="text-xs text-base-content/60 truncate mt-0.5">
                      {lastMsg?.video ? "🎥 Video" : lastMsg?.image && !lastMsg?.text ? "📷 Photo" : lastMsg?.text || "Start chatting"}
                    </p>
                  </div>
                  {lastMsg && <span className="text-[10px] text-base-content/50 flex-shrink-0">{formatTime(lastMsg.createdAt)}</span>}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      {selectedChat ? (
        <div className="flex-1 flex flex-col bg-base-100 overflow-hidden">
          {/* Header */}
          <div className="p-3 bg-base-100 border-b border-base-300 flex items-center gap-3 shadow-sm flex-shrink-0">
            <button onClick={() => { setSelectedChat(null); navigate("/messages"); }} className="md:hidden p-2 hover:bg-primary/10 rounded-full">
              <ArrowLeft size={20} className="text-primary" />
            </button>
            <div className="relative">
              <img src={getChatAvatar(selectedChat)} alt={getChatName(selectedChat)} className="w-10 h-10 rounded-full object-cover" />
              {(() => { const o = getOtherParticipant(selectedChat); return o?._id && onlineUsers.has(o._id.toString()) ? <div className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-base-100" /> : null; })()}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-base-content text-sm">{getChatName(selectedChat)}</h3>
              {(() => { const o = getOtherParticipant(selectedChat); const online = o?._id && onlineUsers.has(o._id.toString()); return <p className={`text-xs ${online ? "text-success" : "text-base-content/50"}`}>{online ? "Active now" : "Offline"}</p>; })()}
            </div>
            <button onClick={() => handleDeleteChat(selectedChat._id)} className="p-2 hover:bg-error/10 rounded-full" title="Delete conversation">
              <Trash2 size={18} className="text-error" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Cg fill='%239C92AC' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`, backgroundColor: "hsl(var(--b1))" }}>
              {messages.length > 0 ? messages.map((msg) => {
                const isMe = msg.senderId === user._id || msg.senderId?._id === user._id;
                const senderId = msg.senderId?._id || msg.senderId;
                const sender = participants.find(p => p._id === senderId);
                return (
                  <div key={msg._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`flex gap-2 max-w-[70%] ${isMe ? "flex-row-reverse" : ""}`}>
                      {!isMe && <img src={sender?.profilePicture || "/user.png"} alt="avatar" className="w-7 h-7 rounded-full object-cover flex-shrink-0 self-end" />}
                      <div className="flex flex-col">
                        <div
                          className={`px-4 py-2.5 shadow-sm ${isMe ? "bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-3xl rounded-tr-md" : "bg-base-100 text-base-content rounded-3xl rounded-tl-md border border-base-300"} ${msg.temp ? "opacity-60 animate-pulse" : ""}`}
                          onContextMenu={e => { if (isMe) { e.preventDefault(); handleDeleteMessage(msg._id); } }}
                        >
                          {msg.text && <p className="text-[14px] leading-relaxed break-words">{msg.text}</p>}
                          {msg.image && (
                            <img src={msg.image} alt="img" className="max-w-[200px] rounded-xl mt-1 cursor-pointer hover:opacity-90"
                              onClick={() => setViewerMedia({ url: msg.image, type: "image" })} />
                          )}
                          {msg.video && (
                            <video src={msg.video} className="max-w-[220px] rounded-xl mt-1 cursor-pointer" controls
                              onClick={e => e.stopPropagation()} />
                          )}
                        </div>
                        <p className={`text-[10px] text-base-content/50 mt-1 px-1 ${isMe ? "text-right" : "text-left"}`}>{formatTime(msg.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center"><div className="text-4xl mb-2">👋</div><p className="font-semibold text-base-content">No messages yet</p><p className="text-sm text-base-content/60 mt-1">Say hi!</p></div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-3 bg-base-100 border-t border-base-300 flex-shrink-0">
            {/* Media preview */}
            {mediaPreview && (
              <div className="mb-2 relative inline-block">
                {mediaType === "video"
                  ? <video src={mediaPreview} className="h-16 rounded-xl border border-base-300" />
                  : <img src={mediaPreview} alt="Preview" className="h-16 w-16 rounded-xl object-cover border border-base-300" />
                }
                <button type="button" onClick={() => { setMediaFile(null); setMediaPreview(""); setMediaType(null); }}
                  className="absolute -top-2 -right-2 bg-error text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:scale-110 transition-transform">
                  <X size={12} />
                </button>
              </div>
            )}
            <div className="flex items-center gap-2 bg-base-200 rounded-full px-3 py-1 border border-base-300 focus-within:border-primary transition-all">
              <input ref={imageInputRef} type="file" accept="image/*,image/gif" className="hidden" onChange={e => handleMediaSelect(e, "image")} />
              <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={e => handleMediaSelect(e, "video")} />
              <button type="button" onClick={() => imageInputRef.current?.click()} className="p-1.5 hover:bg-primary/10 rounded-full transition-colors flex-shrink-0" title="Send image/GIF">
                <Image size={18} className="text-primary" />
              </button>
              <button type="button" onClick={() => videoInputRef.current?.click()} className="p-1.5 hover:bg-primary/10 rounded-full transition-colors flex-shrink-0" title="Send video">
                <Video size={18} className="text-secondary" />
              </button>
              <div className="flex-1 min-w-0">
                <VibeInputEditor value={messageText} onChange={setMessageText} placeholder="Type a message..." height="20px" borderHidden={true} fontSize={14} borderRadius={0} />
              </div>
              <button type="submit" disabled={(!messageText.trim() && !mediaFile) || sending}
                className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:shadow-lg hover:scale-105 disabled:opacity-50 transition-all flex-shrink-0">
                {sending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={16} />}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center">
          <div className="text-center">
            <div className="text-7xl mb-4">💬</div>
            <h3 className="text-xl font-bold text-base-content mb-1">Your Messages</h3>
            <p className="text-base-content/60">Select a conversation to start chatting</p>
          </div>
        </div>
      )}

      <NewChatModal isOpen={showNewChatModal} onClose={() => setShowNewChatModal(false)} />

      {/* Media viewer lightbox */}
      {viewerMedia && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm" onClick={() => setViewerMedia(null)}>
          <div className="relative max-w-[90vw] max-h-[90vh] flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <div className="absolute -top-12 right-0">
              <button onClick={() => setViewerMedia(null)} className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 w-9 h-9 rounded-full flex items-center justify-center">
                <X size={20} />
              </button>
            </div>
            {viewerMedia.type === "video"
              ? <video src={viewerMedia.url} controls className="max-w-[90vw] max-h-[85vh] rounded-2xl" autoPlay />
              : <img src={viewerMedia.url} alt="Full view" className="max-w-[90vw] max-h-[85vh] rounded-2xl object-contain shadow-2xl" />
            }
          </div>
        </div>
      )}
    </div>
  );
}
