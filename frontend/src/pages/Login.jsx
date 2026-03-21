import React, { useState, useEffect } from "react";
import {
  Eye, EyeOff, Mail, Lock, AlertCircle,
  CheckCircle2, LogIn, Shield, ArrowRight,
} from "lucide-react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { API_BASE_URL } from "../lib/api";
import ForgotPassword from "../components/ForgotPassword";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

export default function Login() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login } = useAuth();
  const from      = location.state?.from?.pathname || "/";

  const [form, setForm]                   = useState({ email: "", password: "" });
  const [error, setError]                 = useState("");
  const [loading, setLoading]             = useState(false);
  const [showPassword, setShowPassword]   = useState(false);
  const [fieldErrors, setFieldErrors]     = useState({});
  const [showSuccess, setShowSuccess]     = useState(false);
  const [mounted, setMounted]             = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? "" : "Please enter a valid email address";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value.trimStart() }));
    setError("");

    const errors = { ...fieldErrors };
    if (name === "email") {
      const emailError = validateEmail(value);
      emailError ? (errors.email = emailError) : delete errors.email;
    }
    if (name === "password") {
      value.length < 6
        ? (errors.password = "Password must be at least 6 characters")
        : delete errors.password;
    }
    setFieldErrors(errors);
  };

  const redirectByRole = (user) => {
    if (user.role === "admin") {
      navigate("/admin/dashboard", { replace: true });
    } else if (["vendor", "bnbHost", "contractor"].includes(user.role) && user.vendorStatus === "approved") {
      navigate("/vendor/dashboard", { replace: true });
    } else if (["vendor", "bnbHost", "contractor"].includes(user.role) && user.vendorStatus === "pending") {
      navigate("/vendor/apply", { replace: true });
    } else {
      navigate(from, { replace: true });
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const errors = {};
    const emailError = validateEmail(form.email);
    if (emailError) errors.email = emailError;
    if (form.password.length < 6) errors.password = "Password must be at least 6 characters";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setLoading(false);
      return;
    }

    try {
      const res  = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Invalid email or password");
        setLoading(false);
        return;
      }

      login(data.user, data.token);
      setShowSuccess(true);
      setTimeout(() => redirectByRole(data.user), 900);
    } catch (err) {
      console.error("Login error:", err);
      setError("Failed to sign in. Please check your credentials and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/google`, {
        tokenId: credentialResponse.credential,
      });
      login(res.data.user, res.data.token);
      redirectByRole(res.data.user);
    } catch (err) {
      console.error("Google login error:", err);
      setError("Google sign-in failed. Please try again.");
    }
  };

  // Input border state helper
  const inputBorder = (field) => {
    if (fieldErrors[field]) return "border-brand-400 focus:border-brand-600";
    if (form[field] && !fieldErrors[field]) return "border-brand-300 focus:border-brand-600";
    return "border-brand-200 hover:border-brand-300 focus:border-brand-500";
  };

  if (!mounted) return null;

  return (
    <>
      {/* JSON-LD for SEO */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Sign In — Hillersons Designs",
        "description": "Sign in to your Hillersons Designs account to access free architectural house plans, save favourites, and manage your design requests.",
        "url": "https://hillersons-architecture-site.vercel.app/login",
      })}} />

      <div className="min-h-screen bg-brand-50 flex items-center justify-center p-4 relative overflow-hidden">

        {/* Background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute -top-4 -left-4 w-72 h-72 bg-brand-200 rounded-full blur-3xl opacity-30 animate-pulse" />
          <div className="absolute -bottom-4 -right-4 w-96 h-96 bg-brand-100 rounded-full blur-3xl opacity-40 animate-pulse" />
        </div>

        <main className="w-full max-w-md relative z-10">

          {/* Page header */}
          <header className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-18 h-18 w-16 h-16 bg-brand-600 rounded-2xl mb-5 shadow-xl hover:scale-105 transition-transform duration-300">
              <Shield className="w-8 h-8 text-white" aria-hidden="true" />
            </div>
            <h1 className="text-4xl font-bold text-brand-900 mb-2">Welcome Back</h1>
            <p className="text-brand-600 text-sm">
              Sign in to access your free architectural plans and design requests
            </p>
          </header>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-brand-100 p-8 space-y-6">

            {/* Success banner */}
            {showSuccess && (
              <div
                role="status"
                aria-live="polite"
                className="flex items-center gap-3 p-4 bg-brand-50 border border-brand-200 rounded-xl text-brand-700 animate-fadeIn"
              >
                <CheckCircle2 className="w-5 h-5 text-brand-600 flex-shrink-0" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-sm">Login Successful!</p>
                  <p className="text-xs text-brand-600">Redirecting you now...</p>
                </div>
              </div>
            )}

            {/* Error banner */}
            {error && (
              <div
                role="alert"
                aria-live="assertive"
                className="flex items-center gap-3 p-4 bg-brand-50 border border-brand-300 rounded-xl text-brand-800 animate-shake"
              >
                <AlertCircle className="w-5 h-5 text-brand-600 flex-shrink-0" aria-hidden="true" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleEmailLogin} noValidate aria-label="Sign in form">
              <div className="space-y-5">

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-brand-800 mb-2">
                    Email Address
                  </label>
                  <div className="relative group">
                    <Mail
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-400 group-focus-within:text-brand-600 transition-colors"
                      aria-hidden="true"
                    />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="your.email@example.com"
                      required
                      autoComplete="email"
                      aria-describedby={fieldErrors.email ? "email-error" : undefined}
                      aria-invalid={!!fieldErrors.email}
                      className={`w-full pl-12 pr-10 py-3.5 border-2 rounded-xl transition focus:outline-none focus:ring-2 focus:ring-brand-200 bg-white text-brand-900 placeholder-brand-300 text-sm ${inputBorder("email")}`}
                    />
                    {form.email && !fieldErrors.email && (
                      <CheckCircle2
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-500"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  {fieldErrors.email && (
                    <p id="email-error" role="alert" className="text-xs text-brand-700 flex items-center gap-1 mt-1.5">
                      <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-brand-800 mb-2">
                    Password
                  </label>
                  <div className="relative group">
                    <Lock
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-400 group-focus-within:text-brand-600 transition-colors"
                      aria-hidden="true"
                    />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      required
                      autoComplete="current-password"
                      aria-describedby={fieldErrors.password ? "password-error" : undefined}
                      aria-invalid={!!fieldErrors.password}
                      className={`w-full pl-12 pr-12 py-3.5 border-2 rounded-xl transition focus:outline-none focus:ring-2 focus:ring-brand-200 bg-white text-brand-900 placeholder-brand-300 text-sm ${inputBorder("password")}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-400 hover:text-brand-600 transition-colors"
                    >
                      {showPassword
                        ? <EyeOff className="w-5 h-5" aria-hidden="true" />
                        : <Eye className="w-5 h-5" aria-hidden="true" />
                      }
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p id="password-error" role="alert" className="text-xs text-brand-700 flex items-center gap-1 mt-1.5">
                      <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                      {fieldErrors.password}
                    </p>
                  )}
                </div>

                {/* Forgot password */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-brand-600 hover:text-brand-800 hover:underline font-medium transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading || Object.keys(fieldErrors).length > 0 || !form.email || !form.password}
                  className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-brand-400 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 group flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" aria-hidden="true" />
                      Sign In
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3" aria-hidden="true">
              <div className="flex-1 h-px bg-brand-100" />
              <span className="text-xs text-brand-400 bg-white px-3 py-1 rounded-full border border-brand-100">or</span>
              <div className="flex-1 h-px bg-brand-100" />
            </div>

            {/* Google login */}
            <div aria-label="Sign in with Google">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {
                  console.error("Google login failed");
                  setError("Google sign-in failed. Please try again.");
                }}
              />
            </div>

            {/* Links */}
            <p className="text-center text-sm text-brand-600">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-brand-700 hover:text-brand-900 hover:underline font-semibold transition-colors"
              >
                Create Account
              </Link>
            </p>

            <p className="text-center text-sm text-brand-500">
              Want to sell on Hillersons?{" "}
              <Link
                to="/vendor/apply"
                className="text-brand-600 hover:text-brand-800 hover:underline font-semibold transition-colors"
              >
                Apply as a Vendor
              </Link>
            </p>
          </div>
        </main>

        {/* Forgot password modal */}
        <ForgotPassword
          isOpen={showForgotPassword}
          onClose={() => setShowForgotPassword(false)}
          API_BASE_URL={API_BASE_URL}
          setError={setError}
        />

        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-8px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25%       { transform: translateX(-4px); }
            75%       { transform: translateX(4px); }
          }
          .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
          .animate-shake  { animation: shake 0.4s ease-in-out; }
        `}</style>
      </div>
    </>
  );
}