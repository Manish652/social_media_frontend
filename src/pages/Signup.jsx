import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";
import toast from "react-hot-toast";
import Lottie from "lottie-react";
import animetion from "../assets/animations/Social Networking.json";
import { Eye, EyeOff, Mail, Lock, User, FileText, Camera, Sparkles } from 'lucide-react';

export default function Signup() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    bio: "",
    profilePicture: null
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const navigate = useNavigate();

  // Password Strength Logic
  const passwordStrength = useMemo(() => {
    const pass = formData.password;
    if (!pass) return 0;
    let score = 0;
    if (pass.length > 6) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  }, [formData.password]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profilePicture") {
      const file = files[0];
      if (file) {
        setFormData({ ...formData, profilePicture: file });
        setPreviewUrl(URL.createObjectURL(file)); // Create local preview
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      let profilePictureUrl = null;
      if (formData.profilePicture) {
        setUploadProgress("Uploading your vibe...");
        const result = await uploadToCloudinary(formData.profilePicture, "user_profiles");
        profilePictureUrl = result.url;
      }

      await api.post("/user/register", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        bio: formData.bio,
        profilePictureUrl: profilePictureUrl,
      });

      toast.success("Welcome to the community!");
      navigate("/login", { replace: true });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
      setUploadProgress("");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20">
        
        {/* Left Side - Enhanced Form */}
        <div className="w-full lg:w-auto max-w-md animate-fadeInLeft">
          <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 p-6 sm:p-10 relative overflow-hidden">
            
            {/* Live Profile Preview Circle */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative group cursor-pointer">
                <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100 flex items-center justify-center transition-transform group-hover:scale-105">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <User size={40} className="text-gray-300" />
                  )}
                  <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="text-white" size={20} />
                    <input type="file" name="profilePicture" hidden onChange={handleChange} accept="image/*" />
                  </label>
                </div>
                <div className="absolute -bottom-1 -right-1 bg-indigo-500 text-white p-1.5 rounded-full shadow-md">
                  <Sparkles size={12} />
                </div>
              </div>
              <h2 className="mt-4 text-2xl font-bold text-gray-800">@{formData.username || "username"}</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username Input */}
              <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors" size={18} />
                <input
                  name="username"
                  placeholder="Username"
                  className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Email Input */}
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors" size={18} />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Password Input with Strength Meter */}
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Create Password"
                  className="w-full pl-10 pr-12 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 transition-colors"
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
                {/* Strength Bar */}
                <div className="flex gap-1 mt-2 px-1">
                  {[...Array(4)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                        i < passwordStrength ? (passwordStrength <= 2 ? 'bg-orange-400' : 'bg-green-500') : 'bg-gray-200'
                      }`} 
                    />
                  ))}
                </div>
              </div>

              {/* Bio Input */}
              <div className="relative group">
                <FileText className="absolute left-3 top-3 text-gray-400 group-focus-within:text-purple-500 transition-colors" size={18} />
                <textarea
                  name="bio"
                  placeholder="Tell us your story..."
                  rows="2"
                  className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all resize-none"
                  onChange={handleChange}
                />
              </div>

              {uploadProgress && (
                <div className="text-xs text-center font-medium text-purple-600 animate-pulse">
                  {uploadProgress}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-purple-200 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? "Joining..." : "Get Started"}
              </button>
            </form>

            <p className="text-center text-sm mt-6 text-gray-600">
              Joined us before?{" "}
              <Link to="/login" className="text-purple-600 font-bold hover:underline">
                Login
              </Link>
            </p>
          </div>
        </div>

        {/* Right Side - Animation */}
        <div className="w-full lg:w-auto max-w-2xl animate-fadeInRight hidden lg:block">
          <div className="mb-8 flex justify-center">
            <Lottie animationData={animetion} className="w-full max-w-lg drop-shadow-2xl" />
          </div>
          <div className="text-center">
            <h3 className="text-4xl font-extrabold text-slate-800 mb-4">
              Own Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Vibe</span>
            </h3>
            <p className="text-slate-500 text-lg max-w-md mx-auto">
              The only place where your creativity meets its perfect audience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}