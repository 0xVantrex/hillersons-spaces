import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Heart,
  Share2,
  Bed,
  Building,
  Square,
  Star,
  ArrowRight,
  Eye,
  Sparkles,
  Zap,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { toast } from "react-hot-toast";
import { API_BASE_URL } from "../lib/api";

const ProductCard = ({ product, isFavorite, viewMode, onQuickView }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const handleCardClick = (e) => {
    const isInteractiveElement = e.target.closest('button, a, [role="button"]');
    if (!isInteractiveElement) {
      navigate(`/product/${product._id}`);
    }
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView();
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    toast.success("Added to cart!");
  };

  const handleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/plans/${product._id}/favorite`,
        { method: "PATCH" }
      );
      if (!res.ok) throw new Error("Failed to update favorite");
      const data = await res.json();
      console.log("Favorite updated:", data);
    } catch (error) {
      console.error("Error updating favorite:", error);
    }
  };

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  if (viewMode === "list") {
    return (
      <div
        className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl hover:bg-white transition-all duration-500 group relative cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-lime-400/20 via-emerald-400/20 to-green-400/20 p-[1.5px] opacity-0 group-hover:opacity-100 transition-all duration-700">
          <div className="h-full w-full rounded-3xl bg-white"></div>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row">
          {/* Image */}
          <div className="w-full sm:w-64 md:w-72 lg:w-80 h-48 sm:h-56 relative overflow-hidden rounded-t-3xl sm:rounded-l-3xl sm:rounded-tr-none flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-br from-lime-50 via-emerald-50 to-green-50"></div>
            <img
              src={product.firstImage || product.finalImageURLs?.[0] || "/fallback.jpg"}
              alt={product.title}
              className="relative z-10 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              onLoad={() => setImageLoaded(true)}
            />
            {product.featured && (
              <div className="absolute top-4 left-4 bg-gradient-to-r from-amber-400 to-amber-500 text-white px-3 py-1.5 rounded-2xl text-xs font-bold shadow-lg flex items-center z-20">
                <Sparkles className="w-3 h-3 mr-1" />
                FEATURED
              </div>
            )}
            {product.newListing && (
              <div className="absolute top-4 right-4 bg-gradient-to-r from-lime-500 to-emerald-500 text-white px-3 py-1.5 rounded-2xl text-xs font-bold shadow-lg flex items-center z-20">
                <Zap className="w-3 h-3 mr-1" />
                NEW
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          </div>

          {/* Content */}
          <div className="flex-1 p-5 sm:p-6 lg:p-8 flex flex-col justify-between min-w-0">
            <div>
              <div className="flex justify-between items-start mb-4 gap-3">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 group-hover:text-emerald-700 transition-colors duration-300 line-clamp-2 flex-1">
                  {product.title || "Premium House Plan"}
                </h3>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={handleFavorite}
                    className={`p-2.5 rounded-2xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-110 ${
                      isFavorite
                        ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white"
                        : "bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-gradient-to-r hover:from-rose-500 hover:to-pink-500 hover:text-white border border-gray-200/50"
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-2.5 rounded-2xl bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-gradient-to-r hover:from-emerald-500 hover:to-green-500 hover:text-white transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-110 border border-gray-200/50"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Feature grid — 2 cols on mobile/tablet, 4 on desktop */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                {[
                  { icon: Bed, label: "Rooms", value: product.rooms, colors: "from-lime-50 to-lime-100 border-lime-200/50", iconColors: "from-lime-500 to-emerald-500" },
                  { icon: Building, label: "Floors", value: product.floorCount, colors: "from-emerald-50 to-emerald-100 border-emerald-200/50", iconColors: "from-emerald-500 to-green-500" },
                  { icon: Square, label: "sqm", value: product.area ? product.area.toFixed(0) : null, colors: "from-green-50 to-green-100 border-green-200/50", iconColors: "from-green-500 to-lime-500" },
                  { icon: Star, label: "Rating", value: product.rating, colors: "from-amber-50 to-amber-100 border-amber-200/50", iconColors: "from-amber-500 to-orange-500", fill: true },
                ].map(({ icon: Icon, label, value, colors, iconColors, fill }) => (
                  <div key={label} className={`text-center p-2.5 rounded-2xl bg-gradient-to-br ${colors} border hover:shadow-md transition-all duration-300`}>
                    <div className={`w-8 h-8 bg-gradient-to-r ${iconColors} rounded-xl flex items-center justify-center mx-auto mb-1.5 shadow-md`}>
                      <Icon className={`w-4 h-4 text-white ${fill ? "fill-current" : ""}`} />
                    </div>
                    <span className="text-base font-bold text-gray-800 block">{value || "-"}</span>
                    <p className="text-xs text-gray-600 font-medium">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Price + Actions */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <span className="text-2xl font-bold text-emerald-700">
                {product.price ? `KES ${product.price.toLocaleString()}` : "Contact for Price"}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleQuickView}
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-white/80 backdrop-blur-sm text-gray-700 rounded-2xl hover:bg-lime-50 transition-all duration-300 font-semibold shadow-md hover:shadow-lg border border-gray-200/50 text-sm"
                >
                  Quick View
                </button>
                <Link
                  to={`/product/${product._id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 sm:flex-none px-5 py-2.5 bg-gradient-to-r from-lime-500 to-emerald-500 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 hover:from-lime-600 hover:to-emerald-600 text-sm"
                >
                  View Details
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid / card view
  return (
    <div
      className="group relative bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl border border-white/30 overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {/* Border glow */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-lime-400/20 via-emerald-400/20 to-green-400/20 p-[1.5px] opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="h-full w-full rounded-3xl bg-white/95"></div>
      </div>

      {/* Image */}
      <div className="relative h-52 sm:h-60 lg:h-72 overflow-hidden rounded-t-3xl">
        <div className="absolute inset-0 bg-gradient-to-br from-lime-50 via-emerald-50 to-green-50"></div>

        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-lime-100 via-emerald-100 to-green-100 animate-pulse" />
        )}

        <img
          src={product.firstImage || product.finalImageURLs?.[0] || "fallback.jpg"}
          alt={product.title || "House plan preview"}
          className={`relative z-10 w-full h-full object-cover transition-all duration-700 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          } group-hover:scale-110`}
          onLoad={() => setImageLoaded(true)}
        />

        {/* Shimmer */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 z-20"></div>

        {/* Hover overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent transition-opacity duration-500 z-30 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
            <button
              onClick={handleQuickView}
              className="bg-white/20 backdrop-blur-lg border border-white/30 text-white px-4 py-2 rounded-2xl hover:bg-white/30 transition-all duration-300 font-medium shadow-lg text-sm"
            >
              <Eye className="w-4 h-4 inline mr-1.5" />
              Quick View
            </button>
            <div className="flex gap-2">
              <button
                onClick={handleFavorite}
                className={`p-2.5 rounded-2xl transition-all duration-300 shadow-lg ${
                  isFavorite
                    ? "bg-rose-500 text-white"
                    : "bg-white/20 backdrop-blur-lg border border-white/30 text-white hover:bg-rose-500"
                }`}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
              </button>
              <button
                onClick={handleShare}
                className="bg-white/20 backdrop-blur-lg border border-white/30 text-white p-2.5 rounded-2xl hover:bg-emerald-500 transition-all duration-300 shadow-lg"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Badges */}
        {product.featured && (
          <div className="absolute top-4 left-4 bg-gradient-to-r from-amber-400 to-amber-500 text-white px-3 py-1.5 rounded-2xl text-xs font-bold shadow-lg z-40 flex items-center">
            <Sparkles className="w-3 h-3 mr-1" />
            FEATURED
          </div>
        )}
        {product.newListing && (
          <div className="absolute top-4 right-4 bg-gradient-to-r from-lime-500 to-emerald-500 text-white px-3 py-1.5 rounded-2xl text-xs font-bold shadow-lg z-40 flex items-center">
            <Zap className="w-3 h-3 mr-1" />
            NEW
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="relative z-10 p-4 sm:p-5 lg:p-6">
        <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800 mb-3 group-hover:text-emerald-700 transition-colors duration-300 line-clamp-2">
          {product.title || "Premium House Plan"}
        </h3>

        {/* Feature tiles */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { icon: Bed, label: "Rooms", value: product.rooms, colors: "from-lime-50 to-lime-100 border-lime-200/50", iconColors: "from-lime-500 to-emerald-500" },
            { icon: Building, label: "Floors", value: product.floorCount, colors: "from-emerald-50 to-emerald-100 border-emerald-200/50", iconColors: "from-emerald-500 to-green-500" },
            { icon: Square, label: "sqm", value: product.area ? product.area.toFixed(0) : null, colors: "from-green-50 to-green-100 border-green-200/50", iconColors: "from-green-500 to-lime-500" },
          ].map(({ icon: Icon, label, value, colors, iconColors }) => (
            <div key={label} className={`text-center bg-gradient-to-br ${colors} rounded-2xl p-2 sm:p-2.5 border hover:shadow-md transition-all duration-300`}>
              <div className={`w-8 h-8 bg-gradient-to-r ${iconColors} rounded-xl flex items-center justify-center mx-auto mb-1.5 shadow-md`}>
                <Icon className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm sm:text-base font-bold text-gray-800 block">{value || "-"}</span>
              <span className="text-xs text-gray-600">{label}</span>
            </div>
          ))}
        </div>

        {/* Price + Add to cart — price on top, button full width below */}
        <div className="flex flex-col gap-2 mt-1">
          <span className="text-xl font-bold text-emerald-700 leading-tight">
            {product.price ? `KES ${product.price.toLocaleString()}` : "Contact"}
          </span>
          <button
            onClick={handleAddToCart}
            className="w-full bg-gradient-to-r from-lime-500 to-emerald-500 text-white py-2.5 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 hover:from-lime-600 hover:to-emerald-600 text-sm"
          >
            <ShoppingCart className="w-4 h-4" />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;