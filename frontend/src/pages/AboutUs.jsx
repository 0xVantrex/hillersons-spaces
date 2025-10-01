import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  Award,
  Globe,
  Zap,
  Eye,
  Target,
  Lightbulb,
  Building2,
  Star,
  ArrowRight,
} from "lucide-react";
import { API_BASE_URL } from "../lib/api";
import { useProjects } from "../context/ProjectsContext";
import Header from "../components/Header";
import Footer from "../components/Footer";

const AboutUsPage = () => {
  const { projects } = useProjects();
  const [isVisible, setIsVisible] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { number: "500+", label: "Designs Created", icon: Building2 },
    { number: "98%", label: "Client Satisfaction", icon: Star },
    { number: "15+", label: "Years Experience", icon: Award },
    { number: "50+", label: "Countries Served", icon: Globe },
  ];

  const team = [
    {
      name: "Sarah Hillerson",
      role: "Lead Architect & Founder",
      image:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=faces",
      bio: "Visionary architect with 20+ years transforming dreams into architectural masterpieces.",
    },
    {
      name: "Michael Chen",
      role: "Senior Design Director",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=faces",
      bio: "Award-winning designer specializing in sustainable and innovative residential solutions.",
    },
    {
      name: "Elena Rodriguez",
      role: "Interior Design Lead",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=faces",
      bio: "Creative genius who brings spaces to life with perfect harmony of form and function.",
    },
  ];

  const testimonials = [
    {
      text: "HillersonsDesigns transformed our vision into reality. Their attention to detail and innovative approach exceeded all expectations.",
      author: "James Wellington",
      role: "Homeowner, Nakuru",
    },
    {
      text: "The team's professionalism and creative expertise made our dream home project seamless and extraordinary.",
      author: "Maria Santos",
      role: "Property Developer, Nairobi",
    },
    {
      text: "Outstanding architectural solutions that perfectly balance aesthetics with functionality. Highly recommended!",
      author: "David Thompson",
      role: "Real Estate Investor, Kisumu",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-emerald-50 to-lime-50">
      <Header
        showSearch={showSearch}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        showMobileMenu={showMobileMenu}
        setShowMobileMenu={setShowMobileMenu}
        setShowSearch={setShowSearch}
        projects={projects}
      />

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-500 to-lime-500">
        <div className="absolute inset-0 bg-black/10"></div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-64 h-64 rounded-full bg-white/5 animate-pulse`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${3 + i}s`,
              }}
            ></div>
          ))}
        </div>

        <div
          className={`relative z-10 text-center max-w-4xl px-4 sm:px-6 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black text-white mb-4 sm:mb-6 leading-tight">
            About
            <span className="block bg-gradient-to-r from-lime-300 to-white bg-clip-text text-transparent">
              HillersonsDesigns
            </span>
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-white/90 mb-6 sm:mb-8 max-w-3xl mx-auto px-2">
            Crafting extraordinary living spaces that redefine modern
            architecture and inspire generations
          </p>
          <div className="flex justify-center">
            <ChevronDown className="w-6 h-6 sm:w-8 sm:h-8 text-white animate-bounce" />
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
            <div className="space-y-6 sm:space-y-8 order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 font-semibold text-sm sm:text-base">
                <Lightbulb className="w-3 h-3 sm:w-4 sm:h-4" />
                Our Story
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                Designing Dreams Since
                <span className="text-emerald-600"> 2008</span>
              </h2>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                What started as a passion project in a small studio has evolved
                into one of the most innovative architectural design firms
                globally. We believe every home tells a story, and we're here to
                help you write yours with extraordinary design that stands the
                test of time.
              </p>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                Our commitment to sustainability, innovation, and client
                satisfaction has earned us recognition worldwide. From cozy
                family homes to luxury estates, we craft spaces that don't just
                shelter—they inspire.
              </p>
            </div>
            <div className="relative order-1 lg:order-2">
              <div className="absolute -inset-2 sm:-inset-4 bg-gradient-to-r from-emerald-400 to-lime-400 rounded-xl sm:rounded-2xl opacity-20 blur-xl"></div>
              <img
                src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=400&fit=crop"
                alt="Modern architectural design"
                className="relative z-10 rounded-xl sm:rounded-2xl shadow-2xl w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-r from-emerald-600 to-lime-600">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full bg-white/20 mb-3 sm:mb-4 group-hover:bg-white/30 transition-all duration-300">
                  <stat.icon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
                </div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-1 sm:mb-2">
                  {stat.number}
                </div>
                <div className="text-white/90 font-medium text-xs sm:text-sm lg:text-base">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              Our Core Values
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-2">
              The principles that guide every design decision and client
              interaction
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: Eye,
                title: "Visionary Design",
                description:
                  "We see beyond the ordinary, creating spaces that push boundaries and set new standards in architectural excellence.",
              },
              {
                icon: Target,
                title: "Precision Craftsmanship",
                description:
                  "Every detail matters. Our meticulous attention to detail ensures perfection in every corner of your dream home.",
              },
              {
                icon: Zap,
                title: "Innovation First",
                description:
                  "Embracing cutting-edge technology and sustainable practices to create homes for the future, today.",
              },
            ].map((value, index) => (
              <div key={index} className="group relative">
                <div className="absolute -inset-1 sm:-inset-2 bg-gradient-to-r from-emerald-400 to-lime-400 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                <div className="relative bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100">
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full bg-gradient-to-r from-emerald-500 to-lime-500 mb-4 sm:mb-6">
                    <value.icon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                    {value.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-gradient-to-r from-emerald-600 to-lime-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-12 sm:mb-16">
            What Our Clients Say
          </h2>

          <div className="relative min-h-[200px] sm:min-h-[180px]">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`transition-all duration-500 ${
                  index === activeTestimonial
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4 absolute inset-0"
                }`}
              >
                <blockquote className="text-lg sm:text-xl lg:text-2xl text-white/90 mb-6 sm:mb-8 italic leading-relaxed px-2">
                  "{testimonial.text}"
                </blockquote>
                <div className="text-white">
                  <div className="font-bold text-lg sm:text-xl">
                    {testimonial.author}
                  </div>
                  <div className="text-white/80 text-sm sm:text-base">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-6 sm:mt-8 gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveTestimonial(index)}
                className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                  index === activeTestimonial ? "bg-white" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
            Ready to Build Your Dream?
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 sm:mb-12 max-w-2xl mx-auto px-2">
            Let's collaborate to create something extraordinary. Your perfect
            home is just a conversation away.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center px-2">
            <button className="group bg-gradient-to-r from-emerald-600 to-lime-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-2">
              Start Your Project
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
            <button className="border-2 border-emerald-600 text-emerald-600 px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg hover:bg-emerald-600 hover:text-white transition-all duration-300">
              View Our Portfolio
            </button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default AboutUsPage;
