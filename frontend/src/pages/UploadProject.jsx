import React, { useState, useId } from "react";
import {
  Upload, Image, FileText, Building, Home, Heart,
  Palette, Wrench, MapPin, Users, Bed, Bath, Clock,
  CheckCircle2, AlertCircle, Star, Zap, Sparkles,
} from "lucide-react";
import { API_BASE_URL } from "../lib/api";
import { useAuth } from "../context/AuthContext";

/* ─── Constants ───────────────────────────────────────────────── */
const AMENITY_OPTIONS = [
  { id: "wifi",      label: "Wi-Fi" },
  { id: "parking",   label: "Parking" },
  { id: "pool",      label: "Pool" },
  { id: "ac",        label: "Air Con" },
  { id: "breakfast", label: "Breakfast" },
  { id: "security",  label: "Security" },
];

const CATEGORY_OPTIONS = {
  Commercial: [
    "Mixed use development",
    "Office park",
    "Commercial plaza",
    "Retail shops",
    "Godowns & warehouses",
    "Service station",
    "Hospitality development",
  ],
  Residential: [
    "Residential apartment development",
    "Residential house development",
    "Residential estate development",
  ],
  Social: [
    "Hospital development",
    "Education facility development",
    "Social market development",
    "Religion facility development",
  ],
  Interior:   [],
  Renovation: [],
};

const CATEGORY_ICONS = {
  Commercial: <Building className="w-4 h-4" aria-hidden="true" />,
  Residential: <Home    className="w-4 h-4" aria-hidden="true" />,
  Social:      <Heart   className="w-4 h-4" aria-hidden="true" />,
  Interior:    <Palette className="w-4 h-4" aria-hidden="true" />,
  Renovation:  <Wrench  className="w-4 h-4" aria-hidden="true" />,
};

/* ─── Shared input class ──────────────────────────────────────── */
const inputCls =
  "w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 text-sm text-gray-900 " +
  "hover:border-gray-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 " +
  "focus:outline-none transition-all placeholder-gray-400 bg-white";

const selectCls = inputCls + " cursor-pointer";

/* ─── Field label ─────────────────────────────────────────────── */
function Label({ htmlFor, icon, children, required }) {
  return (
    <label htmlFor={htmlFor} className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-1.5">
      {icon && <span aria-hidden="true">{icon}</span>}
      {children}
      {required && <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>}
    </label>
  );
}

/* ─── Inline alert ────────────────────────────────────────────── */
function InlineAlert({ type, message }) {
  if (!message) return null;
  const styles = {
    success: "bg-brand-50 border-brand-200 text-brand-800",
    error:   "bg-red-50 border-red-200 text-red-700",
  };
  const Icon = type === "success" ? CheckCircle2 : AlertCircle;
  return (
    <div role={type === "error" ? "alert" : "status"} aria-live="polite"
      className={`flex items-start gap-3 p-4 rounded-xl border text-sm ${styles[type]}`}>
      <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}

/* ─── File drop zone ──────────────────────────────────────────── */
function DropZone({ id, label, hint, onChange, fileCount, required }) {
  return (
    <div>
      <Label htmlFor={id} icon={<Image className="w-4 h-4" />} required={required}>
        {label}
      </Label>
      <div className="border-2 border-dashed border-brand-200 rounded-xl p-5 text-center hover:border-brand-400 transition-colors bg-brand-50/30">
        <input
          id={id}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={onChange}
          className="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-600 file:text-white hover:file:bg-brand-700 file:cursor-pointer"
          aria-required={required}
        />
        <p className="text-xs text-gray-400 mt-2">{hint}</p>
        {fileCount > 0 && (
          <p className="text-xs text-brand-600 font-semibold mt-1.5">
            {fileCount} file{fileCount !== 1 ? "s" : ""} selected
          </p>
        )}
      </div>
    </div>
  );
}

/* ─── Toggle flag chip ────────────────────────────────────────── */
function FlagChip({ id, label, icon, checked, onChange }) {
  return (
    <label htmlFor={id}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 cursor-pointer text-sm font-medium transition select-none ${
        checked
          ? "border-brand-500 bg-brand-50 text-brand-700"
          : "border-gray-200 text-gray-500 hover:border-brand-300"
      }`}>
      <input id={id} type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
      <span aria-hidden="true">{icon}</span>
      {label}
    </label>
  );
}

/* ─── Submit button ───────────────────────────────────────────── */
function SubmitBtn({ loading, label, loadingLabel }) {
  return (
    <button
      type="submit"
      disabled={loading}
      aria-busy={loading}
      className="w-full bg-brand-600 hover:bg-brand-700 active:scale-[0.99] text-white font-semibold py-3.5 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
    >
      {loading ? (
        <>
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
          {loadingLabel}
        </>
      ) : (
        <>
          <Upload className="w-4 h-4" aria-hidden="true" />
          {label}
        </>
      )}
    </button>
  );
}

/* ─── PLAN FORM default state ─────────────────────────────────── */
const PLAN_DEFAULT = {
  title: "", description: "", subCategoryGroup: "Commercial",
  subCategory: "Mixed use development",
  floorCount: "", rooms: "", price: "", area: "",
  featured: false, newListing: false, premium: false,
};

/* ─── BNB FORM default state ──────────────────────────────────── */
const BNB_DEFAULT = {
  title: "", description: "", location: "", county: "", town: "",
  pricePerNight: "", maxGuests: "", bedrooms: "", bathrooms: "",
  checkInTime: "14:00", checkOutTime: "11:00",
  amenities: [], rules: "",
};

/* ════════════════════════════════════════════════════════════════ */
export default function UploadProject() {
  const { token } = useAuth(); // ✅ AuthContext only — no localStorage fallback
  const uid = useId();

  const [activeTab, setActiveTab]   = useState("plan");

  /* Plan state */
  const [planForm, setPlanForm]     = useState(PLAN_DEFAULT);
  const [planFiles, setPlanFiles]   = useState(null);
  const [finalFiles, setFinalFiles] = useState(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [planMsg, setPlanMsg]       = useState({ type: "", text: "" });

  /* BNB state */
  const [bnbForm, setBnbForm]       = useState(BNB_DEFAULT);
  const [bnbFiles, setBnbFiles]     = useState(null);
  const [bnbLoading, setBnbLoading] = useState(false);
  const [bnbMsg, setBnbMsg]         = useState({ type: "", text: "" });

  /* ── Plan handlers ── */
  const handlePlanChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPlanForm((prev) => {
      const updated = { ...prev, [name]: type === "checkbox" ? checked : value };
      if (name === "subCategoryGroup") {
        const opts = CATEGORY_OPTIONS[value] || [];
        updated.subCategory = opts[0] || "";
      }
      return updated;
    });
  };

  const handlePlanSubmit = async (e) => {
    e.preventDefault();
    setPlanMsg({ type: "", text: "" });

    /* Basic validation */
    if (!planForm.title.trim())       return setPlanMsg({ type: "error", text: "Project title is required." });
    if (!planForm.description.trim()) return setPlanMsg({ type: "error", text: "Project description is required." });
    if (!planForm.price)              return setPlanMsg({ type: "error", text: "Price is required." });

    setPlanLoading(true);
    try {
      const body = new FormData();
      const fields = ["title","description","price","area","floorCount","rooms",
                      "subCategoryGroup","subCategory","featured","newListing","premium"];
      fields.forEach((f) => body.append(f, planForm[f]));

      if (planFiles)  Array.from(planFiles).forEach((file)  => body.append("planImages",  file));
      if (finalFiles) Array.from(finalFiles).forEach((file) => body.append("finalImages", file));

      const res = await fetch(`${API_BASE_URL}/api/plans/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }, // ✅ no localStorage fallback
        body,
      });

      // ✅ Bug fix: always parse error body safely
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Upload failed. Please try again.");
      }

      setPlanMsg({ type: "success", text: "Project uploaded successfully!" });
      setPlanForm(PLAN_DEFAULT);
      setPlanFiles(null);
      setFinalFiles(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setPlanMsg({ type: "error", text: err.message || "Something went wrong." });
    } finally {
      setPlanLoading(false);
    }
  };

  /* ── BNB handlers ── */
  const handleBnbChange = (e) => {
    const { name, value } = e.target;
    setBnbForm((f) => ({ ...f, [name]: value }));
  };

  const toggleAmenity = (id) => {
    setBnbForm((f) => ({
      ...f,
      amenities: f.amenities.includes(id)
        ? f.amenities.filter((a) => a !== id)
        : [...f.amenities, id],
    }));
  };

  const handleBnbSubmit = async (e) => {
    e.preventDefault();
    setBnbMsg({ type: "", text: "" });

    /* ✅ Bug fix: all validation before setBnbLoading — no early alert() leaks */
    const errs = [];
    if (!bnbForm.title.trim())       errs.push("Title is required.");
    if (!bnbForm.description.trim()) errs.push("Description is required.");
    if (!bnbForm.pricePerNight)      errs.push("Price per night is required.");
    if (!bnbFiles || bnbFiles.length === 0) errs.push("Please upload at least one image.");
    if (errs.length > 0) return setBnbMsg({ type: "error", text: errs.join(" ") });

    setBnbLoading(true);
    try {
      /* Step 1 — create listing */
      const listingRes = await fetch(`${API_BASE_URL}/api/bnb/admin/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title:       bnbForm.title,
          description: bnbForm.description,
          location:    bnbForm.location,
          county:      bnbForm.county,
          town:        bnbForm.town,
          price:       Number(bnbForm.pricePerNight),
          listingType: "bnb",
          bnb: {
            pricePerNight: Number(bnbForm.pricePerNight),
            maxGuests:     Number(bnbForm.maxGuests)  || 1,
            bedrooms:      Number(bnbForm.bedrooms)   || 1,
            bathrooms:     Number(bnbForm.bathrooms)  || 1,
            checkInTime:   bnbForm.checkInTime,
            checkOutTime:  bnbForm.checkOutTime,
            amenities:     bnbForm.amenities,
            rules: bnbForm.rules
              ? bnbForm.rules.split("\n").map((r) => r.trim()).filter(Boolean)
              : [],
          },
        }),
      });

      const listingData = await listingRes.json().catch(() => ({}));
      if (!listingRes.ok) throw new Error(listingData.error || "Failed to create BNB listing.");

      /* Step 2 — upload images */
      const imageBody = new FormData();
      Array.from(bnbFiles).forEach((file) => imageBody.append("images", file));

      const imageRes = await fetch(
        `${API_BASE_URL}/api/upload/bnb/${listingData.listing._id}`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: imageBody }
      );

      const imageResult = await imageRes.json().catch(() => ({}));
      if (!imageRes.ok) {
        /* Listing created but images failed — surface as a warning, not hard error */
        setBnbMsg({
          type: "error",
          text: `Listing created but images failed to upload: ${imageResult.error || "Unknown error"}. Add images from your dashboard.`,
        });
      } else {
        setBnbMsg({
          type: "success",
          text: `BNB listing created with ${imageResult.images?.length ?? 0} image(s)!`,
        });
        setBnbForm(BNB_DEFAULT);
        setBnbFiles(null);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err) {
      setBnbMsg({ type: "error", text: err.message || "Something went wrong." });
    } finally {
      setBnbLoading(false); // ✅ Bug fix: always resets, even after early-return validation
    }
  };

  const subOptions    = CATEGORY_OPTIONS[planForm.subCategoryGroup] || [];
  const showSubCat    = subOptions.length > 0;
  const planFileCount = planFiles  ? planFiles.length  : 0;
  const finalFileCount= finalFiles ? finalFiles.length : 0;
  const bnbFileCount  = bnbFiles   ? bnbFiles.length   : 0;

  /* ═══════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">

          {/* Header */}
          <header className="bg-gradient-to-r from-brand-600 to-brand-700 px-8 py-6">
            <div className="flex items-center gap-3 mb-1">
              <Upload className="w-6 h-6 text-white" aria-hidden="true" />
              <h1 className="text-2xl font-bold text-white">Upload New Listing</h1>
            </div>
            <p className="text-brand-100 text-sm">Add a house plan or BNB property listing</p>
          </header>

          {/* Tab switcher */}
          <nav
            role="tablist"
            aria-label="Listing type"
            className="flex border-b border-gray-100 bg-gray-50"
          >
            {[
              { id: "plan", label: "House Plan" },
              { id: "bnb",  label: "BNB Listing" },
            ].map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`panel-${tab.id}`}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3.5 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-500 ${
                  activeTab === tab.id
                    ? "bg-white border-b-2 border-brand-600 text-brand-700"
                    : "text-gray-500 hover:text-brand-600 hover:bg-white/60"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* ══ PLAN FORM ══════════════════════════════════════════ */}
          <section
            id="panel-plan"
            role="tabpanel"
            aria-labelledby="tab-plan"
            hidden={activeTab !== "plan"}
            className="p-8 space-y-6"
          >
            <InlineAlert type={planMsg.type} message={planMsg.text} />

            <form onSubmit={handlePlanSubmit} noValidate className="space-y-6" aria-label="Upload house plan">

              {/* Title */}
              <div>
                <Label htmlFor={`${uid}-plan-title`} icon={<FileText className="w-4 h-4" />} required>
                  Project Title
                </Label>
                <input
                  id={`${uid}-plan-title`}
                  name="title"
                  value={planForm.title}
                  onChange={handlePlanChange}
                  placeholder="Enter your project title"
                  required
                  aria-required="true"
                  className={inputCls}
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor={`${uid}-plan-desc`} icon={<FileText className="w-4 h-4" />} required>
                  Project Description
                </Label>
                <textarea
                  id={`${uid}-plan-desc`}
                  name="description"
                  value={planForm.description}
                  onChange={handlePlanChange}
                  placeholder="Describe the project in detail…"
                  rows={4}
                  required
                  aria-required="true"
                  className={inputCls + " resize-vertical"}
                />
              </div>

              {/* Categories */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`${uid}-main-cat`} icon={<Building className="w-4 h-4" />}>
                    Main Category
                  </Label>
                  <select
                    id={`${uid}-main-cat`}
                    name="subCategoryGroup"
                    value={planForm.subCategoryGroup}
                    onChange={handlePlanChange}
                    className={selectCls}
                  >
                    {Object.keys(CATEGORY_OPTIONS).map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {showSubCat && (
                  <div>
                    <Label htmlFor={`${uid}-sub-cat`} icon={CATEGORY_ICONS[planForm.subCategoryGroup]}>
                      Sub Category
                    </Label>
                    <select
                      id={`${uid}-sub-cat`}
                      name="subCategory"
                      value={planForm.subCategory}
                      onChange={handlePlanChange}
                      className={selectCls}
                    >
                      {subOptions.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Rooms & floors */}
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { id: `${uid}-rooms`,  name: "rooms",      label: "Rooms",       placeholder: "e.g. 4" },
                  { id: `${uid}-floors`, name: "floorCount", label: "Floors",      placeholder: "e.g. 2" },
                  { id: `${uid}-area`,   name: "area",       label: "Area (sqm)",  placeholder: "e.g. 150" },
                ].map(({ id, name, label, placeholder }) => (
                  <div key={name}>
                    <Label htmlFor={id}>{label}</Label>
                    <input
                      id={id}
                      name={name}
                      type="number"
                      min="0"
                      value={planForm[name]}
                      onChange={handlePlanChange}
                      placeholder={placeholder}
                      className={inputCls}
                    />
                  </div>
                ))}
              </div>

              {/* Price */}
              <div>
                <Label htmlFor={`${uid}-price`} required>Price (KES)</Label>
                <input
                  id={`${uid}-price`}
                  name="price"
                  type="number"
                  min="0"
                  value={planForm.price}
                  onChange={handlePlanChange}
                  placeholder="e.g. 2,500,000"
                  required
                  aria-required="true"
                  className={inputCls}
                />
              </div>

              {/* Listing flags — now visible UI instead of hidden state */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Listing Flags</p>
                <div className="flex flex-wrap gap-2">
                  <FlagChip
                    id={`${uid}-featured`}
                    label="Featured"
                    icon={<Star className="w-4 h-4" />}
                    checked={planForm.featured}
                    onChange={(e) => setPlanForm((f) => ({ ...f, featured: e.target.checked }))}
                  />
                  <FlagChip
                    id={`${uid}-new`}
                    label="New Listing"
                    icon={<Sparkles className="w-4 h-4" />}
                    checked={planForm.newListing}
                    onChange={(e) => setPlanForm((f) => ({ ...f, newListing: e.target.checked }))}
                  />
                  <FlagChip
                    id={`${uid}-premium`}
                    label="Premium"
                    icon={<Zap className="w-4 h-4" />}
                    checked={planForm.premium}
                    onChange={(e) => setPlanForm((f) => ({ ...f, premium: e.target.checked }))}
                  />
                </div>
              </div>

              {/* Images */}
              <DropZone
                id={`${uid}-plan-imgs`}
                label="Plan Images (blueprints)"
                hint="Architectural drawings and blueprints — JPG, PNG or WebP"
                onChange={(e) => setPlanFiles(e.target.files)}
                fileCount={planFileCount}
              />
              <DropZone
                id={`${uid}-final-imgs`}
                label="Final Product Images"
                hint="3–10 photos of the completed project — JPG, PNG or WebP"
                onChange={(e) => setFinalFiles(e.target.files)}
                fileCount={finalFileCount}
              />

              <SubmitBtn
                loading={planLoading}
                label="Upload Project"
                loadingLabel="Uploading…"
              />
            </form>
          </section>

          {/* ══ BNB FORM ═══════════════════════════════════════════ */}
          <section
            id="panel-bnb"
            role="tabpanel"
            aria-labelledby="tab-bnb"
            hidden={activeTab !== "bnb"}
            className="p-8 space-y-6"
          >
            <InlineAlert type={bnbMsg.type} message={bnbMsg.text} />

            <form onSubmit={handleBnbSubmit} noValidate className="space-y-6" aria-label="Create BNB listing">

              {/* Title */}
              <div>
                <Label htmlFor={`${uid}-bnb-title`} required>Title</Label>
                <input
                  id={`${uid}-bnb-title`}
                  name="title"
                  value={bnbForm.title}
                  onChange={handleBnbChange}
                  placeholder="e.g. Hillersons Luxury Suite — Karen"
                  required
                  aria-required="true"
                  className={inputCls}
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor={`${uid}-bnb-desc`} required>Description</Label>
                <textarea
                  id={`${uid}-bnb-desc`}
                  name="description"
                  value={bnbForm.description}
                  onChange={handleBnbChange}
                  placeholder="Describe the property, its atmosphere and highlights…"
                  rows={4}
                  required
                  aria-required="true"
                  className={inputCls + " resize-vertical"}
                />
              </div>

              {/* Location */}
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { id: `${uid}-loc`,    name: "location", label: "Location",   placeholder: "e.g. Karen, Nairobi", icon: <MapPin className="w-4 h-4" /> },
                  { id: `${uid}-county`, name: "county",   label: "County",     placeholder: "e.g. Nairobi" },
                  { id: `${uid}-town`,   name: "town",     label: "Town / Area", placeholder: "e.g. Karen" },
                ].map(({ id, name, label, placeholder, icon }) => (
                  <div key={name}>
                    <Label htmlFor={id} icon={icon}>{label}</Label>
                    <input
                      id={id}
                      name={name}
                      value={bnbForm[name]}
                      onChange={handleBnbChange}
                      placeholder={placeholder}
                      className={inputCls}
                    />
                  </div>
                ))}
              </div>

              {/* Price + guest details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { id: `${uid}-ppn`,   name: "pricePerNight", label: "Price / Night (KES)", placeholder: "5000",  req: true },
                  { id: `${uid}-guests`,name: "maxGuests",      label: "Max Guests",          placeholder: "4",    icon: <Users className="w-4 h-4" /> },
                  { id: `${uid}-beds`,  name: "bedrooms",       label: "Bedrooms",            placeholder: "2",    icon: <Bed   className="w-4 h-4" /> },
                  { id: `${uid}-baths`, name: "bathrooms",      label: "Bathrooms",           placeholder: "1",    icon: <Bath  className="w-4 h-4" /> },
                ].map(({ id, name, label, placeholder, req, icon }) => (
                  <div key={name}>
                    <Label htmlFor={id} icon={icon} required={req}>{label}</Label>
                    <input
                      id={id}
                      name={name}
                      type="number"
                      min="0"
                      value={bnbForm[name]}
                      onChange={handleBnbChange}
                      placeholder={placeholder}
                      required={req}
                      aria-required={req ? "true" : undefined}
                      className={inputCls}
                    />
                  </div>
                ))}
              </div>

              {/* Check-in / Check-out */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: `${uid}-checkin`,  name: "checkInTime",  label: "Check-in Time" },
                  { id: `${uid}-checkout`, name: "checkOutTime", label: "Check-out Time" },
                ].map(({ id, name, label }) => (
                  <div key={name}>
                    <Label htmlFor={id} icon={<Clock className="w-4 h-4" />}>{label}</Label>
                    <input
                      id={id}
                      name={name}
                      type="time"
                      value={bnbForm[name]}
                      onChange={handleBnbChange}
                      className={inputCls}
                    />
                  </div>
                ))}
              </div>

              {/* Amenities */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Amenities</p>
                <div className="flex flex-wrap gap-2" role="group" aria-label="Select amenities">
                  {AMENITY_OPTIONS.map(({ id, label }) => {
                    const active = bnbForm.amenities.includes(id);
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => toggleAmenity(id)}
                        aria-pressed={active}
                        className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition focus:outline-none focus:ring-2 focus:ring-brand-400 ${
                          active
                            ? "border-brand-500 bg-brand-50 text-brand-700"
                            : "border-gray-200 text-gray-500 hover:border-brand-300"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Rules */}
              <div>
                <Label htmlFor={`${uid}-rules`}>House Rules <span className="text-gray-400 font-normal">(one per line)</span></Label>
                <textarea
                  id={`${uid}-rules`}
                  name="rules"
                  value={bnbForm.rules}
                  onChange={handleBnbChange}
                  placeholder={"No smoking\nNo pets\nNo parties"}
                  rows={3}
                  className={inputCls + " resize-none"}
                />
              </div>

              {/* Images */}
              <DropZone
                id={`${uid}-bnb-imgs`}
                label="Property Images"
                hint="JPG, PNG or WebP — up to 10 images, max 5 MB each"
                onChange={(e) => setBnbFiles(e.target.files)}
                fileCount={bnbFileCount}
                required
              />

              <SubmitBtn
                loading={bnbLoading}
                label="Create BNB Listing"
                loadingLabel="Creating listing…"
              />
            </form>
          </section>

        </div>
      </div>
    </div>
  );
}