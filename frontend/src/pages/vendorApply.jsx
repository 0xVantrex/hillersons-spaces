import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../lib/api";
import {
  Building2,
  User,
  Phone,
  MapPin,
  Globe,
  FileText,
  ChevronRight,
  Clock,
  XCircle,
  CheckCircle2,
  AlertCircle,
  Wrench,
  Home,
  BookOpen,
} from "lucide-react";

const VENDOR_ROLES = [
  {
    id: "vendor",
    label: "General Vendor",
    description: "Sell house plans, land, books, or properties",
    icon: Building2,
  },
  {
    id: "bnbHost",
    label: "BNB Host",
    description: "List short-stay properties for booking",
    icon: Home,
  },
  {
    id: "contractor",
    label: "Contractor / Service Provider",
    description: "Offer construction or professional services",
    icon: Wrench,
  },
];

export default function VendorApply() {
  const { user, token, vendorStatus, login } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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

  const handleSubmit = async () => {
    if (!form.role) return setError("Please select a vendor type.");
    if (!form.businessName.trim())
      return setError("Business name is required.");
    if (!form.businessDescription.trim())
      return setError("Please describe your business.");
    if (!form.location.trim()) return setError("Location is required.");

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

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Application failed");

      // Update local user state so UI reflects pending status
      login({ ...user, role: form.role, vendorStatus: "pending" }, token);
      setStep(3); // go to success screen
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Already pending ────────────────────────────────────────────────────────
  if (vendorStatus === "pending" && step !== 3) {
    return (
      <StatusScreen
        icon={<Clock className="w-16 h-16 text-amber-500" />}
        color="amber"
        title="Application Under Review"
        message="Your vendor application has been submitted and is being reviewed by the Hillersons team. This usually takes 1-2 business days."
        tip="You will receive an email once your application is approved."
      />
    );
  }

  // ── Rejected ───────────────────────────────────────────────────────────────
  if (vendorStatus === "rejected") {
    return (
      <StatusScreen
        icon={<XCircle className="w-16 h-16 text-red-500" />}
        color="red"
        title="Application Not Approved"
        message="Unfortunately your vendor application was not approved at this time."
        tip="You can contact support for more details or reapply with updated information."
        action={
          <button
            onClick={() => login({ ...user, vendorStatus: "none" }, token)}
            className="mt-4 bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition"
          >
            Reapply
          </button>
        }
      />
    );
  }

  // ── Already approved ───────────────────────────────────────────────────────
  if (vendorStatus === "approved") {
    return (
      <StatusScreen
        icon={<CheckCircle2 className="w-16 h-16 text-emerald-500" />}
        color="emerald"
        title="You're an Approved Vendor"
        message="Your vendor account is active. Go to your dashboard to manage listings."
        action={
          <button
            onClick={() => navigate("/vendor/dashboard")}
            className="mt-4 bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition"
          >
            Go to Dashboard
          </button>
        }
      />
    );
  }

  // ── Success screen after submission ───────────────────────────────────────
  if (step === 3) {
    return (
      <StatusScreen
        icon={<CheckCircle2 className="w-16 h-16 text-emerald-500" />}
        color="emerald"
        title="Application Submitted!"
        message="Thank you! Your vendor application has been received. The Hillersons team will review it within 1-2 business days."
        tip="You'll get an email notification once approved."
        action={
          <button
            onClick={() => navigate("/")}
            className="mt-4 bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition"
          >
            Back to Home
          </button>
        }
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-lime-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Become a Vendor
          </h1>
          <p className="text-gray-500">
            Join the Hillersons marketplace and reach thousands of customers
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-3 mb-10">
          {[1, 2].map((s) => (
            <React.Fragment key={s}>
              <div
                className={`flex items-center justify-center w-9 h-9 rounded-full font-bold text-sm transition-all ${
                  step >= s
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                {s}
              </div>
              {s < 2 && (
                <div
                  className={`flex-1 h-1 rounded-full transition-all ${
                    step > s ? "bg-emerald-600" : "bg-gray-200"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 mb-6">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* ── Step 1: Choose role ── */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                What type of vendor are you?
              </h2>
              <div className="space-y-4">
                {VENDOR_ROLES.map(({ id, label, description, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setForm((f) => ({ ...f, role: id }))}
                    className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all ${
                      form.role === id
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-gray-200 hover:border-emerald-300 hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        form.role === id
                          ? "bg-emerald-600 text-white"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{label}</p>
                      <p className="text-sm text-gray-500">{description}</p>
                    </div>
                    {form.role === id && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 ml-auto flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  if (!form.role)
                    return setError("Please select a vendor type.");
                  setError("");
                  setStep(2);
                }}
                className="w-full mt-8 bg-gradient-to-r from-emerald-600 to-lime-600 text-white py-4 rounded-2xl font-bold hover:from-emerald-700 hover:to-lime-700 transition flex items-center justify-center gap-2"
              >
                Continue
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* ── Step 2: Business details ── */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Tell us about your business
              </h2>
              <div className="space-y-5">
                <FormField
                  icon={Building2}
                  label="Business Name"
                  name="businessName"
                  value={form.businessName}
                  onChange={handleChange}
                  placeholder="e.g. Kimani Properties"
                  required
                />
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Business Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="businessDescription"
                    value={form.businessDescription}
                    onChange={handleChange}
                    placeholder="Describe what you offer, your experience, etc."
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 resize-none transition"
                  />
                </div>
                <FormField
                  icon={MapPin}
                  label="Location"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="e.g. Nairobi, Karen"
                  required
                />
                <FormField
                  icon={Phone}
                  label="Business Phone"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+254 7XX XXX XXX"
                />
                <FormField
                  icon={Globe}
                  label="Website (optional)"
                  name="website"
                  value={form.website}
                  onChange={handleChange}
                  placeholder="https://yourwebsite.com"
                />
                {form.role === "contractor" && (
                  <FormField
                    icon={Wrench}
                    label="Specialization"
                    name="specialization"
                    value={form.specialization}
                    onChange={handleChange}
                    placeholder="e.g. Roofing, Plumbing, Full Construction"
                  />
                )}
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-4 rounded-2xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-lime-600 text-white py-4 rounded-2xl font-bold hover:from-emerald-700 hover:to-lime-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Application
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          Already a vendor?{" "}
          <Link
            to="/vendor/dashboard"
            className="text-emerald-600 hover:underline font-medium"
          >
            Go to dashboard
          </Link>
        </p>
      </div>
    </div>
  );
}

// ── Reusable form field ────────────────────────────────────────────────────────
function FormField({
  icon: Icon,
  label,
  name,
  value,
  onChange,
  placeholder,
  required,
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition"
        />
      </div>
    </div>
  );
}

// ── Status screen ──────────────────────────────────────────────────────────────
function StatusScreen({ icon, color, title, message, tip, action }) {
  const navigate = useNavigate();
  const borderColor =
    {
      amber: "border-amber-200 bg-amber-50",
      red: "border-red-200 bg-red-50",
      emerald: "border-emerald-200 bg-emerald-50",
    }[color] || "border-gray-200 bg-gray-50";

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-lime-50 flex items-center justify-center p-4">
      <div
        className={`max-w-md w-full text-center border-2 ${borderColor} rounded-3xl p-10 shadow-xl`}
      >
        <div className="flex justify-center mb-6">{icon}</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">{title}</h2>
        <p className="text-gray-600 mb-2">{message}</p>
        {tip && <p className="text-sm text-gray-400 mt-2">{tip}</p>}
        {action}
        <button
          onClick={() => navigate("/")}
          className="block mx-auto mt-4 text-sm text-gray-400 hover:text-gray-600 transition"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
