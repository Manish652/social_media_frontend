import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";
import toast from "react-hot-toast";
import Lottie from "lottie-react";
import animetion from "../assets/animations/Social Networking.json";
import { Eye, EyeOff, Mail, Lock, User, FileText, Camera, Sparkles, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';

export default function Signup() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    bio: "",
    profilePicture: null
  });
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [uploadProgress, setUploadProgress] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const navigate = useNavigate();

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
        setPreviewUrl(URL.createObjectURL(file));
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSendOtp = async (e, isResend = false) => {
    if (e?.preventDefault) e.preventDefault();
    if (loading) return;
    setLoading(true);
    setLoadingMsg("Sending OTP to your email… this may take up to 15 seconds");
    try {
      await api.post("/user/send-otp", { email: formData.email });
      toast.success("OTP sent! Check your inbox (and spam folder) 📧");
      setStep(2);
      // Start 60s cooldown for resend
      setResendCooldown(60);
      const interval = setInterval(() => {
        setResendCooldown(prev => { if (prev <= 1) { clearInterval(interval); return 0; } return prev - 1; });
      }, 1000);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to send OTP. Check your email address and try again.");
    } finally {
      setLoading(false);
      setLoadingMsg("");
    }
  };

  const handleRegister = async (e) => {
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
        otp: otp,
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
    <div className="h-screen w-full flex bg-base-100 overflow-hidden">
      
      {/* Left Side: Form Section */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 md:p-16 relative bg-base-100">
        <div className="absolute top-0 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="w-full max-w-md z-10 py-10">
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-5xl font-black tracking-tighter mb-3">
              Join the <span className="text-primary">Vibe.</span>
            </h2>
            <p className="text-base-content/60 text-lg font-medium">
              Create your account to start sharing.
            </p>
          </div>

          {/* Profile Picture Upload - Centered */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative group cursor-pointer">
              <div className="w-28 h-28 rounded-3xl rotate-3 group-hover:rotate-0 transition-all duration-500 overflow-hidden bg-base-200 border-4 border-base-100 shadow-2xl flex items-center justify-center">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover -rotate-3 group-hover:rotate-0 transition-transform duration-500" />
                ) : (
                  <User size={48} className="text-base-content/20" />
                )}
                <label className="absolute inset-0 bg-primary/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm">
                  <Camera className="text-white" size={24} />
                  <input type="file" name="profilePicture" hidden onChange={handleChange} accept="image/*" />
                </label>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-primary text-white p-2 rounded-xl shadow-lg animate-bounce">
                <Sparkles size={16} />
              </div>
            </div>
            {formData.username && <p className="mt-3 font-bold text-primary">@{formData.username}</p>}
          </div>

          <form onSubmit={step === 1 ? handleSendOtp : handleRegister} className="space-y-4">
            {step === 1 ? (
              <div className="space-y-4 animate-fadeInLeft">
                <InputField icon={<User size={20}/>} label="Username">
                   <input name="username" placeholder="vibe_creator" className="input rounded-4xl  input-bordered w-full pl-12 bg-base-200/40 border-base-content/10 focus:border-primary transition-all" onChange={handleChange} required />
                </InputField>

                <InputField icon={<Mail size={20}/>} label="Email">
                   <input type="email" name="email" placeholder="you@vibe.com" className="input rounded-4xl  input-bordered w-full pl-12 bg-base-200/40 border-base-content/10 focus:border-primary transition-all" onChange={handleChange} required />
                </InputField>

                <InputField icon={<Lock className="absolute left-4 top-4" size={20}/>} label="Password">
                   <div className="relative">
                     <input type={showPassword ? "text" : "password"} name="password" placeholder="••••••••" className="input rounded-4xl h-13 input-bordered w-full pl-12 pr-12 bg-base-200/40 border-base-content/10 focus:border-primary transition-all" onChange={handleChange} required />
                     <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-base-content/30 hover:text-primary transition-colors">
                       {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                     </button>
                   </div>
                   <div className="flex gap-1 mt-2 px-1">
                     {[...Array(4)].map((_, i) => (
                       <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i < passwordStrength ? (passwordStrength <= 2 ? 'bg-warning' : 'bg-success') : 'bg-base-200'}`} />
                     ))}
                   </div>
                </InputField>

                <InputField icon={<FileText size={20}/>} label="Bio">
                   <textarea name="bio" placeholder="Tell the world your vibe..." rows="2" className="textarea rounded-2xl textarea-bordered w-full pl-12 bg-base-200/40 border-base-content/10 focus:border-primary transition-all resize-none" onChange={handleChange} />
                </InputField>
              </div>
            ) : (
              <div className="space-y-5 animate-fadeInRight">
                <div className="bg-primary/5 p-5 rounded-3xl border border-primary/10 text-center">
                  <ShieldCheck size={44} className="mx-auto text-primary mb-3" />
                  <h4 className="text-xl font-bold">Verify your Email</h4>
                  <p className="text-sm text-base-content/60 mt-2">We sent a 6-digit code to<br/><span className="text-primary font-bold">{formData.email}</span></p>
                  <p className="text-xs text-base-content/40 mt-1">Not in inbox? Check your <span className="font-semibold">spam/junk</span> folder</p>
                </div>
                
                <InputField icon={<Lock size={20}/>} label="Enter OTP">
                  <input type="text" placeholder="000000" className="input rounded-4xl input-bordered w-full pl-12 text-center tracking-[1em] text-xl font-bold bg-base-200/40 border-base-content/10 focus:border-primary transition-all" value={otp} onChange={(e) => setOtp(e.target.value)} required maxLength={6} />
                </InputField>

                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setStep(1)} className="btn btn-ghost flex-1 rounded-4xl gap-2 text-base-content/50 hover:bg-base-200">
                    <ArrowLeft size={16} /> Edit
                  </button>
                  <button type="button" disabled={resendCooldown > 0 || loading} onClick={(e) => handleSendOtp(e, true)}
                    className="btn btn-outline flex-1 rounded-4xl gap-2 text-primary border-primary/30 hover:bg-primary/5 disabled:opacity-40">
                    {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : "Resend OTP"}
                  </button>
                </div>
              </div>
            )}

            {(uploadProgress || loadingMsg) && (
              <div className="flex items-center justify-center gap-2 text-primary font-bold animate-pulse text-sm text-center">
                <span className="loading loading-dots loading-xs"></span>
                <span>{uploadProgress || loadingMsg}</span>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn btn-primary rounded-4xl w-full h-16 text-xl font-bold shadow-2xl shadow-primary/30 hover:translate-y-[-2px] transition-all active:scale-95">
              {loading ? <span className="loading loading-spinner"></span> : (
                <span className="flex items-center gap-3">
                  {step === 1 ? "Get OTP" : "Finalize Signup"} <ArrowRight size={24} />
                </span>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-base-content/50 text-lg">
              Joined before?{" "}
              <Link to="/login" className="text-primary font-bold hover:underline underline-offset-8 decoration-2">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side: Visual Section */}
      <div className="hidden lg:flex w-1/2 h-full bg-base-200 relative items-center justify-center p-12 overflow-hidden">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-secondary/10 rounded-full blur-[100px] animate-pulse delay-700"></div>

        <div className="max-w-xl w-full flex flex-col items-center z-10">
          <div className="w-full drop-shadow-[0_35px_35px_rgba(0,0,0,0.15)] mb-10">
            <Lottie animationData={animetion} className="w-full h-auto transform scale-110" />
          </div>

          <div className="text-center">
            <h3 className="text-5xl font-black mb-6">
              Own Your <span className="italic font-serif text-primary">Vibe</span>
            </h3>
            <p className="text-base-content/60 text-xl max-w-sm mx-auto leading-relaxed">
              The only place where your creativity meets its perfect audience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Component for consistency
function InputField({ icon, label, children }) {
  return (
    <div className="form-control w-full">
      <label className="label">
        <span className="label-text font-bold uppercase tracking-widest text-[10px] opacity-60">{label}</span>
      </label>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-base-content/30 group-focus-within:text-primary transition-colors">
          {icon}
        </div>
        {children}
      </div>
    </div>
  );
}