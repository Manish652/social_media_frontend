import { Sparkles, Video, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import runningCat from "../assets/animations/Running Cat.json";
import { userAuth } from "../context/AuthContext.jsx";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";
import PostUploadProgress from "./PostUploadProgress.jsx";

export default function CreateReel() {
  const { user } = userAuth();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [videoPreview, setVideoPreview] = useState("");
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [err, setErr] = useState("");

  const handleVideoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideo(file);
      setVideoPreview(URL.createObjectURL(file));
      setErr("");
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!video) return setErr("Please select a video");
    
    try {
      setLoading(true);
      setUploadProgress("Uploading reel...");
      const result = await uploadToCloudinary(video, "reels_uploads");
      await api.post("/reel/create", { videoUrl: result.url, caption });
      navigate("/reels");
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to create reel");
    } finally {
      setLoading(false);
      setUploadProgress("");
    }
  };

  return (
    <div className="min-h-screen bg-base-200 pb-24 lg:pb-8 pt-10 lg:ml-64 xl:mr-80">
      <div className="max-w-2xl mx-auto px-6">
        <div className="w-full mx-auto animate-fadeInRight">
          {/* Main Card: Changed to bg-base-100 to ensure it stands out in Dark Mode */}
          <div className="bg-base-100 p-8 rounded-[2.5rem] shadow-2xl border border-base-300 relative overflow-hidden transition-all">
            
            <div className="mb-8">
              {/* text-base-content is key! It turns white in dark mode and black in light mode */}
              <h2 className="text-3xl font-black text-base-content">New Reel</h2>
              <p className="text-base-content/60 font-medium">Upload your masterpiece</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-6">
              {/* Video Upload Zone */}
              <div className="relative group">
                {videoPreview ? (
                  <div className="relative rounded-3xl overflow-hidden bg-black aspect-[9/16] max-h-[450px] mx-auto shadow-2xl ring-4 ring-base-200">
                    <video src={videoPreview} controls className="w-full h-full object-contain" />
                    <button
                      type="button"
                      onClick={() => { setVideo(null); setVideoPreview(""); }}
                      className="absolute top-4 right-4 bg-black/50 hover:bg-error text-white p-2 rounded-full transition-all border border-white/10"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ) : (
                  /* Dropzone: Using bg-base-200 so it's slightly darker than the card in dark mode */
                  <label className="flex flex-col items-center justify-center w-full aspect-[9/16] max-h-[350px] border-2 border-dashed border-base-300 bg-base-200/50 rounded-3xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group">
                    <div className="flex flex-col items-center text-center p-6">
                      <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Video size={32} />
                      </div>
                      <p className="text-lg font-bold text-base-content">Drop your video here</p>
                      <p className="text-xs text-base-content/40 mt-1 uppercase tracking-widest font-bold">Portrait (9:16) recommended</p>
                    </div>
                    <input type="file" accept="video/*" onChange={handleVideoChange} className="hidden" />
                  </label>
                )}
              </div>

              {/* Caption Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-base-content/50 uppercase tracking-widest ml-1">Caption</label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows="3"
                  className="textarea textarea-bordered w-full bg-base-200 border-base-300 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none text-base-content placeholder-base-content/30"
                  placeholder="Tell your vibe..."
                />
              </div>

              <PostUploadProgress uploadProgress={uploadProgress} runningCat={runningCat} />

              {err && (
                <div className="alert alert-error text-sm rounded-2xl">
                  <span>{err}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !video}
                className="btn btn-primary w-full h-14 rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-2 border-none text-white font-bold text-lg"
              >
                {loading ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Publish Reel
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}