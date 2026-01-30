import { Upload, Video, Sparkles, Wand2, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import { userAuth } from "../context/AuthContext.jsx";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";
import Lottie from "lottie-react";
import runningCat from "../assets/animations/Running Cat.json";
import PostUploadProgress from "./PostUploadProgress.jsx";
import animatin1 from "../assets/animations/Influencer photoshoot.json";

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
    setErr("");
    if (!video) {
      setErr("Please select a video");
      return;
    }
    try {
      setLoading(true);
      setUploadProgress("Uploading reel...");
      const result = await uploadToCloudinary(video, "reels_uploads");
      const videoUrl = result.url;
      setUploadProgress("Creating reel...");
      await api.post("/reel/create", { videoUrl, caption });
      setUploadProgress("");
      navigate("/reels");
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to create reel");
      setUploadProgress("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[100%] bg-gradient-to-br from-slate-50 to-indigo-50/30 pb-20 pt-10">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Side: Engaging Content & Animation */}
        <div className="hidden lg:flex flex-col space-y-8 animate-fadeInLeft">
          <div className="space-y-4">
            <h1 className="text-5xl font-black text-slate-800 leading-tight">
              Share Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500">Story</span> <br /> 
              in 60 Seconds.
            </h1>
            <p className="text-lg text-slate-600 max-w-md">
              Reels are the best way to reach new audiences. High quality lighting and catchy captions get 2x more engagement!
            </p>
          </div>

          <div className="relative w-full max-w-md">
            {/* Lottie Animation */}
            <Lottie animationData={animatin1} className="w-full drop-shadow-2xl" />
            
            {/* Floating Engagement Badges */}
            <div className="absolute -top-4 -right-4 bg-white p-4 rounded-2xl shadow-xl animate-bounce duration-[3000ms] flex items-center gap-3 border border-purple-100">
              <div className="bg-purple-100 p-2 rounded-lg text-purple-600"><Sparkles size={20} /></div>
              <span className="text-sm font-bold text-slate-700">Go Viral</span>
            </div>
            
       
          </div>
        </div>

        {/* Right Side: Upload Form */}
        <div className="w-full max-w-xl mx-auto lg:mx-0 animate-fadeInRight">
          <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-white relative overflow-hidden">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-800">New Reel</h2>
              <p className="text-slate-500">Upload your masterpiece</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-6">
              {/* Video Upload Zone */}
              <div className="relative group">
                {videoPreview ? (
                  <div className="relative rounded-3xl overflow-hidden bg-black aspect-[9/16] max-h-[450px] mx-auto shadow-2xl ring-4 ring-white">
                    <video src={videoPreview} controls className="w-full h-full object-contain" />
                    <button
                      type="button"
                      onClick={() => { setVideo(null); setVideoPreview(""); }}
                      className="absolute top-4 right-4 bg-white/20 backdrop-blur-md hover:bg-red-500 text-white p-2 rounded-full transition-all"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full aspect-[9/16] max-h-[300px] border-2 border-dashed border-slate-300 rounded-3xl cursor-pointer hover:border-purple-500 hover:bg-purple-50/50 transition-all duration-300 group">
                    <div className="flex flex-col items-center text-center p-6">
                      <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Video size={32} />
                      </div>
                      <p className="text-lg font-bold text-slate-700">Drop your video</p>
                      <p className="text-sm text-slate-500 mt-1">Portrait (9:16) recommended</p>
                    </div>
                    <input type="file" accept="video/*" onChange={handleVideoChange} className="hidden" />
                  </label>
                )}
              </div>

              {/* Caption Input */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Caption</label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows="3"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-none text-slate-700"
                  placeholder="Tell your vibe..."
                />
              </div>

              {/* Progress Component */}
              <PostUploadProgress uploadProgress={uploadProgress} runningCat={runningCat} />

              {/* Error Message */}
              {err && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-2xl animate-shake">
                  {err}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !video}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-purple-200 disabled:opacity-50 disabled:scale-100 transform active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                   <span className="flex items-center gap-2">
                     <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                     {uploadProgress || "Finalizing..."}
                   </span>
                ) : (
                  <>
                    <Sparkles size={18} />
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