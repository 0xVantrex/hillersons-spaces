import { useState, useEffect, useId } from "react";
import { Mail, AlertCircle, CheckCircle2, X } from "lucide-react";

/* ─── Email validation ────────────────────────────────────────── */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/* ─────────────────────────────────────────────────────────────── */
const ForgotPassword = ({ isOpen, onClose, API_BASE_URL }) => {
  // ✅ Bug fix: removed unused `setError` prop — was accepted but never called
  const uid = useId();
  const titleId = `${uid}-title`;

  const [email,      setEmail]      = useState("");
  const [isLoading,  setIsLoading]  = useState(false);
  const [modalError, setModalError] = useState("");
  const [success,    setSuccess]    = useState(false);

  /* ── Escape key & body scroll lock ── */
  useEffect(() => {
    if (!isOpen) return;

    // Prevent background scroll while modal is open
    document.body.style.overflow = "hidden";

    const onKey = (e) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);

  const handleClose = () => {
    setEmail("");
    setModalError("");
    setSuccess(false);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalError("");

    // ✅ Bug fix: proper email format validation before hitting the API
    if (!email.trim()) {
      setModalError("Please enter your email address.");
      return;
    }
    if (!isValidEmail(email)) {
      setModalError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setModalError(data.message || "Failed to send reset link. Please try again.");
        return;
      }

      setSuccess(true);
    } catch {
      setModalError("A network error occurred. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    /* ── Backdrop — click outside to close ── */
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleClose}
      aria-hidden="true"
    >
      {/* ── Dialog panel ── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()} // ✅ prevent backdrop click propagating into modal
        className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-md w-full"
      >
        {success ? (
          /* ── Success state ── */
          <div className="p-8 text-center" role="status" aria-live="polite">
            <div
              className="mx-auto mb-6 w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center"
              aria-hidden="true"
            >
              <CheckCircle2 className="w-8 h-8 text-brand-600" />
            </div>

            <h2
              id={titleId}
              className="text-2xl font-bold text-brand-700 mb-3"
            >
              Check Your Email
            </h2>

            <p className="text-gray-500 mb-8 leading-relaxed text-sm">
              We sent a password reset link to{" "}
              <span className="font-semibold text-brand-600">{email.trim()}</span>.
              Check your spam folder if you don't see it within a few minutes.
            </p>

            <button
              onClick={handleClose}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 px-6 rounded-2xl transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
            >
              Got it
            </button>
          </div>
        ) : (
          /* ── Form state ── */
          <div className="p-8">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2
                  id={titleId}
                  className="text-2xl font-bold text-brand-700"
                >
                  Reset Password
                </h2>
                <p className="text-gray-500 text-sm mt-1 leading-relaxed">
                  Enter your email and we'll send a reset link.
                </p>
              </div>

              {/* ✅ Bug fix: aria-label on close button */}
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close password reset dialog"
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 flex-shrink-0 ml-4"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSubmit} noValidate aria-label="Password reset form">
              {/* Email field */}
              <div className="mb-5">
                <label
                  htmlFor={`${uid}-email`}
                  className="block text-sm font-semibold text-gray-700 mb-1.5"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                    aria-hidden="true"
                  />
                  <input
                    id={`${uid}-email`}
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (modalError) setModalError("");
                    }}
                    placeholder="you@example.com"
                    required
                    aria-required="true"
                    aria-invalid={!!modalError}
                    aria-describedby={modalError ? `${uid}-error` : undefined}
                    disabled={isLoading}
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-2xl text-sm
                      focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-500
                      hover:border-gray-300 transition disabled:opacity-60 disabled:cursor-not-allowed
                      placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Inline error */}
              {modalError && (
                <div
                  id={`${uid}-error`}
                  role="alert"
                  className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2"
                >
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <p className="text-red-600 text-sm">{modalError}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="flex-1 px-5 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-2xl text-sm font-semibold transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  aria-busy={isLoading}
                  className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 px-5 rounded-2xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 flex items-center justify-center gap-2 shadow-md"
                >
                  {isLoading ? (
                    <>
                      {/* ✅ Consistent Tailwind spinner — no raw inline SVG */}
                      <span
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                        aria-hidden="true"
                      />
                      Sending…
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;