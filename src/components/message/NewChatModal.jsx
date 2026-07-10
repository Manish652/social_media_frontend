import { Search, UserPlus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios.js";

export default function NewChatModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [searching, setSearching] = useState(false);
  const [creating, setCreating] = useState(false);
  const [loadingSuggested, setLoadingSuggested] = useState(false);

  // Load suggested users when modal opens
  useEffect(() => {
    if (isOpen && suggestedUsers.length === 0) {
      setLoadingSuggested(true);
      api.get("/user/suggested")
        .then(res => setSuggestedUsers((res.data || []).slice(0, 4)))
        .catch(() => {})
        .finally(() => setLoadingSuggested(false));
    }
  }, [isOpen]);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query.trim()) { setSearchResults([]); return; }
    try {
      setSearching(true);
      const res = await api.get(`/search?query=${query}`);
      setSearchResults(res.data?.userResult || []);
    } catch { setSearchResults([]); } finally { setSearching(false); }
  };

  const handleCreateChat = async (userId) => {
    try {
      setCreating(true);
      const { data } = await api.post("/chat/create", { userId });
      const chatId = data?._id || data?.chat?._id || data?.chatId;
      onClose();
      navigate(chatId ? `/messages?chatId=${chatId}` : "/messages");
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to create chat");
    } finally { setCreating(false); }
  };

  const handleClose = () => { setSearchQuery(""); setSearchResults([]); onClose(); };

  if (!isOpen) return null;

  const showSuggested = !searchQuery.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-base-300">
          <div className="flex items-center gap-2">
            <UserPlus size={20} className="text-primary" />
            <h2 className="text-lg font-bold text-base-content">New Message</h2>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-base-200 rounded-full transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-base-300">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Search users..."
              className="w-full pl-9 pr-4 py-2.5 bg-base-200 border border-base-300 rounded-full text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              autoFocus
            />
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-3">
          {showSuggested ? (
            <>
              <p className="text-xs font-semibold text-base-content/50 uppercase tracking-widest mb-3 px-1">Suggested</p>
              {loadingSuggested ? (
                <div className="space-y-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="flex items-center gap-3 p-2 animate-pulse">
                      <div className="w-11 h-11 rounded-full bg-base-200" />
                      <div className="flex-1"><div className="h-4 bg-base-200 rounded w-3/4 mb-1.5" /><div className="h-3 bg-base-200 rounded w-1/2" /></div>
                    </div>
                  ))}
                </div>
              ) : suggestedUsers.length === 0 ? (
                <div className="text-center py-8 text-base-content/50">
                  <p className="text-3xl mb-2">👋</p>
                  <p className="text-sm font-medium">Search for someone to message</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {suggestedUsers.map(u => (
                    <button key={u._id} onClick={() => handleCreateChat(u._id)} disabled={creating}
                      className="w-full flex items-center gap-3 p-2.5 hover:bg-base-200 rounded-xl transition-colors disabled:opacity-50">
                      <img src={u.profilePicture || "/user.png"} alt={u.username} className="w-11 h-11 rounded-full object-cover flex-shrink-0" />
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-sm text-base-content">{u.username}</p>
                        {u.bio && <p className="text-xs text-base-content/60 truncate">{u.bio}</p>}
                      </div>
                      <span className="text-xs text-primary font-semibold px-2 py-1 bg-primary/10 rounded-full">Message</span>
                    </button>
                  ))}
                  <p className="text-center text-xs text-base-content/40 mt-3">Search to find more people</p>
                </div>
              )}
            </>
          ) : searching ? (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="flex items-center gap-3 p-2 animate-pulse">
                  <div className="w-11 h-11 rounded-full bg-base-200" />
                  <div className="flex-1"><div className="h-4 bg-base-200 rounded w-3/4 mb-1.5" /><div className="h-3 bg-base-200 rounded w-1/2" /></div>
                </div>
              ))}
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-10 text-base-content/50">
              <p className="text-3xl mb-2">🔍</p>
              <p className="text-sm font-medium">No users found</p>
              <p className="text-xs mt-1">Try a different search</p>
            </div>
          ) : (
            <div className="space-y-1">
              {searchResults.map(u => (
                <button key={u._id} onClick={() => handleCreateChat(u._id)} disabled={creating}
                  className="w-full flex items-center gap-3 p-2.5 hover:bg-base-200 rounded-xl transition-colors disabled:opacity-50">
                  <img src={u.profilePicture || "/user.png"} alt={u.username} className="w-11 h-11 rounded-full object-cover" />
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-sm text-base-content">{u.username}</p>
                    {u.bio && <p className="text-xs text-base-content/60 truncate">{u.bio}</p>}
                  </div>
                  <span className="text-xs text-primary font-semibold px-2 py-1 bg-primary/10 rounded-full">Message</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
