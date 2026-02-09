import { Search, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios.js";

export default function NewChatModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const response = await api.get(`/search?query=${query}`);
      setSearchResults(response.data?.userResult || []);
    } catch (err) {
      console.error("Search failed:", err);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleCreateChat = async (userId) => {
    try {
      setCreating(true);
      const { data } = await api.post("/chat/create", { userId });
      const chatId = data?._id || data?.chat?._id || data?.chatId;
      onClose();
      if (chatId) {
        navigate(`/messages?chatId=${chatId}`);
      } else {
        navigate(`/messages`);
      }
    } catch (err) {
      console.error("Failed to create chat:", err);
      alert(err?.response?.data?.message || "Failed to create chat");
    } finally {
      setCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold">New Message</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-purple-500 transition-colors"
              autoFocus
            />
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-4">
          {searching ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-12 h-12 rounded-full bg-gray-200" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {searchQuery ? (
                <>
                  <p className="text-4xl mb-3">🔍</p>
                  <p className="font-medium">No users found</p>
                  <p className="text-sm mt-1">Try a different search</p>
                </>
              ) : (
                <>
                  <p className="text-4xl mb-3">👋</p>
                  <p className="font-medium">Search for someone</p>
                  <p className="text-sm mt-1">Start typing to the find find users</p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {searchResults.map((user) => (
                <button
                  key={user._id}
                  onClick={() => handleCreateChat(user._id)}
                  disabled={creating}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors disabled:opacity-50"
                >
                  <img
                    src={user.profilePicture || "/user.png"}
                    alt={user.username}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-gray-900">{user.username}</p>
                    {user.fullName && (
                      <p className="text-sm text-gray-500">{user.fullName}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
