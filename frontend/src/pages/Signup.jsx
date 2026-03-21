import React, { useState } from "react";
import {
  Eye, EyeOff, User, Mail, Lock,
  AlertCircle, CheckCircle2, Send,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../lib/api";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useAuth } from "../context/AuthContext"; // ✅ use AuthContext, not localStorage

/* ─── Password strength helpers ───────────────────────────────── */
const PASSWORD_RULES = [
  { test: (p) => p.length >= 8,                                      message: "At least 8 characters" },
  { test: (p) => /[A-Z]/.test(p),                                    message: "One uppercase letter" },
  { test: (p) => /[a-z]/.test(p),                                    message: "One lowercase letter" },
  { test: (p) => /\d/.test(p),                                       message: "One number" },
  { test: (p) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(p),    message: "One special character" },
];

function checkPasswordStrength(password) {
  const feedback = PASSWORD_RULES.map((rule) => ({
    message: rule.message,
    passed: rule.test(password),
  }));
  return { score: feedback.filter((f) => f.passed).length, feedback };
}

function validateUsername(name) {
  if (name.length < 3)  return "Username must be at least 3 characters";
  if (name.length > 20) return "Username must be fewer than 20 characters";
  if (!/^[a-zA-Z0-9_]+$/.test(name)) return "Only letters, numbers, and underscores allowed";
  return "";
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "" : "Please enter a valid email address";
}

/* ─── Strength bar ────────────────────────────────────────────── */
function StrengthBar({ score }) {
  const colors = ["bg-red-500", "bg-red-400", "bg-yellow-400", "bg-brand-400", "bg-brand-500"];
  const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
  const textColors = ["text-red-600", "text-red-500", "text-yellow-600", "text-brand-600", "text-brand-700"];
  const idx = Math.max(0, score - 1);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${colors[idx] ?? "bg-brand-500"}`}
            style={{ width: `${(score / 5) * 100}%` }}
            role="progressbar"
            aria-valuenow={score}
            aria-valuemin={0}
            aria-valuemax={5}
            aria-label="Password strength"
          />
        </div>
        <span className={`text-xs font-semibold w-16 text-right ${textColors[idx]}`}>
          {score > 0 ? labels[idx] : ""}
        </span>
      </div>
      <ul className="grid grid-cols-1 gap-0.5" aria-label="Password requirements">
        {checkPasswordStrength.feedback /* populated below per-render, dummy here */}
      </ul>
    </div>
  );
}

/* ─── Field wrapper ───────────────────────────────────────────── */
function FieldError({ message }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-xs text-red-600 flex items-center gap-1 mt-1">
      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}

/* ─── Input border utility ────────────────────────────────────── */
function inputClass(hasError, hasSuccess) {
  if (hasError)   return "border-red-300 bg-red-50/40 focus:border-red-400 focus:ring-red-200";
  if (hasSuccess) return "border-brand-300 bg-brand-50/40 focus:border-brand-400 focus:ring-brand-200";
  return "border-gray-200 hover:border-gray-300 focus:border-brand-400 focus:ring-brand-200";
}

/* ─── Main component ──────────────────────────────────────────── */
export default function Signup() {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth(); // ✅ Google login stores token via context

  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [strength, setStrength] = useState({ score: 0, feedback: [] });
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [resendStatus, setResendStatus] = useState(""); // "" | "sending" | "sent" | "error"

  /* ── Field change handler ── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value.trimStart() }));
    setGlobalError("");

    const errs = { ...fieldErrors };

    if (name === "name") {
      const err = validateUsername(value);
      err ? (errs.name = err) : delete errs.name;
    }
    if (name === "email") {
      const err = validateEmail(value);
      err ? (errs.email = err) : delete errs.email;
    }
    if (name === "password") {
      const s = checkPasswordStrength(value);
      setStrength(s);
      if (form.confirmPassword && value !== form.confirmPassword) {
        errs.confirmPassword = "Passwords do not match";
      } else {
        delete errs.confirmPassword;
      }
    }
    if (name === "confirmPassword") {
      value !== form.password
        ? (errs.confirmPassword = "Passwords do not match")
        : delete errs.confirmPassword;
    }

    setFieldErrors(errs);
  };

  /* ── Submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError("");

    const { name, email, password, confirmPassword } = form;
    const trimmedName  = name.trim();
    const trimmedEmail = email.trim();
    const errs = {};

    const nameErr = validateUsername(trimmedName);
    if (nameErr) errs.name = nameErr;

    const emailErr = validateEmail(trimmedEmail);
    if (emailErr) errs.email = emailErr;

    if (!password) errs.password = "Password is required";
    else if (strength.score < 3) errs.password = "Password is too weak";

    if (password !== confirmPassword) errs.confirmPassword = "Passwords do not match";

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName, email: trimmedEmail, password }),
      });

      // ✅ Bug fix: always check response status
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || "Could not create account. Please try again.");
      }

      // ✅ Bug fix: don't navigate away — show the email-sent message
      setSignupSuccess(true);
      setForm({ name: "", email: "", password: "", confirmPassword: "" });
      setStrength({ score: 0, feedback: [] });
      setFieldErrors({});
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setGlobalError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Resend verification ── */
  const handleResend = async () => {
    setResendStatus("sending");
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });
      setResendStatus(response.ok ? "sent" : "error");
    } catch {
      setResendStatus("error");
    }
  };

  /* ── Google success ── */
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/google`, {
        tokenId: credentialResponse.credential,
      });
      const { token, user } = res.data;
      authLogin(token, user); // ✅ Bug fix: use AuthContext, not localStorage directly
      navigate("/home");
    } catch (err) {
      setGlobalError("Google sign-up failed. Please try again.");
      console.error("Google signup error:", err);
    }
  };

  /* ── Derived values ── */
  const passwordsMatch =
    form.confirmPassword.length > 0 && form.password === form.confirmPassword;

  const isSubmitDisabled =
    loading ||
    Object.keys(fieldErrors).length > 0 ||
    strength.score < 3 ||
    !form.name || !form.email || !form.password || !form.confirmPassword;

  /* ─────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-lime-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Page header */}
        <header className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-brand-600 to-brand-700 rounded-2xl mb-4 shadow-md"
            aria-hidden="true"
          >
            <User className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-brand-700">Create Account</h1>
          <p className="text-gray-500 mt-1 text-sm">Join our community today</p>
        </header>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 space-y-6">

          {/* ── Success banner ── */}
          {signupSuccess && (
            <div
              role="status"
              aria-live="polite"
              className="flex items-start gap-3 p-4 bg-brand-50 border border-brand-200 rounded-xl text-brand-800"
            >
              <Send className="w-5 h-5 flex-shrink-0 mt-0.5 text-brand-600" aria-hidden="true" />
              <div>
                <h2 className="font-semibold text-sm mb-1">Account created — check your inbox</h2>
                <p className="text-xs text-brand-700 leading-relaxed">
                  We sent a verification link to your email. Click it to activate your account.
                </p>
                <div className="mt-2 text-xs text-brand-600">
                  {resendStatus === "" && (
                    <>
                      Did not receive it?{" "}
                      <button
                        onClick={handleResend}
                        className="underline hover:no-underline font-medium focus:outline-none focus:ring-1 focus:ring-brand-500 rounded"
                      >
                        Resend verification email
                      </button>
                    </>
                  )}
                  {resendStatus === "sending" && <span>Sending…</span>}
                  {resendStatus === "sent"    && <span className="text-brand-700 font-medium">Email resent. Check your spam folder too.</span>}
                  {resendStatus === "error"   && <span className="text-red-600">Could not resend. Please try again later.</span>}
                </div>
              </div>
            </div>
          )}

          {/* ── Global error ── */}
          {globalError && (
            <div
              role="alert"
              className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <span className="text-sm">{globalError}</span>
            </div>
          )}

          {/* ── Form ── */}
          <form
            onSubmit={handleSubmit}
            noValidate
            aria-label="Create a new account"
            className="space-y-5"
          >
            {/* Username */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                Username
              </label>
              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                  aria-hidden="true"
                />
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="username"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. john_doe"
                  required
                  aria-required="true"
                  aria-invalid={!!fieldErrors.name}
                  aria-describedby={fieldErrors.name ? "name-error" : undefined}
                  className={`w-full pl-10 pr-9 py-2.5 border-2 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 ${inputClass(!!fieldErrors.name, form.name && !fieldErrors.name)}`}
                />
                {form.name && !fieldErrors.name && (
                  <CheckCircle2
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-500"
                    aria-hidden="true"
                  />
                )}
              </div>
              <FieldError message={fieldErrors.name} />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                  aria-hidden="true"
                />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  aria-required="true"
                  aria-invalid={!!fieldErrors.email}
                  aria-describedby={fieldErrors.email ? "email-error" : undefined}
                  className={`w-full pl-10 pr-9 py-2.5 border-2 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 ${inputClass(!!fieldErrors.email, form.email && !fieldErrors.email)}`}
                />
                {form.email && !fieldErrors.email && (
                  <CheckCircle2
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-500"
                    aria-hidden="true"
                  />
                )}
              </div>
              <FieldError message={fieldErrors.email} />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                  aria-hidden="true"
                />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  required
                  aria-required="true"
                  aria-invalid={!!fieldErrors.password}
                  aria-describedby="password-strength"
                  className={`w-full pl-10 pr-10 py-2.5 border-2 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 ${inputClass(!!fieldErrors.password, false)}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-600 transition-colors focus:outline-none focus:ring-1 focus:ring-brand-400 rounded"
                >
                  {showPassword
                    ? <EyeOff className="w-4 h-4" aria-hidden="true" />
                    : <Eye     className="w-4 h-4" aria-hidden="true" />}
                </button>
              </div>

              {/* Strength indicator */}
              {form.password && (
                <div id="password-strength" className="mt-2 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          strength.score <= 2 ? "bg-red-400" :
                          strength.score === 3 ? "bg-yellow-400" :
                          strength.score === 4 ? "bg-brand-400" : "bg-brand-600"
                        }`}
                        style={{ width: `${(strength.score / 5) * 100}%` }}
                        role="progressbar"
                        aria-valuenow={strength.score}
                        aria-valuemin={0}
                        aria-valuemax={5}
                        aria-label="Password strength"
                      />
                    </div>
                    <span className={`text-xs font-semibold w-14 text-right ${
                      strength.score <= 2 ? "text-red-500" :
                      strength.score === 3 ? "text-yellow-600" : "text-brand-600"
                    }`}>
                      {["", "Weak", "Weak", "Fair", "Good", "Strong"][strength.score]}
                    </span>
                  </div>
                  <ul className="space-y-0.5" aria-label="Password requirements">
                    {strength.feedback.map((item) => (
                      <li
                        key={item.message}
                        className={`flex items-center gap-1.5 text-xs ${item.passed ? "text-brand-600" : "text-gray-400"}`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${item.passed ? "bg-brand-500" : "bg-gray-200"}`} aria-hidden="true" />
                        {item.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <FieldError message={fieldErrors.password} />
            </div>

            {/* Confirm password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirm password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                  aria-hidden="true"
                />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  required
                  aria-required="true"
                  aria-invalid={!!fieldErrors.confirmPassword}
                  className={`w-full pl-10 pr-10 py-2.5 border-2 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 ${inputClass(!!fieldErrors.confirmPassword, passwordsMatch)}`}
                />
                {/* ✅ Bug fix: CheckCircle no longer overlaps toggle */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {passwordsMatch && (
                    <CheckCircle2 className="w-4 h-4 text-brand-500" aria-hidden="true" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                  className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-600 transition-colors focus:outline-none focus:ring-1 focus:ring-brand-400 rounded ${passwordsMatch ? "right-8" : "right-3"}`}
                >
                  {showConfirm
                    ? <EyeOff className="w-4 h-4" aria-hidden="true" />
                    : <Eye     className="w-4 h-4" aria-hidden="true" />}
                </button>
              </div>
              <FieldError message={fieldErrors.confirmPassword} />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitDisabled}
              aria-busy={loading}
              className="w-full bg-brand-600 text-white font-semibold py-3 px-4 rounded-xl transition-all hover:bg-brand-700 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 shadow-md hover:shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                    aria-hidden="true"
                  />
                  Creating account…
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3" aria-hidden="true">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400 font-medium">or continue with</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Google */}
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setGlobalError("Google sign-up failed. Please try again.")}
              theme="outline"
              size="large"
              width="100%"
            />
          </div>

          {/* Login link */}
          <p className="text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-brand-600 font-semibold hover:text-brand-800 hover:underline transition-colors focus:outline-none focus:ring-1 focus:ring-brand-400 rounded"
            >
              Log in
            </Link>
          </p>
        </div>

        {/* Legal footer */}
        <p className="text-center text-xs text-gray-400 mt-5 leading-relaxed">
          By creating an account, you agree to our{" "}
          <Link to="/terms" className="underline hover:text-gray-600 transition-colors">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className="underline hover:text-gray-600 transition-colors">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}