import { Bell, X, Check, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import api from "../../api/axios.js";
import toast from "react-hot-toast";

export default function Notification({ token }) {
  const [openNotif, setOpenNotif] = useState(false);
  const [loadingNotif, setLoadingNotif] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoadingNotif(true);
      const { data } = await api.get("/notification");
      setNotifications(Array.isArray(data?.notifications) ? data.notifications : []);
    } catch {
      setNotifications([]);
    } finally {
      setLoadingNotif(false);
    }
  }, []);

  const removeNotification = async (id) => {
    try {
      await api.delete(`/notification/${id}`);
      fetchNotifications();
      toast.success("Notification removed");
    } catch {
      toast.error("Failed to remove notification");
    }
  };

  const clearAll = async () => {
    try {
      await Promise.all(
        notifications.map((n) => api.delete(`/notification/${n._id}`))
      );
      fetchNotifications();
      toast.success("All notifications cleared");
    } catch {
      toast.error("Failed to clear notifications");
    }
  };

  const markAllRead = async () => {
    try {
      const unread = notifications.filter((n) => !n.read);
      await Promise.all(
        unread.map((n) => api.put(`/notification/${n._id}/read`))
      );
      fetchNotifications();
    } catch (err) {
      toast.error("Failed to mark all notifications as read");
    }
  };

  useEffect(() => {
    if (token) fetchNotifications();
  }, [token, fetchNotifications]);

  useEffect(() => {
    if (!token) return;
    const id = setInterval(() => {
      if (!openNotif) fetchNotifications();
    }, 30000);
    return () => clearInterval(id);
  }, [token, openNotif, fetchNotifications]);

  useEffect(() => {
    if (openNotif) markAllRead();
  }, [openNotif]);

  const hasUnread = notifications.some((n) => !n.read);
  const hasAny = notifications.length > 0;
  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNotificationIcon = (type) => {
    const icons = {
      follow: "👋",
      like: "❤️",
      comment: "💬",
    };
    return icons[type] || "🔔";
  };

  const getNotificationText = (notification) => {
    const username = notification.fromUser?.username || "Someone";
    switch (notification.type) {
      case "follow":
        return `${username} started following you`;
      case "like":
        return `${username} liked your post`;
      case "comment":
        return `${username} commented on your post`;
      default:
        return `${username} has an update`;
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);

    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setOpenNotif((v) => !v)}
        className="relative p-2.5 rounded-full hover:bg-gradient-to-br from-purple-50 to-pink-50 transition-all duration-300 group"
        aria-label="Notifications"
      >
        <Bell
          size={20}
          className={`transition-all duration-300 ${openNotif
              ? 'text-purple-600 scale-110'
              : 'text-gray-600 group-hover:text-purple-600'
            }`}
          strokeWidth={2}
        />

        {/* Unread Badge */}
        {hasUnread && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] font-bold rounded-full shadow-lg animate-pulse ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {openNotif && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpenNotif(false)}
          />

          {/* Notification Panel */}
          <div className=" fixed sm:absolute
    left-2 right-2 sm:left-auto sm:right-0
    mt-3
    sm:w-[380px]
    max-h-[500px]
    bg-white/95 backdrop-blur-xl
    border border-gray-200/50
    rounded-2xl shadow-2xl
    z-50 overflow-hidden
    animate-in slide-in-from-top-2 duration-200">
            {/* Header */}
            <div className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-5 py-4 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Notifications
                  </h3>
                  {hasAny && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                    </p>
                  )}
                </div>

                {hasAny && (
                  <button
                    onClick={clearAll}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-all duration-200"
                  >
                    <Trash2 size={12} />
                    Clear all
                  </button>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="max-h-[420px] overflow-y-auto">
              {loadingNotif ? (
                <div className="p-8 text-center">
                  <div className="inline-block w-8 h-8 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                  <p className="text-sm text-gray-500 mt-3">Loading...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                    <Bell className="text-purple-600" size={28} />
                  </div>
                  <p className="text-sm font-medium text-gray-900">No notifications yet</p>
                  <p className="text-xs text-gray-500 mt-1">We'll let you know when something arrives</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((n, index) => (
                    <div
                      key={n._id}
                      className={`group px-5 py-4 flex gap-3 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 transition-all duration-200 ${!n.read ? 'bg-purple-50/30' : ''
                        }`}
                      style={{
                        animation: `slideIn 0.3s ease-out ${index * 0.05}s both`
                      }}
                    >
                      {/* Avatar with icon overlay */}
                      <div className="relative flex-shrink-0">
                        <img
                          src={n?.fromUser?.profilePicture || "/user.png"}
                          alt={n?.fromUser?.username}
                          className="w-11 h-11 rounded-full object-cover ring-2 ring-white shadow-sm"
                        />
                        <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center text-sm shadow-md">
                          {getNotificationIcon(n.type)}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 leading-relaxed">
                          <span className="font-semibold">
                            {n.fromUser?.username || "Someone"}
                          </span>{" "}
                          <span className="text-gray-700">
                            {n.type === "follow"
                              ? "started following you"
                              : n.type === "like"
                                ? "liked your post"
                                : n.type === "comment"
                                  ? "commented on your post"
                                  
                                  : "has an update"}
                          </span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                          {getTimeAgo(n.createdAt)}
                          {!n.read && (
                            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                          )}
                        </p>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNotification(n._id);
                        }}
                        className="flex-shrink-0 p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200 opacity-0 group-hover:opacity-100"
                        aria-label="Remove notification"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}