import React, { useState, useEffect } from "react";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle2,
  LogIn,
  Shield,
  ArrowRight,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { API_BASE_URL } from "../lib/api";
import ForgotPassword from "../components/ForgotPassword";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

<ForgotPassword />;

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [rememberMe, setRememberMe] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { login } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Email validation
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value.trimStart() }));
    setError("");

    // Real-time validation
    const errors = { ...fieldErrors };

    if (name === "email") {
      const emailError = validateEmail(value);
      if (emailError) errors.email = emailError;
      else delete errors.email;
    }

    if (name === "password") {
      if (value.length < 6) {
        errors.password = "Password must be at least 6 characters";
      } else {
        delete errors.password;
      }
    }

    setFieldErrors(errors);
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate all fields
    const errors = {};
    const emailError = validateEmail(form.email);
    if (emailError) errors.email = emailError;

    if (form.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          rememberMe: rememberMe,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Invalid username or password");
        setLoading(false);
        return;
      }

      const { token, user } = data;

      localStorage.setItem("token", token);

      login(user, token, rememberMe);
      setTimeout(() => {
        if (user.role === "admin") {
          setShowSuccess(true);
          navigate("/admin/dashboard");
        } else {
          navigate("/");
        }
      }, 900);
    } catch (err) {
      console.error("Login error:", err);
      setError(
        "Failed to sign in. Please check your credentials and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const idToken = credentialResponse.credential;

      const res = await axios.post(`${API_BASE_URL}/api/auth/google`, {
        tokenId: idToken,
      });

      const { token, user } = res.data;

      localStorage.setItem("token", token);

      login(user, token, true);
      navigate("/home");
    } catch (err) {
      console.error("Google signup error:", err);
      setError("Google signup failed: " + err.message);
    }
  };

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-lime-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-gradient-to-r from-green-400/20 to-lime-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-4 -right-4 w-96 h-96 bg-gradient-to-r from-lime-400/20 to-green-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-600 to-lime-600 rounded-3xl mb-6 shadow-2xl transform hover:scale-105 transition-transform duration-300">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-lime-600 bg-clip-text text-transparent mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 p-8 space-y-6 transform hover:shadow-3xl transition-all duration-300">
          {/* Success Message */}
          {showSuccess && (
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-lime-50 border border-green-200 rounded-2xl text-green-700 animate-fadeIn">
              <CheckCircle2 className="w-6 h-6 text-green-600 animate-bounce" />
              <div>
                <h3 className="font-semibold">Login Successful!</h3>
                <p className="text-sm">Redirecting to your dashboard...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl text-red-700 animate-shake">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-green-500 transition-colors duration-200" />
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                  className={`w-full pl-12 pr-4 py-4 border-2 rounded-2xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-500/20 bg-white/50 backdrop-blur-sm hover:bg-white/70 ${
                    fieldErrors.email
                      ? "border-red-300 bg-red-50/50 focus:border-red-500"
                      : form.email && !fieldErrors.email
                      ? "border-green-300 bg-green-50/50 focus:border-green-500"
                      : "border-gray-200 hover:border-gray-300 focus:border-green-500"
                  }`}
                />
                {form.email && !fieldErrors.email && (
                  <CheckCircle2 className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500 animate-fadeIn" />
                )}
              </div>
              {fieldErrors.email && (
                <p className="text-sm text-red-600 flex items-center gap-1 animate-slideDown">
                  <AlertCircle className="w-4 h-4" />
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-green-500 transition-colors duration-200" />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  className={`w-full pl-12 pr-14 py-4 border-2 rounded-2xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-500/20 bg-white/50 backdrop-blur-sm hover:bg-white/70 ${
                    fieldErrors.password
                      ? "border-red-300 bg-red-50/50 focus:border-red-500"
                      : "border-gray-200 hover:border-gray-300 focus:border-green-500"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-sm text-red-600 flex items-center gap-1 animate-slideDown">
                  <AlertCircle className="w-4 h-4" />
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                />
                <span className="text-sm text-gray-600 group-hover:text-gray-800">
                  Remember me
                </span>
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-green-600 hover:text-green-700 hover:underline font-medium transition-colors duration-200"
              >
                Forgot password?
              </button>
            </div>

            {/* Login Button */}
            <button
              onClick={handleEmailLogin}
              disabled={
                loading ||
                Object.keys(fieldErrors).length > 0 ||
                !form.email ||
                !form.password
              }
              className="w-full bg-gradient-to-r from-green-600 to-lime-600 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 hover:from-green-700 hover:to-lime-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-green-500/30 shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 group"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <LogIn className="w-5 h-5" />
                  Sign In
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
            <span className="text-sm text-gray-500 bg-white/80 px-4 py-1 rounded-full border border-gray-200">
              or
            </span>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent via-gray-300 to-transparent" />
          </div>

          {/* Google Signup */}
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              console.error("Google login failed");
              setError("Google login failed");
            }}
          />

          {/* Signup Link */}
          <p className="text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-green-600 hover:text-green-700 hover:underline font-semibold transition-colors duration-200"
            >
              Create Account
            </Link>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPassword
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        API_BASE_URL={API_BASE_URL}
        setError={setError}
      />

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
