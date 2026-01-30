import { Image, Search as SearchIcon, TrendingUp, Users, ArrowRight, Grid, Bookmark } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";

export default function Search() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'people', 'posts'
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [randomPosts, setRandomPosts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRandomPosts();
  }, []);

  const fetchRandomPosts = async () => {
    try {
      const { data } = await api.get("/post");
      const shuffled = (data.posts || []).sort(() => 0.5 - Math.random());
      setRandomPosts(shuffled.slice(0, 15));
    } catch (err) {
      console.error("Failed to fetch random posts:", err);
    }
  };

  const onSearch = async (e) => {
    e?.preventDefault?.();
    if (!q.trim()) return;
    setError("");
    setLoading(true);
    try {
      const { data } = await api.get("/search/search", { params: { query: q.trim() } });
      setUsers(Array.isArray(data?.userResult) ? data.userResult : []);
      setPosts(Array.isArray(data?.postResult) ? data.postResult : []);
    } catch (err) {
      setError("Something went wrong with the search.");
    } finally {
      setLoading(false);
    }
  };

  const hasSearched = q.trim() !== "" && (users.length > 0 || posts.length > 0 || loading);

  return (
    <div className="min-h-screen pb-28 bg-[#fafafa]">
      {/* Decorative Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-purple-200/30 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-pink-200/20 blur-[100px] rounded-full" />
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-10 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col items-center mb-10 animate-fadeInDown">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">Vibe</span>
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Find your friends and inspiration</p>
        </div>

        {/* Floating Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <form
            onSubmit={onSearch}
            className="group relative bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white overflow-hidden focus-within:ring-4 focus-within:ring-purple-500/10 transition-all duration-500"
          >
            <div className="flex items-center gap-3 px-6 py-5">
              <SearchIcon size={22} className="text-slate-400 group-focus-within:text-purple-500 transition-colors" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search usernames, names, or vibes..."
                className="flex-1 outline-none text-lg bg-transparent placeholder-slate-400 text-slate-700 font-medium"
              />
              {q && (
                <button 
                  type="submit" 
                  disabled={loading}
                  className="bg-slate-900 text-white p-3 rounded-2xl hover:bg-purple-600 transition-all shadow-lg active:scale-90"
                >
                  <ArrowRight size={20} />
                </button>
              )}
            </div>
          </form>

          {/* Quick Tags */}
          {!hasSearched && (
             <div className="flex flex-wrap justify-center gap-2 mt-6 animate-fadeInUp">
                {['#photography', '#art', '#nature', '#travel'].map(tag => (
                  <button key={tag} onClick={() => {setQ(tag); onSearch();}} className="px-4 py-1.5 bg-white border border-slate-100 rounded-full text-xs font-bold text-slate-500 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-100 transition-all">
                    {tag}
                  </button>
                ))}
             </div>
          )}
        </div>

        {/* Tab Switcher (Only visible after search) */}
        {hasSearched && !loading && (
          <div className="flex justify-center gap-4 mb-8">
            {['all', 'people', 'posts'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-full text-sm font-bold capitalize transition-all ${
                  activeTab === tab 
                  ? 'bg-slate-900 text-white shadow-xl scale-105' 
                  : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin mb-4" />
            <p className="text-slate-500 font-bold animate-pulse">Searching the universe...</p>
          </div>
        )}

        {/* Results / Explore Grid */}
        <div className="space-y-12">
          
          {/* USERS SECTION */}
          {(activeTab === 'all' || activeTab === 'people') && users.length > 0 && (
            <section className="animate-fadeInUp">
              <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Users size={20} className="text-purple-500" /> People
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {users.map(u => (
                  <Link 
                    key={u._id} 
                    to={`/u/${u._id}`}
                    className="flex items-center gap-4 p-4 bg-white/60 backdrop-blur-sm border border-white rounded-[1.5rem] hover:bg-white hover:shadow-xl hover:shadow-purple-500/5 transition-all group"
                  >
                    <img 
                      src={u.profilePic || u.profilePicture || "/user.png"} 
                      className="w-14 h-14 rounded-full object-cover ring-2 ring-purple-100 group-hover:ring-purple-400 transition-all"
                    />
                    <div className="flex-1">
                      <p className="font-bold text-slate-800 tracking-tight">@{u.username}</p>
                      <p className="text-xs text-slate-500 font-medium">{u.fullName || "Member"}</p>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-xl text-slate-400 group-hover:bg-purple-600 group-hover:text-white transition-all">
                      <ArrowRight size={18} />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* POSTS SECTION (Grid) */}
          {(activeTab === 'all' || activeTab === 'posts') && (
            <section className="animate-fadeInUp delay-100">
              <div className="flex items-center justify-between mb-6 px-2">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  {hasSearched ? <Grid size={20} className="text-pink-500" /> : <TrendingUp size={20} className="text-pink-500" />}
                  {hasSearched ? "Posts" : "Discover Vibes"}
                </h3>
              </div>
              
              <div className="columns-2 sm:columns-3 gap-4 space-y-4">
                {(hasSearched ? posts : randomPosts).map((post) => (
                  <Link
                    key={post._id}
                    to={`/post/${post._id}`}
                    className="relative block break-inside-avoid rounded-3xl overflow-hidden group shadow-sm hover:shadow-2xl transition-all duration-500"
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60 opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                    
                    {post.image || post.mediaUrl ? (
                      <img
                        src={post.image || post.mediaUrl}
                        alt="post"
                        className="w-full h-auto object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-40 bg-gradient-to-br from-purple-500 to-pink-500 p-6 flex items-center justify-center">
                         <p className="text-white font-bold text-center italic">"{post.caption}"</p>
                      </div>
                    )}

                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all z-20">
                       <p className="text-white text-xs font-bold line-clamp-1">{post.caption || "View Vibe"}</p>
                       <div className="flex items-center gap-2 mt-2">
                          <div className="w-5 h-5 rounded-full bg-white/20 backdrop-blur-md border border-white/30" />
                          <span className="text-[10px] text-white/80 font-medium">@{post.user?.username || 'user'}</span>
                       </div>
                    </div>
                  </Link>
                ))}
              </div>

              {hasSearched && posts.length === 0 && !loading && (
                <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                  <Bookmark className="mx-auto text-slate-200 mb-4" size={48} />
                  <p className="text-slate-400 font-bold">No posts found for this vibe.</p>
                </div>
              )}
            </section>
          )}

        </div>
      </div>
    </div>
  );
}