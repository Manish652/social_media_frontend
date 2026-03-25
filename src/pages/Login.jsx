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
    <div className="min-h-screen w-full flex items-center justify-center bg-base-200 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20">

        <div className="w-full lg:w-auto max-w-md">
          <div className="card bg-base-100 shadow-xl border border-base-200">
            <div className="card-body p-8 sm:p-10">
              <div className="mb-8 text-left">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                  Welcome Back
                </h2>
                <p className="text-base-content/70 text-lg">
                  Login to continue your journey
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Email</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      name="email"
                      placeholder="your@email.com"
                      className="input input-bordered pl-11 w-full"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Password</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock size={18} />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Enter your password"
                      className="input input-bordered pl-11 pr-12 w-full"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />

                    {/* Eye Toggle Button */}
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <Eye size={20} />
                      ) : (
                        <EyeOff size={20} />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="loading loading-spinner loading-sm"></span>
                      Logging In...
                    </span>
                  ) : "Login"}
                </button>
              </form>

              <p className="text-center text-base-content/70 mt-6">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="text-primary hover:text-primary-focus font-semibold transition-colors"
                >
                  Sign Up
                </Link>
              </p>
            </div>
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
            <h3 className="text-3xl sm:text-4xl font-bold text-base-content text-center mb-8">
              Connect. Share. Inspire. <br /> And Be In{" "}
              <span className="relative inline-block mt-2">
                <span className="relative z-10 font-black bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent px-3">
                  Vibe
                </span>
                <span className="absolute bottom-1 left-0 w-full h-3 bg-base-200 -z-0 rounded-full opacity-50"></span>
              </span>
            </h3>

            <div className="space-y-5">
              <FeatureCard
                icon="🎯"
                title="Personalized Feed"
                description="Experience content tailored to your interests and preferences"
                delay="0.4s"
              />
              <FeatureCard
                icon="👥"
                title="Connect with Friends"
                description="Build meaningful connections with people who share your interests"
                delay="0.6s"
              />
              <FeatureCard
                icon="✨"
                title="Creative Expression"
                description="Share your stories, photos, and moments with the world"
                delay="0.8s"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

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
          <h4 className="text-lg font-semibold text-base-content mb-1 group-hover:text-primary transition-colors duration-300">
            {title}
          </h4>
          <p className="text-base-content/70 text-sm leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    );
  }
}