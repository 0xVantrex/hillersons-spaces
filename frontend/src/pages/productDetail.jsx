import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { API_BASE_URL } from "../lib/api";
import { useProjects } from "../context/ProjectsContext";
import {
  ArrowLeft, Heart, Share2, Bed, Bath, Square, Building,
  MapPin, Phone, Mail, ChevronRight, Star, Eye, ZoomIn,
  Check, Users, Clock, Award, Shield, MessageCircle,
  Calendar, Calculator, FileText, Home, Ruler, X,
} from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";

// ── Constants ─────────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  { name: "James Kiprotich", location: "Nairobi",  text: "Exceptional quality plans. Built our dream home!", rating: 5 },
  { name: "Mary Wanjiku",    location: "Mombasa",  text: "Professional service and beautiful designs.",       rating: 5 },
  { name: "Peter Otieno",    location: "Kisumu",   text: "Great value for money. Highly recommended!",        rating: 5 },
];

const FEATURES = [
  { icon: Shield,  title: "Quality Guarantee", desc: "100% satisfaction guaranteed" },
  { icon: Clock,   title: "Fast Delivery",     desc: "Plans ready in 24–48 hours" },
  { icon: Users,   title: "Expert Support",    desc: "Professional architect support" },
  { icon: Award,   title: "Award Winning",     desc: "Recognised design excellence" },
];

const TABS = [
  { id: "description", label: "Overview", icon: FileText },
  { id: "specs",       label: "Specs",    icon: Ruler },
  { id: "includes",    label: "Includes", icon: Check },
];

// Shared classes
const specCard   = "bg-brand-50 p-4 rounded-xl";
const iconCircle = "w-10 h-10 bg-brand-600 rounded-lg flex items-center justify-center flex-shrink-0";

export default function ProductDetail() {
  const { projects } = useProjects();
  const { id } = useParams();

  const [product, setProduct]             = useState(null);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [mainImage, setMainImage]         = useState("");
  const [favorites, setFavorites]         = useState(new Set());
  const [activeTab, setActiveTab]         = useState("description");
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [showSearch, setShowSearch]       = useState(false);
  const [searchQuery, setSearchQuery]     = useState("");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const imageRef = useRef(null);

  const incrementView = async (productId) => {
    try {
      await fetch(`${API_BASE_URL}/api/plans/${productId}/view`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("Failed to increment view:", err);
    }
  };

  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/plans`);
        if (!res.ok) throw new Error("Failed to fetch plans");
        const data = await res.json();

        const productData = data.find((plan) => String(plan._id) === String(id));
        if (productData) {
          const finalImages = Array.isArray(productData.finalImageURLs) && productData.finalImageURLs.length > 0
            ? productData.finalImageURLs : [];
          const planImages = Array.isArray(productData.planImageURLs) && productData.planImageURLs.length > 0
            ? productData.planImageURLs : [];
          const images = finalImages.length > 0 ? finalImages : ["https://via.placeholder.com/600x400?text=No+Image"];

          setProduct({ ...productData, finalImageURLs: finalImages, planImageURLs: planImages });
          setMainImage(images[0]);

          if (productData._id) incrementView(productData._id);

          const viewed = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
          const newViewed = [productData, ...viewed.filter((p) => p._id !== id)].slice(0, 5);
          localStorage.setItem("recentlyViewed", JSON.stringify(newViewed));
          setRecentlyViewed(newViewed);
        } else {
          setError("Product not found");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, [id]);

  const toggleFavorite = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/plans/${id}/favorite`, { method: "PATCH" });
      if (!res.ok) throw new Error("Failed to favourite plan");
      setFavorites((prev) => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
      });
    } catch (err) {
      console.error("Failed to toggle favourite:", err);
    }
  };

  const shareProduct = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: product.title, text: `Check out this house plan: ${product.title}`, url: window.location.href });
      } catch { setShowShareModal(true); }
    } else {
      setShowShareModal(true);
    }
  };

  const copyToClipboard = (text) => navigator.clipboard.writeText(text);

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <Header showSearch={showSearch} searchQuery={searchQuery} setSearchQuery={setSearchQuery}
          setShowSearch={setShowSearch} showMobileMenu={showMobileMenu} setShowMobileMenu={setShowMobileMenu} projects={projects} />
        <div className="min-h-screen bg-brand-50 pt-20 px-4 md:px-8">
          <div className="max-w-7xl mx-auto animate-pulse space-y-8">
            <div className="h-10 w-32 bg-brand-100 rounded-lg" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-96 bg-brand-100 rounded-xl" />
                <div className="grid grid-cols-4 gap-4">
                  {[1,2,3,4].map((i) => <div key={i} className="h-20 bg-brand-100 rounded-lg" />)}
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-8 bg-brand-100 rounded w-3/4" />
                <div className="h-6 bg-brand-50 rounded w-1/2" />
                <div className="grid grid-cols-2 gap-4">
                  {[1,2,3,4].map((i) => <div key={i} className="h-24 bg-brand-100 rounded-lg" />)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <>
        <Header showSearch={showSearch} searchQuery={searchQuery} setSearchQuery={setSearchQuery}
          setShowSearch={setShowSearch} showMobileMenu={showMobileMenu} setShowMobileMenu={setShowMobileMenu} projects={projects} />
        <div className="min-h-screen bg-brand-50 flex items-center justify-center px-4 pt-20">
          <div className="max-w-md bg-white rounded-2xl shadow-lg border border-brand-100 p-8 text-center">
            <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Home className="w-8 h-8 text-brand-600" />
            </div>
            <h2 className="text-2xl font-bold text-brand-900 mb-3">Plan Not Found</h2>
            <p className="text-brand-600 mb-6 text-sm">{error}</p>
            <Link
              to="/Allproducts"
              className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-xl font-semibold inline-flex items-center gap-2 transition"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to All Plans
            </Link>
          </div>
        </div>
      </>
    );
  }

  if (!product) return null;

  // ── Main render ──────────────────────────────────────────────────────────────
  return (
    <>
      {/* JSON-LD structured data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.title,
        "description": product.description || `Free architectural house plan — ${product.rooms || ""} bedrooms, ${product.floorCount || ""} floors. Available from Hillersons Designs Kenya.`,
        "image": product.finalImageURLs?.[0] || "",
        "brand": { "@type": "Brand", "name": "Hillersons Designs" },
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "KES",
          "availability": "https://schema.org/InStock",
          "seller": { "@type": "Organization", "name": "Hillersons Designs" }
        },
        "aggregateRating": product.rating ? {
          "@type": "AggregateRating",
          "ratingValue": product.rating,
          "reviewCount": product.reviews || 1
        } : undefined
      })}} />

      <Header showSearch={showSearch} searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        setShowSearch={setShowSearch} showMobileMenu={showMobileMenu} setShowMobileMenu={setShowMobileMenu} projects={projects} />

      <div className="min-h-screen bg-brand-50 pt-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">

          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-sm text-brand-600 flex-wrap">
            <Link to="/" className="hover:text-brand-900 transition">Home</Link>
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
            <Link to="/Allproducts" className="hover:text-brand-900 transition">House Plans</Link>
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
            <span className="text-brand-900 font-medium truncate">{product.title}</span>
          </nav>

          <div className="mb-8">
            <Link
              to="/Allproducts"
              className="group bg-white hover:bg-brand-50 text-brand-700 px-4 py-2 rounded-xl font-medium inline-flex items-center gap-2 transition shadow-sm border border-brand-200"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" aria-hidden="true" />
              Back to All Plans
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* ── Image Gallery ──────────────────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <div className="bg-brand-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <Eye className="w-4 h-4" aria-hidden="true" />
                  {product.views || 0} views
                </div>
                <div className="bg-brand-100 text-brand-800 px-3 py-1 rounded-full text-sm font-medium">
                  Free Plan
                </div>
              </div>

              {/* Main image */}
              <div className="bg-white rounded-xl shadow-sm border border-brand-100 overflow-hidden relative group">
                <img
                  ref={imageRef}
                  src={mainImage || product.finalImageURLs?.[0] || ""}
                  alt={`${product.title} — free house plan Kenya`}
                  className="w-full h-auto max-h-[500px] object-contain mx-auto cursor-zoom-in"
                  onClick={() => setIsImageZoomed(true)}
                  loading="eager"
                />
                <button
                  onClick={() => setIsImageZoomed(true)}
                  aria-label="Zoom image"
                  className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>
                <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-lg text-xs">
                  1 / {(product.finalImageURLs?.length || 0) + (product.planImageURLs?.length || 0)}
                </div>
              </div>

              {/* Final views thumbnails */}
              {product.finalImageURLs?.length > 0 && (
                <>
                  <p className="text-sm font-semibold text-brand-800">Final Views</p>
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    {product.finalImageURLs.map((img, index) => (
                      <button
                        key={`final-${index}`}
                        onClick={() => setMainImage(img)}
                        aria-label={`View final image ${index + 1}`}
                        className={`bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition border-2 ${
                          mainImage === img ? "border-brand-500" : "border-transparent"
                        }`}
                      >
                        <img src={img} alt={`${product.title} — view ${index + 1}`} className="w-full h-20 object-cover" loading="lazy" />
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Blueprint thumbnails */}
              {product.planImageURLs?.length > 0 && (
                <>
                  <p className="text-sm font-semibold text-brand-800">Blueprints</p>
                  <div className="grid grid-cols-4 gap-3">
                    {product.planImageURLs.map((img, index) => (
                      <button
                        key={`plan-${index}`}
                        onClick={() => setMainImage(img)}
                        aria-label={`View blueprint ${index + 1}`}
                        className={`bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition border-2 ${
                          mainImage === img ? "border-brand-500" : "border-transparent"
                        }`}
                      >
                        <img src={img} alt={`${product.title} — blueprint ${index + 1}`} className="w-full h-20 object-cover" loading="lazy" />
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Why choose this plan */}
              <div className="bg-white rounded-xl shadow-sm border border-brand-100 p-6">
                <h2 className="text-lg font-bold text-brand-900 mb-4">Why Choose This Plan?</h2>
                <div className="grid grid-cols-2 gap-4">
                  {FEATURES.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-brand-50 rounded-lg border border-brand-100">
                      <div className={iconCircle}>
                        <feature.icon className="w-5 h-5 text-white" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="font-semibold text-brand-900 text-sm">{feature.title}</p>
                        <p className="text-xs text-brand-600">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Sidebar ───────────────────────────────────────────────────── */}
            <aside className="space-y-6">

              {/* Title + rating */}
              <div className="bg-white rounded-xl shadow-sm border border-brand-100 p-6">
                <h1 className="text-2xl font-bold text-brand-900 mb-3">{product.title}</h1>

                {product.rating && (
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-brand-accent fill-brand-accent" aria-hidden="true" />
                      ))}
                      <span className="font-bold text-brand-900 ml-1 text-sm">{product.rating}</span>
                    </div>
                    {product.reviews && (
                      <span className="text-xs text-brand-500">({product.reviews} reviews)</span>
                    )}
                  </div>
                )}

                <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-200 text-brand-700 px-4 py-2 rounded-xl font-semibold text-sm">
                  <Check className="w-4 h-4" aria-hidden="true" />
                  Free — No purchase required
                </div>
              </div>

              {/* CTA */}
              <div className="bg-white rounded-xl shadow-sm border border-brand-100 p-6">
                <p className="text-sm text-brand-600 mb-4">
                  Interested in this plan? Contact our team to get started or request a custom modification.
                </p>
                <div className="space-y-3">
                  <a
                    href="tel:+254763831806"
                    className="w-full bg-brand-600 hover:bg-brand-700 text-white px-6 py-3.5 rounded-xl font-semibold transition flex items-center justify-center gap-2 text-sm"
                    aria-label="Call Hillersons Designs to enquire about this plan"
                  >
                    <Phone className="w-5 h-5" aria-hidden="true" />
                    Call to Enquire
                  </a>
                  <a
                    href="https://wa.me/254763831806"
                    target="_blank" rel="noopener noreferrer"
                    className="w-full bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 px-6 py-3.5 rounded-xl font-semibold transition flex items-center justify-center gap-2 text-sm"
                    aria-label="WhatsApp Hillersons Designs"
                  >
                    WhatsApp Us
                  </a>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={toggleFavorite}
                      aria-label={favorites.has(id) ? "Remove from saved" : "Save this plan"}
                      className={`px-3 py-3 rounded-xl font-medium flex items-center justify-center gap-1.5 transition text-sm ${
                        favorites.has(id)
                          ? "bg-brand-100 text-brand-700 hover:bg-brand-200"
                          : "bg-brand-50 text-brand-600 hover:bg-brand-100 border border-brand-200"
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${favorites.has(id) ? "fill-current" : ""}`} aria-hidden="true" />
                      {favorites.has(id) ? "Saved" : "Save"}
                    </button>
                    <button
                      onClick={shareProduct}
                      aria-label="Share this plan"
                      className="bg-brand-50 hover:bg-brand-100 text-brand-600 border border-brand-200 px-3 py-3 rounded-xl font-medium flex items-center justify-center gap-1.5 transition text-sm"
                    >
                      <Share2 className="w-4 h-4" aria-hidden="true" />
                      Share
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick specs */}
              <div className="bg-white rounded-xl shadow-sm border border-brand-100 p-6">
                <h2 className="text-base font-bold text-brand-900 mb-4">Quick Specifications</h2>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: Bed,      label: "Bedrooms",  value: product.rooms || "—" },
                    { icon: Bath,     label: "Bathrooms", value: Math.ceil((product.rooms || 0) * 0.75) || "—" },
                    { icon: Building, label: "Floors",    value: product.floorCount || "—" },
                    { icon: Square,   label: "Area",      value: product.area ? `${product.area.toFixed(0)}m²` : "—" },
                  ].map(({ icon: Icon, label, value }, i) => (
                    <div key={i} className={specCard}>
                      <div className="flex items-center gap-2 text-brand-600 mb-1">
                        <Icon className="w-4 h-4" aria-hidden="true" />
                        <span className="font-semibold text-xs">{label}</span>
                      </div>
                      <div className="text-xl font-bold text-brand-900">{value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tabs */}
              <div className="bg-white rounded-xl shadow-sm border border-brand-100 overflow-hidden">
                <div className="flex border-b border-brand-100" role="tablist">
                  {TABS.map((tab) => (
                    <button
                      key={tab.id}
                      role="tab"
                      aria-selected={activeTab === tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-3 font-medium flex-1 text-center flex items-center justify-center gap-2 transition text-sm ${
                        activeTab === tab.id
                          ? "text-brand-600 border-b-2 border-brand-600 bg-brand-50"
                          : "text-brand-500 hover:bg-brand-50"
                      }`}
                    >
                      <tab.icon className="w-4 h-4" aria-hidden="true" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  ))}
                </div>

                <div className="p-6" role="tabpanel">
                  {activeTab === "description" && (
                    <div className="space-y-4">
                      <p className="text-brand-700 leading-relaxed text-sm">
                        {product.description || "This architectural design combines modern aesthetics with functional living spaces, perfect for contemporary family living in Kenya."}
                      </p>
                      {product.location && (
                        <div className="flex items-center gap-2 text-brand-700 p-3 bg-brand-50 rounded-lg text-sm">
                          <MapPin className="w-4 h-4 text-brand-600" aria-hidden="true" />
                          Suitable for: {product.location} and similar climates
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-3">
                        {product.warranty && (
                          <div className="p-3 bg-brand-50 rounded-lg border border-brand-100">
                            <Shield className="w-5 h-5 text-brand-600 mb-2" aria-hidden="true" />
                            <p className="font-semibold text-brand-900 text-sm">{product.warranty}</p>
                            <p className="text-xs text-brand-500">Design guarantee</p>
                          </div>
                        )}
                        {product.revisions && (
                          <div className="p-3 bg-brand-50 rounded-lg border border-brand-100">
                            <Check className="w-5 h-5 text-brand-600 mb-2" aria-hidden="true" />
                            <p className="font-semibold text-brand-900 text-sm">{product.revisions}</p>
                            <p className="text-xs text-brand-500">Free modifications</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === "specs" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-bold text-brand-900 mb-3 flex items-center gap-2 text-sm">
                          <Ruler className="w-4 h-4 text-brand-600" aria-hidden="true" />
                          Dimensions
                        </h3>
                        <div className="space-y-2">
                          {[
                            { label: "Length",     value: `${product.length || "—"} m` },
                            { label: "Width",      value: `${product.width  || "—"} m` },
                            { label: "Height",     value: `${product.height || "—"} m` },
                            { label: "Total Area", value: product.area ? `${product.area.toFixed(0)} m²` : "—" },
                          ].map((item, i) => (
                            <div key={i} className="flex justify-between items-center p-2 hover:bg-brand-50 rounded-lg text-sm">
                              <span className="text-brand-500">{item.label}:</span>
                              <span className="font-semibold text-brand-900">{item.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-bold text-brand-900 mb-3 flex items-center gap-2 text-sm">
                          <Building className="w-4 h-4 text-brand-600" aria-hidden="true" />
                          Structure
                        </h3>
                        <div className="space-y-2">
                          {[
                            { label: "Floors",       value: product.floorCount || "—" },
                            { label: "Bedrooms",     value: product.rooms || "—" },
                            { label: "Bathrooms",    value: Math.ceil((product.rooms || 0) * 0.75) || "—" },
                            { label: "Customizable", value: product.customizable ? "Yes" : "Limited" },
                          ].map((item, i) => (
                            <div key={i} className="flex justify-between items-center p-2 hover:bg-brand-50 rounded-lg text-sm">
                              <span className="text-brand-500">{item.label}:</span>
                              <span className="font-semibold text-brand-900">{item.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "includes" && (
                    <div>
                      <h3 className="font-bold text-brand-900 mb-4 flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-brand-600" aria-hidden="true" />
                        Complete Package Includes:
                      </h3>
                      {product.includes?.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-5">
                          {product.includes.map((item, index) => (
                            <div key={index} className="flex items-center gap-3 text-brand-700 p-2 hover:bg-brand-50 rounded-lg text-sm">
                              <div className="w-2 h-2 bg-brand-500 rounded-full flex-shrink-0" />
                              {item}
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="p-4 bg-brand-50 border border-brand-100 rounded-xl">
                        <p className="font-semibold text-brand-900 mb-2 text-sm">Bonus Inclusions:</p>
                        <ul className="text-xs text-brand-700 space-y-1">
                          <li>• Free consultation call with architect</li>
                          <li>• 3D walkthrough video</li>
                          <li>• Construction timeline guide</li>
                          <li>• Local building permit guidance</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact card */}
              <div className="bg-brand-700 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <MessageCircle className="w-5 h-5" aria-hidden="true" />
                  <h2 className="text-lg font-bold">Ready to Build Your Dream?</h2>
                </div>
                <p className="mb-5 text-brand-200 text-sm">
                  Get expert advice or request a customisation of this plan from our team in Kenya.
                </p>
                <div className="space-y-3 mb-5">
                  <a href="tel:+254763831806" className="flex items-center gap-3 hover:text-brand-200 transition group">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition flex-shrink-0">
                      <Phone className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Call Now</p>
                      <p className="text-xs text-brand-200">+254 763 831 806</p>
                    </div>
                  </a>
                  <a href="mailto:HillersonsCompany@gmail.com" className="flex items-center gap-3 hover:text-brand-200 transition group">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition flex-shrink-0">
                      <Mail className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Email Us</p>
                      <p className="text-xs text-brand-200">HillersonsCompany@gmail.com</p>
                    </div>
                  </a>
                </div>
                <div className="space-y-2">
                  <button className="w-full bg-white text-brand-700 hover:bg-brand-50 px-6 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 text-sm">
                    <Calendar className="w-4 h-4" aria-hidden="true" />
                    Schedule Free Consultation
                  </button>
                  <button className="w-full bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 border border-white/20 text-sm">
                    Request Custom Modifications
                    <ChevronRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>

              {/* Testimonials */}
              <div className="bg-white rounded-xl shadow-sm border border-brand-100 p-6">
                <h2 className="text-base font-bold text-brand-900 mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4 text-brand-600" aria-hidden="true" />
                  What Our Customers Say
                </h2>
                <div className="space-y-4">
                  {TESTIMONIALS.slice(0, 2).map((t, index) => (
                    <blockquote key={index} className="p-4 bg-brand-50 rounded-xl border border-brand-100">
                      <div className="flex items-center gap-0.5 mb-2">
                        {[...Array(t.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 text-brand-accent fill-brand-accent" aria-hidden="true" />
                        ))}
                      </div>
                      <p className="text-brand-800 text-sm mb-2">"{t.text}"</p>
                      <footer className="text-xs text-brand-500">
                        <span className="font-semibold">{t.name}</span>, {t.location}
                      </footer>
                    </blockquote>
                  ))}
                </div>
              </div>

              {/* Cost calculator trigger */}
              <div className="bg-white rounded-xl shadow-sm border border-brand-100 p-6">
                <button
                  onClick={() => setShowCalculator(true)}
                  className="w-full flex items-center justify-between text-brand-700 hover:text-brand-900 transition group"
                  aria-label="Open construction cost estimator"
                >
                  <div className="flex items-center gap-3">
                    <Calculator className="w-5 h-5 text-brand-600" aria-hidden="true" />
                    <span className="font-semibold text-sm">Estimate Construction Cost</span>
                  </div>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </button>
              </div>
            </aside>
          </div>

          {/* Recently viewed */}
          {recentlyViewed.length > 1 && (
            <section aria-labelledby="recently-viewed-heading" className="mt-12 bg-white rounded-xl shadow-sm border border-brand-100 p-6">
              <h2 id="recently-viewed-heading" className="text-lg font-bold text-brand-900 mb-6">
                Recently Viewed Plans
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {recentlyViewed.slice(1, 5).map((item, index) => (
                  <Link
                    key={index}
                    to={`/product/${item._id}`}
                    className="group bg-brand-50 rounded-xl p-4 hover:bg-brand-100 transition border border-brand-100"
                  >
                    <div className="aspect-square bg-brand-100 rounded-lg mb-3 overflow-hidden">
                      {item.finalImageURLs?.[0] && (
                        <img
                          src={item.finalImageURLs[0]}
                          alt={`${item.title} — house plan`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      )}
                    </div>
                    <h3 className="font-semibold text-brand-900 text-sm mb-1 line-clamp-2 group-hover:text-brand-600 transition">
                      {item.title}
                    </h3>
                    <p className="text-xs text-brand-500">{item.rooms} bed · {item.area?.toFixed(0)}m²</p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <Footer />

      {/* ── Image zoom modal ──────────────────────────────────────────────────── */}
      {isImageZoomed && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Zoomed image view"
          onClick={() => setIsImageZoomed(false)}
        >
          <div className="relative max-w-full max-h-full">
            <img
              src={mainImage}
              alt={`${product.title} — zoomed view`}
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={() => setIsImageZoomed(false)}
              aria-label="Close zoomed image"
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* ── Share modal ───────────────────────────────────────────────────────── */}
      {showShareModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="share-modal-title"
        >
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-brand-100">
            <h3 id="share-modal-title" className="text-lg font-bold text-brand-900 mb-4">Share This Plan</h3>
            <div className="space-y-3">
              <button
                onClick={() => copyToClipboard(window.location.href)}
                className="w-full bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 p-3 rounded-xl flex items-center gap-3 transition text-sm font-medium"
              >
                <Share2 className="w-5 h-5" aria-hidden="true" />
                Copy Link
              </button>
              <div className="grid grid-cols-3 gap-2">
                <a
                  href={`https://wa.me/?text=Check out this house plan: ${product.title} ${window.location.href}`}
                  target="_blank" rel="noopener noreferrer"
                  className="bg-brand-600 hover:bg-brand-700 text-white p-3 rounded-xl text-center transition text-sm font-medium"
                >
                  WhatsApp
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?text=Check out this house plan: ${product.title}&url=${window.location.href}`}
                  target="_blank" rel="noopener noreferrer"
                  className="bg-brand-500 hover:bg-brand-600 text-white p-3 rounded-xl text-center transition text-sm font-medium"
                >
                  Twitter
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`}
                  target="_blank" rel="noopener noreferrer"
                  className="bg-brand-700 hover:bg-brand-800 text-white p-3 rounded-xl text-center transition text-sm font-medium"
                >
                  Facebook
                </a>
              </div>
            </div>
            <button
              onClick={() => setShowShareModal(false)}
              className="mt-4 w-full bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 p-3 rounded-xl transition font-medium text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ── Cost calculator modal ─────────────────────────────────────────────── */}
      {showCalculator && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="calculator-modal-title"
        >
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-brand-100">
            <h3 id="calculator-modal-title" className="text-lg font-bold text-brand-900 mb-4 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-brand-600" aria-hidden="true" />
              Construction Cost Estimate
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-brand-50 rounded-xl border border-brand-100">
                <p className="text-xs text-brand-500 mb-1">Estimated Construction Cost</p>
                <p className="text-2xl font-bold text-brand-900">
                  KES {((product.area || 100) * 35000).toLocaleString()} – {((product.area || 100) * 55000).toLocaleString()}
                </p>
                <p className="text-xs text-brand-400 mt-1">
                  Based on {product.area?.toFixed(0) || 100}m² at KES 35,000–55,000 per m²
                </p>
              </div>
              <ul className="text-sm text-brand-600 space-y-1.5">
                <li>• Estimates based on mid-range finishes</li>
                <li>• Excludes land cost and site preparation</li>
                <li>• Final costs may vary by location and specifications</li>
                <li>• Contact us for a detailed quotation</li>
              </ul>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setShowCalculator(false)}
                  className="bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 p-3 rounded-xl transition font-medium text-sm"
                >
                  Close
                </button>
                <a
                  href="tel:+254763831806"
                  className="bg-brand-600 hover:bg-brand-700 text-white p-3 rounded-xl transition font-medium text-sm text-center"
                  aria-label="Call to get a construction quote"
                >
                  Get Quote
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}