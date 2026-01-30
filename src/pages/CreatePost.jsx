import { Image, X, Send, Smile, Paperclip } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import { getMediaType, uploadToCloudinary } from "../utils/cloudinaryUpload.js";
import Lottie from "lottie-react";
import toast from "react-hot-toast";
import runningCat from "../assets/animations/Running Cat.json";
import PostUploadProgress from "./PostUploadProgress.jsx";

// Assets
import ani from "../assets/animations/hi.json";
import anim from "../assets/animations/postbg.json";

export default function CreatePost() {
  const navigate = useNavigate();
  const [caption, setCaption] = useState("");
  const [media, setMedia] = useState(null);
  const [preview, setPreview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setMedia(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const removeMedia = () => {
    setMedia(null);
    setPreview("");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (submitting || (!caption && !media)) return;
    setSubmitting(true);

    try {
      let mediaUrl = null;
      let mediaType = null;

      if (media) {
        setUploadProgress("Uploading your media...");
        const result = await uploadToCloudinary(media, "social_media_uploads");
        mediaUrl = result.url;
        mediaType = getMediaType(media);
      }
      
      setUploadProgress("Finalizing post...");
      await api.post("/post/create", {
        caption,
        mediaUrl,
        mediaType,
      });

      toast.success("Vibe shared successfully!");
      navigate("/");
    } catch (err) {
      console.error("Create post error:", err);
      toast.error("Failed to post. Try again.");
    } finally {
      setUploadProgress("");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pt-10 pb-24 px-4">
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN - Welcome Animation */}
        <div className="hidden lg:flex lg:col-span-3 flex-col items-center sticky top-10 animate-fadeInLeft">
          <div className="w-full max-w-[250px]">
            <Lottie animationData={ani} loop={true} />
          </div>
          <div className="mt-4 text-center">
            <h3 className="text-2xl font-bold text-slate-800">Hey there!</h3>
            <p className="text-slate-500 mt-2">Ready to share something amazing with the world?</p>
          </div>
        </div>

        {/* MIDDLE COLUMN - The Post Form */}
        <div className="lg:col-span-6 w-full max-w-2xl mx-auto animate-fadeInUp">
          <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                Create Post <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
              </h2>
            </div>

            <form onSubmit={onSubmit} className="space-y-6">
              {/* Caption Area */}
              <div className="relative group">
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows="5"
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-3xl px-6 py-5 focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all resize-none text-lg text-slate-700 placeholder:text-slate-400"
                  placeholder="What's happening? Spark a conversation..."
                />
                <div className="absolute bottom-4 right-6 flex items-center gap-3 text-slate-400">
                  <Smile size={20} className="hover:text-purple-500 cursor-pointer transition-colors" />
                </div>
              </div>

              {/* Media Preview / Upload Dropzone */}
              <div className="relative">
                {preview ? (
                  <div className="relative rounded-3xl overflow-hidden bg-slate-900 shadow-xl group">
                    {media?.type.startsWith("image/") ? (
                      <img src={preview} alt="Preview" className="w-full max-h-[400px] object-contain mx-auto" />
                    ) : (
                      <video src={preview} controls className="w-full max-h-[400px]" />
                    )}
                    <button
                      type="button"
                      onClick={removeMedia}
                      className="absolute top-4 right-4 bg-black/50 hover:bg-red-500 backdrop-blur-md text-white p-2 rounded-full transition-all transform hover:scale-110"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ) : (
                  <label className="group flex flex-col items-center justify-center gap-4 p-12 border-2 border-dashed border-slate-200 rounded-[2rem] cursor-pointer hover:border-purple-400 hover:bg-purple-50/30 transition-all duration-300">
                    <div className="w-16 h-16 bg-white shadow-md rounded-2xl flex items-center justify-center text-purple-500 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                      <Image size={32} />
                    </div>
                    <div className="text-center">
                      <span className="block text-lg font-bold text-slate-700">Add Photos or Video</span>
                      <span className="text-sm text-slate-400">Drag and drop or click to browse</span>
                    </div>
                    <input type="file" accept="image/*,video/*" onChange={onFileChange} className="hidden" />
                  </label>
                )}
              </div>

              {/* Progress Component */}
              <div className="px-2">
                <PostUploadProgress uploadProgress={uploadProgress} runningCat={runningCat} />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || (!caption && !media)}
                className="w-full bg-gradient-to-r from-slate-900 to-slate-800 hover:from-purple-600 hover:to-indigo-600 text-white font-bold py-4 rounded-2xl shadow-xl hover:shadow-purple-200 disabled:opacity-40 disabled:cursor-not-allowed transform active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-lg"
              >
                {submitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Publishing...
                  </div>
                ) : (
                  <>
                    <Send size={20} />
                    Post Vibe
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN - Post BG Animation */}
        <div className="hidden lg:flex lg:col-span-3 flex-col items-center sticky top-10 animate-fadeInRight">
          <div className="w-full">
            <Lottie animationData={anim} loop={true} className="drop-shadow-xl" />
          </div>
          <div className="mt-6 p-6 bg-white/50 backdrop-blur-sm rounded-3xl border border-white/50">
            <p className="text-sm font-medium text-slate-600 italic leading-relaxed">
              "Visual content is 40x more likely to get shared on social media."
            </p>
            <div className="mt-3 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                <Paperclip size={14} />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pro Tip</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}