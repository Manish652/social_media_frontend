import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import InputField from "../components/common/InputField.jsx";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
export default function Signup() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    bio: "",
    profilePicture: null
  });
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profilePicture") {
      setFormData({ ...formData, profilePicture: files && files[0] ? files[0] : null });
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

      // Upload profile picture directly to Cloudinary (bypasses server network)
      if (formData.profilePicture) {
        setUploadProgress("Uploading profile picture...");
        const result = await uploadToCloudinary(formData.profilePicture, "user_profiles");
        profilePictureUrl = result.url;
        setUploadProgress("Upload complete! Creating account...");
      }

      // Send registration data to backend (only URL, not file)
      await api.post("/user/register", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        bio: formData.bio,
        profilePictureUrl: profilePictureUrl,
      });

      setUploadProgress("");
      toast.success("Account created successfully!");
      // Redirect to login page after successful registration
      navigate("/login", { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Signup failed";
      toast.error(msg);
      setUploadProgress("");
    } finally {
      setLoading(false);
    }
  };

  return (
   <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 py-8">
  <form
    onSubmit={handleSubmit}
    className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-5 sm:p-8 w-full max-w-md border border-white"
  >
    <div className="text-center mb-5">
      <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1">
        Create Account
      </h2>
      <p className="text-gray-500 text-xs sm:text-sm">Join us and start sharing</p>
    </div>

    <div className="space-y-3.5">
      <InputField
        label="Username"
        name="username"
        value={formData.username}
        onChange={handleChange}
        placeholder="Choose a username"
        required
      />
      <InputField
        label="Email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="your@email.com"
        required
      />
      <InputField
        label="Password"
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="Create a strong password"
        required
      />
      <InputField
        label="Bio (Optional)"
        name="bio"
        value={formData.bio}
        onChange={handleChange}
        placeholder="Tell us about yourself"
      />
      <InputField
        label="Profile Picture (Optional)"
        name="profilePicture"
        type="file"
        accept="image/*"
        onChange={handleChange}
      />
    </div>

    {uploadProgress && (
      <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl mt-3.5 border border-purple-100">
        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin flex-shrink-0" />
        <span className="text-xs sm:text-sm text-purple-700 font-medium">{uploadProgress}</span>
      </div>
    )}

    <button
      type="submit"
      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2.5 sm:py-3 rounded-xl mt-5 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:scale-95"
      disabled={loading}
    >
      {loading ? "Creating account..." : "Sign Up"}
    </button>

    <p className="text-center text-xs sm:text-sm mt-4 text-gray-600">
      Already have an account?{" "}
      <Link to="/login" className="text-purple-600 font-semibold hover:underline">
        Login
      </Link>
    </p>
  </form>
</div>
  );
}
