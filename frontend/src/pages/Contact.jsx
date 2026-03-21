import React, { useState } from "react";
import {
  Mail, Phone, MapPin, Clock, Send, MessageCircle,
  Building, CheckCircle, Loader2, Globe, Award, Users,
} from "lucide-react";
import { useProjects } from "../context/ProjectsContext";
import Header from "../components/Header";
import Footer from "../components/Footer";

const Contact = () => {
  const { projects } = useProjects();
  const [showSearch, setShowSearch]     = useState(false);
  const [searchQuery, setSearchQuery]   = useState("");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [formData, setFormData] = useState({
    name: "", email: "", subject: "", message: "", projectType: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted]   = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: "", email: "", subject: "", message: "", projectType: "" });
    }, 3000);
  };

  const contactMethods = [
    {
      icon: MessageCircle,
      title: "WhatsApp Chat",
      description: "Quick responses, instant communication",
      action: "Start Chat",
      href: "https://wa.me/254763831806?text=Hello%20Hillersons%20InvestmentCo.,%20I%20would%20like%20to%20inquire%20about%20your%20services.",
    },
    {
      icon: Mail,
      title: "Email Us",
      description: "Detailed proposals and documentation",
      action: "Send Email",
      href: "mailto:hillersonsdesigns@gmail.com",
    },
    {
      icon: Phone,
      title: "Call Direct",
      description: "Speak with our design consultants",
      action: "Call Now",
      href: "tel:+254763831806",
    },
  ];

  const companyInfo = [
    {
      icon: MapPin,
      title: "Visit Our Studio",
      info: "Rehema Hse, Nairobi, Kenya",
      subInfo: "By appointment only",
    },
    {
      icon: Clock,
      title: "Working Hours",
      info: "Monday – Friday: 9:00 AM – 6:00 PM",
      subInfo: "Saturday: 10:00 AM – 2:00 PM",
    },
    {
      icon: Building,
      title: "Our Expertise",
      info: "Architecture · Interior Design · Renovation",
      subInfo: "10+ years of experience",
    },
  ];

  const stats = [
    { icon: Award, number: "150+", label: "Projects Completed" },
    { icon: Users, number: "98%",  label: "Client Satisfaction" },
    { icon: Globe, number: "4+",   label: "Cities Served" },
  ];

  // Shared input class
  const inputClass =
    "w-full p-4 border-2 border-brand-200 rounded-xl focus:outline-none focus:border-brand-500 transition bg-brand-50 focus:bg-white text-brand-900 placeholder-brand-300";

  return (
    <div className="min-h-screen bg-brand-50">
      <Header
        showSearch={showSearch}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        showMobileMenu={showMobileMenu}
        setShowMobileMenu={setShowMobileMenu}
        setShowSearch={setShowSearch}
        projects={projects}
      />

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative py-24 text-center overflow-hidden">
        <div className="absolute inset-0 bg-brand-50" />
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-brand-100 rounded-full blur-3xl animate-pulse opacity-60" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-brand-200 rounded-full blur-3xl animate-pulse opacity-40" />

        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <h1 className="text-5xl md:text-7xl font-black text-brand-900 leading-tight mb-6">
            Let's Create{" "}
            <span className="text-brand-600">Something Amazing</span>
          </h1>
          <p className="text-xl text-brand-700 max-w-3xl mx-auto leading-relaxed mb-8">
            Transform your space with award-winning architecture and interior
            design. We bring your vision to life with precision, creativity, and
            unmatched expertise.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mt-12">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <stat.icon className="w-6 h-6 text-brand-600 mr-2" />
                  <span className="text-3xl font-bold text-brand-900">{stat.number}</span>
                </div>
                <p className="text-brand-600 text-sm font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact method cards ──────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <h2 className="text-3xl font-bold text-center text-brand-900 mb-12">
          Choose Your Preferred Way to Connect
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {contactMethods.map((method, index) => (
            <a
              key={index}
              href={method.href}
              target={method.href.startsWith("http") ? "_blank" : undefined}
              rel={method.href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-brand-100"
            >
              <div className="w-14 h-14 bg-brand-600 group-hover:bg-brand-700 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300">
                <method.icon className="w-7 h-7 text-white" />
              </div>

              <h3 className="text-xl font-bold text-brand-900 mb-3 group-hover:text-brand-600 transition-colors">
                {method.title}
              </h3>
              <p className="text-brand-700 mb-6 leading-relaxed text-sm">
                {method.description}
              </p>

              <div className="flex items-center text-brand-600 font-semibold group-hover:text-brand-800 transition-colors">
                {method.action}
                <Send className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ── Contact form ──────────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="relative bg-white rounded-2xl shadow-lg p-10 md:p-14 overflow-hidden border border-brand-100">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-50 rounded-full blur-3xl opacity-60 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-100 rounded-full blur-3xl opacity-40 animate-pulse" />

          <div className="relative z-10">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-bold text-brand-900 mb-4">
                Start Your Project Today
              </h2>
              <p className="text-brand-700 text-lg max-w-2xl mx-auto">
                Tell us about your vision and we'll get back to you within 24
                hours with a personalized consultation.
              </p>
            </div>

            {isSubmitted ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-brand-600" />
                </div>
                <h3 className="text-2xl font-bold text-brand-900 mb-4">
                  Message Sent Successfully!
                </h3>
                <p className="text-brand-600">
                  We'll get back to you within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-brand-800 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className={inputClass}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-brand-800 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className={inputClass}
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-brand-800 mb-2">
                    Project Type
                  </label>
                  <select
                    name="projectType"
                    value={formData.projectType}
                    onChange={handleInputChange}
                    className={inputClass}
                  >
                    <option value="">Select project type</option>
                    <option value="residential">Residential Architecture</option>
                    <option value="commercial">Commercial Architecture</option>
                    <option value="interior">Interior Design</option>
                    <option value="renovation">Renovation</option>
                    <option value="consultation">Design Consultation</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-brand-800 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className={inputClass}
                    placeholder="Brief description of your project"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-brand-800 mb-2">
                    Project Details *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className={`${inputClass} resize-none`}
                    placeholder="Tell us about your project, timeline, budget range, and any specific requirements..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white py-4 px-8 rounded-xl font-semibold shadow transition-all duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending Message...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── Company info cards ────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-8">
          {companyInfo.map((info, index) => (
            <div
              key={index}
              className="flex gap-4 items-start p-6 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow border border-brand-100"
            >
              <div className="p-3 bg-brand-100 rounded-xl flex-shrink-0">
                <info.icon className="w-6 h-6 text-brand-600" />
              </div>
              <div>
                <h4 className="font-semibold text-brand-900 mb-1">{info.title}</h4>
                <p className="text-brand-800 text-sm mb-1">{info.info}</p>
                <p className="text-sm text-brand-500">{info.subInfo}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;