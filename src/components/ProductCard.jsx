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
  Clock,
  Shield,
  Zap,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { toast } from "react-hot-toast";
import { API_BASE_URL } from "../lib/api";

const ProductCard = ({
  plan,
  product,
  isFavorite,
  onToggleFavorite,
  viewMode,
  onQuickView,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const handleCardClick = (e) => {
    // Check if the click was on an interactive element
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

  const handleFavorite = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/plans/${product._id}/favorite`,
        {
          method: "PATCH",
        }
      );
      if (!res.ok) throw new Error("Failed to upfate favorite");
      const data = await res.json();
      console.log("Favorite updated:", data);
    } catch (error) {
      console.error("Error updating favorite:", error);
    }
  };

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Share functionality would go here
  };

  if (viewMode === "list") {
    return (
      <div
        className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl hover:bg-white transition-all duration-500 group relative cursor-pointer"
        onClick={handleCardClick}
      >
        {/* Premium gradient border effect */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-lime-400/20 via-emerald-400/20 to-green-400/20 p-[1.5px] opacity-0 group-hover:opacity-100 transition-all duration-700">
          <div className="h-full w-full rounded-3xl bg-white"></div>
        </div>

        <div className="relative z-10 flex">
          <div className="w-80 h-56 relative overflow-hidden">
            {/* Enhanced gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-lime-50 via-emerald-50 to-green-50"></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-lime-100/40 via-transparent to-emerald-100/40"></div>

            <img
              src={
                product.firstImage ||
                product.finalImageURLs?.[0] ||
                "/fallback.jpg"
              }
              alt={product.title}
              className="relative z-10 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              onLoad={() => setImageLoaded(true)}
            />

            {/* Premium badges with enhanced styling */}
            {product.featured && (
              <div className="absolute top-6 left-6 bg-gradient-to-r from-amber-400 to-amber-500 text-white px-4 py-2 rounded-2xl text-xs font-bold shadow-lg backdrop-blur-sm border border-white/20 flex items-center">
                <Sparkles className="w-3 h-3 mr-1" />
                FEATURED
              </div>
            )}
            {product.newListing && (
              <div className="absolute top-6 right-6 bg-gradient-to-r from-lime-500 to-emerald-500 text-white px-4 py-2 rounded-2xl text-xs font-bold shadow-lg backdrop-blur-sm border border-white/20 flex items-center">
                <Zap className="w-3 h-3 mr-1" />
                NEW
              </div>
            )}

            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          </div>

          <div className="flex-1 p-8 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 pr-4">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-emerald-700 transition-colors duration-300">
                    {product.title || "Premium House Plan"}
                  </h3>
                  <p className="text-gray-600 font-medium flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-500" />
                    by {product.architect}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleFavorite}
                    className={`p-3 rounded-2xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-110 ${
                      isFavorite
                        ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white"
                        : "bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-gradient-to-r hover:from-rose-500 hover:to-pink-500 hover:text-white border border-gray-200/50"
                    }`}
                  >
                    <Heart
                      className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`}
                    />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-3 rounded-2xl bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-gradient-to-r hover:from-emerald-500 hover:to-green-500 hover:text-white transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-110 border border-gray-200/50"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Enhanced feature grid */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="text-center p-3 rounded-2xl bg-gradient-to-br from-lime-50 to-lime-100 border border-lime-200/50 hover:shadow-md transition-all duration-300 group/feature">
                  <div className="w-9 h-9 bg-gradient-to-r from-lime-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-md group-hover/feature:scale-110 transition-transform duration-300">
                    <Bed className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-lg font-bold text-gray-800 block">
                    {product.rooms || "-"}
                  </span>
                  <p className="text-xs text-gray-600 font-medium">Rooms</p>
                </div>
                <div className="text-center p-3 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200/50 hover:shadow-md transition-all duration-300 group/feature">
                  <div className="w-9 h-9 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-md group-hover/feature:scale-110 transition-transform duration-300">
                    <Building className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-lg font-bold text-gray-800 block">
                    {product.floorCount || "-"}
                  </span>
                  <p className="text-xs text-gray-600 font-medium">Floors</p>
                </div>
                <div className="text-center p-3 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200/50 hover:shadow-md transition-all duration-300 group/feature">
                  <div className="w-9 h-9 bg-gradient-to-r from-green-500 to-lime-500 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-md group-hover/feature:scale-110 transition-transform duration-300">
                    <Square className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-lg font-bold text-gray-800 block">
                    {product.area ? `${product.area.toFixed(0)}` : "-"}
                  </span>
                  <p className="text-xs text-gray-600 font-medium">sqm</p>
                </div>
                <div className="text-center p-3 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200/50 hover:shadow-md transition-all duration-300 group/feature">
                  <div className="w-9 h-9 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-md group-hover/feature:scale-110 transition-transform duration-300">
                    <Star className="w-4 h-4 text-white fill-current" />
                  </div>
                  <span className="text-lg font-bold text-gray-800 block">
                    {product.rating}
                  </span>
                  <p className="text-xs text-gray-600 font-medium">Rating</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-end">
              <div>
                <span className="text-3xl font-bold text-emerald-700">
                  {product.price
                    ? `KES ${product.price.toLocaleString()}`
                    : "Contact for Price"}
                </span>
                <p className="text-gray-600 font-medium mt-1 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-500" />
                  Delivery: {product.completionTime}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleQuickView}
                  className="px-6 py-3 bg-white/80 backdrop-blur-sm text-gray-700 rounded-2xl hover:bg-lime-50 transition-all duration-300 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 border border-gray-200/50"
                >
                  Quick View
                </button>
                <Link
                  to={`/product/${product._id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="px-8 py-3 bg-gradient-to-r from-lime-500 to-emerald-500 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2 hover:from-lime-600 hover:to-emerald-600"
                >
                  View Details
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="group relative bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl border border-white/30 overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {/* Premium border glow effect */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-lime-400/20 via-emerald-400/20 to-green-400/20 p-[1.5px] opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="h-full w-full rounded-3xl bg-white/95"></div>
      </div>

      {/* Image Container */}
      <div className="relative h-72 overflow-hidden rounded-t-3xl">
        {/* Enhanced gradient backgrounds */}
        <div className="absolute inset-0 bg-gradient-to-br from-lime-50 via-emerald-50 to-green-50"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-lime-100/30 via-transparent to-emerald-100/30"></div>

        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-lime-100 via-emerald-100 to-green-100 animate-pulse">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
          </div>
        )}

        <img
          src={
            product.firstImage || product.finalImageURLs?.[0] || "fallback.jpg"
          }
          alt={product.title || "House plan preview"}
          className={`relative z-10 w-full h-full object-cover transition-all duration-700 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          } group-hover:scale-110`}
          onLoad={() => setImageLoaded(true)}
        />

        {/* Premium shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 z-20"></div>

        {/* Enhanced overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent transition-opacity duration-500 z-30 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
            <div className="flex gap-3">
              <button
                onClick={handleQuickView}
                className="bg-white/20 backdrop-blur-lg border border-white/30 text-white px-5 py-2.5 rounded-2xl hover:bg-white/30 transition-all duration-300 font-medium shadow-lg transform hover:scale-105"
              >
                <Eye className="w-4 h-4 inline mr-2" />
                Quick View
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleFavorite}
                className={`p-2.5 rounded-2xl transition-all duration-300 shadow-lg transform hover:scale-110 ${
                  isFavorite
                    ? "bg-rose-500 text-white"
                    : "bg-white/20 backdrop-blur-lg border border-white/30 text-white hover:bg-rose-500"
                }`}
              >
                <Heart
                  className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`}
                />
              </button>
              <button
                onClick={handleShare}
                className="bg-white/20 backdrop-blur-lg border border-white/30 text-white p-2.5 rounded-2xl hover:bg-emerald-500 transition-all duration-300 shadow-lg transform hover:scale-110"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Premium badges */}
        {product.featured && (
          <div className="absolute top-5 left-5 bg-gradient-to-r from-amber-400 to-amber-500 text-white px-3 py-1.5 rounded-2xl text-xs font-bold shadow-lg backdrop-blur-sm border border-white/20 z-40 flex items-center">
            <Sparkles className="w-3 h-3 mr-1" />
            FEATURED
          </div>
        )}

        {/* Enhanced rating badge */}
        <div className="absolute top-5 right-5 bg-white/95 backdrop-blur-sm rounded-2xl px-3 py-1.5 flex items-center gap-1 shadow-lg border border-white/30 z-40">
          <Star className="w-4 h-4 text-amber-500 fill-current" />
          <span className="text-sm font-bold text-gray-800">
            {product.rating}
          </span>
        </div>
      </div>

      {/* Enhanced Card Content */}
      <div className="relative z-10 p-6">
        <div className="mb-5">
          <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-emerald-700 transition-colors duration-300 line-clamp-2">
            {product.title || "Premium House Plan"}
          </h3>
          <p className="text-sm text-gray-600 flex items-center">
            <Shield className="w-4 h-4 text-emerald-500 mr-1.5" />
            by {product.architect}
          </p>
        </div>

        {/* Enhanced Property Features */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="text-center bg-gradient-to-br from-lime-50 to-lime-100 rounded-2xl p-3 border border-lime-200/50 hover:shadow-md transition-all duration-300 group/feature">
            <div className="w-9 h-9 bg-gradient-to-r from-lime-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-md group-hover/feature:scale-110 transition-transform duration-300">
              <Bed className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold text-gray-800 block">
              {product.rooms || "-"}
            </span>
            <span className="text-xs text-gray-600">Rooms</span>
          </div>
          <div className="text-center bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-3 border border-emerald-200/50 hover:shadow-md transition-all duration-300 group/feature">
            <div className="w-9 h-9 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-md group-hover/feature:scale-110 transition-transform duration-300">
              <Building className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold text-gray-800 block">
              {product.floorCount || "-"}
            </span>
            <span className="text-xs text-gray-600">Floors</span>
          </div>
          <div className="text-center bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-3 border border-green-200/50 hover:shadow-md transition-all duration-300 group/feature">
            <div className="w-9 h-9 bg-gradient-to-r from-green-500 to-lime-500 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-md group-hover/feature:scale-110 transition-transform duration-300">
              <Square className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold text-gray-800 block">
              {product.area ? `${product.area.toFixed(0)}` : "-"}
            </span>
            <span className="text-xs text-gray-600">sqm</span>
          </div>
        </div>

        {/* Enhanced Price and Action */}
        <div className="flex justify-between items-center w-full mb-5">
          <div className="min-w-0 flex-1 pr-4">
            <span className="text-2xl font-bold text-emerald-700 block">
              {product.price
                ? `KES ${product.price.toLocaleString()}`
                : "Contact"}
            </span>
            <p className="text-sm text-gray-600 font-medium mt-1 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-500" />
              {product.completionTime}
            </p>
          </div>

          <button
            onClick={handleAddToCart}
            className="bg-gradient-to-r from-lime-500 to-emerald-500 text-white px-5 py-2.5 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2 hover:from-lime-600 hover:to-emerald-600"
          >
            <ShoppingCart className="w-4 h-4" />
            Add
          </button>
        </div>

        {/* Enhanced What's Included */}
        {product.includes && product.includes.length > 0 && (
          <div className="pt-5 border-t border-gray-100">
            <p className="text-sm text-gray-600 mb-2 font-medium flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              What's Included:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {product.includes.slice(0, 3).map((item, index) => (
                <span
                  key={index}
                  className="text-xs bg-gradient-to-r from-lime-50 to-emerald-50 text-emerald-700 px-2.5 py-1.5 rounded-xl font-medium border border-lime-200/50"
                >
                  {item}
                </span>
              ))}
              {product.includes.length > 3 && (
                <span className="text-xs bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 px-2.5 py-1.5 rounded-xl font-bold border border-emerald-200/50">
                  +{product.includes.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
