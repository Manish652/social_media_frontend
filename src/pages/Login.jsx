import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import InputField from "../components/common/InputField.jsx";
import { userAuth } from "../context/AuthContext.jsx";
import { Link } from "react-router-dom";
export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = userAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Login failed";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
<div className="flex justify-center items-center h-screen overflow-y-auto overflow-x-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4">
  <form
    onSubmit={handleSubmit}
    className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-5 sm:p-8 w-full max-w-md border border-white"
  >
    <div className="text-center mb-4">
      <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1">
        Welcome Back
      </h2>
      <p className="text-gray-500 text-xs sm:text-sm">Login to continue</p>
    </div>

    <div className="space-y-3">
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
        placeholder="Enter your password"
        required
      />
    </div>

    <button
      type="submit"
      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2.5 sm:py-3 rounded-xl mt-4 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:scale-95"
      disabled={loading}
    >
      {loading ? "Logging In..." : "Login"}
    </button>

    <p className="text-center text-xs sm:text-sm mt-4 text-gray-600">
      Don't have an account?{" "}
      <Link to="/signup" className="text-purple-600 font-semibold hover:underline">
        Sign Up
      </Link>
    </p>
  </form>
</div>
  );
}
