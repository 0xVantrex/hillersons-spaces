import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Building, Award, Star, Heart, Bed, Bath, Square,
  Phone, TrendingUp, PlayCircle, Shield, Clock, Users,
  CheckCircle, ArrowRight, X, Palette, Compass, Globe,
  Sparkles, Diamond, Crown,
} from "lucide-react";
import { Slide } from "react-slideshow-image";
import "react-slideshow-image/dist/styles.css";
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

// ── Constants ─────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: Palette,
    title: "Custom Design Studio",
    description: "Personalise every detail with our advanced 3D design tools and expert consultation",
  },
  {
    icon: Shield,
    title: "Quality Assurance",
    description: "Certified architectural designs that meet Kenyan and international building standards",
  },
  {
    icon: Globe,
    title: "Kenya-Focused",
    description: "Plans optimised for Kenyan climate, terrain, and county building regulations",
  },
  {
    icon: Crown,
    title: "Free Support",
    description: "24/7 architectural consultation and project guidance at no extra cost",
  },
];

const HERO_IMAGES = [
  { src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&h=1080&fit=crop", alt: "Modern house exterior design Kenya" },
  { src: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1920&h=1080&fit=crop", alt: "Contemporary interior design Nairobi" },
  { src: "https://images.unsplash.com/photo-1505691723518-36a5ac3be353?w=1920&h=1080&fit=crop", alt: "Modern commercial office building" },
  { src: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1920&h=1080&fit=crop", alt: "Luxury villa architectural design" },
  { src: "https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=1920&h=1080&fit=crop", alt: "Premium residential house plan" },
];

// Deterministic blob positions (avoids Math.random re-render issues)
const BLOB_POSITIONS = [
  { left: "8%",  top: "12%" }, { left: "32%", top: "65%" },
  { left: "55%", top: "20%" }, { left: "72%", top: "78%" },
  { left: "18%", top: "45%" }, { left: "88%", top: "35%" },
  { left: "44%", top: "88%" }, { left: "66%", top: "5%"  },
  { left: "25%", top: "82%" }, { left: "80%", top: "60%" },
];

export default function HomePage() {
  const { projects } = useProjects();

  const [showQuickView, setShowQuickView]   = useState(false);
  const [quickViewPlan, setQuickViewPlan]   = useState(null);
  const [featuredPlans, setFeaturedPlans]   = useState([]);
  const [trendingPlans, setTrendingPlans]   = useState([]);
  const [loading, setLoading]               = useState(true);
  const [favorites, setFavorites]           = useState(new Set());
  const [searchQuery, setSearchQuery]       = useState("");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSearch, setShowSearch]         = useState(false);
  const [showVideo, setShowVideo]           = useState(false);
  const [scrollY, setScrollY]               = useState(0);
  const [error, setError]                   = useState(null);
  const [categories, setCategories]         = useState([]);

  const heroRef = useRef(null);

  // Fetch categories
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/categories`)
      .then((res) => res.json())
      .then(setCategories)
      .catch((err) => console.error("Failed to fetch categories:", err));
  }, []);

  // Parallax scroll
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Process raw plan data
  const processPlanData = useCallback((data, id) => {
    let images = [];
    if (Array.isArray(data.images) && data.images.length > 0) images = data.images.filter(Boolean);
    if (images.length === 0 && data.mainImage)  images = [data.mainImage];
    if (images.length === 0 && data.coverImage) images = [data.coverImage];
    if (images.length === 0 && data.thumbnail)  images = [data.thumbnail];
    if (images.length === 0 && Array.isArray(data.finalImageURLs) && data.finalImageURLs.length > 0)
      images = data.finalImageURLs;
    if (images.length === 0)
      images = ["https://via.placeholder.com/600x400?text=No+Image"];

    return {
      _id: id,
      image: images[0],
      finalImageURLs: images,
      title: data.title || "Untitled Plan",
      rooms: parseInt(data.rooms) || 0,
      newListing: data.newListing || false,
      floorCount: parseInt(data.floorCount) || 0,
      height: parseInt(data.height) || 0,
      length: parseInt(data.length) || 0,
      includes: [`${data.rooms || 0} Bedrooms`, `${data.floorCount || 0} Floors`],
    };
  }, []);

  const fetchPlans = useCallback(async (type = "featured") => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/plans?${type}=true`);
      if (!res.ok) throw new Error(`Failed to fetch ${type} plans`);
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error(`Invalid data for ${type} plans`);
      return data.map((item, i) => processPlanData(item, item._id || `${type}-${i}`));
    } catch (err) {
      console.error(err);
      setError(`Failed to load ${type} plans`);
      return [];
    }
  }, [processPlanData]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [featured, newListing] = await Promise.all([
          fetchPlans("featured"),
          fetchPlans("newListing"),
        ]);
        setFeaturedPlans(featured);
        setTrendingPlans(newListing);
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Failed to load plans data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [fetchPlans]);

  const toggleFavorite = (productId) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(productId) ? next.delete(productId) : next.add(productId);
      return next;
    });
  };

  const handleQuickView = useCallback((plan) => {
    setQuickViewPlan(plan);
    setShowQuickView(true);
  }, []);

  const closeQuickView = useCallback(() => {
    setShowQuickView(false);
    setQuickViewPlan(null);
  }, []);

  return (
    <>
      {/* JSON-LD structured data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "ProfessionalService",
        "name": "Hillersons Designs",
        "description": "Kenya's leading architectural design firm offering free house plans, custom residential and commercial designs across Nairobi, Mombasa, Kisumu and beyond.",
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
        "serviceType": ["Residential Architecture", "Commercial Architecture", "Interior Design", "Renovation", "House Plans"],
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": "Free Architectural House Plans Kenya"
        }
      })}} />

      <div className="bg-brand-50 overflow-x-hidden">
        <Header
          showSearch={showSearch} searchQuery={searchQuery}
          setSearchQuery={setSearchQuery} showMobileMenu={showMobileMenu}
          setShowMobileMenu={setShowMobileMenu} setShowSearch={setShowSearch}
          projects={projects}
        />

        {/* ── Hero ───────────────────────────────────────────────────────────── */}
        <section
          ref={heroRef}
          aria-label="Hero — Free Architectural Plans Kenya"
          className="relative min-h-screen text-white overflow-hidden flex items-center"
        >
          {/* Slideshow background */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <Slide duration={5000} transitionDuration={1000} arrows={false} pauseOnHover={false} autoplay infinite>
              {HERO_IMAGES.map((img, i) => (
                <div key={i} className="relative w-full h-screen">
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="w-full h-full object-cover"
                    loading={i === 0 ? "eager" : "lazy"}
                  />
                  <div className="absolute inset-0 bg-brand-900/50" />
                </div>
              ))}
            </Slide>
          </div>

          {/* Decorative blobs — deterministic positions */}
          <div className="absolute inset-0 z-10 pointer-events-none">
            {BLOB_POSITIONS.map((pos, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-white/20 rounded-full animate-pulse"
                style={{ left: pos.left, top: pos.top, animationDelay: `${i * 0.3}s` }}
              />
            ))}
          </div>

          <div className="container mx-auto px-4 pt-8 pb-24 relative z-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">

              {/* Left — copy */}
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-xl rounded-full px-5 py-2.5 mb-8 border border-white/20">
                  <Diamond className="w-4 h-4 text-brand-200 animate-pulse" aria-hidden="true" />
                  <span className="text-xs font-bold text-brand-100 tracking-widest uppercase">
                    Free Architectural Plans
                  </span>
                </div>

                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
                  <span className="block text-white">Craft Your</span>
                  <span className="block text-brand-200">Architectural</span>
                  <span className="block text-white">Masterpiece</span>
                </h1>

                <p className="text-base sm:text-lg text-white/90 mb-10 leading-relaxed font-light">
                  Kenya's most comprehensive collection of professional architectural designs —
                  from{" "}
                  <strong className="text-brand-200 font-semibold">
                    luxury villas to modern bungalows
                  </strong>{" "}
                  — crafted for Kenyan homes and climate. All plans available for free.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-12">
                  <Link
                    to="/Allproducts"
                    className="group bg-brand-600 hover:bg-brand-700 text-white px-8 py-4 rounded-xl font-bold text-base transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 flex items-center justify-center gap-3"
                  >
                    <Compass className="w-5 h-5" aria-hidden="true" />
                    Explore Free Plans
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                  </Link>

                  <button
                    onClick={() => setShowVideo(true)}
                    aria-label="Watch our architectural design showcase video"
                    className="group bg-white/10 backdrop-blur-xl hover:bg-white/20 text-white px-8 py-4 rounded-xl font-bold text-base transition-all duration-300 border border-white/30 flex items-center justify-center gap-3"
                  >
                    <PlayCircle className="w-5 h-5 group-hover:scale-110 transition-transform" aria-hidden="true" />
                    Watch Showcase
                  </button>
                </div>

                {/* Trust stats */}
                <div className="grid grid-cols-3 gap-6">
                  {[
                    { value: "100+", label: "Free Plans",         icon: Building },
                    { value: "100+", label: "Happy Clients",      icon: Users },
                    { value: "15+",  label: "Expert Architects",  icon: Award },
                  ].map((stat, i) => (
                    <div key={i} className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <stat.icon className="w-5 h-5 text-brand-200 mr-2" aria-hidden="true" />
                        <span className="text-2xl md:text-3xl font-bold text-brand-200">{stat.value}</span>
                      </div>
                      <p className="text-xs text-white/80 font-medium">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right — showcase card */}
              <div className="relative lg:ml-8 mt-8 lg:mt-0">
                <article
                  className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl hover:scale-[1.02] transition-transform duration-500"
                  aria-label="Featured house plan preview"
                >
                  <div className="relative overflow-hidden rounded-xl">
                    <img
                      src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop"
                      alt="Modern 4-bedroom villa with 3 bathrooms — 2,500 sq ft house plan Kenya"
                      className="w-full h-72 md:h-80 object-cover"
                      loading="eager"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-900/60 to-transparent" />

                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur rounded-xl px-3 py-1.5 shadow">
                      <div className="flex items-center gap-1.5">
                        <Star className="w-4 h-4 text-brand-accent fill-brand-accent" aria-hidden="true" />
                        <span className="text-sm font-bold text-brand-900">5.0 Rating</span>
                      </div>
                    </div>

                    <div className="absolute top-4 right-4 bg-brand-600 text-white px-3 py-1.5 rounded-xl shadow text-xs font-bold">
                      Trending
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur rounded-xl p-3 shadow">
                      <h2 className="font-bold text-brand-900 text-sm mb-2">Modern Villa — House Plan Kenya</h2>
                      <div className="flex items-center justify-between text-xs text-brand-700">
                        <span className="flex items-center gap-1"><Bed className="w-3.5 h-3.5" aria-hidden="true" /> 4 Beds</span>
                        <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" aria-hidden="true" /> 3 Baths</span>
                        <span className="flex items-center gap-1"><Square className="w-3.5 h-3.5" aria-hidden="true" /> 2,500 ft²</span>
                      </div>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </div>

          {/* Wave divider */}
          <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
            <svg viewBox="0 0 1440 120" className="w-full h-16 sm:h-20 fill-brand-50" aria-hidden="true">
              <path d="M0,64L48,69.3C96,75,192,85,288,85.3C384,85,480,75,576,64C672,53,768,43,864,48C960,53,1056,75,1152,80C1248,85,1344,75,1392,69.3L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" />
            </svg>
          </div>
        </section>

        {/* ── Categories ───────────────────────────────────────────────────────── */}
        <section aria-labelledby="categories-heading" className="py-16 sm:py-20 bg-brand-50">
          <div className="container mx-auto px-4">
            <header className="text-center mb-12 sm:mb-16">
              <p className="text-brand-600 font-semibold text-sm uppercase tracking-widest mb-3">
                Explore by Category
              </p>
              <h2 id="categories-heading" className="text-3xl sm:text-4xl md:text-5xl font-bold text-brand-900 mb-4">
                Discover Your Perfect Design Style
              </h2>
              <p className="text-lg text-brand-700 max-w-3xl mx-auto">
                From contemporary villas to traditional bungalows — explore architectural styles
                designed for Kenyan homes
              </p>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {categories.map((category) => (
                <Link
                  key={category._id}
                  to={`/categories/${encodeURIComponent(category._id)}`}
                  className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1 cursor-pointer"
                  aria-label={`Browse ${category._id} architectural designs`}
                >
                  <div className="relative h-56 md:h-64">
                    <img
                      src={category.subcategories?.[0]?.image?.[0] || "https://via.placeholder.com/400x300?text=No+Image"}
                      alt={`${category._id} architectural designs Kenya`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-brand-900/60 group-hover:bg-brand-900/70 transition-colors duration-300" />

                    <div className="absolute inset-0 flex flex-col justify-end p-5">
                      <h3 className="text-xl font-bold text-white mb-1">{category._id}</h3>
                      <p className="text-brand-200 text-sm">
                        {category.subcategories?.length || 0} designs available
                      </p>
                    </div>

                    <div className="absolute top-3 right-3 bg-white/90 rounded-full px-2.5 py-1 shadow text-xs font-bold text-brand-900">
                      {category.subcategories?.length || 0}+
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ─────────────────────────────────────────────────────────── */}
        <section aria-labelledby="features-heading" className="py-16 sm:py-20 bg-white">
          <div className="container mx-auto px-4">
            <header className="text-center mb-12 sm:mb-16">
              <p className="text-brand-600 font-semibold text-sm uppercase tracking-widest mb-3">
                Why Hillersons Designs
              </p>
              <h2 id="features-heading" className="text-3xl sm:text-4xl md:text-5xl font-bold text-brand-900 mb-4">
                Kenya's Most Trusted Architectural Design Platform
              </h2>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {FEATURES.map((feature, index) => (
                <article
                  key={index}
                  className="group bg-brand-50 rounded-2xl p-7 hover:shadow-xl transition-all duration-500 hover:-translate-y-1 border border-brand-100 hover:border-brand-300"
                >
                  <div className="w-14 h-14 bg-brand-600 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-7 h-7 text-white" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-bold text-brand-900 mb-3 group-hover:text-brand-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-brand-700 leading-relaxed text-sm">{feature.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── Featured Plans ───────────────────────────────────────────────────── */}
        <section id="featured-plans" aria-labelledby="featured-heading" className="container mx-auto px-4 py-16 sm:py-20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 sm:mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 id="featured-heading" className="text-3xl sm:text-4xl md:text-5xl font-bold text-brand-900 mb-4">
                Featured House Plans
              </h2>
              <p className="text-lg text-brand-700 leading-relaxed">
                Handpicked architectural designs representing the pinnacle of Kenyan residential and
                commercial design excellence
              </p>
            </div>
            <Link
              to="/allProducts"
              className="group flex items-center gap-3 bg-brand-600 hover:bg-brand-700 text-white px-7 py-3.5 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl flex-shrink-0 text-sm"
            >
              View All Plans
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </Link>
          </div>

          {loading ? (
            <div className="col-span-3 text-center text-brand-600 text-lg py-12 animate-pulse">
              Loading featured plans...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {featuredPlans.map((product) => (
                <div
                  key={product._id}
                  className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 overflow-hidden border border-brand-100 hover:border-brand-300"
                >
                  <ProductCard
                    product={product}
                    isFavorite={favorites.has(product._id)}
                    onToggleFavorite={() => toggleFavorite(product._id)}
                    onQuickView={() => handleQuickView(product)}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Trending Plans ───────────────────────────────────────────────────── */}
        <section aria-labelledby="trending-heading" className="bg-brand-50 py-16 sm:py-20">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 sm:mb-16 gap-6">
              <div className="max-w-2xl">
                <span className="inline-flex items-center gap-2 bg-brand-600 text-white px-5 py-2 rounded-full text-xs font-bold mb-5 shadow">
                  <TrendingUp className="w-4 h-4" aria-hidden="true" />
                  Trending Now
                </span>
                <h2 id="trending-heading" className="text-3xl sm:text-4xl md:text-5xl font-bold text-brand-900 mb-4">
                  Latest Architectural Innovations
                </h2>
                <p className="text-lg text-brand-700 leading-relaxed">
                  Cutting-edge house plans setting new standards in modern Kenyan architecture
                </p>
              </div>
              <Link
                to="/allProducts"
                className="group flex items-center gap-3 bg-white hover:bg-brand-50 text-brand-600 px-7 py-3.5 rounded-xl font-bold transition-all duration-300 shadow hover:shadow-md border border-brand-200 flex-shrink-0 text-sm"
              >
                Explore All
                <TrendingUp className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                <LoadingSkeleton count={3} />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {trendingPlans.map((product) => (
                  <div
                    key={product._id}
                    className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 overflow-hidden border border-brand-100 hover:border-brand-300"
                  >
                    <ProductCard
                      product={product}
                      isFavorite={favorites.has(product._id)}
                      onToggleFavorite={() => toggleFavorite(product._id)}
                      onQuickView={() => handleQuickView(product)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── Why Choose Us ────────────────────────────────────────────────────── */}
        <WhyChooseUs />

        {/* ── Social proof / Stats ─────────────────────────────────────────────── */}
        <section aria-labelledby="stats-heading" className="relative bg-brand-800 text-white py-16 sm:py-20 overflow-hidden">
          <div className="absolute inset-0 bg-brand-900/30 pointer-events-none" />

          <div className="container mx-auto px-4 relative z-10">
            <header className="text-center max-w-4xl mx-auto mb-14">
              <span className="inline-block bg-white/20 backdrop-blur px-5 py-2 rounded-full text-xs font-bold mb-5 border border-white/30 tracking-widest uppercase">
                Client Testimonials
              </span>
              <h2 id="stats-heading" className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                Trusted by Kenyan Homeowners
              </h2>
              <p className="text-lg text-brand-200 leading-relaxed">
                Thousands of families across Kenya have built their dream homes using our free architectural plans
              </p>
            </header>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
              {[
                { value: "98%",  label: "Client Satisfaction", icon: Heart },
                { value: "24/7", label: "Support Available",   icon: Clock },
                { value: "500+", label: "Projects Completed",  icon: CheckCircle },
                { value: "15+",  label: "Years Experience",    icon: Award },
              ].map((stat, i) => (
                <div key={i} className="text-center group">
                  <div className="flex items-center justify-center mb-3">
                    <div className="w-14 h-14 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform duration-300">
                      <stat.icon className="w-7 h-7 text-brand-200" aria-hidden="true" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-brand-200 mb-1">{stat.value}</div>
                  <div className="text-brand-300 font-medium text-xs sm:text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Process ──────────────────────────────────────────────────────────── */}
        <ProcessSteps />

        {/* ── CTA ──────────────────────────────────────────────────────────────── */}
        <section aria-labelledby="cta-heading" className="bg-white py-16 sm:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto text-center">
              <span className="inline-block bg-brand-50 border border-brand-200 rounded-full px-5 py-2 text-xs font-bold text-brand-600 mb-6 tracking-widest uppercase">
                Start Your Journey Today
              </span>

              <h2 id="cta-heading" className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-brand-900 mb-6 leading-tight">
                Transform Your Vision Into{" "}
                <span className="text-brand-600">Architectural Reality</span>
              </h2>

              <p className="text-lg sm:text-xl text-brand-700 mb-10 max-w-4xl mx-auto leading-relaxed">
                Join thousands of satisfied homeowners who've built their dream homes across Kenya
                with our{" "}
                <strong className="text-brand-600 font-semibold">
                  award-winning, free architectural designs
                </strong>
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link
                  to="/allProducts"
                  className="group bg-brand-600 hover:bg-brand-700 text-white px-10 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 flex items-center justify-center gap-3"
                >
                  <Building className="w-6 h-6" aria-hidden="true" />
                  Browse Free Plans
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </Link>

                <a
                  href="tel:+254763831806"
                  className="group bg-white border-2 border-brand-200 hover:border-brand-500 hover:bg-brand-50 text-brand-600 px-10 py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3"
                  aria-label="Call Hillersons Designs for architectural consultation"
                >
                  <Phone className="w-6 h-6 group-hover:scale-110 transition-transform" aria-hidden="true" />
                  Consult Our Architects
                </a>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-4xl mx-auto">
                {[
                  { icon: Shield, label: "100% Satisfaction Guarantee" },
                  { icon: Clock,  label: "24-Hour Response" },
                  { icon: Award,  label: "Award-Winning Designs" },
                  { icon: Users,  label: "Expert Support Team" },
                ].map((item, i) => (
                  <div key={i} className="text-center group">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-50 border border-brand-200 rounded-xl mb-3 group-hover:scale-110 transition-transform duration-300">
                      <item.icon className="w-7 h-7 text-brand-600" aria-hidden="true" />
                    </div>
                    <p className="text-xs text-brand-700 font-medium">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <Footer />

        {/* ── Video modal ──────────────────────────────────────────────────────── */}
        {showVideo && (
          <div
            className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Architectural design showcase video"
          >
            <div className="relative bg-white rounded-2xl p-6 md:p-8 max-w-5xl w-full shadow-2xl border border-brand-100">
              <button
                onClick={() => setShowVideo(false)}
                aria-label="Close video"
                className="absolute top-5 right-5 w-10 h-10 bg-brand-100 hover:bg-brand-200 text-brand-600 rounded-full flex items-center justify-center transition hover:scale-110"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-5">
                <h3 className="text-xl font-bold text-brand-900 mb-1">
                  Hillersons Designs — Architectural Showcase
                </h3>
                <p className="text-brand-600 text-sm">
                  See how Kenya's leading architectural firm brings your vision to life
                </p>
              </div>

              <div className="relative w-full h-0 pb-[56.25%] rounded-xl overflow-hidden shadow-lg">
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                  title="Hillersons Designs Architectural Design Showcase Kenya"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Quick view modal ─────────────────────────────────────────────────── */}
        {showQuickView && quickViewPlan && (
          <QuickViewModal
            product={{ ...quickViewPlan, bedrooms: quickViewPlan.rooms, floorCount: quickViewPlan.floorCount }}
            isOpen={showQuickView}
            onClose={closeQuickView}
          />
        )}
      </div>
    </>
  );
}