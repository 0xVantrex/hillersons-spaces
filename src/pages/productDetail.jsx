import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { API_BASE_URL } from "../lib/api";
import { useProjects } from "../context/ProjectsContext";
import {
  ArrowLeft,
  Heart,
  Share2,
  Bed,
  Bath,
  Square,
  Building,
  MapPin,
  Download,
  Phone,
  Mail,
  ChevronRight,
  Star,
  Eye,
  ZoomIn,
  Check,
  Users,
  Clock,
  Award,
  Shield,
  MessageCircle,
  Calendar,
  Calculator,
  FileText,
  Home,
  Ruler,
} from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const ProductDetail = () => {
  const { projects } = useProjects();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [favorites, setFavorites] = useState(new Set());
  const [activeTab, setActiveTab] = useState("description");
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const imageRef = useRef(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileMenu, setShowMobileMenu] = useState("");

  const testimonials = [
    {
      name: "James Kiprotich",
      location: "Nairobi",
      text: "Exceptional quality plans. Built our dream home!",
      rating: 5,
    },
    {
      name: "Mary Wanjiku",
      location: "Mombasa",
      text: "Professional service and beautiful designs.",
      rating: 5,
    },
    {
      name: "Peter Otieno",
      location: "Kisumu",
      text: "Great value for money. Highly recommended!",
      rating: 5,
    },
  ];

  const features = [
    {
      icon: Shield,
      title: "Quality Guarantee",
      desc: "100% satisfaction guaranteed",
    },
    { icon: Clock, title: "Fast Delivery", desc: "Plans ready in 24-48 hours" },
    {
      icon: Users,
      title: "Expert Support",
      desc: "Professional architect support",
    },
    {
      icon: Award,
      title: "Award Winning",
      desc: "Recognized design excellence",
    },
  ];

  // 🔥 Increment view count function
  const incrementView = async (productId) => {
    try {
      await fetch(`${API_BASE_URL}/api/plans/${productId}/view`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
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
        if (!res.ok) {
          throw new Error("Failed to fetch plans");
        }
        const data = await res.json();
        console.log("Fetched plans:", data);

        const productData = data.find(
          (plan) => String(plan._id) === String(id)
        );
        if (productData) {
          const finalImages =
            Array.isArray(productData.finalImageURLs) &&
            productData.finalImageURLs.length > 0
              ? productData.finalImageURLs
              : [];

          const planImages =
            Array.isArray(productData.planImageURLs) &&
            productData.planImageURLs.length > 0
              ? productData.planImageURLs
              : [];

          const images =
            finalImages.length > 0
              ? finalImages
              : ["https://via.placeholder.com/600x400?text=No+Image"];

          setProduct({
            ...productData,
            finalImageURLs: finalImages,
            planImageURLs: planImages,
          });
          setMainImage(images[0]);

          // 🔥 Increment view count when product is loaded
          if (productData._id) {
            incrementView(productData._id);
          }

          const viewed = JSON.parse(
            localStorage.getItem("recentlyViewed") || "[]"
          );
          const newViewed = [
            productData,
            ...viewed.filter((p) => p._id !== id),
          ].slice(0, 5);
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
      const res = await fetch(`${API_BASE_URL}/api/plans/${id}/favorite`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error("Failed to favorite plan");

      const data = await res.json();
      console.log("Favorite updated:", data);

      setFavorites((prev) => {
        const newFavorites = new Set(prev);
        if (newFavorites.has(id)) {
          newFavorites.delete(id);
        } else {
          newFavorites.add(id);
        }
        return newFavorites;
      });
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
    }
  };

  const handleImageZoom = () => {
    setIsImageZoomed(true);
  };

  const shareProduct = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: `Check out this amazing house plan: ${product.title}`,
          url: window.location.href,
        });
      } catch (err) {
        setShowShareModal(true);
      }
    } else {
      setShowShareModal(true);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  // Image Gallery Component
  const ImageGallery = () => (
    <div className="lg:col-span-2 space-y-4">
      <div className="flex items-center gap-4 mb-4">
        <div className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
          <Eye className="w-4 h-4" />
          {product.views || 0} views today
        </div>
        <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
          🔥 Trending Design
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden relative group">
        <img
          ref={imageRef}
          src={mainImage || product.finalImageURLs?.[0] || ""}
          alt={product.title}
          className="w-full h-auto max-h-[500px] object-contain mx-auto cursor-zoom-in"
          onClick={handleImageZoom}
        />
        <div className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
          <ZoomIn className="w-5 h-5" />
        </div>
        <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-lg text-sm">
          1 /{" "}
          {(product.finalImageURLs?.length || 0) +
            (product.planImageURLs?.length || 0)}
        </div>
      </div>

      {product.finalImageURLs?.length > 0 && (
        <>
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Final Views
          </h3>
          <div className="grid grid-cols-4 gap-4 mb-4">
            {product.finalImageURLs.map((img, index) => (
              <button
                key={`final-${index}`}
                onClick={() => setMainImage(img)}
                className={`bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105 ${
                  mainImage === img ? "ring-2 ring-green-500 shadow-md" : ""
                }`}
              >
                <img
                  src={img}
                  alt={`${product.title} final ${index + 1}`}
                  className="w-full h-20 object-cover"
                />
              </button>
            ))}
          </div>
        </>
      )}

      {product.planImageURLs?.length > 0 && (
        <>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Blueprints</h3>
          <div className="grid grid-cols-4 gap-4">
            {product.planImageURLs.map((img, index) => (
              <button
                key={`plan-${index}`}
                onClick={() => setMainImage(img)}
                className={`bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105 ${
                  mainImage === img ? "ring-2 ring-green-500 shadow-md" : ""
                }`}
              >
                <img
                  src={img}
                  alt={`${product.title} blueprint ${index + 1}`}
                  className="w-full h-20 object-cover"
                />
              </button>
            ))}
          </div>
        </>
      )}

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold text-green-900 mb-4">
          Why Choose This Plan?
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-green-50 rounded-lg"
            >
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <feature.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-semibold text-green-900">
                  {feature.title}
                </div>
                <div className="text-sm text-green-700">{feature.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Product Info Sidebar Component
  const ProductSidebar = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h1 className="text-3xl font-bold text-green-900 mb-2">
          {product.title}
        </h1>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
            <Users className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-green-700 font-medium">
              Designed by {product.architect}
            </p>
            <p className="text-sm text-green-600">
              {product.certifications?.[0]}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
            ))}
            <span className="font-bold text-green-800 ml-1">
              {product.rating}
            </span>
          </div>
          <span className="text-sm text-green-700">
            ({product.reviews} reviews)
          </span>
          <span className="text-sm text-green-700">
            {product.downloads} downloads
          </span>
        </div>

        <div className="mb-4">
          <div className="text-3xl font-bold text-green-800 mb-1">
            {product.price
              ? `KES ${product.price.toLocaleString()}`
              : "Contact for Price"}
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-green-600" />
            <span className="text-green-700">
              Ready in: {product.completionTime}
            </span>
          </div>
          <div className="text-sm text-orange-600 font-medium mt-1">
            ⚡ Limited time: Free 3D walkthrough included!
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="space-y-3">
          <button className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center gap-2">
            <Download className="w-5 h-5" />
            Download Complete Plans
          </button>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={toggleFavorite}
              className={`px-3 py-3 rounded-lg font-medium flex items-center justify-center gap-1 transition-all duration-200 ${
                favorites.has(id)
                  ? "bg-red-100 text-red-600 hover:bg-red-200"
                  : "bg-green-100 text-green-700 hover:bg-green-200"
              }`}
            >
              <Heart
                className={`w-4 h-4 ${favorites.has(id) ? "fill-current" : ""}`}
              />
              <span className="hidden sm:inline">
                {favorites.has(id) ? "Saved" : "Save"}
              </span>
            </button>

            <button
              onClick={shareProduct}
              className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-3 rounded-lg font-medium flex items-center justify-center gap-1 transition-all duration-200"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Share</span>
            </button>

            <button
              onClick={() => setShowCalculator(true)}
              className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-3 rounded-lg font-medium flex items-center justify-center gap-1 transition-all duration-200"
            >
              <Calculator className="w-4 h-4" />
              <span className="hidden sm:inline">Cost</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold text-green-900 mb-4">
          Quick Specifications
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-green-700 mb-2">
              <Bed className="w-5 h-5" />
              <span className="font-semibold">Bedrooms</span>
            </div>
            <div className="text-2xl font-bold text-green-900">
              {product.rooms || "-"}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-blue-700 mb-2">
              <Bath className="w-5 h-5" />
              <span className="font-semibold">Bathrooms</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">
              {Math.ceil((product.rooms || 0) * 0.75)}
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-purple-700 mb-2">
              <Building className="w-5 h-5" />
              <span className="font-semibold">Floors</span>
            </div>
            <div className="text-2xl font-bold text-purple-900">
              {product.floorCount || "-"}
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-orange-700 mb-2">
              <Square className="w-5 h-5" />
              <span className="font-semibold">Area</span>
            </div>
            <div className="text-2xl font-bold text-orange-900">
              {product.area ? `${product.area.toFixed(0)}m²` : "-"}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="flex border-b border-green-100">
          {[
            { id: "description", label: "Overview", icon: FileText },
            { id: "specs", label: "Specs", icon: Ruler },
            { id: "includes", label: "Includes", icon: Check },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-medium flex-1 text-center flex items-center justify-center gap-2 transition-all duration-200 ${
                activeTab === tab.id
                  ? "text-green-600 border-b-2 border-green-600 bg-green-50"
                  : "text-green-700 hover:bg-green-50"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === "description" && (
            <div className="space-y-4">
              <p className="text-green-800 leading-relaxed">
                {product.description ||
                  "This premium architectural design combines modern aesthetics with functional living spaces, perfect for contemporary family living."}
              </p>

              {product.location && (
                <div className="flex items-center gap-2 text-green-700 p-3 bg-green-50 rounded-lg">
                  <MapPin className="w-5 h-5" />
                  <span>
                    Suitable for: {product.location} and similar climates
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Shield className="w-6 h-6 text-blue-600 mb-2" />
                  <div className="font-semibold text-blue-900">
                    {product.warranty}
                  </div>
                  <div className="text-sm text-blue-700">Design guarantee</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <Check className="w-6 h-6 text-green-600 mb-2" />
                  <div className="font-semibold text-green-900">
                    {product.revisions}
                  </div>
                  <div className="text-sm text-green-700">
                    Free modifications
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "specs" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                    <Ruler className="w-5 h-5" />
                    Dimensions
                  </h4>
                  <div className="space-y-3">
                    {[
                      { label: "Length", value: `${product.length || "-"} m` },
                      { label: "Width", value: `${product.width || "-"} m` },
                      { label: "Height", value: `${product.height || "-"} m` },
                      {
                        label: "Total Area",
                        value: product.area
                          ? `${product.area.toFixed(0)} m²`
                          : "-",
                      },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-2 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        <span className="text-green-700">{item.label}:</span>
                        <span className="font-semibold text-green-900">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    Structure
                  </h4>
                  <div className="space-y-3">
                    {[
                      { label: "Floors", value: product.floorCount || "-" },
                      { label: "Bedrooms", value: product.rooms || "-" },
                      {
                        label: "Bathrooms",
                        value: Math.ceil((product.rooms || 0) * 0.75),
                      },
                      {
                        label: "Customizable",
                        value: product.customizable ? "Yes" : "Limited",
                      },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-2 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        <span className="text-green-700">{item.label}:</span>
                        <span className="font-semibold text-green-900">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "includes" && (
            <div>
              <h4 className="font-bold text-green-800 mb-4 flex items-center gap-2">
                <Check className="w-5 h-5" />
                Complete Package Includes:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {product.includes?.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 text-green-700 p-2 hover:bg-green-50 rounded-lg transition-colors"
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                <h5 className="font-semibold text-green-800 mb-2">
                  💎 Bonus Inclusions:
                </h5>
                <ul className="text-sm text-green-700 space-y-1">
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

      <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle className="w-6 h-6" />
          <h3 className="text-xl font-bold">Ready to Build Your Dream?</h3>
        </div>
        <p className="mb-4 opacity-90">
          Get instant access to plans or speak with our expert architects for
          customization.
        </p>

        <div className="space-y-3 mb-6">
          <a
            href="tel:+254763831806"
            className="flex items-center gap-3 hover:text-green-100 transition-colors group"
          >
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold">Call Now</div>
              <div className="text-sm opacity-90">+254 763 831806</div>
            </div>
          </a>
          <a
            href="mailto:HillersonsCompany@gmail.com"
            className="flex items-center gap-3 hover:text-green-100 transition-colors group"
          >
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold">Email Us</div>
              <div className="text-sm opacity-90">
                HillersonsCompany@gmail.com
              </div>
            </div>
          </a>
        </div>

        <div className="space-y-2">
          <button className="w-full bg-white text-green-700 hover:bg-green-50 px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2 shadow-md">
            <Calendar className="w-5 h-5" />
            Schedule Free Consultation
          </button>
          <button className="w-full bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 border border-white/20">
            Request Custom Modifications
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold text-green-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          What Our Customers Say
        </h3>
        <div className="space-y-4">
          {testimonials.slice(0, 2).map((testimonial, index) => (
            <div key={index} className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-1 mb-2">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 text-yellow-500 fill-current"
                  />
                ))}
              </div>
              <p className="text-green-800 text-sm mb-2">
                "{testimonial.text}"
              </p>
              <div className="text-xs text-green-600">
                <span className="font-semibold">{testimonial.name}</span>,{" "}
                {testimonial.location}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <>
        <Header
          showSearch={showSearch}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setShowSearch={setShowSearch}
          showMobileMenu={showMobileMenu}
          setShowMobileMenu={setShowMobileMenu}
          projects={projects}
        />
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 pt-20 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse space-y-8">
              <div className="h-10 w-32 bg-green-200/50 rounded-lg"></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                  <div className="h-96 bg-green-200/50 rounded-xl"></div>
                  <div className="grid grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-20 bg-green-200/50 rounded-lg"
                      ></div>
                    ))}
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="h-8 bg-green-200/50 rounded w-3/4"></div>
                  <div className="h-6 bg-green-200/50 rounded w-1/2"></div>
                  <div className="grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-24 bg-green-200/50 rounded-lg"
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header
          showSearch={showSearch}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setShowSearch={setShowSearch}
          showMobileMenu={showMobileMenu}
          setShowMobileMenu={setShowMobileMenu}
        />
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center px-4 pt-20">
          <div className="max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Home className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-800 mb-4">
              Product Not Found
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              to="/Allproducts"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold inline-flex items-center gap-2 transition-all duration-200 transform hover:scale-105"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Products
            </Link>
          </div>
        </div>
      </>
    );
  }

  if (!product) return null;

  return (
    <>
      <Header
        showSearch={showSearch}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setShowSearch={setShowSearch}
        showMobileMenu={showMobileMenu}
        setShowMobileMenu={setShowMobileMenu}
      />

      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 pt-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 flex items-center gap-2 text-sm">
            <Link
              to="/"
              className="text-green-600 hover:text-green-700 transition-colors"
            >
              Home
            </Link>
            <ChevronRight className="w-4 h-4 text-green-400" />
            <Link
              to="/products"
              className="text-green-600 hover:text-green-700 transition-colors"
            >
              House Plans
            </Link>
            <ChevronRight className="w-4 h-4 text-green-400" />
            <span className="text-green-800 font-medium truncate">
              {product.title}
            </span>
          </div>

          <div className="mb-8">
            <Link
              to="/Allproducts"
              className="group bg-white/80 backdrop-blur-sm hover:bg-white text-green-800 px-4 py-2 rounded-lg font-medium inline-flex items-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md border border-green-100"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
              Back to All Plans
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <ImageGallery />
            <ProductSidebar />
          </div>

          {recentlyViewed.length > 1 && (
            <div className="mt-12 bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-green-900 mb-6">
                Recently Viewed Plans
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {recentlyViewed.slice(1, 5).map((item, index) => (
                  <Link
                    key={index}
                    to={`/products/${item._id}`}
                    className="group bg-green-50 rounded-lg p-4 hover:bg-green-100 transition-all duration-200 transform hover:scale-105"
                  >
                    <div className="aspect-square bg-green-200 rounded-lg mb-3 overflow-hidden">
                      {item.finalImageURLs?.[0] && (
                        <img
                          src={item.finalImageURLs[0]}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <h4 className="font-semibold text-green-900 text-sm mb-1 line-clamp-2 group-hover:text-green-700">
                      {item.title}
                    </h4>
                    <p className="text-xs text-green-600">
                      {item.rooms} bed • {item.area?.toFixed(0)}m²
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {isImageZoomed && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setIsImageZoomed(false)}
        >
          <div className="relative max-w-full max-h-full">
            <img
              src={mainImage}
              alt={product.title}
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={() => setIsImageZoomed(false)}
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-green-900 mb-4">
              Share This Plan
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => copyToClipboard(window.location.href)}
                className="w-full bg-green-100 hover:bg-green-200 text-green-700 p-3 rounded-lg flex items-center gap-3 transition-colors"
              >
                <Share2 className="w-5 h-5" />
                Copy Link
              </button>
              <div className="grid grid-cols-3 gap-2">
                <a
                  href={`https://wa.me/?text=Check out this amazing house plan: ${product.title} ${window.location.href}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-lg text-center transition-colors text-sm"
                >
                  WhatsApp
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?text=Check out this amazing house plan: ${product.title}&url=${window.location.href}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-lg text-center transition-colors text-sm"
                >
                  Twitter
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg text-center transition-colors text-sm"
                >
                  Facebook
                </a>
              </div>
            </div>
            <button
              onClick={() => setShowShareModal(false)}
              className="mt-4 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 p-3 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showCalculator && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-green-900 mb-4 flex items-center gap-2">
              <Calculator className="w-6 h-6" />
              Construction Cost Estimate
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-sm text-green-600 mb-1">
                  Estimated Construction Cost
                </div>
                <div className="text-2xl font-bold text-green-900">
                  KES {((product.area || 100) * 35000).toLocaleString()} -{" "}
                  {((product.area || 100) * 55000).toLocaleString()}
                </div>
                <div className="text-xs text-green-600 mt-1">
                  Based on {product.area?.toFixed(0) || 100}m² at KES
                  35,000-55,000 per m²
                </div>
              </div>

              <div className="text-sm text-gray-600 space-y-2">
                <p>• Estimates based on mid-range finishes</p>
                <p>• Excludes land cost and site preparation</p>
                <p>
                  • Final costs may vary based on location and specifications
                </p>
                <p>• Contact us for detailed quotation</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setShowCalculator(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-3 rounded-lg transition-colors"
                >
                  Close
                </button>
                <button className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg transition-colors">
                  Get Quote
                </button>
              </div>
            </div>
          </div>
          <Footer />
        </div>
      )}
    </>
  );
};

export default ProductDetail;
