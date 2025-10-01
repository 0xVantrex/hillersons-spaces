import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Building,
  Award,
  Star,
  Heart,
  Bed,
  Bath,
  Square,
  Phone,
  TrendingUp,
  PlayCircle,
  Shield,
  Clock,
  Users,
  CheckCircle,
  ArrowRight,
  X,
  Palette,
  Compass,
  Globe,
  Sparkles,
  Diamond,
  Crown,
} from "lucide-react";

import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import QuickViewModal from "../components/QuickViewModal";
import LoadingSkeleton from "../components/LoadingSkeleton";
import Header from "../components/Header";
import Footer from "../components/Footer";
import WhyChooseUs from "../components/WhyChooseUs";
import ProcessSteps from "../components/ProcessSteps";
import { API_BASE_URL } from "../lib/api";
import { useProjects } from "../context/ProjectsContext";

// Clean Constants
const FEATURES = [
  {
    icon: Palette,
    title: "Custom Design Studio",
    description: "Personalize every detail with our advanced 3D design tools",
  },
  {
    icon: Shield,
    title: "Quality Assurance",
    description: "Certified designs that meet international building standards",
  },
  {
    icon: Globe,
    title: "Kenya-Focused",
    description:
      "Designs optimized for Kenyan climate and building regulations",
  },
  {
    icon: Crown,
    title: "Free Support",
    description: "24/7 architectural consultation and project guidance",
  },
];

const CATEGORIES = [
  {
    name: "Modern Villas",
    count: 0,
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop",
    gradient: "from-emerald-600 to-lime-500",
  },
  {
    name: "Bungalows",
    count: 0,
    image:
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=400&h=300&fit=crop",
    gradient: "from-lime-600 to-emerald-500",
  },
  {
    name: "Apartments",
    count: 0,
    image:
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop",
    gradient: "from-emerald-700 to-lime-600",
  },
  {
    name: "Commercial",
    count: 0,
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop",
    gradient: "from-lime-700 to-emerald-600",
  },
];

const HomePage = () => {
  // State management
  const { projects } = useProjects();
  const [showQuickView, setShowQuickView] = useState(false);
  const [quickViewPlan, setQuickViewPlan] = useState(null);
  const [featuredPlans, setFeaturedPlans] = useState([]);
  const [trendingPlans, setTrendingPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState({});
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/categories`)
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error("Failed to fetch categories:", err));
  }, []);

  const [filters, setFilters] = useState({
    planType: "All Types",
    bedrooms: "Any",
    floors: "Any",
    budget: "Any Budget",
    area: "Any Size",
    customizable: false,
    readyToBuild: false,
  });

  const heroRef = useRef(null);
  const observerRef = useRef(null);

  // Scroll handler for parallax effects
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Intersection Observer for animations
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible((prev) => ({
            ...prev,
            [entry.target.id]: entry.isIntersecting,
          }));
        });
      },
      { threshold: 0.1 }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Clean utility function to process plan data
  const processPlanData = useCallback((data, id) => {
    let images = [];
    if (Array.isArray(data.images) && data.images.length > 0) {
      images = data.images.filter(Boolean);
    }
    if (images.length === 0 && data.mainImage) images = [data.mainImage];
    if (images.length === 0 && data.coverImage) images = [data.coverImage];
    if (images.length === 0 && data.thumbnail) images = [data.thumbnail];
    if (
      images.length === 0 &&
      Array.isArray(data.finalImageURLs) &&
      data.finalImageURLs.length > 0
    ) {
      images = data.finalImageURLs;
    }
    if (images.length === 0) {
      images = ["https://via.placeholder.com/600x400?text=No+Image"];
    }

    return {
      id: id,
      image: images[0],
      finalImageURLs: images,
      title: data.title || "Untitled Plan",
      rooms: parseInt(data.rooms) || 0,
      customizable: data.customizable || false,
      newListing: data.newListing || false,
      floorCount: parseInt(data.floorCount) || 0,
      height: parseInt(data.height) || 0,
      length: parseInt(data.length) || 0,
      includes: [
        `${data.rooms || 0} Bedrooms`,
        `${data.floorCount || 0} Floors`,
        data.customizable ? "Customizable" : "Fixed Design",
      ],
    };
  }, []);

  // Fetch plans from API
  const fetchPlans = useCallback(
    async (type = "featured") => {
      try {
        const endpoint =
          type === "featured" ? "featured=true" : "trending=true";
        const response = await fetch(`${API_BASE_URL}/api/plans?${endpoint}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch ${type} plans: ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error(`Invalid data format received for ${type} plans`);
        }

        return data.map((item, index) => {
          const id = item.id || `${type}-${index}`;
          return processPlanData(item, id);
        });
      } catch (error) {
        console.error(`Error fetching ${type} plans:`, error);
        setError(`Failed to load ${type} plans`);
        return [];
      }
    },
    [processPlanData]
  );

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [featured, trending] = await Promise.all([
          fetchPlans("featured"),
          fetchPlans("trending"),
        ]);

        setFeaturedPlans(featured);
        setTrendingPlans(trending);
      } catch (error) {
        console.error("Error loading data:", error);
        setError("Failed to load plans data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [fetchPlans]);

  // Handle quick view
  const handleQuickView = useCallback((plan) => {
    setQuickViewPlan(plan);
    setShowQuickView(true);
  }, []);

  const handleCategoryChange = useCallback((index) => {
    setActiveCategory(index);
  }, []);

  // Close modals
  const closeQuickView = useCallback(() => {
    setShowQuickView(false);
    setQuickViewPlan(null);
  }, []);

  return (
    <div className="bg-gradient-to-b from-emerald-50 via-lime-50 to-white overflow-x-hidden">
      console.log("Projects:", projects);
      <Header
        showSearch={showSearch}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        showMobileMenu={showMobileMenu}
        setShowMobileMenu={setShowMobileMenu}
        setShowSearch={setShowSearch}
        projects={projects}
      />
      {/* Revolutionary Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-lime-800 text-white overflow-hidden flex items-center"
      >
        {/* Dynamic Animated Background */}
        <div className="absolute inset-0">
          {/* Floating geometric shapes */}
          <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-lime-400/20 to-emerald-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-emerald-400/20 to-lime-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-lime-300/20 to-emerald-300/20 rounded-full blur-3xl animate-pulse delay-500"
            style={{
              transform: `translate(-50%, -50%) translateY(${scrollY * 0.5}px)`,
            }}
          ></div>

          {/* Floating particles */}
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-lime-300/30 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 pt-8 pb-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="max-w-2xl">
              {/* free Badge */}
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-lime-500/20 to-emerald-500/20 backdrop-blur-xl rounded-full px-4 sm:px-6 py-2 sm:py-3 mb-6 sm:mb-8 border border-lime-300/30">
                <Diamond className="w-4 h-4 sm:w-5 sm:h-5 text-lime-300 animate-pulse" />
                <span className="text-xs sm:text-sm font-semibold text-lime-200 tracking-wide">
                  FREE ARCHITECTURAL PLANS
                </span>
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-300" />
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 sm:mb-8 leading-tight">
                <span className="block bg-gradient-to-r from-white to-emerald-100 bg-clip-text text-transparent">
                  Craft Your
                </span>
                <span className="block bg-gradient-to-r from-lime-300 via-emerald-300 to-lime-400 bg-clip-text text-transparent animate-pulse">
                  Architectural
                </span>
                <span className="block bg-gradient-to-r from-white to-emerald-100 bg-clip-text text-transparent">
                  Masterpiece
                </span>
              </h1>

              {/* Enhanced Subtitle */}
              <p className="text-base sm:text-lg md:text-xl text-emerald-100 mb-8 sm:mb-10 leading-relaxed font-light">
                Experience Kenya's most sophisticated collection of
                architectural designs.
                <span className="text-lime-300 font-semibold">
                  {" "}
                  From luxury villas to modern bungalows
                </span>{" "}
                - discover plans that redefine elegance and functionality. All
                available for FREE
              </p>

              {/* Enhanced CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-8 sm:mb-12">
                <Link
                  to="/Allproducts"
                  className="group relative bg-gradient-to-r from-lime-500 to-emerald-500 hover:from-lime-400 hover:to-emerald-400 text-white px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg transition-all duration-500 shadow-xl sm:shadow-2xl hover:shadow-lime-500/50 hover:scale-105 transform overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2 sm:gap-3">
                    <Compass className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                    Explore Collection
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-lime-400 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </Link>

                <button
                  onClick={() => setShowVideo(true)}
                  className="group bg-white/10 backdrop-blur-xl hover:bg-white/20 text-white px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg transition-all duration-500 border border-white/30 hover:border-lime-300/50 flex items-center justify-center gap-2 sm:gap-3"
                >
                  <div className="relative">
                    <PlayCircle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform" />
                    <div className="absolute inset-0 bg-lime-300/30 rounded-full animate-ping"></div>
                  </div>
                  Watch Showcase
                </button>
              </div>

              {/* Enhanced Trust Indicators */}
              <div className="grid grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                {[
                  { value: "100+", label: "Free Plans", icon: Building },
                  { value: "100+", label: "Happy Clients", icon: Users },
                  { value: "15+", label: "Expert Architects", icon: Award },
                ].map((stat, index) => (
                  <div key={index} className="text-center group cursor-pointer">
                    <div className="flex items-center justify-center mb-1 sm:mb-2">
                      <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-lime-300 mr-1 sm:mr-2 group-hover:scale-110 transition-transform" />
                      <div className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-lime-300 to-emerald-300 bg-clip-text text-transparent">
                        {stat.value}
                      </div>
                    </div>
                    <div className="text-xs sm:text-sm text-emerald-200 font-medium">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Enhanced Hero Visual */}
            <div className="relative lg:ml-8 mt-8 lg:mt-0">
              {/* Main showcase card */}
              <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-white/20 shadow-xl sm:shadow-2xl hover:shadow-lime-500/20 transition-all duration-700 transform hover:scale-105">
                <div className="relative overflow-hidden rounded-xl sm:rounded-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop"
                    alt="Elegant House Design"
                    className="w-full h-60 sm:h-72 md:h-80 object-cover transition-transform duration-700 hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/50 to-transparent"></div>

                  {/* Floating info cards */}
                  <div className="absolute top-2 sm:top-3 md:top-4 left-2 sm:left-3 md:left-4 bg-white/90 backdrop-blur rounded-lg sm:rounded-xl px-2 sm:px-3 md:px-4 py-1 sm:py-2 shadow-lg">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Star className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500 fill-amber-500" />
                      <span className="text-xs sm:text-sm font-bold text-emerald-900">
                        5.0 Rating
                      </span>
                    </div>
                  </div>

                  <div className="absolute top-2 sm:top-3 md:top-4 right-2 sm:right-3 md:right-4 bg-lime-500 text-emerald-900 px-2 sm:px-3 md:px-4 py-1 sm:py-2 rounded-lg sm:rounded-xl shadow-lg">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="text-xs sm:text-sm font-bold">
                        Trending
                      </span>
                    </div>
                  </div>

                  <div className="absolute bottom-2 sm:bottom-3 md:bottom-4 left-2 sm:left-3 md:left-4 right-2 sm:right-3 md:right-4 bg-white/90 backdrop-blur rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 shadow-lg">
                    <h3 className="font-bold text-emerald-900 text-sm sm:text-base mb-1 sm:mb-2">
                      Modern Villa Masterpiece
                    </h3>
                    <div className="flex items-center justify-between text-xs sm:text-sm text-emerald-700">
                      <span className="flex items-center gap-1">
                        <Bed className="w-3 h-3 sm:w-4 sm:h-4" /> 4 Beds
                      </span>
                      <span className="flex items-center gap-1">
                        <Bath className="w-3 h-3 sm:w-4 sm:h-4" /> 3 Baths
                      </span>
                      <span className="flex items-center gap-1">
                        <Square className="w-3 h-3 sm:w-4 sm:h-4" /> 2,500 ft²
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Enhanced Decorative wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            className="w-full h-16 sm:h-20 fill-emerald-50"
          >
            <path d="M0,64L48,69.3C96,75,192,85,288,85.3C384,85,480,75,576,64C672,53,768,43,864,48C960,53,1056,75,1152,80C1248,85,1344,75,1392,69.3L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
          </svg>
        </div>
      </section>
      {/* Enhanced Categories Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-emerald-50 to-lime-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16">
            <span className="inline-block bg-gradient-to-r from-emerald-600 to-lime-600 bg-clip-text text-transparent font-semibold text-base sm:text-lg mb-3 sm:mb-4">
              EXPLORE BY CATEGORY
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-emerald-900 mb-4 sm:mb-6">
              Discover Your Perfect{" "}
              <span className="text-lime-600">Design Style</span>
            </h2>
            <p className="text-lg sm:text-xl text-emerald-700 max-w-3xl mx-auto">
              From contemporary villas to traditional bungalows, find the
              architectural style that speaks to your vision
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {categories.map((category, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl hover:shadow-lime-500/25 transition-all duration-700 transform hover:scale-105 cursor-pointer"
                onClick={() => handleCategoryChange(category._id)}
              >
                <div className="relative h-48 sm:h-56 md:h-64">
                  <img
                    src={
                      category.image?.[0] ||
                      "https://via.placeholder.com/400x300"
                    }
                    alt={category._id}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-600 to-lime-500 opacity-70 group-hover:opacity-80 transition-opacity duration-500"></div>

                  <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6">
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                      {category._id}
                    </h3>
                    <p className="text-emerald-100 font-medium opacity-90 text-sm sm:text-base transform translate-y-3 sm:translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-100">
                      {category.count} Designs Available
                    </p>
                  </div>

                  <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-white/90 backdrop-blur rounded-full px-2 sm:px-3 py-1 shadow-lg">
                    <span className="text-xs sm:text-sm font-bold text-emerald-900">
                      {category.count}+
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* free Features Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16">
            <span className="inline-block bg-gradient-to-r from-emerald-600 to-lime-600 bg-clip-text text-transparent font-semibold text-base sm:text-lg mb-3 sm:mb-4">
              free FEATURES
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-emerald-900 mb-4 sm:mb-6">
              Why Choose{" "}
              <span className="text-lime-600">HillersonsInvestmentCompany</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {FEATURES.map((feature, index) => (
              <div
                key={index}
                className="group relative bg-gradient-to-br from-emerald-50 to-lime-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 hover:shadow-xl sm:hover:shadow-2xl transition-all duration-700 transform hover:scale-105 border border-emerald-100 hover:border-lime-300"
              >
                <div className="relative mb-4 sm:mb-6">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-r from-emerald-500 to-lime-500 rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <feature.icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-lime-400 rounded-full animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-emerald-900 mb-3 sm:mb-4 group-hover:text-lime-600 transition-colors duration-500">
                  {feature.title}
                </h3>
                <p className="text-emerald-700 leading-relaxed text-sm sm:text-base">
                  {feature.description}
                </p>

                {/* Hover effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-lime-500/5 to-emerald-500/5 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Enhanced Featured Plans Section */}
      <section
        id="featured-plans"
        className="container mx-auto px-4 py-16 sm:py-20"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 sm:mb-16">
          <div className="max-w-2xl">
            <span className="inline-block bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-sm font-bold mb-4 sm:mb-6 shadow-lg">
              ⭐ FREE SELECTION
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-emerald-900 mb-4 sm:mb-6">
              Featured{" "}
              <span className="bg-gradient-to-r from-lime-600 to-emerald-600 bg-clip-text text-transparent">
                Masterpieces
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-emerald-700 leading-relaxed">
              Handpicked architectural gems that represent the pinnacle of
              design excellence and innovation
            </p>
          </div>
          <Link
            to="/allProducts"
            className="group flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-emerald-600 to-lime-600 hover:from-emerald-700 hover:to-lime-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold mt-6 md:mt-0 transition-all duration-500 shadow-lg sm:shadow-xl hover:shadow-lime-500/25 transform hover:scale-105 text-sm sm:text-base"
          >
            View All Masterpieces
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {!loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
            {featuredPlans.map((plan, index) => (
              <div
                key={plan.id}
                className="group relative bg-white rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-xl hover:shadow-2xl transition-all duration-700 transform hover:scale-105 overflow-hidden border border-emerald-100 hover:border-lime-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Enhanced Product Card Wrapper */}
                <div className="relative">
                  <ProductCard
                    product={{
                      ...plan,
                      bedrooms: plan.rooms,
                      floorCount: plan.floorCount,
                    }}
                    isFavorite={false}
                    onToggleFavorite={() => {}}
                    viewMode="grid"
                    onQuickView={() => handleQuickView(plan)}
                  />

                  {/* free overlay effects */}
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                  {/* Floating free badge */}
                  <div className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs font-bold shadow-lg opacity-0 group-hover:opacity-100 transform -translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                    PREMIUM
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
            {/* You can add a loading skeleton or spinner here */}
            <div className="col-span-3 text-center text-emerald-600 text-lg sm:text-xl py-8 sm:py-12">
              Loading featured plans...
            </div>
          </div>
        )}
      </section>
      {/* Enhanced Trending Plans Section */}
      <section className="bg-gradient-to-br from-emerald-50 to-lime-50 py-16 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 sm:mb-16">
            <div className="max-w-2xl">
              <span className="inline-block bg-gradient-to-r from-lime-500 to-emerald-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-sm font-bold mb-4 sm:mb-6 shadow-lg flex items-center gap-1 sm:gap-2">
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                TRENDING NOW
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-emerald-900 mb-4 sm:mb-6">
                Latest{" "}
                <span className="bg-gradient-to-r from-lime-600 to-emerald-600 bg-clip-text text-transparent">
                  Innovations
                </span>
              </h2>
              <p className="text-lg sm:text-xl text-emerald-700 leading-relaxed">
                Cutting-edge designs that are setting new standards in modern
                architecture
              </p>
            </div>
            <Link
              to="/allProducts"
              className="group flex items-center gap-2 sm:gap-3 bg-white hover:bg-emerald-50 text-emerald-600 px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold mt-6 md:mt-0 transition-all duration-500 shadow-lg sm:shadow-xl hover:shadow-emerald-500/25 transform hover:scale-105 border border-emerald-200 text-sm sm:text-base"
            >
              Explore Trends
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
              <LoadingSkeleton count={3} />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
              {trendingPlans.map((plan, index) => (
                <div
                  key={plan.id}
                  className="group relative bg-white rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-xl hover:shadow-2xl transition-all duration-700 transform hover:scale-105 overflow-hidden border border-emerald-100 hover:border-lime-300"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="relative">
                    <ProductCard
                      product={{
                        ...plan,
                        bedrooms: plan.rooms,
                        floorCount: plan.floorCount,
                        architect: plan.architect,
                        saved: 0,
                        views: 0,
                      }}
                      isFavorite={false}
                      onToggleFavorite={() => {}}
                      viewMode="grid"
                      onQuickView={() => handleQuickView(plan)}
                    />

                    {/* Trending indicator */}
                    <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-gradient-to-r from-lime-500 to-emerald-500 text-white p-1.5 sm:p-2 rounded-full shadow-lg animate-pulse">
                      <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                    </div>

                    {/* New badge */}
                    <div className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      NEW
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      {/* Enhanced Why Choose Us Section */}
      <WhyChooseUs />
      {/* Revolutionary Testimonials Section */}
      <section className="relative bg-gradient-to-br from-emerald-900 via-emerald-800 to-lime-800 text-white py-16 sm:py-20 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-lime-400 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-emerald-400 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-lime-300 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto mb-16 sm:mb-20">
            <span className="inline-block bg-white/20 backdrop-blur-xl px-4 sm:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-sm font-bold mb-4 sm:mb-6 border border-white/30">
              ⭐ CLIENT TESTIMONIALS
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
              What Our{" "}
              <span className="bg-gradient-to-r from-lime-300 to-emerald-300 bg-clip-text text-transparent">
                Clients Say
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-emerald-100 leading-relaxed">
              Discover why thousands of homeowners trust us with their dream
              homes
            </p>
          </div>

          {/* Enhanced trust indicators */}
          <div className="mt-12 sm:mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
            {[
              { value: "98%", label: "Client Satisfaction", icon: Heart },
              { value: "24/7", label: "Support Available", icon: Clock },
              { value: "500+", label: "Projects Completed", icon: CheckCircle },
              { value: "15+", label: "Years Experience", icon: Award },
            ].map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="flex items-center justify-center mb-3 sm:mb-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white/10 backdrop-blur-xl rounded-xl sm:rounded-2xl flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform duration-500">
                    <stat.icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-lime-300" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-lime-300 mb-1 sm:mb-2">
                  {stat.value}
                </div>
                <div className="text-emerald-200 font-medium text-xs sm:text-sm">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Enhanced Process Steps */}
      <ProcessSteps />
      {/* CTA Section */}
      <section className="bg-white text-slate-800 py-16 sm:py-20 overflow-hidden relative">
        {/* Dynamic background elements (optional) */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-80 h-80 bg-lime-300 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-300 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-lime-200 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 sm:gap-3 bg-white/60 backdrop-blur-md rounded-full px-4 sm:px-6 py-2 sm:py-3 mb-6 sm:mb-8 border border-lime-100 shadow-sm">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-lime-500 animate-pulse" />
              <span className="text-xs sm:text-sm font-bold text-lime-600">
                START YOUR JOURNEY TODAY
              </span>
              <Diamond className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 sm:mb-8 leading-tight text-emerald-500">
              Transform Your Vision Into
              <span className="block bg-gradient-to-r from-lime-500 via-emerald-500 to-lime-600 bg-clip-text text-transparent">
                Architectural Reality
              </span>
            </h2>

            <p className="text-lg sm:text-xl md:text-2xl text-slate-600 mb-8 sm:mb-12 max-w-4xl mx-auto leading-relaxed">
              Join thousands of satisfied homeowners who've built their dreams
              with our
              <span className="text-emerald-600 font-semibold">
                {" "}
                award-winning architectural designs
              </span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mb-8 sm:mb-12">
              <Link
                to="/allProducts"
                className="group relative bg-gradient-to-r from-lime-500 to-emerald-500 hover:from-lime-400 hover:to-emerald-400 text-white px-8 sm:px-10 md:px-12 py-4 sm:py-5 md:py-6 rounded-xl sm:rounded-2xl font-bold text-lg sm:text-xl transition-all duration-500 shadow-xl sm:shadow-2xl hover:shadow-lime-500/50 transform hover:scale-105 overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-3">
                  <Building className="w-5 h-5 sm:w-6 sm:h-6" />
                  Browse free Collection
                  <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-lime-400 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </Link>

              <a
                href="tel:+254763831806"
                className="group bg-white border border-emerald-300 hover:bg-lime-50 text-emerald-600 px-8 sm:px-10 md:px-12 py-4 sm:py-5 md:py-6 rounded-xl sm:rounded-2xl font-bold text-lg sm:text-xl transition-all duration-500 flex items-center justify-center gap-2 sm:gap-3 shadow-sm hover:shadow-md"
              >
                <Phone className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
                Consult Our Architect
              </a>
            </div>

            {/* Trust indicators */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 md:gap-8 max-w-4xl mx-auto">
              {[
                { icon: Shield, label: "100% Satisfaction Guarantee" },
                { icon: Clock, label: "24-Hour Delivery" },
                { icon: Award, label: "Award-Winning Designs" },
                { icon: Users, label: "Expert Support Team" },
              ].map((item, index) => (
                <div key={index} className="group text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-lime-100 text-lime-700 rounded-xl sm:rounded-2xl border border-lime-200 mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-500">
                    <item.icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* Footer */}
      <Footer />
      {/* Enhanced Video Modal */}
      {showVideo && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 max-w-4xl sm:max-w-5xl md:max-w-6xl w-full shadow-xl sm:shadow-2xl border border-emerald-100">
            <button
              onClick={() => setShowVideo(false)}
              className="absolute top-4 sm:top-6 right-4 sm:right-6 w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 hover:bg-emerald-200 text-emerald-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <div className="mb-4 sm:mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-emerald-900 mb-1 sm:mb-2">
                Architectural Design Showcase
              </h3>
              <p className="text-emerald-600 text-sm sm:text-base">
                Discover the art of elegance in home design
              </p>
            </div>

            <div className="relative w-full h-0 pb-[56.25%] rounded-xl sm:rounded-2xl overflow-hidden shadow-lg sm:shadow-xl">
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                title="Architectural Design Showcase"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
      {/* Quick View Modal */}
      {showQuickView && quickViewPlan && (
        <QuickViewModal
          product={{
            ...quickViewPlan,
            bedrooms: quickViewPlan.rooms,
            floorCount: quickViewPlan.floorCount,
          }}
          isOpen={showQuickView}
          onClose={closeQuickView}
        />
      )}
    </div>
  );
};

export default HomePage;
