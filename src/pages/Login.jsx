import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import api from "../api/axios.js";
import { userAuth } from "../context/AuthContext.jsx";
import toast from "react-hot-toast";
import Lottie from "lottie-react";
import animetion from "../assets/animations/Social Networking.json";
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Added State
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = userAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const { data } = await api.post("/user/login", formData);
      if (data?.token) {
        login(data.user, data.token);
      }
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
      toast.success("Logged in successfully!");
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Login failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20">
        
        {/* Left Side - Login Form */}
        <div className="w-full lg:w-auto max-w-md animate-fadeInLeft">
          <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 p-8 sm:p-10">
            <div className="mb-8 text-left">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent mb-2">
                Welcome Back
              </h2>
              <p className="text-slate-600 text-lg">
                Login to continue your journey
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2 text-left">
                <label className="text-sm font-medium text-gray-700 ml-1">Email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    placeholder="your@email.com"
                    className="w-full pl-11 pr-4 py-3.5 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2 text-left">
                <label className="text-sm font-medium text-gray-700 ml-1">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    className="w-full pl-11 pr-12 py-3.5 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  
                  {/* Eye Toggle Button */}
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-4  flex items-center text-gray-400 hover:text-indigo-600 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    <div className="flex items-center justify-center w-6 h-6 transition-transform duration-200 active:scale-75">
                      {showPassword ? (
                        <Eye size={20} className="animate-in fade-in zoom-in duration-300" />
                      ) : (
                        <EyeOff size={20} className="animate-in fade-in zoom-in duration-300" />
                      )}
                    </div>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.01] active:scale-[0.99] flex justify-center items-center"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Logging In...
                  </span>
                ) : "Login"}
              </button>
            </form>

            <p className="text-center text-slate-600 mt-6">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>

        {/* Right Side - Animation and Info */}
        <div className="w-full lg:w-auto max-w-2xl animate-fadeInRight">
          <div className="mb-8 flex justify-center">
            <div className="w-full max-w-md lg:max-w-lg">
              <Lottie
                animationData={animetion}
                className="w-full h-auto drop-shadow-2xl"
              />
            </div>
          </div>

          <div className="space-y-6 px-4">
            <h3 className="text-3xl sm:text-4xl font-bold text-slate-800 text-center mb-8">
              Connect. Share. Inspire. <br /> And Be In{" "}
              <span className="relative inline-block mt-2">
                <span className="relative z-10 font-black bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent px-3">
                  Vibe
                </span>
                <span className="absolute bottom-1 left-0 w-full h-3 bg-indigo-100 -z-0 rounded-full opacity-50"></span>
              </span>
            </h3>

            <div className="space-y-5">
              <FeatureCard
                icon="🎯"
                title="Personalized Feed"
                description="Experience content tailored to your interests and preferences"
                delay="0.4s"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description, delay }) {
  return (
    <div
      className="animate-fadeInUp flex items-start gap-4 group"
      style={{ animationDelay: delay }}
    >
      <div className="text-4xl flex-shrink-0 transform group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <div className="flex-1 text-left">
        <h4 className="text-lg font-semibold text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors duration-300">
          {title}
        </h4>
        <p className="text-slate-600 text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}