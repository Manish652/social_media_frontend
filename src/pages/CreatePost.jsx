import { Image, Send, Smile, X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import runningCat from "../assets/animations/Running Cat.json";
import { getMediaType, uploadToCloudinary } from "../utils/cloudinaryUpload.js";
import PostUploadProgress from "./PostUploadProgress.jsx";
import InputEmoji from "react-input-emoji";
import VibeInputEditor from "../components/common/VibeInputEditor.jsx";
import TagsInput from "../components/common/TagsInput.jsx";
export default function CreatePost() {
  const navigate = useNavigate();
  const [caption, setCaption] = useState("");
  const [tags, setTags] = useState([]);
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
        tags
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
    <div className="min-h-screen bg-base-200 pt-10 pb-24 lg:pb-8 px-4 lg:ml-64 xl:mr-80 transition-colors duration-300">
      <div className="max-w-[900px] mx-auto grid grid-cols-1 gap-8 items-start">

        {/* The Post Form */}
        <div className="w-full max-w-2xl mx-auto animate-fadeInUp">
          <div className="bg-base-100 rounded-[2.5rem] shadow-2xl border border-base-300 p-6 sm:p-8 transition-colors duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-base-content flex items-center gap-2">
                Create Post
              </h2>
            </div>

            <form onSubmit={onSubmit} className="space-y-6">
              {/* Caption Area */}
              <div className="w-full bg-base-200 border border-base-300 rounded-3xl px-6 py-5 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all resize-none text-lg text-base-content placeholder:text-base-content/40"
              >
                <VibeInputEditor
                  value={caption}
                  onChange={setCaption}
                  placeholder="Write a comment..."
                  height="30px"
                  borderHidden={true} // This removes the box border
                />

              </div>

              {/* Tags Area */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-base-content/50 uppercase tracking-widest ml-1">Tags</label>
                <TagsInput value={tags} onChange={setTags} placeholder="Add tags (e.g., WebDev, React)" />
              </div>

              {/* Media Preview / Upload Dropzone */}
              <div className="relative">
                {preview ? (
                  <div className="relative rounded-3xl overflow-hidden bg-black shadow-xl group border border-base-300">
                    {media?.type.startsWith("image/") ? (
                      <img src={preview} alt="Preview" className="w-full max-h-[400px] object-contain mx-auto" />
                    ) : (
                      <video src={preview} controls className="w-full max-h-[400px]" />
                    )}
                    <button
                      type="button"
                      onClick={removeMedia}
                      className="absolute top-4 right-4 bg-black/50 hover:bg-error backdrop-blur-md text-white p-2 rounded-full transition-all transform hover:scale-110 border border-white/20"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ) : (
                  <label className="group flex flex-col items-center justify-center gap-4 p-12 border-2 border-dashed border-base-300 rounded-[2rem] cursor-pointer hover:border-primary hover:bg-primary/5 transition-all duration-300">
                    <div className="w-16 h-16 bg-base-200 shadow-sm rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 group-hover:rotate-3 transition-transform">
                      <Image size={32} />
                    </div>
                    <div className="text-center">
                      <span className="block text-lg font-bold text-base-content">Add Photos or Video</span>
                      <span className="text-sm text-base-content/50 uppercase tracking-widest font-bold">Drag and drop or browse</span>
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
                className="btn btn-neutral w-full h-16 rounded-2xl shadow-xl hover:bg-primary hover:border-primary text-white border-none disabled:bg-base-300 disabled:text-base-content/30 transform active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-lg group"
              >
                {submitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Publishing...
                  </div>
                ) : (
                  <>
                    <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    Post Vibe
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