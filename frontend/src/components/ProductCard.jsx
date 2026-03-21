import React, { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart, Heart, Share2, Bed, Building,
  Square, Star, ArrowRight, Eye, Sparkles, Zap,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import { API_BASE_URL } from "../lib/api";

/* ─── Feature tile config ─────────────────────────────────────── */
const FEATURE_TILES_GRID = (product) => [
  { Icon: Bed,      label: "Rooms",  value: product.rooms },
  { Icon: Building, label: "Floors", value: product.floorCount },
  // ✅ Bug fix: Number() guard prevents .toFixed crash on string values
  { Icon: Square,   label: "sqm",    value: product.area != null ? Number(product.area).toFixed(0) : null },
];

const FEATURE_TILES_LIST = (product) => [
  ...FEATURE_TILES_GRID(product),
  { Icon: Star, label: "Rating", value: product.rating, fill: true },
];

/* ─── Tile ────────────────────────────────────────────────────── */
function FeatureTile({ Icon, label, value, fill = false }) {
  return (
    <div className="text-center p-2.5 rounded-2xl bg-brand-50 border border-brand-100 hover:shadow-sm transition-shadow duration-200">
      <div className="w-8 h-8 bg-brand-600 rounded-xl flex items-center justify-center mx-auto mb-1.5 shadow-sm">
        <Icon className={`w-4 h-4 text-white ${fill ? "fill-current" : ""}`} aria-hidden="true" />
      </div>
      <span className="text-sm font-bold text-gray-800 block">{value ?? "—"}</span>
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  );
}

/* ─── Badges ──────────────────────────────────────────────────── */
function FeaturedBadge() {
  return (
    <div className="absolute top-4 left-4 bg-brand-accent text-gray-900 px-3 py-1.5 rounded-2xl text-xs font-bold shadow-lg z-40 flex items-center gap-1">
      <Sparkles className="w-3 h-3" aria-hidden="true" />
      FEATURED
    </div>
  );
}

function NewBadge() {
  return (
    <div className="absolute top-4 right-4 bg-gradient-to-r from-lime-500 to-brand-500 text-white px-3 py-1.5 rounded-2xl text-xs font-bold shadow-lg z-40 flex items-center gap-1">
      <Zap className="w-3 h-3" aria-hidden="true" />
      NEW
    </div>
  );
}

/* ─── Price display ───────────────────────────────────────────── */
function Price({ price, className = "" }) {
  return (
    <span className={`font-bold text-brand-700 ${className}`}>
      {price ? `KES ${Number(price).toLocaleString("en-KE")}` : "Contact for Price"}
    </span>
  );
}

/* ════════════════════════════════════════════════════════════════ */
const ProductCard = ({ product, isFavorite: initialFavorite = false, viewMode = "grid", onQuickView }) => {
  const [imageLoaded,  setImageLoaded]  = useState(false);
  const [isFavorite,   setIsFavorite]   = useState(initialFavorite);
  const [favLoading,   setFavLoading]   = useState(false);

  const navigate    = useNavigate();
  const { addToCart } = useCart();
  const { token }   = useAuth(); // ✅ Bug fix: auth token for favorite API

  const productUrl = `/product/${product._id}`;
  // ✅ Bug fix: consistent absolute fallback path
  const imageSrc   = product.firstImage || product.finalImageURLs?.[0] || "/fallback.jpg";

  /* ── Card keyboard + click nav ── */
  const handleCardClick = useCallback((e) => {
    if (e.target.closest('button, a, [role="button"]')) return;
    navigate(productUrl);
  }, [navigate, productUrl]);

  // ✅ Bug fix: keyboard accessible card navigation
  const handleCardKeyDown = useCallback((e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      navigate(productUrl);
    }
  }, [navigate, productUrl]);

  /* ── Quick view ── */
  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView?.();
  };

  /* ── Add to cart ── */
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    toast.success(`${product.title || "Plan"} added to cart`);
  };

  /* ── Favorite — with auth header + optimistic UI + toast ── */
  const handleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (favLoading) return;

    const next = !isFavorite;
    setIsFavorite(next); // optimistic
    setFavLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/plans/${product._id}/favorite`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error("Failed to update favourite");
      toast.success(next ? "Saved to favourites" : "Removed from favourites");
    } catch {
      setIsFavorite(!next); // revert on failure
      toast.error("Could not update favourites. Please try again.");
    } finally {
      setFavLoading(false);
    }
  };

  /* ── Share — Web Share API with clipboard fallback ── */
  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const shareData = {
      title: product.title || "House Plan",
      text:  `Check out this plan on Hillersons Spaces`,
      url:   `${window.location.origin}${productUrl}`,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast.success("Link copied to clipboard");
      }
    } catch {
      // User cancelled share — no toast needed
    }
  };

  /* ─── Shared action buttons ─────────────────────────────────── */
  const FavBtn = ({ dark = false }) => (
    <button
      type="button"
      onClick={handleFavorite}
      disabled={favLoading}
      aria-label={isFavorite ? "Remove from favourites" : "Save to favourites"}
      aria-pressed={isFavorite}
      className={`p-2.5 rounded-2xl transition-all duration-200 shadow-md disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-400 ${
        isFavorite
          ? "bg-red-500 text-white"
          : dark
            ? "bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-red-500"
            : "bg-white text-gray-500 hover:bg-red-50 hover:text-red-500 border border-gray-100"
      }`}
    >
      <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} aria-hidden="true" />
    </button>
  );

  const ShareBtn = ({ dark = false }) => (
    <button
      type="button"
      onClick={handleShare}
      aria-label="Share this plan"
      className={`p-2.5 rounded-2xl transition-all duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-brand-400 ${
        dark
          ? "bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-brand-600"
          : "bg-white text-gray-500 hover:bg-brand-50 hover:text-brand-600 border border-gray-100"
      }`}
    >
      <Share2 className="w-4 h-4" aria-hidden="true" />
    </button>
  );

  /* ═══════════════════════════════════════════════════════════ */
  /* LIST VIEW                                                  */
  /* ═══════════════════════════════════════════════════════════ */
  if (viewMode === "list") {
    return (
      <article
        className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer focus-within:ring-2 focus-within:ring-brand-400"
        onClick={handleCardClick}
        onKeyDown={handleCardKeyDown}
        tabIndex={0}
        role="article"
        aria-label={`${product.title || "House Plan"} — ${product.price ? `KES ${Number(product.price).toLocaleString("en-KE")}` : "Contact for price"}`}
      >
        <div className="flex flex-col sm:flex-row">

          {/* Image */}
          <div className="w-full sm:w-64 md:w-72 lg:w-80 h-48 sm:h-56 relative overflow-hidden rounded-t-3xl sm:rounded-l-3xl sm:rounded-tr-none flex-shrink-0 bg-brand-50">
            <img
              src={imageSrc}
              alt={product.title || "House plan preview"}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onLoad={() => setImageLoaded(true)}
              loading="lazy"
              width={320} height={224}
            />
            {product.featured  && <FeaturedBadge />}
            {product.newListing && <NewBadge />}
          </div>

          {/* Content */}
          <div className="flex-1 p-5 sm:p-6 lg:p-8 flex flex-col justify-between min-w-0">
            <div>
              <div className="flex justify-between items-start mb-4 gap-3">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 group-hover:text-brand-700 transition-colors line-clamp-2 flex-1">
                  {product.title || "Premium House Plan"}
                </h3>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <FavBtn />
                  <ShareBtn />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                {FEATURE_TILES_LIST(product).map((tile) => (
                  <FeatureTile key={tile.label} {...tile} />
                ))}
              </div>
            </div>

            {/* Price + actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <Price price={product.price} className="text-2xl" />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleQuickView}
                  aria-label={`Quick view ${product.title || "plan"}`}
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-white text-gray-700 rounded-2xl hover:bg-brand-50 hover:text-brand-700 transition-colors font-semibold border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                >
                  Quick View
                </button>
                <Link
                  to={productUrl}
                  onClick={(e) => e.stopPropagation()}
                  aria-label={`View full details for ${product.title || "this plan"}`}
                  className="flex-1 sm:flex-none px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-bold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                >
                  View Details
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </article>
    );
  }

  /* ═══════════════════════════════════════════════════════════ */
  /* GRID VIEW                                                  */
  /* ═══════════════════════════════════════════════════════════ */
  return (
    <article
      className="group relative bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 cursor-pointer focus-within:ring-2 focus-within:ring-brand-400"
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      tabIndex={0}
      role="article"
      aria-label={`${product.title || "House Plan"} — ${product.price ? `KES ${Number(product.price).toLocaleString("en-KE")}` : "Contact for price"}`}
    >
      {/* Image */}
      <div className="relative h-52 sm:h-60 lg:h-64 overflow-hidden rounded-t-3xl bg-brand-50">

        {/* Skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-brand-100 animate-pulse" aria-hidden="true" />
        )}

        <img
          src={imageSrc}
          alt={product.title || "House plan preview"}
          className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImageLoaded(true)}
          loading="lazy"
          width={400} height={260}
        />

        {/* Hover overlay with actions */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30">
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
            <button
              type="button"
              onClick={handleQuickView}
              aria-label={`Quick view ${product.title || "plan"}`}
              className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-4 py-2 rounded-2xl hover:bg-white/30 transition-colors font-medium text-sm flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-white"
            >
              <Eye className="w-4 h-4" aria-hidden="true" />
              Quick View
            </button>
            <div className="flex gap-2">
              <FavBtn dark />
              <ShareBtn dark />
            </div>
          </div>
        </div>

        {product.featured   && <FeaturedBadge />}
        {product.newListing && <NewBadge />}
      </div>

      {/* Card body */}
      <div className="p-4 sm:p-5">
        <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 group-hover:text-brand-700 transition-colors line-clamp-2">
          {product.title || "Premium House Plan"}
        </h3>

        {/* Feature tiles */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {FEATURE_TILES_GRID(product).map((tile) => (
            <FeatureTile key={tile.label} {...tile} />
          ))}
        </div>

        {/* Price + Add to Cart */}
        <div className="flex flex-col gap-2">
          <Price price={product.price} className="text-xl" />
          <button
            type="button"
            onClick={handleAddToCart}
            aria-label={`Add ${product.title || "this plan"} to cart`}
            className="w-full bg-brand-600 hover:bg-brand-700 active:scale-[0.98] text-white py-2.5 rounded-2xl font-bold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
          >
            <ShoppingCart className="w-4 h-4" aria-hidden="true" />
            Add to Cart
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;