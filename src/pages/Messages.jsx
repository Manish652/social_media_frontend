import { ArrowLeft, Image, MessageSquarePlus, Send, Smile, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import NewChatModal from ".././components/message/NewChatModal.jsx";
import api from "../api/axios.js";
import { userAuth } from "../context/AuthContext.jsx";
import socket from "../lib/socket.js";

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
  const messagesEndRef = useRef(null);

  // Socket connection
  useEffect(() => {
    if (user && token) {
      console.log("[Messages] Connecting socket with token");
      socket.auth = { token };
      socket.connect();

      socket.on("connect", () => {
        console.log("[Messages] Socket connected:", socket.id);
      });

      socket.on("connect_error", (err) => {
        console.error("[Messages] Socket connection error:", err.message);
      });

      // Listen for online/offline status
      socket.on("userOnline", (userId) => {
        console.log("[Messages] User online:", userId);
        setOnlineUsers((prev) => new Set(prev).add(userId));
      });

      socket.on("userOffline", (userId) => {
        console.log("[Messages] User offline:", userId);
        setOnlineUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      });

      return () => {
        console.log("[Messages] Disconnecting socket");
        socket.off("userOnline");
        socket.off("userOffline");
        socket.disconnect();
      };
    }
  }, [user, token]);

  // Listen for new messages
  useEffect(() => {
    const handleNewMessage = (newMessage) => {
      console.log("[Messages] Received new message:", newMessage);

      // Update messages if in the same chat
      setMessages((prev) => {
        // Only add if we're in the same chat and it's not a duplicate
        if (selectedChat && newMessage.chatId === selectedChat._id) {
          if (prev.some((msg) => msg._id === newMessage._id)) {
            console.log("[Messages] Duplicate message, skipping");
            return prev;
          }
          console.log("[Messages] Adding message to current chat");
          return [...prev, newMessage];
        }
        console.log("[Messages] Message for different chat, updating chat list only");
        return prev;
      });

      // Update chat list to show latest message
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat._id === newMessage.chatId
            ? { ...chat, lastMessage: newMessage }
            : chat
        )
      );
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [selectedChat]);

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (chatIdFromUrl && chats.length > 0) {
      const chat = chats.find((c) => c._id === chatIdFromUrl);
      if (chat) {
        handleSelectChat(chat);
      }
    }
  }, [chatIdFromUrl, chats]);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat._id);
      fetchParticipants(selectedChat._id);
    }
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchChats = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/chat");
      setChats(Array.isArray(data) ? data : data.chats || []);
    } catch (err) {
      console.error("Failed to fetch chats:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      const { data } = await api.get(`/message/chat/${chatId}`);
      // Handle different response structures
      const msgs = Array.isArray(data) ? data : data.messages || data.message || [];
      setMessages(msgs);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
      // Set empty array on error so UI doesn't break
      setMessages([]);
    }
  };

  const fetchParticipants = async (chatId) => {
    try {
      const { data } = await api.get(`/message/participants/${chatId}`);
      setParticipants(Array.isArray(data) ? data : data.participants || []);
    } catch (err) {
      console.error("Failed to fetch participants:", err);
      // Set empty array on error
      setParticipants([]);
    }
  };

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    navigate(`/messages?chatId=${chat._id}`, { replace: true });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedChat || sending) return;

    // Get receiver ID (the other participant)
    const otherParticipant = selectedChat.participants?.find(
      (p) => String(p._id || p) !== String(user._id)
    );

    const receiverId = otherParticipant?._id || otherParticipant;

    if (!receiverId) {
      console.error("No receiver found");
      return;
    }

    const tempId = `temp-${Date.now()}`;
    const tempMessage = {
      _id: tempId,
      text: messageText,
      senderId: user._id,
      createdAt: new Date().toISOString(),
      temp: true,
    };

    setMessages((prev) => [...prev, tempMessage]);
    const textToSend = messageText;
    setMessageText("");

    try {
      setSending(true);
      const { data } = await api.post("/message/send", {
        chatId: selectedChat._id,
        receiverId: receiverId,
        text: textToSend,
      });

      // Replace temp message with real one
      setMessages((prev) =>
        prev.map((msg) => (msg._id === tempId ? data : msg))
      );

      // Update chat list
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat._id === selectedChat._id
            ? { ...chat, lastMessage: data }
            : chat
        )
      );
    } catch (err) {
      console.error("Failed to send message:", err);
      setMessages((prev) => prev.filter((msg) => msg._id !== tempId));
      setMessageText(textToSend);
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!confirm("Delete this message?")) return;

    try {
      await api.delete(`/message/delete/${messageId}`);
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
    } catch (err) {
      console.error("Failed to delete message:", err);
    }
  };

  const handleDeleteChat = async (chatId) => {
    if (!confirm("Delete this conversation?")) return;

    try {
      await api.delete(`/chat/${chatId}`);
      setChats((prev) => prev.filter((chat) => chat._id !== chatId));
      if (selectedChat?._id === chatId) {
        setSelectedChat(null);
        navigate("/messages");
      }
    } catch (err) {
      console.error("Failed to delete chat:", err);
    }
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const hours = date.getHours();
    const mins = date.getMinutes();
    const timeStr = `${hours % 12 || 12}:${mins.toString().padStart(2, "0")} ${hours >= 12 ? "PM" : "AM"
      }`;

    if (diff < 86400000) return timeStr;
    if (diff < 172800000) return `Yesterday ${timeStr}`;
    return date.toLocaleDateString();
  };

  const getOtherParticipant = (chat) => {
    if (!chat?.participants) return null;
    return chat.participants.find((p) => p._id !== user._id);
  };

  const getChatName = (chat) => {
    const other = getOtherParticipant(chat);
    return other?.username || other?.name || "User";
  };

  const getChatAvatar = (chat) => {
    const other = getOtherParticipant(chat);
    return other?.profilePicture || "/user.png";
  };

  return (
    <div className="fixed inset-0 flex bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden pt-16 pb-16">
      {/* Chats List */}
      <div
        className={`${selectedChat ? "hidden md:flex" : "flex"
          } w-full md:w-[380px] bg-white shadow-xl flex-col overflow-hidden`}
      >
        <div className="p-5 bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Messages</h2>
          <button
            onClick={() => setShowNewChatModal(true)}
            className="p-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full transition-all duration-200 hover:scale-110"
          >
            <MessageSquarePlus size={22} className="text-white" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-3 space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                  <div className="w-14 h-14 rounded-full bg-gray-200" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-4">
                <p className="text-5xl">💬</p>
              </div>
              <p className="font-semibold text-gray-800 text-lg mb-1">No messages yet</p>
              <p className="text-sm text-gray-500">Start a new conversation!</p>
            </div>
          ) : (
            chats.map((chat) => {
              return (
                <button
                  key={chat._id}
                  onClick={() => handleSelectChat(chat)}
                  className={`w-full p-4 flex items-center gap-3 transition-all duration-200 border-l-4 ${selectedChat?._id === chat._id
                    ? "bg-gradient-to-r from-purple-50 to-pink-50 border-purple-600"
                    : "border-transparent hover:bg-gray-50"
                    }`}
                >
                  <div className="relative">
                    <img
                      src={getChatAvatar(chat)}
                      alt={getChatName(chat)}
                      className="w-14 h-14 rounded-full object-cover ring-2 ring-gray-100"
                    />
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-semibold text-gray-900 truncate text-base">
                      {getChatName(chat)}
                    </p>
                    <p className="text-sm text-gray-500 truncate mt-0.5">
                      {chat.lastMessage?.text || "Start chatting"}
                    </p>
                  </div>
                  {chat.lastMessage && (
                    <span className="text-xs text-gray-400 font-medium">
                      {formatTime(chat.lastMessage.createdAt)}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      {selectedChat ? (
        <div className="flex-1 flex flex-col bg-white shadow-lg overflow-hidden" style={{ height: 'calc(100vh - 8rem)' }}>
          {/* Chat Header */}
          <div className="p-4 bg-white border-b border-gray-200 flex items-center gap-3 shadow-sm flex-shrink-0">
            <button
              onClick={() => {
                setSelectedChat(null);
                navigate("/messages");
              }}
              className="md:hidden p-2 hover:bg-purple-50 rounded-full transition-colors"
            >
              <ArrowLeft size={20} className="text-purple-600" />
            </button>
            <div className="relative">
              <img
                src={getChatAvatar(selectedChat)}
                alt={getChatName(selectedChat)}
                className="w-11 h-11 rounded-full object-cover ring-2 ring-purple-100"
              />
              {(() => {
                const other = getOtherParticipant(selectedChat);
                const isOnline = other && onlineUsers.has(other._id || other);
                return isOnline ? (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                ) : null;
              })()}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-base">
                {getChatName(selectedChat)}
              </h3>
              {(() => {
                const other = getOtherParticipant(selectedChat);
                const isOnline = other && onlineUsers.has(other._id || other);
                return (
                  <p className={`text-xs font-medium ${isOnline ? "text-green-600" : "text-gray-400"}`}>
                    {isOnline ? "Active now" : "Offline"}
                  </p>
                );
              })()}
            </div>
            <button
              onClick={() => handleDeleteChat(selectedChat._id)}
              className="p-2 hover:bg-red-50 rounded-full transition-colors"
              title="Delete conversation"
            >
              <Trash2 size={20} className="text-red-600" />
            </button>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto p-6 space-y-4"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundColor: "#fafafa",
            }}
          >
            {Array.isArray(messages) && messages.length > 0 ? (
              messages.map((msg, index) => {
                const isMe = msg.senderId === user._id || msg.senderId?._id === user._id || msg.sender === user._id || msg.sender?._id === user._id;
                const senderId = msg.senderId?._id || msg.senderId || msg.sender?._id || msg.sender;
                const sender = participants.find((p) => p._id === senderId);
                const prevMsg = messages[index - 1];
                const prevIsMe = prevMsg && (prevMsg.senderId === user._id || prevMsg.senderId?._id === user._id);
                const showAvatar = !isMe && (!prevMsg || prevIsMe !== isMe);

                return (
                  <div
                    key={msg._id}
                    className={`flex ${isMe ? "justify-end" : "justify-start"} ${showAvatar ? "mt-4" : "mt-1"
                      }`}
                  >
                    <div className={`flex gap-2 max-w-[75%] md:max-w-[60%] ${isMe ? "flex-row-reverse" : ""}`}>
                      {!isMe && showAvatar && (
                        <img
                          src={sender?.profilePicture || "/user.png"}
                          alt={sender?.username || "User"}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0 ring-2 ring-gray-100"
                        />
                      )}
                      {!isMe && !showAvatar && <div className="w-8" />}
                      <div className="flex flex-col">
                        <div
                          className={`px-4 py-2.5 shadow-sm ${isMe
                            ? "bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-3xl rounded-tr-md"
                            : "bg-white text-gray-900 rounded-3xl rounded-tl-md border border-gray-200"
                            } ${msg.temp ? "opacity-60 animate-pulse" : ""}`}
                          onContextMenu={(e) => {
                            if (isMe) {
                              e.preventDefault();
                              handleDeleteMessage(msg._id);
                            }
                          }}
                        >
                          <p className="text-[15px] leading-relaxed break-words">{msg.text}</p>
                        </div>
                        <p
                          className={`text-[11px] text-gray-400 mt-1 px-1 font-medium ${isMe ? "text-right" : "text-left"
                            }`}
                        >
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <p className="text-4xl">👋</p>
                  </div>
                  <p className="text-base font-semibold text-gray-700">No messages yet</p>
                  <p className="text-sm text-gray-500 mt-1">Say hi to start the conversation!</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form
            onSubmit={handleSendMessage}
            className="p-4 bg-white border-t border-gray-200 flex-shrink-0"
          >
            <div className="flex items-center gap-2 bg-gray-50 rounded-full px-4 py-2 border border-gray-200 focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-100 transition-all">
              <button
                type="button"
                className="p-1.5 hover:bg-purple-100 rounded-full transition-colors flex-shrink-0"
              >
                <Image size={20} className="text-purple-600" />
              </button>
              <button
                type="button"
                className="p-1.5 hover:bg-purple-100 rounded-full transition-colors flex-shrink-0"
              >
                <Smile size={20} className="text-purple-600" />
              </button>
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-transparent px-2 py-1 focus:outline-none text-gray-900 placeholder-gray-400 min-w-0"
              />
              <button
                type="submit"
                disabled={!messageText.trim() || sending}
                className="p-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200 flex-shrink-0"
              >
                <Send size={18} />
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center h-full">
          <div className="text-center">
            <div className="w-32 h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <div className="text-7xl">💬</div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Your Messages
            </h3>
            <p className="text-gray-500 text-base">
              Select a conversation to start chatting
            </p>
          </div>
        </div>
      )}

      {/* New Chat Modal */}
      <NewChatModal
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
      />
    </div>
  );
}
