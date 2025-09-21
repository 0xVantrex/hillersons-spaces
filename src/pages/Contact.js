import React, { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageCircle,
  Building,
  CheckCircle,
  Loader2,
  Globe,
  Award,
  Users,
} from "lucide-react";
import { API_BASE_URL } from "../lib/api";
import { useProjects } from "../context/ProjectsContext";
import Header from "../components/Header";
import Footer from "../components/Footer";

const Contact = () => {
  const { projects } = useProjects();
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    projectType: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    setIsSubmitted(true);

    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
        projectType: "",
      });
    }, 3000);
  };

  const contactMethods = [
    {
      icon: MessageCircle,
      title: "WhatsApp Chat",
      description: "Quick responses, instant communication",
      action: "Start Chat",
      href: "https://wa.me/254763831806?text=Hello%20Hillersons%20InvestmentCo.,%20I%20would%20like%20to%20inquire%20about%20your%20services.",
      gradient: "from-green-500 to-emerald-600",
      hoverColor: "hover:from-green-600 hover:to-emerald-700",
    },
    {
      icon: Mail,
      title: "Email Us",
      description: "Detailed proposals and documentation",
      action: "Send Email",
      href: "mailto:hillersonsdesigns@gmail.com",
      gradient: "from-blue-500 to-indigo-600",
      hoverColor: "hover:from-blue-600 hover:to-indigo-700",
    },
    {
      icon: Phone,
      title: "Call Direct",
      description: "Speak with our design consultants",
      action: "Call Now",
      href: "tel:+254763831806",
      gradient: "from-purple-500 to-pink-600",
      hoverColor: "hover:from-purple-600 hover:to-pink-700",
    },
  ];

  const companyInfo = [
    {
      icon: MapPin,
      title: "Visit Our Studio",
      info: "Riverside Drive, Nairobi, Kenya",
      subInfo: "By appointment only",
    },
    {
      icon: Clock,
      title: "Working Hours",
      info: "Monday - Friday: 9:00 AM - 6:00 PM",
      subInfo: "Saturday: 10:00 AM - 2:00 PM",
    },
    {
      icon: Building,
      title: "Our Expertise",
      info: "Architecture • Interior Design • Renovation",
      subInfo: "15+ years of experience",
    },
  ];

  const stats = [
    { icon: Award, number: "150+", label: "Projects Completed" },
    { icon: Users, number: "98%", label: "Client Satisfaction" },
    { icon: Globe, number: "4+", label: "Cities Served" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      <Header
        showSearch={showSearch}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        showMobileMenu={showMobileMenu}
        setShowMobileMenu={setShowMobileMenu}
        setShowSearch={setShowSearch}
        projects={projects}
      />
      {/* Hero Section with Enhanced Animation */}
      <section className="relative py-24 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/5 via-transparent to-lime-600/5"></div>
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-emerald-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-lime-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <h1 className="text-5xl md:text-7xl font-black text-slate-800 leading-tight mb-6">
            Let's Create{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-lime-500 to-emerald-600 animate-gradient-x">
              Something Amazing
            </span>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-8">
            Transform your space with award-winning architecture and interior
            design. We bring your vision to life with precision, creativity, and
            unmatched expertise.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mt-12">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <stat.icon className="w-6 h-6 text-emerald-600 mr-2" />
                  <span className="text-3xl font-bold text-slate-800">
                    {stat.number}
                  </span>
                </div>
                <p className="text-slate-600 text-sm font-medium">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Contact Methods */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <h2 className="text-3xl font-bold text-center text-slate-800 mb-12">
          Choose Your Preferred Way to Connect
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {contactMethods.map((method, index) => (
            <a
              key={index}
              href={method.href}
              target={method.href.startsWith("http") ? "_blank" : undefined}
              rel={
                method.href.startsWith("http")
                  ? "noopener noreferrer"
                  : undefined
              }
              className="group relative overflow-hidden rounded-3xl bg-white p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-slate-100"
            >
              <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-500 from-emerald-500 to-lime-500"></div>

              <div
                className={`bg-gradient-to-br ${method.gradient} ${method.hoverColor} p-6 rounded-2xl text-white mb-6 transform group-hover:scale-110 transition-transform duration-300`}
              >
                <method.icon className="w-8 h-8" />
              </div>

              <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-emerald-700 transition-colors">
                {method.title}
              </h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                {method.description}
              </p>

              <div className="flex items-center text-emerald-600 font-semibold group-hover:text-emerald-700">
                {method.action}
                <Send className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Enhanced Contact Form */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="relative bg-white rounded-3xl shadow-2xl p-12 md:p-16 overflow-hidden border border-slate-100">
          {/* Animated Background Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-100 to-lime-100 rounded-full blur-3xl opacity-40 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-lime-100 to-emerald-100 rounded-full blur-3xl opacity-40 animate-pulse delay-1000"></div>

          <div className="relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-slate-800 mb-4">
                Start Your Project Today
              </h2>
              <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                Tell us about your vision and we'll get back to you within 24
                hours with a personalized consultation.
              </p>
            </div>

            {isSubmitted ? (
              <div className="text-center py-12">
                <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-slate-800 mb-4">
                  Message Sent Successfully!
                </h3>
                <p className="text-slate-600">
                  We'll get back to you within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all bg-slate-50 focus:bg-white"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all bg-slate-50 focus:bg-white"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Project Type
                  </label>
                  <select
                    name="projectType"
                    value={formData.projectType}
                    onChange={handleInputChange}
                    className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all bg-slate-50 focus:bg-white"
                  >
                    <option value="">Select project type</option>
                    <option value="residential">
                      Residential Architecture
                    </option>
                    <option value="commercial">Commercial Architecture</option>
                    <option value="interior">Interior Design</option>
                    <option value="renovation">Renovation</option>
                    <option value="consultation">Design Consultation</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all bg-slate-50 focus:bg-white"
                    placeholder="Brief description of your project"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Project Details *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows="6"
                    className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all bg-slate-50 focus:bg-white resize-none"
                    placeholder="Tell us about your project, timeline, budget range, and any specific requirements..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-emerald-600 to-lime-600 hover:from-emerald-700 hover:to-lime-700 text-white py-4 px-8 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 inline mr-2 animate-spin" />
                      Sending Message...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 inline mr-2" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Enhanced Info Section */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-8">
          {companyInfo.map((info, index) => (
            <div
              key={index}
              className="flex gap-4 items-start p-6 rounded-2xl bg-white shadow-md hover:shadow-lg transition-shadow border border-slate-100"
            >
              <div className="p-3 bg-gradient-to-br from-emerald-100 to-lime-100 rounded-xl">
                <info.icon className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 mb-1">
                  {info.title}
                </h4>
                <p className="text-slate-700 mb-1">{info.info}</p>
                <p className="text-sm text-slate-500">{info.subInfo}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-gradient-to-r from-emerald-600 to-lime-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Space?
          </h2>
          <p className="text-emerald-100 text-lg mb-8 max-w-2xl mx-auto">
            Join over 150 satisfied clients who trusted us with their dream
            projects. Let's make your vision a reality.
          </p>
          <a
            href="mailto:hillersonsdesigns@gmail.com"
            className="inline-flex items-center bg-white text-emerald-600 px-8 py-4 rounded-xl font-semibold hover:bg-emerald-50 transition-colors shadow-lg"
          >
            <Mail className="w-5 h-5 mr-2" />
            Start Your Project
          </a>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Contact;
