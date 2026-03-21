import React, { useState, useId } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../lib/api";
import {
  Building2, User, Phone, MapPin, Globe,
  ChevronRight, Clock, XCircle, CheckCircle2,
  AlertCircle, Wrench, Home, Send,
} from "lucide-react";

/* ─── Vendor role definitions ─────────────────────────────────── */
const VENDOR_ROLES = [
  {
    id: "vendor",
    label: "General Vendor",
    description: "Sell house plans, land, books, or properties",
    Icon: Building2,
  },
  {
    id: "bnbHost",
    label: "BNB Host",
    description: "List short-stay properties for booking",
    Icon: Home,
  },
  {
    id: "contractor",
    label: "Contractor / Service Provider",
    description: "Offer construction or professional services",
    Icon: Wrench,
  },
];

/* ─── Shared input class ──────────────────────────────────────── */
const inputCls =
  "w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm text-gray-900 " +
  "placeholder-gray-400 focus:outline-none focus:border-brand-500 " +
  "focus:ring-2 focus:ring-brand-200 hover:border-gray-300 transition-all bg-white";

/* ─── Reusable form field ─────────────────────────────────────── */
function FormField({ id, icon: Icon, label, name, value, onChange, placeholder, required, type = "text" }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
      </label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          aria-required={required ? "true" : undefined}
          className={inputCls}
        />
      </div>
    </div>
  );
}

/* ─── Inline error banner ─────────────────────────────────────── */
function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div role="alert" className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 mb-6">
      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
      <span className="text-sm">{message}</span>
    </div>
  );
}

/* ─── Progress bar ────────────────────────────────────────────── */
function StepProgress({ current, total }) {
  return (
    <nav aria-label="Application progress" className="flex items-center gap-3 mb-10">
      {Array.from({ length: total }, (_, i) => i + 1).map((s) => (
        <React.Fragment key={s}>
          <div
            role="listitem"
            aria-current={current === s ? "step" : undefined}
            aria-label={`Step ${s}${current === s ? " (current)" : current > s ? " (completed)" : ""}`}
            className={`flex items-center justify-center w-9 h-9 rounded-full font-bold text-sm transition-all ${
              current >= s
                ? "bg-brand-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-400"
            }`}
          >
            {current > s
              ? <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
              : s}
          </div>
          {s < total && (
            <div className={`flex-1 h-1 rounded-full transition-all ${current > s ? "bg-brand-600" : "bg-gray-100"}`} />
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

/* ─── Status screen ───────────────────────────────────────────── */
function StatusScreen({ icon, colorClass, title, message, tip, primaryAction }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-lime-50 flex items-center justify-center p-4">
      <div className={`max-w-md w-full text-center border-2 ${colorClass} rounded-2xl p-10 shadow-lg bg-white`}>
        <div className="flex justify-center mb-6" aria-hidden="true">{icon}</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">{title}</h1>
        <p className="text-gray-600 text-sm leading-relaxed mb-2">{message}</p>
        {tip && <p className="text-xs text-gray-400 mt-2 leading-relaxed">{tip}</p>}

        {/* ✅ Bug fix: single action area — no duplicate "Back to Home" buttons */}
        {primaryAction && <div className="mt-6">{primaryAction}</div>}

        <button
          onClick={() => navigate("/")}
          className="mt-4 text-sm text-gray-400 hover:text-brand-600 transition-colors underline-offset-2 hover:underline focus:outline-none focus:ring-1 focus:ring-brand-400 rounded"
        >
          Return to home
        </button>
      </div>
    </div>
  );
}

/* ─── Primary button ──────────────────────────────────────────── */
function PrimaryBtn({ loading, label, loadingLabel, onClick, type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading}
      aria-busy={loading}
      className="flex-1 bg-brand-600 hover:bg-brand-700 active:scale-[0.99] text-white py-3.5 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
    >
      {loading ? (
        <>
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
          {loadingLabel}
        </>
      ) : (
        <>
          {label}
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </>
      )}
    </button>
  );
}

/* ════════════════════════════════════════════════════════════════ */
export default function VendorApply() {
  const { user, token, vendorStatus, login } = useAuth();
  const navigate = useNavigate();
  const uid = useId();

  const [step, setStep]       = useState(1);
  const [submitted, setSubmitted] = useState(false); // ✅ Bug fix: separate flag from vendorStatus
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const [form, setForm] = useState({
    role: "",
    businessName: "",
    businessDescription: "",
    location: "",
    phone: user?.phone || "",
    website: "",
    specialization: "",
  });

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError("");
  };

  /* ── Validate & go to step 2 ── */
  const handleStep1Continue = () => {
    if (!form.role) return setError("Please select a vendor type to continue.");
    setError("");
    setStep(2);
  };

  /* ── Final submit ── */
  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError("");

    // ✅ Bug fix: all validation up front before any async work
    const errs = [];
    if (!form.role)                       errs.push("Please select a vendor type.");
    if (!form.businessName.trim())        errs.push("Business name is required.");
    if (!form.businessDescription.trim()) errs.push("Business description is required.");
    if (!form.location.trim())            errs.push("Location is required.");
    if (errs.length) return setError(errs[0]);

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/vendor/apply`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Application failed. Please try again.");

      login({ ...user, role: form.role, vendorStatus: "pending" }, token);
      setSubmitted(true); // ✅ Bug fix: use dedicated flag so step 3 is always reachable
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Status screens ── */

  // ✅ Bug fix: check submitted flag FIRST before vendorStatus checks
  if (submitted) {
    return (
      <StatusScreen
        icon={<Send className="w-14 h-14 text-brand-600" />}
        colorClass="border-brand-200"
        title="Application Submitted"
        message="Thank you! Your vendor application has been received. The Hillersons team will review it within 1–2 business days."
        tip="You will receive an email notification once your application is approved."
        primaryAction={
          <button
            onClick={() => navigate("/")}
            className="bg-brand-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-brand-700 transition focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
          >
            Back to Home
          </button>
        }
      />
    );
  }

  if (vendorStatus === "pending") {
    return (
      <StatusScreen
        icon={<Clock className="w-14 h-14 text-brand-400" />}
        colorClass="border-brand-100"
        title="Application Under Review"
        message="Your vendor application has been submitted and is being reviewed by the Hillersons team. This usually takes 1–2 business days."
        tip="You will receive an email once your application is approved."
      />
    );
  }

  if (vendorStatus === "rejected") {
    return (
      <StatusScreen
        icon={<XCircle className="w-14 h-14 text-red-500" />}
        colorClass="border-red-200"
        title="Application Not Approved"
        message="Unfortunately your vendor application was not approved at this time. You can contact support for more information or reapply with updated details."
        primaryAction={
          <button
            onClick={() => {
              login({ ...user, vendorStatus: "none" }, token);
              setForm({ role: "", businessName: "", businessDescription: "", location: "", phone: user?.phone || "", website: "", specialization: "" });
              setStep(1);
            }}
            className="bg-brand-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-brand-700 transition focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
          >
            Reapply
          </button>
        }
      />
    );
  }

  if (vendorStatus === "approved") {
    return (
      <StatusScreen
        icon={<CheckCircle2 className="w-14 h-14 text-brand-600" />}
        colorClass="border-brand-200"
        title="You're an Approved Vendor"
        message="Your vendor account is active. Head to your dashboard to manage your listings and track performance."
        primaryAction={
          <button
            onClick={() => navigate("/vendor/dashboard")}
            className="bg-brand-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-brand-700 transition focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
          >
            Go to Dashboard
          </button>
        }
      />
    );
  }

  /* ── Main form ── */
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-lime-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Page header */}
        <header className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Become a Vendor</h1>
          <p className="text-gray-500 text-sm">
            Join the Hillersons marketplace and reach thousands of customers
          </p>
        </header>

        <StepProgress current={step} total={2} />

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <ErrorBanner message={error} />

          {/* ── Step 1: Role selection ── */}
          {step === 1 && (
            <section aria-labelledby="step1-heading">
              <h2 id="step1-heading" className="text-lg font-bold text-gray-800 mb-6">
                What type of vendor are you?
              </h2>

              <div
                role="radiogroup"
                aria-label="Vendor type"
                className="space-y-3"
              >
                {VENDOR_ROLES.map(({ id, label, description, Icon }) => {
                  const selected = form.role === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => { setForm((f) => ({ ...f, role: id })); setError(""); }}
                      className={`w-full flex items-center gap-4 p-5 rounded-xl border-2 text-left transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                        selected
                          ? "border-brand-500 bg-brand-50"
                          : "border-gray-200 hover:border-brand-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                        selected ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-500"
                      }`}>
                        <Icon className="w-5 h-5" aria-hidden="true" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 text-sm">{label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
                      </div>
                      {selected && (
                        <CheckCircle2 className="w-5 h-5 text-brand-600 flex-shrink-0" aria-hidden="true" />
                      )}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={handleStep1Continue}
                className="w-full mt-8 bg-brand-600 hover:bg-brand-700 active:scale-[0.99] text-white py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
              >
                Continue
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </section>
          )}

          {/* ── Step 2: Business details ── */}
          {step === 2 && (
            <section aria-labelledby="step2-heading">
              <h2 id="step2-heading" className="text-lg font-bold text-gray-800 mb-6">
                Tell us about your business
              </h2>

              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <FormField
                  id={`${uid}-bizname`}
                  icon={Building2}
                  label="Business Name"
                  name="businessName"
                  value={form.businessName}
                  onChange={handleChange}
                  placeholder="e.g. Kimani Properties"
                  required
                />

                <div>
                  <label htmlFor={`${uid}-bizdesc`} className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Business Description
                    <span className="text-red-500 ml-1" aria-hidden="true">*</span>
                  </label>
                  <textarea
                    id={`${uid}-bizdesc`}
                    name="businessDescription"
                    value={form.businessDescription}
                    onChange={handleChange}
                    placeholder="Describe what you offer, your experience, and what makes you stand out…"
                    rows={4}
                    required
                    aria-required="true"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 hover:border-gray-300 transition-all resize-none"
                  />
                </div>

                <FormField
                  id={`${uid}-location`}
                  icon={MapPin}
                  label="Location"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="e.g. Nairobi, Karen"
                  required
                />

                <FormField
                  id={`${uid}-phone`}
                  icon={Phone}
                  label="Business Phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+254 7XX XXX XXX"
                />

                <FormField
                  id={`${uid}-website`}
                  icon={Globe}
                  label="Website (optional)"
                  name="website"
                  type="url"
                  value={form.website}
                  onChange={handleChange}
                  placeholder="https://yourwebsite.com"
                />

                {form.role === "contractor" && (
                  <FormField
                    id={`${uid}-spec`}
                    icon={Wrench}
                    label="Specialization"
                    name="specialization"
                    value={form.specialization}
                    onChange={handleChange}
                    placeholder="e.g. Roofing, Plumbing, Full Construction"
                  />
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setStep(1); setError(""); }}
                    className="flex-1 py-3.5 rounded-xl border-2 border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 hover:border-gray-300 transition focus:outline-none focus:ring-2 focus:ring-gray-300"
                  >
                    Back
                  </button>
                  <PrimaryBtn
                    type="submit"
                    loading={loading}
                    label="Submit Application"
                    loadingLabel="Submitting…"
                  />
                </div>
              </form>
            </section>
          )}
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          Already a vendor?{" "}
          <Link
            to="/vendor/dashboard"
            className="text-brand-600 font-semibold hover:text-brand-800 hover:underline transition-colors focus:outline-none focus:ring-1 focus:ring-brand-400 rounded"
          >
            Go to dashboard
          </Link>
        </p>
      </div>
    </div>
  );
}