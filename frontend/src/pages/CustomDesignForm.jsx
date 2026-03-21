import { useState } from "react";
import {
  Phone, Mail, Send, ArrowRight, Loader2,
  Home, Building2, Building, Store, UtensilsCrossed,
  Hotel, Warehouse, School, Hospital, Sparkles,
} from "lucide-react";
import { API_BASE_URL } from "../lib/api";
import { useProjects } from "../context/ProjectsContext";
import Header from "../components/Header";
import Footer from "../components/Footer";

// ── SEO meta helper (works with react-helmet or similar) ─────────────────────
// If you have react-helmet-async installed, wrap <Helmet> around the meta block.
// For now the meta tags are documented here for when you add SSR/helmet.
// title: "Request a Custom Architectural Design | Hillersons Designs Kenya"
// description: "Submit your custom house or commercial design request to Hillersons Designs. Kenya's award-winning architectural firm serving Nairobi, Mombasa, Kisumu & beyond."
// keywords: "custom house design Kenya, architectural plans Nairobi, bespoke home design, commercial architecture Kenya, Hillersons Designs"

const projectTypes = [
  { value: "",                  label: "Select Project Type",    disabled: true },
  { value: "residential-house", label: "Residential House" },
  { value: "modern-villa",      label: "Modern Villa" },
  { value: "apartment-complex", label: "Apartment Complex" },
  { value: "office-building",   label: "Office Building" },
  { value: "retail-space",      label: "Retail Space" },
  { value: "restaurant",        label: "Restaurant" },
  { value: "hotel",             label: "Hotel" },
  { value: "warehouse",         label: "Warehouse" },
  { value: "school",            label: "School / Educational Facility" },
  { value: "healthcare",        label: "Healthcare Facility" },
  { value: "other",             label: "Other" },
];

const budgetRanges = [
  { value: "",         label: "Select Budget Range",       disabled: true },
  { value: "under-50k",  label: "Under KES 5,000,000" },
  { value: "50k-100k",   label: "KES 5M – KES 10M" },
  { value: "100k-250k",  label: "KES 10M – KES 25M" },
  { value: "250k-500k",  label: "KES 25M – KES 50M" },
  { value: "500k-1m",    label: "KES 50M – KES 100M" },
  { value: "above-1m",   label: "Above KES 100M" },
  { value: "discuss",    label: "Let's Discuss" },
];

const roomOptions = [
  { value: "",          label: "Select Room Configuration", disabled: true },
  { value: "1-bedroom", label: "1 Bedroom" },
  { value: "2-bedroom", label: "2 Bedrooms" },
  { value: "3-bedroom", label: "3 Bedrooms" },
  { value: "4-bedroom", label: "4+ Bedrooms" },
  { value: "studio",    label: "Studio / Open Plan" },
  { value: "custom",    label: "Custom Configuration" },
];

const process = [
  {
    step: "1",
    title: "Consultation",
    detail: "Initial discussion within 24 hours of submission",
  },
  {
    step: "2",
    title: "Design Phase",
    detail: "Conceptual designs and 3D visualisations",
  },
  {
    step: "3",
    title: "Development",
    detail: "Detailed drawings, BOQs and full documentation",
  },
];

const inputClass =
  "w-full border-2 border-brand-200 focus:border-brand-500 focus:outline-none rounded-xl p-4 text-brand-900 placeholder-brand-300 transition bg-white hover:border-brand-300 text-sm";

const labelClass =
  "block text-brand-800 font-semibold text-xs uppercase tracking-wide mb-2";

export default function CustomDesignForm() {
  const { projects } = useProjects();
  const [showSearch, setShowSearch]         = useState(false);
  const [searchQuery, setSearchQuery]       = useState("");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isSubmitting, setIsSubmitting]     = useState(false);
  const [isSubmitted, setIsSubmitted]       = useState(false);

  const [form, setForm] = useState({
    name: "", email: "", phone: "",
    projectType: "", rooms: "", budget: "", description: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/custom-requests/custom-design`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setIsSubmitted(true);
        setForm({ name: "", email: "", phone: "", projectType: "", rooms: "", budget: "", description: "" });
        setTimeout(() => setIsSubmitted(false), 5000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-50">
      <Header
        showSearch={showSearch} setShowSearch={setShowSearch}
        searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        showMobileMenu={showMobileMenu} setShowMobileMenu={setShowMobileMenu}
        projects={projects}
      />

      {/* JSON-LD structured data for SEO */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "ProfessionalService",
        "name": "Hillersons Designs",
        "description": "Custom architectural and interior design services in Kenya. Residential, commercial and social amenity projects.",
        "url": "https://hillersons-architecture-site.vercel.app",
        "telephone": "+254763831806",
        "email": "HillersonsDesigns@gmail.com",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Rehema House",
          "addressLocality": "Nairobi",
          "addressCountry": "KE"
        },
        "areaServed": "Kenya",
        "serviceType": ["Residential Architecture", "Commercial Architecture", "Interior Design", "Renovation"]
      })}} />

      <main className="max-w-5xl mx-auto px-4 py-12">

        {/* ── Page heading ────────────────────────────────────────────────────── */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-600 rounded-2xl mb-6 shadow-lg">
            <Building2 className="w-8 h-8 text-white" aria-hidden="true" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-brand-900 mb-4 leading-tight">
            Request a Custom Architectural Design
          </h1>
          <p className="text-lg text-brand-700 max-w-3xl mx-auto leading-relaxed">
            Transform your vision into a professionally crafted architectural
            plan. Hillersons Designs specialises in innovative, sustainable, and
            bespoke designs for homes, commercial spaces and social amenities
            across Kenya.
          </p>
        </header>

        {/* ── Success state ────────────────────────────────────────────────────── */}
        {isSubmitted ? (
          <div className="bg-white rounded-2xl border border-brand-200 shadow-lg p-16 text-center">
            <div className="w-20 h-20 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Send className="w-9 h-9 text-brand-600" />
            </div>
            <h2 className="text-2xl font-bold text-brand-900 mb-3">
              Request Submitted!
            </h2>
            <p className="text-brand-700">
              Our architects will review your project and contact you within 24 hours.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            aria-label="Custom design request form"
            className="bg-white rounded-2xl shadow-lg overflow-hidden border border-brand-100"
          >
            {/* Form header bar */}
            <div className="bg-brand-600 p-8">
              <h2 className="text-2xl font-bold text-white mb-1">Project Details</h2>
              <p className="text-brand-100 text-sm">
                Share your vision and we'll get back to you within 24 hours
              </p>
            </div>

            <div className="p-8 md:p-12">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                {/* ── Left: form fields ──────────────────────────────────────── */}
                <div className="lg:col-span-2 space-y-10">

                  {/* Section 1 — Personal info */}
                  <section aria-labelledby="personal-info-heading">
                    <h3
                      id="personal-info-heading"
                      className="text-xl font-bold text-brand-900 mb-6 flex items-center gap-3"
                    >
                      <span className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 font-bold text-sm">
                        1
                      </span>
                      Personal Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className={labelClass}>Full Name *</label>
                        <input
                          id="name" type="text" name="name"
                          placeholder="Enter your full name"
                          value={form.name} onChange={handleChange}
                          className={inputClass} required
                          autoComplete="name"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className={labelClass}>Email Address *</label>
                        <input
                          id="email" type="email" name="email"
                          placeholder="your.email@example.com"
                          value={form.email} onChange={handleChange}
                          className={inputClass} required
                          autoComplete="email"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label htmlFor="phone" className={labelClass}>Phone Number</label>
                        <input
                          id="phone" type="tel" name="phone"
                          placeholder="+254 700 000 000"
                          value={form.phone} onChange={handleChange}
                          className={inputClass}
                          autoComplete="tel"
                        />
                      </div>
                    </div>
                  </section>

                  {/* Section 2 — Project specs */}
                  <section aria-labelledby="project-specs-heading">
                    <h3
                      id="project-specs-heading"
                      className="text-xl font-bold text-brand-900 mb-6 flex items-center gap-3"
                    >
                      <span className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 font-bold text-sm">
                        2
                      </span>
                      Project Specifications
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="projectType" className={labelClass}>Project Type *</label>
                        <select
                          id="projectType" name="projectType"
                          value={form.projectType} onChange={handleChange}
                          className={inputClass} required
                        >
                          {projectTypes.map((t, i) => (
                            <option key={i} value={t.value} disabled={t.disabled}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="rooms" className={labelClass}>Room Configuration</label>
                        <select
                          id="rooms" name="rooms"
                          value={form.rooms} onChange={handleChange}
                          className={inputClass}
                        >
                          {roomOptions.map((r, i) => (
                            <option key={i} value={r.value} disabled={r.disabled}>
                              {r.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label htmlFor="budget" className={labelClass}>Project Budget</label>
                        <select
                          id="budget" name="budget"
                          value={form.budget} onChange={handleChange}
                          className={inputClass}
                        >
                          {budgetRanges.map((b, i) => (
                            <option key={i} value={b.value} disabled={b.disabled}>
                              {b.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </section>

                  {/* Section 3 — Vision */}
                  <section aria-labelledby="vision-heading">
                    <h3
                      id="vision-heading"
                      className="text-xl font-bold text-brand-900 mb-6 flex items-center gap-3"
                    >
                      <span className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 font-bold text-sm">
                        3
                      </span>
                      Your Vision
                    </h3>
                    <label htmlFor="description" className={labelClass}>
                      Project Description
                    </label>
                    <textarea
                      id="description" name="description"
                      placeholder="Describe your ideal design — style preferences, functional needs, sustainability goals, specific features, site location, and any inspiration you have in mind."
                      value={form.description} onChange={handleChange}
                      rows={6}
                      className={`${inputClass} resize-none`}
                    />
                  </section>
                </div>

                {/* ── Right: sidebar ─────────────────────────────────────────── */}
                <aside className="lg:col-span-1">
                  <div className="sticky top-8 space-y-6">

                    {/* Our process */}
                    <div className="bg-brand-50 rounded-2xl p-6 border border-brand-100">
                      <h4 className="font-bold text-brand-900 text-base mb-4">
                        Our Design Process
                      </h4>
                      <ol className="space-y-4">
                        {process.map(({ step, title, detail }) => (
                          <li key={step} className="flex items-start gap-3">
                            <span className="w-6 h-6 bg-brand-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                              {step}
                            </span>
                            <div>
                              <p className="text-sm font-semibold text-brand-900">{title}</p>
                              <p className="text-xs text-brand-600 mt-0.5">{detail}</p>
                            </div>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Contact */}
                    <div className="bg-white rounded-2xl p-6 border-2 border-brand-200">
                      <h4 className="font-bold text-brand-900 text-base mb-4">
                        Need Help?
                      </h4>
                      <div className="space-y-3">
                        <a
                          href="tel:+254763831806"
                          className="flex items-center gap-3 group"
                          aria-label="Call Hillersons Designs"
                        >
                          <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Phone className="w-4 h-4 text-brand-600" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-brand-800">Call Us</p>
                            <p className="text-xs text-brand-600 group-hover:text-brand-800 transition">
                              +254 763 831 806
                            </p>
                          </div>
                        </a>
                        <a
                          href="mailto:HillersonsDesigns@gmail.com"
                          className="flex items-center gap-3 group"
                          aria-label="Email Hillersons Designs"
                        >
                          <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Mail className="w-4 h-4 text-brand-600" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-brand-800">Email</p>
                            <p className="text-xs text-brand-600 group-hover:text-brand-800 transition">
                              HillersonsDesigns@gmail.com
                            </p>
                          </div>
                        </a>
                      </div>
                    </div>
                  </div>
                </aside>
              </div>

              {/* ── Submit ──────────────────────────────────────────────────── */}
              <div className="flex justify-center mt-12">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  aria-label="Submit your custom design request"
                  className="bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white font-bold text-base px-14 py-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-3"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting Request...
                    </>
                  ) : (
                    <>
                      Submit Design Request
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </main>

      <Footer />
    </div>
  );
}