import { Bell, X, Check, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import api from "../../api/axios.js";
import toast from "react-hot-toast";
import { useTheme } from "../../context/ThemeContext.jsx";
import socket from "../../lib/socket.js";

export default function Notification({ token }) {
  const { theme } = useTheme();
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

  // 🔴 Real-time: listen for new notifications via socket
  useEffect(() => {
    if (!token) return;

    const handleNewNotification = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      const username = notification.fromUser?.username || "Someone";
      const type = notification.type;
      const msg = type === "follow" ? `${username} started following you`
        : type === "like" ? `${username} liked your post`
        : type === "comment" ? `${username} commented on your post`
        : type === "message" ? `${username} sent you a message`
        : `${username} has an update`;
      toast(msg, { icon: "🔔" });
    };

    socket.on("newNotification", handleNewNotification);
    return () => socket.off("newNotification", handleNewNotification);
  }, [token]);

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
    <div className="dropdown dropdown-end">
      {/* Bell Button */}
      <label tabIndex={0} className="btn btn-ghost btn-circle hover:bg-base-300 transition-colors">
        <div className="indicator">
          <Bell size={20} className="text-base-content" />
          {hasUnread && (
            <span className="badge badge-primary badge-sm indicator-item border-none text-[10px] font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
      </label>

      {/* Dropdown Panel */}
      {/* Changed: Added 'border-base-300' and 'bg-base-100' for better dark mode definition */}
      <div tabIndex={0} key={theme} className="dropdown-content z-[50] !bg-base-100 shadow-2xl border border-base-300 w-80 max-h-[32rem] overflow-hidden mt-2">
        <div className="card-body p-0"> {/* Removed default padding to control header/content separately */}

          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-base-300 bg-base-100/50 backdrop-blur-md">
            <div>
              <h3 className="font-black text-sm uppercase tracking-wider text-base-content">Notifications</h3>
              {hasAny && (
                <p className="text-[10px] font-bold text-primary uppercase tracking-tight">
                  {unreadCount > 0 ? `${unreadCount} new updates` : 'Caught up'}
                </p>
              )}
            </div>

            {hasAny && (
              <button
                onClick={clearAll}
                className="btn btn-ghost btn-xs text-error hover:bg-error/10"
              >
                <Trash2 size={12} />
                Clear
              </button>
            )}
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[24rem] bg-base-100">
            {loadingNotif ? (
              <div className="text-center py-12">
                <span className="loading loading-spinner loading-md text-primary"></span>
                <p className="text-xs font-medium text-base-content/50 mt-4 tracking-wide uppercase">Loading vibes...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12 px-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-base-200 rounded-full flex items-center justify-center text-base-content/20">
                  <Bell size={32} />
                </div>
                <p className="text-sm font-bold text-base-content">Quiet in here...</p>
                <p className="text-xs text-base-content/50 mt-1">We'll notify you when the magic happens.</p>
              </div>
            ) : (
              <div className="divide-y divide-base-300">
                {notifications.map((n) => (
                  <div
                    key={n._id}
                    className={`flex gap-3 p-4 hover:bg-base-200 transition-all cursor-default group ${!n.read ? 'bg-primary/5 border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'
                      }`}
                  >
                    {/* Avatar with icon overlay */}
                    <div className="relative flex-shrink-0">
                      <div className="avatar">
                        <div className="w-10 h-10 rounded-full ring-1 ring-base-300">
                          <img
                            src={n?.fromUser?.profilePicture || "/user.png"}
                            alt={n?.fromUser?.username}
                            className="object-cover"
                          />
                        </div>
                      </div>
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-base-100 rounded-full flex items-center justify-center text-[10px] border border-base-300 shadow-sm">
                        {getNotificationIcon(n.type)}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-base-content leading-snug">
                        <span className="font-bold hover:text-primary transition-colors cursor-pointer">
                          {n.fromUser?.username || "Someone"}
                        </span>{" "}
                        <span className="text-base-content/70">
                          {n.type === "follow"
                            ? "started following you"
                            : n.type === "like"
                              ? "liked your post"
                              : n.type === "comment"
                                ? "commented on your post"
                                : "has an update"}
                        </span>
                      </p>
                      <p className="text-[10px] font-semibold text-base-content/40 mt-1 flex items-center gap-2 uppercase tracking-tighter">
                        {getTimeAgo(n.createdAt)}
                        {!n.read && (
                          <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
                        )}
                      </p>
                    </div>

                    {/* Remove Button - Visible on hover */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNotification(n._id);
                      }}
                      className="btn btn-ghost btn-xs btn-circle text-base-content/20 hover:text-error opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Optional Footer */}
          {hasAny && (
            <div className="p-2 border-t border-base-300 bg-base-200/30 text-center">
              <button className="text-[10px] font-bold uppercase tracking-widest text-base-content/40 hover:text-primary transition-colors">
                View All Activity
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}