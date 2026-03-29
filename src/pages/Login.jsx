import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import api from "../api/axios.js";
import { userAuth } from "../context/AuthContext.jsx";
import toast from "react-hot-toast";
import Lottie from "lottie-react";
import animetion from "../assets/animations/Social Networking.json";
import { Eye, EyeOff, Mail, Lock, Sparkles, Target, Users, ArrowRight } from 'lucide-react';

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = userAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const { data } = await api.post("/user/login", formData);
      if (data?.token) login(data.user, data.token);
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
      toast.success("Welcome back!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    // Changed: overflow-hidden and h-screen to ensure no scrolling on desktop
    <div className="h-screen w-full flex bg-base-100 overflow-hidden">
      
      {/* Left Side: Form Section (Immersive) */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 md:p-20 relative bg-base-100">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="w-full max-w-md z-10">
          <div className="mb-12">
            <h2 className="text-6xl font-black tracking-tighter mb-4">
              Log <span className="text-primary">In.</span>
            </h2>
            <p className="text-base-content/60 text-xl font-medium">
              The Vibe community is waiting for you.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-bold uppercase tracking-widest text-[10px] opacity-60">Email Address</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-base-content/30 group-focus-within:text-primary transition-colors">
                  <Mail size={22} />
                </div>
                <input
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  className="input input-bordered w-full h-14 pl-12 bg-base-200/40 border-base-content/10 focus:border-primary text-lg transition-all"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-bold uppercase tracking-widest text-[10px] opacity-60">Password</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-base-content/30 group-focus-within:text-primary transition-colors">
                  <Lock size={22} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  className="input input-bordered w-full h-14 pl-12 pr-12 bg-base-200/40 border-base-content/10 focus:border-primary text-lg transition-all"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-base-content/30 hover:text-primary transition-colors"
                >
                  {showPassword ? <Eye size={22} /> : <EyeOff size={22} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full h-16 text-xl font-bold shadow-2xl shadow-primary/30 hover:translate-y-[-2px] transition-all active:scale-95"
            >
              {loading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                <span className="flex items-center gap-3">
                  Get Started <ArrowRight size={24} />
                </span>
              )}
            </button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-base-content/50 text-lg">
              New here?{" "}
              <Link to="/signup" className="text-primary font-bold hover:underline underline-offset-8 decoration-2">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side: High-Impact Visual Section */}
      <div className="hidden lg:flex w-1/2 h-full bg-base-200 relative items-center justify-center p-12 overflow-hidden">
        {/* Animated Orbs for Depth */}
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-secondary/10 rounded-full blur-[100px] animate-pulse delay-1000"></div>

        <div className="max-w-xl w-full flex flex-col items-center z-10">
          <div className="w-full drop-shadow-[0_35px_35px_rgba(0,0,0,0.15)] mb-10">
            <Lottie
              animationData={animetion}
              className="w-full h-auto transform scale-110"
            />
          </div>

          <div className="text-center mb-12">
            <h3 className="text-5xl font-black mb-4">
              Be in the <span className="italic font-serif text-primary relative">Vibe<span className="absolute bottom-2 left-0 w-full h-1 bg-primary/20 -z-10"></span></span>
            </h3>
            <p className="text-base-content/60 text-lg max-w-xs mx-auto">
              Join the next generation of social connectivity.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-4 w-full px-10">
            <FeatureRow 
              icon={<Target className="text-primary" size={24} />} 
              title="Tailored Experience" 
              desc="Feeds designed around your unique style." 
            />
                      
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureRow({ icon, title, desc }) {
  return (
    <div className="flex gap-5 items-center bg-base-100/40 backdrop-blur-sm p-5 rounded-3xl border border-white/10 hover:bg-base-100 transition-all duration-500 group">
      <div className="p-4 bg-base-100 rounded-2xl shadow-lg group-hover:bg-primary group-hover:text-primary-content transition-all duration-500">
        {icon}
      </div>
      <div>
        <h4 className="font-extrabold text-base-content text-lg">{title}</h4>
        <p className="text-sm text-base-content/50 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}