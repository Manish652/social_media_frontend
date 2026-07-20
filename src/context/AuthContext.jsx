import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios.js";
import { setToken as setMemoryToken } from "../utils/getToken.js";
import socket from "../lib/socket.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const normalizeIds = (arr) => {
    if (!Array.isArray(arr)) return [];
    const seen = new Set();
    const out = [];
    for (const v of arr) {
      const s = String(v);
      if (!seen.has(s)) { seen.add(s); out.push(s); }
    }
    return out;
  };
  const normalizeUserData = (u) => {
    if (!u) return u;
    return {
      ...u,
      followers: normalizeIds(u.followers),
      following: normalizeIds(u.following),
    };
  };
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Connect socket whenever we have a token
  useEffect(() => {
    if (token) {
      socket.auth = { token };
      if (!socket.connected) {
        socket.connect();
        console.log("[AuthContext] Socket connecting with token...");
      }
    } else {
      if (socket.connected) {
        socket.disconnect();
        console.log("[AuthContext] Socket disconnected (no token)");
      }
    }
  }, [token]);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data } = await api.get("/user/refresh");
        setMemoryToken(data.token);
        setToken(data.token);

        if (data.user) {
          const normalized = normalizeUserData(data.user);
          setUser(normalized);
          try { localStorage.setItem("user", JSON.stringify(normalized)); } catch { }
        } else {
          // Fallback to localStorage if the refresh didn't send user object for some reason
          const savedUser = localStorage.getItem("user");
          if (savedUser) {
            const parsed = JSON.parse(savedUser);
            const normalized = normalizeUserData(parsed);
            setUser(normalized);
            try { localStorage.setItem("user", JSON.stringify(normalized)); } catch { }
          }
        }
      } catch (err) {
        // Not authenticated
        setMemoryToken(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };
    initializeAuth();
  }, []);

  const login = (userData, userToken) => {
    const normalized = normalizeUserData(userData);
    setUser(normalized);
    setToken(userToken);
    setMemoryToken(userToken);
    localStorage.setItem("user", JSON.stringify(normalized));
  };

  const logout = async () => {
    try {
      await api.post("/user/logout");
    } catch (err) {
      console.error("Logout failed on server", err);
    }
    setUser(null);
    setToken(null);
    setMemoryToken(null);
    localStorage.removeItem("user");
    toast.success("Logged out successfully!");
  };

  const updateFollowing = (targetUserId, action) => {
    setUser((prev) => {
      if (!prev?._id) return prev;
      const tid = String(targetUserId);
      let following = Array.isArray(prev.following) ? prev.following.map(String) : [];
      if (action === "follow") {
        if (!following.includes(tid)) following.push(tid);
      } else if (action === "unfollow") {
        following = following.filter((id) => id !== tid);
      }
      const next = { ...prev, following };
      try {
        localStorage.setItem("user", JSON.stringify(next));
      } catch { }
      return next;
    });
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, loading, updateFollowing }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const userAuth = () => useContext(AuthContext);
