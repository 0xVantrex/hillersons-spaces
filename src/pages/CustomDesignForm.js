import { useState } from "react";
import { API_BASE_URL } from "../lib/api";
import { useProjects } from "../context/ProjectsContext";
import Header from "../components/Header";
import Footer from "../components/Footer";

const CustomDesignForm = () => {
  const { projects } = useProjects();
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    projectType: "",
    rooms: "",
    budget: "",
    description: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/custom-requests/custom-design`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      if (res.ok) {
        alert("✅ Request sent! Our architects will contact you soon.");
        setForm({
          name: "",
          email: "",
          phone: "",
          projectType: "",
          rooms: "",
          budget: "",
          description: "",
        });
      }
    } catch (err) {
      console.error(err);
      alert("❌ Something went wrong. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const projectTypes = [
    { value: "", label: "Select Project Type", disabled: true },
    { value: "residential-house", label: "🏠 Residential House" },
    { value: "modern-villa", label: "🏡 Modern Villa" },
    { value: "apartment-complex", label: "🏢 Apartment Complex" },
    { value: "office-building", label: "🏢 Office Building" },
    { value: "retail-space", label: "🏪 Retail Space" },
    { value: "restaurant", label: "🍽️ Restaurant" },
    { value: "hotel", label: "🏨 Hotel" },
    { value: "warehouse", label: "🏭 Warehouse" },
    { value: "school", label: "🏫 School/Educational" },
    { value: "healthcare", label: "🏥 Healthcare Facility" },
    { value: "other", label: "✨ Other" },
  ];

  const budgetRanges = [
    { value: "", label: "Select Budget Range", disabled: true },
    { value: "under-50k", label: "Under $50,000" },
    { value: "50k-100k", label: "$50,000 - $100,000" },
    { value: "100k-250k", label: "$100,000 - $250,000" },
    { value: "250k-500k", label: "$250,000 - $500,000" },
    { value: "500k-1m", label: "$500,000 - $1,000,000" },
    { value: "above-1m", label: "Above $1,000,000" },
    { value: "discuss", label: "Let's Discuss" },
  ];

  const roomOptions = [
    { value: "", label: "Select Room Configuration", disabled: true },
    { value: "1-bedroom", label: "1 Bedroom" },
    { value: "2-bedroom", label: "2 Bedrooms" },
    { value: "3-bedroom", label: "3 Bedrooms" },
    { value: "4-bedroom", label: "4+ Bedrooms" },
    { value: "studio", label: "Studio/Open Plan" },
    { value: "custom", label: "Custom Configuration" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-lime-50 py-8 px-4">
      <Header
        showSearch={showSearch}
        setShowSearch={setShowSearch}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        showMobileMenu={showMobileMenu}
        setShowMobileMenu={setShowMobileMenu}
        projects={projects}
      />
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-600 to-lime-600 rounded-3xl mb-6 shadow-xl">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-emerald-800 to-lime-700 bg-clip-text text-transparent mb-6">
            Request a Custom Design
          </h1>
          <p className="text-xl text-emerald-700 max-w-3xl mx-auto leading-relaxed">
            Transform your vision into architectural reality. Our expert team
            specializes in creating innovative, sustainable, and stunning
            architectural solutions tailored to your unique needs.
          </p>
        </div>

        {/* Form Container */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-emerald-100"
        >
          {/* Header Bar */}
          <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-lime-500 p-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Project Details
                </h2>
                <p className="text-emerald-100">
                  Share your vision and we'll bring it to life within 24 hours
                </p>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-8 md:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Personal Information */}
              <div className="lg:col-span-2 space-y-6">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-emerald-800 mb-6 flex items-center">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-emerald-600 font-bold">1</span>
                    </div>
                    Personal Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name Field */}
                    <div className="space-y-2">
                      <label className="block text-emerald-800 font-semibold text-sm uppercase tracking-wide">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        placeholder="Enter your full name"
                        value={form.name}
                        onChange={handleChange}
                        className="w-full border-2 border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200/50 rounded-xl p-4 text-emerald-900 placeholder-emerald-400 transition-all duration-300 bg-white hover:border-emerald-300"
                        required
                      />
                    </div>

                    {/* Email Field */}
                    <div className="space-y-2">
                      <label className="block text-emerald-800 font-semibold text-sm uppercase tracking-wide">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        placeholder="your.email@example.com"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full border-2 border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200/50 rounded-xl p-4 text-emerald-900 placeholder-emerald-400 transition-all duration-300 bg-white hover:border-emerald-300"
                        required
                      />
                    </div>

                    {/* Phone Field */}
                    <div className="space-y-2 md:col-span-2">
                      <label className="block text-emerald-800 font-semibold text-sm uppercase tracking-wide">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        placeholder="+1 (555) 123-4567"
                        value={form.phone}
                        onChange={handleChange}
                        className="w-full border-2 border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200/50 rounded-xl p-4 text-emerald-900 placeholder-emerald-400 transition-all duration-300 bg-white hover:border-emerald-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Project Specifications */}
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-emerald-800 mb-6 flex items-center">
                    <div className="w-8 h-8 bg-lime-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-lime-600 font-bold">2</span>
                    </div>
                    Project Specifications
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Project Type */}
                    <div className="space-y-2">
                      <label className="block text-emerald-800 font-semibold text-sm uppercase tracking-wide">
                        Project Type *
                      </label>
                      <select
                        name="projectType"
                        value={form.projectType}
                        onChange={handleChange}
                        className="w-full border-2 border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200/50 rounded-xl p-4 text-emerald-900 bg-white transition-all duration-300 hover:border-emerald-300"
                        required
                      >
                        {projectTypes.map((type, index) => (
                          <option
                            key={index}
                            value={type.value}
                            disabled={type.disabled}
                          >
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Rooms */}
                    <div className="space-y-2">
                      <label className="block text-emerald-800 font-semibold text-sm uppercase tracking-wide">
                        Room Configuration
                      </label>
                      <select
                        name="rooms"
                        value={form.rooms}
                        onChange={handleChange}
                        className="w-full border-2 border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200/50 rounded-xl p-4 text-emerald-900 bg-white transition-all duration-300 hover:border-emerald-300"
                      >
                        {roomOptions.map((room, index) => (
                          <option
                            key={index}
                            value={room.value}
                            disabled={room.disabled}
                          >
                            {room.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Budget */}
                    <div className="space-y-2 md:col-span-2">
                      <label className="block text-emerald-800 font-semibold text-sm uppercase tracking-wide">
                        Project Budget
                      </label>
                      <select
                        name="budget"
                        value={form.budget}
                        onChange={handleChange}
                        className="w-full border-2 border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200/50 rounded-xl p-4 text-emerald-900 bg-white transition-all duration-300 hover:border-emerald-300"
                      >
                        {budgetRanges.map((range, index) => (
                          <option
                            key={index}
                            value={range.value}
                            disabled={range.disabled}
                          >
                            {range.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Project Description */}
                <div>
                  <h3 className="text-2xl font-bold text-emerald-800 mb-6 flex items-center">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-emerald-600 font-bold">3</span>
                    </div>
                    Your Vision
                  </h3>

                  <div className="space-y-2">
                    <label className="block text-emerald-800 font-semibold text-sm uppercase tracking-wide">
                      Project Description
                    </label>
                    <textarea
                      name="description"
                      placeholder="Describe your dream design in detail... Tell us about your style preferences, functional requirements, sustainability goals, and any specific features you envision."
                      value={form.description}
                      onChange={handleChange}
                      rows={6}
                      className="w-full border-2 border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200/50 rounded-xl p-4 text-emerald-900 placeholder-emerald-400 transition-all duration-300 resize-none bg-white hover:border-emerald-300"
                    />
                  </div>
                </div>
              </div>

              {/* Right Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-8 space-y-6">
                  {/* Process Info */}
                  <div className="bg-gradient-to-br from-lime-50 to-emerald-50 rounded-2xl p-6 border border-lime-200">
                    <h4 className="font-bold text-emerald-800 text-lg mb-4 flex items-center">
                      <div className="w-8 h-8 bg-lime-500 rounded-full flex items-center justify-center mr-3">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      Our Process
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-white text-xs font-bold">
                            1
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-emerald-800">
                            Consultation
                          </p>
                          <p className="text-xs text-emerald-600">
                            Initial discussion within 24h
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-white text-xs font-bold">
                            2
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-emerald-800">
                            Design Phase
                          </p>
                          <p className="text-xs text-emerald-600">
                            Conceptual designs & 3D models
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-white text-xs font-bold">
                            3
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-emerald-800">
                            Development
                          </p>
                          <p className="text-xs text-emerald-600">
                            Detailed drawings & documentation
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="bg-white rounded-2xl p-6 border-2 border-emerald-200">
                    <h4 className="font-bold text-emerald-800 text-lg mb-4">
                      Need Help?
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-emerald-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-emerald-800">
                            Call Us
                          </p>
                          <p className="text-xs text-emerald-600">
                            +254 763 831 806
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-emerald-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-emerald-800">
                            Email
                          </p>
                          <p className="text-xs text-emerald-600">
                            HillersonsDesigns@gmail.com
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center mt-12">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-lime-500 hover:from-emerald-700 hover:via-emerald-600 hover:to-lime-600 text-white font-bold text-xl px-16 py-5 rounded-2xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    <span>Submitting Your Request...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <span>Submit Design Request</span>
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </div>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default CustomDesignForm;
