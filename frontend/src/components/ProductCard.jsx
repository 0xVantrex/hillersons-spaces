import React, { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Heart, Share2, Bed, Building,
  Square, Star, ArrowRight, Eye, Sparkles, Zap, Phone,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import { API_BASE_URL } from "../lib/api";

/* ─── Feature tile config ─────────────────────────────────────── */
const FEATURE_TILES_GRID = (product) => [
  { Icon: Bed,      label: "Rooms",  value: product.rooms },
  { Icon: Building, label: "Floors", value: product.floorCount },
  { Icon: Square,   label: "sqm",    value: product.area != null ? Number(product.area).toFixed(0) : null },
];

const FEATURE_TILES_LIST = (product) => [
  ...FEATURE_TILES_GRID(product),
  { Icon: Star, label: "Rating", value: product.rating, fill: true },
];

/* ─── Tile ────────────────────────────────────────────────────── */
function FeatureTile({ Icon, label, value, fill = false }) {
  return (
    <div className="text-center p-2.5 rounded-2xl bg-emerald-50 border border-emerald-100 hover:shadow-sm transition-shadow duration-200">
      <div className="w-8 h-8 bg-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-1.5 shadow-sm">
        <Icon className={`w-4 h-4 text-white ${fill ? "fill-current" : ""}`} aria-hidden="true" />
      </div>
      <span className="text-sm font-bold text-gray-800 block">{value ?? "—"}</span>
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  );
}


/* ════════════════════════════════════════════════════════════════ */
const ProductCard = ({ product, isFavorite: initialFavorite = false, viewMode = "grid", onQuickView }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isFavorite,  setIsFavorite]  = useState(initialFavorite);
  const [favLoading,  setFavLoading]  = useState(false);

  const navigate  = useNavigate();
  const { token } = useAuth();

  const productUrl = `/product/${product._id}`;
  const imageSrc   = product.firstImage || product.finalImageURLs?.[0] || "/fallback.jpg";

  const handleCardClick = useCallback((e) => {
    if (e.target.closest('button, a, [role="button"]')) return;
    navigate(productUrl);
  }, [navigate, productUrl]);

  const handleCardKeyDown = useCallback((e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); navigate(productUrl); }
  }, [navigate, productUrl]);

  const handleQuickView = (e) => { e.preventDefault(); e.stopPropagation(); onQuickView?.(); };

  const handleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (favLoading) return;
    const next = !isFavorite;
    setIsFavorite(next);
    setFavLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/plans/${product._id}/favorite`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error();
      toast.success(next ? "Saved to favourites" : "Removed from favourites");
    } catch {
      setIsFavorite(!next);
      toast.error("Could not update favourites.");
    } finally {
      setFavLoading(false);
    }
  };

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}${productUrl}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: product.title || "House Plan", text: "Check out this plan on Hillersons Spaces", url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
      }
    } catch { }
  };

  /* ─── Shared button components ─── */
  const FavBtn = ({ dark = false }) => (
    <button type="button" onClick={handleFavorite} disabled={favLoading}
      aria-label={isFavorite ? "Remove from favourites" : "Save to favourites"}
      aria-pressed={isFavorite}
      className={`p-2.5 rounded-2xl transition-all duration-200 shadow-sm disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-400 ${
        isFavorite
          ? "bg-red-500 text-white"
          : dark
            ? "bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-red-500"
            : "bg-white text-gray-500 hover:bg-red-50 hover:text-red-500 border border-gray-100"
      }`}>
      <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} aria-hidden="true" />
    </button>
  );

  const ShareBtn = ({ dark = false }) => (
    <button type="button" onClick={handleShare} aria-label="Share this plan"
      className={`p-2.5 rounded-2xl transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
        dark
          ? "bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-emerald-600"
          : "bg-white text-gray-500 hover:bg-emerald-50 hover:text-emerald-600 border border-gray-100"
      }`}>
      <Share2 className="w-4 h-4" aria-hidden="true" />
    </button>
  );

  /* ═══════════════════════════════════════════════════════════ */
  /* LIST VIEW                                                  */
  /* ═══════════════════════════════════════════════════════════ */
  if (viewMode === "list") {
    return (
      <article
        className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer focus-within:ring-2 focus-within:ring-emerald-400"
        onClick={handleCardClick} onKeyDown={handleCardKeyDown}
        tabIndex={0} role="article" aria-label={product.title || "House Plan"}
      >
        <div className="flex flex-col sm:flex-row">
          {/* Image */}
          <div className="w-full sm:w-64 md:w-72 lg:w-80 h-48 sm:h-56 relative overflow-hidden rounded-t-3xl sm:rounded-l-3xl sm:rounded-tr-none flex-shrink-0 bg-emerald-50">
            <img src={imageSrc} alt={product.title || "House plan preview"}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onLoad={() => setImageLoaded(true)} loading="lazy" />
          
          </div>

          {/* Content */}
          <div className="flex-1 p-5 sm:p-6 lg:p-8 flex flex-col justify-between min-w-0">
            <div>
              <div className="flex justify-between items-start mb-4 gap-3">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 group-hover:text-emerald-700 transition-colors line-clamp-2 flex-1">
                  {product.title || "Premium House Plan"}
                </h3>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <FavBtn />
                  <ShareBtn />
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                {FEATURE_TILES_LIST(product).map((tile) => <FeatureTile key={tile.label} {...tile} />)}
              </div>
            </div>

            {/* Actions — no price */}
            <div className="flex flex-col sm:flex-row gap-2">
              <button type="button" onClick={handleQuickView}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-white text-gray-700 rounded-2xl hover:bg-emerald-50 hover:text-emerald-700 transition font-semibold border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400">
                Quick View
              </button>
              <Link to={productUrl} onClick={(e) => e.stopPropagation()}
                className="flex-1 sm:flex-none px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-sm transition flex items-center justify-center gap-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2">
                View Details
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
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
      className="group relative bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 cursor-pointer focus-within:ring-2 focus-within:ring-emerald-400"
      onClick={handleCardClick} onKeyDown={handleCardKeyDown}
      tabIndex={0} role="article" aria-label={product.title || "House Plan"}
    >
      {/* Image */}
      <div className="relative h-52 sm:h-60 lg:h-64 overflow-hidden rounded-t-3xl bg-emerald-50">
        {!imageLoaded && <div className="absolute inset-0 bg-emerald-100 animate-pulse" aria-hidden="true" />}
        <img src={imageSrc} alt={product.title || "House plan preview"}
          className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setImageLoaded(true)} loading="lazy" />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30">
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
            <button type="button" onClick={handleQuickView}
              className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-4 py-2 rounded-2xl hover:bg-white/30 transition font-medium text-sm flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-white">
              <Eye className="w-4 h-4" aria-hidden="true" />
              Quick View
            </button>
            <div className="flex gap-2">
              <FavBtn dark />
              <ShareBtn dark />
            </div>
          </div>
        </div>

      </div>

      {/* Card body */}
      <div className="p-4 sm:p-5">
        <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 group-hover:text-emerald-700 transition-colors line-clamp-2">
          {product.title || "Premium House Plan"}
        </h3>

        {/* Feature tiles */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {FEATURE_TILES_GRID(product).map((tile) => <FeatureTile key={tile.label} {...tile} />)}
        </div>

        {/* Free badge + enquire + view — no price, no cart */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full">
              Free Plan
            </span>
            <a href="tel:+254763831806" onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-emerald-600 transition font-medium">
              <Phone className="w-3 h-3" />
              Enquire
            </a>
          </div>
          <Link to={productUrl} onClick={(e) => e.stopPropagation()}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-2xl font-bold shadow-sm transition flex items-center justify-center gap-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2">
            View Plan
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;