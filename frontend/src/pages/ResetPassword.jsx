import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { API_BASE_URL } from "../lib/api";

/* ─── SVG Icons — no lucide dependency needed ─────────────────── */
const Icons = {
  Key: () => (
    <svg aria-hidden="true" className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
    </svg>
  ),
  Lock: () => (
    <svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  Eye: () => (
    <svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  EyeOff: () => (
    <svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  ),
  Alert: () => (
    <svg aria-hidden="true" className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Check: () => (
    <svg aria-hidden="true" className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  CheckCircle: () => (
    <svg aria-hidden="true" className="w-10 h-10 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Shield: () => (
    <svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  ArrowLeft: () => (
    <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  ),
  Spinner: () => (
    <svg aria-hidden="true" className="w-5 h-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  ),
};

/* ─── Password strength ───────────────────────────────────────── */
function getStrength(pwd) {
  let s = 0;
  if (pwd.length >= 8)          s++;
  if (/[a-z]/.test(pwd))        s++;
  if (/[A-Z]/.test(pwd))        s++;
  if (/[0-9]/.test(pwd))        s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;
  return s;
}

const STRENGTH_META = [
  { label: "",        bar: "bg-gray-200",   text: "text-gray-400" },
  { label: "Weak",    bar: "bg-red-500",    text: "text-red-600"  },
  { label: "Weak",    bar: "bg-red-400",    text: "text-red-500"  },
  { label: "Fair",    bar: "bg-brand-accent",text:"text-yellow-700"},
  { label: "Good",    bar: "bg-brand-500",  text: "text-brand-700"},
  { label: "Strong",  bar: "bg-brand-600",  text: "text-brand-700"},
];

const REQUIREMENTS = [
  { label: "At least 8 characters",  test: (p) => p.length >= 8 },
  { label: "One uppercase letter",   test: (p) => /[A-Z]/.test(p) },
  { label: "One number",             test: (p) => /[0-9]/.test(p) },
  { label: "One special character",  test: (p) => /[^A-Za-z0-9]/.test(p) },
];

/* ─── Password input with toggle ─────────────────────────────── */
function PasswordField({ id, label, value, onChange, placeholder, show, onToggle, matchState }) {
  const borderClass =
    matchState === "match"   ? "border-brand-400 focus:border-brand-500" :
    matchState === "nomatch" ? "border-red-300 focus:border-red-400"     :
                               "border-gray-200 focus:border-brand-500";

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-semibold text-gray-700">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          <Icons.Lock />
        </span>
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required
          autoComplete={id === "new-password" ? "new-password" : "new-password"}
          className={`w-full pl-12 pr-12 py-3.5 border-2 ${borderClass} rounded-xl text-sm text-gray-900 bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/20 placeholder:text-gray-400`}
          aria-describedby={`${id}-hint`}
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 rounded"
        >
          {show ? <Icons.EyeOff /> : <Icons.Eye />}
        </button>
      </div>
      {matchState === "nomatch" && (
        <p id={`${id}-hint`} role="alert" className="text-xs text-red-600 flex items-center gap-1 mt-1">
          <Icons.Alert /> Passwords do not match
        </p>
      )}
      {matchState === "match" && (
        <p id={`${id}-hint`} className="text-xs text-brand-600 flex items-center gap-1 mt-1">
          <Icons.Check /> Passwords match
        </p>
      )}
    </div>
  );
}

/* ─── Main component ──────────────────────────────────────────── */
export default function ResetPassword() {
  const { token } = useParams();
  const navigate   = useNavigate();

  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword,    setShowPassword]    = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState("");
  const [success,         setSuccess]         = useState(false);
  const [countdown,       setCountdown]       = useState(5);

  /* SEO */
  useEffect(() => {
    document.title = "Reset Password — Secure Account Recovery";
  }, []);

  /* Countdown after success */
  useEffect(() => {
    if (!success) return;
    if (countdown <= 0) { navigate("/login"); return; }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [success, countdown, navigate]);

  const strength     = getStrength(password);
  const strengthMeta = STRENGTH_META[strength];

  const confirmMatchState =
    !confirmPassword ? undefined :
    password === confirmPassword ? "match" : "nomatch";

  const isValid =
    password.length >= 6 &&
    password === confirmPassword &&
    !loading;

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/reset-password/${token}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || data.message || "Something went wrong. Please try again.");
      }

      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isValid, token, password]);

  /* ── Success screen ── */
  if (success) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-lime-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div
            className="bg-white rounded-2xl shadow-lg border border-brand-100 p-10 text-center"
            role="status"
            aria-live="polite"
          >
            <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-brand-200">
              <Icons.CheckCircle />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Password Reset</h1>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              Your password has been updated successfully. You can now log in with your new password.
            </p>
            {/* Progress bar */}
            <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3 overflow-hidden">
              <div
                className="bg-brand-600 h-1.5 rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${((5 - countdown) / 5) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mb-6">
              Redirecting to login in {countdown} second{countdown !== 1 ? "s" : ""}…
            </p>
            <Link
              to="/login"
              className="inline-block bg-brand-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
            >
              Go to Login Now
            </Link>
          </div>
        </div>
      </main>
    );
  }

  /* ── Form screen ── */
  return (
    <main className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-lime-50 flex items-center justify-center p-4">

      {/* Subtle background blobs */}
      <div aria-hidden="true" className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-brand-200/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-lime-200/20 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">

        {/* Icon + heading */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-18 h-18 w-[4.5rem] h-[4.5rem] bg-gradient-to-br from-brand-600 to-brand-700 rounded-2xl shadow-lg mb-5">
            <Icons.Key />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Reset Password</h1>
          <p className="text-gray-500 text-sm">Create a new secure password for your account</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 space-y-6">

          {/* Error banner */}
          {error && (
            <div
              role="alert"
              aria-live="assertive"
              className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700"
            >
              <Icons.Alert />
              <p className="text-sm leading-snug">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">

            {/* New password */}
            <div className="space-y-3">
              <PasswordField
                id="new-password"
                label="New Password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                placeholder="Enter your new password"
                show={showPassword}
                onToggle={() => setShowPassword((v) => !v)}
              />

              {/* Strength bar */}
              {password && (
                <div className="space-y-1.5" aria-label={`Password strength: ${strengthMeta.label}`}>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">Password strength</span>
                    <span className={`text-xs font-semibold ${strengthMeta.text}`}>
                      {strengthMeta.label}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${strengthMeta.bar}`}
                      style={{ width: `${(strength / 5) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Requirements checklist */}
              <ul className="space-y-1.5 pt-1" aria-label="Password requirements">
                {REQUIREMENTS.map(({ label, test }) => {
                  const met = test(password);
                  return (
                    <li key={label} className={`flex items-center gap-2 text-xs transition-colors ${met ? "text-brand-700" : "text-gray-400"}`}>
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${met ? "bg-brand-600" : "bg-gray-200"}`}>
                        {met && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </span>
                      {label}
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Confirm password */}
            <PasswordField
              id="confirm-password"
              label="Confirm Password"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
              placeholder="Re-enter your new password"
              show={showConfirm}
              onToggle={() => setShowConfirm((v) => !v)}
              matchState={confirmMatchState}
            />

            {/* Submit */}
            <button
              type="submit"
              disabled={!isValid}
              aria-disabled={!isValid}
              className="w-full flex items-center justify-center gap-2.5 bg-brand-600 text-white font-semibold py-3.5 px-6 rounded-xl text-sm transition-all hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 shadow-sm hover:shadow-md"
            >
              {loading ? (
                <>
                  <Icons.Spinner />
                  Resetting Password…
                </>
              ) : (
                <>
                  <Icons.Shield />
                  Reset Password
                </>
              )}
            </button>
          </form>

          {/* Back link */}
          <div className="pt-4 border-t border-gray-100 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-800 font-medium transition-colors focus:outline-none focus:underline"
            >
              <Icons.ArrowLeft />
              Back to Login
            </Link>
          </div>
        </div>

        {/* Trust note */}
        <p className="text-center text-xs text-gray-400 mt-6 flex items-center justify-center gap-1.5">
          <Icons.Shield />
          Your password is encrypted and stored securely
        </p>
      </div>
    </main>
  );
}