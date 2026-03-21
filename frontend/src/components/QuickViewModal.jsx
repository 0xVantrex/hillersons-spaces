import React, { useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Award, Bed, Bath, Square, Building,
  Star, Zap, X, Phone, Mail, Heart,
} from "lucide-react";

/* ─── Stat tile ───────────────────────────────────────────────── */
function StatTile({ Icon, value, label, iconColor, bgColor }) {
  return (
    <div className={`${bgColor} rounded-xl p-4 text-center`}>
      <Icon className={`w-6 h-6 ${iconColor} mx-auto mb-2`} aria-hidden="true" />
      <span className="text-lg font-bold text-gray-800 block">{value ?? "—"}</span>
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  );
}

/* ─── Badge ───────────────────────────────────────────────────── */
function Badge({ children, variant = "brand" }) {
  const styles = {
    brand:  "bg-brand-600 text-white",
    accent: "bg-brand-accent text-gray-900",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold shadow ${styles[variant]}`}>
      {children}
    </span>
  );
}

/* ════════════════════════════════════════════════════════════════ */
const QuickViewModal = ({ product, onClose, isFavorite, onToggleFavorite }) => {
  const navigate   = useNavigate();
  const closeRef   = useRef(null);  // focus target on open

  // ✅ Bug fix: MongoDB uses _id not id
  const productId = product?._id || product?.id;

  /* ── Escape key + focus on open ── */
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    // Prevent body scroll while modal is open
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const handleQuickBuy = () => {
    onClose();
    navigate(`/quick-buy/${productId}`);
  };

  /* ── Null-safe helpers ── */
  const title      = product?.title        || "Premium House Plan";
  const architect  = product?.architect    || null;
  const price      = product?.price        ? `KES ${Number(product.price).toLocaleString("en-KE")}` : "Contact for price";
  const delivery   = product?.completionTime || null;
  const rating     = product?.rating       ?? null;
  const reviewCount= product?.reviewCount  ?? null;
  const views      = product?.views        ?? null;
  const saved      = product?.saved        ?? null;
  const rooms      = product?.rooms        ?? null;
  const bathrooms  = product?.bathrooms    ?? null; // ✅ use real field, not derived
  const floors     = product?.floorCount   ?? null;
  const area       = product?.area         != null ? `${Math.round(product.area)} sqm` : null;

  // ✅ Bug fix: safe thumbnail access
  const images     = Array.isArray(product?.finalImageURLs) ? product.finalImageURLs : [];
  const heroImage  = images[0] || null;
  const thumbs     = images.slice(1, 4); // up to 3 thumbnails

  return (
    /* Backdrop — click to close */
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      role="presentation"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="qv-title"
        className="bg-brand-50 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center rounded-t-3xl z-10">
          <h2
            id="qv-title"
            className="text-xl font-bold text-brand-700"
          >
            Quick Preview
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleFavorite}
              aria-label={isFavorite ? "Remove from favourites" : "Add to favourites"}
              aria-pressed={isFavorite}
              className={`p-2.5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-400 ${
                isFavorite
                  ? "bg-red-100 text-red-600 hover:bg-red-200"
                  : "bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500"
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} aria-hidden="true" />
            </button>
            <button
              ref={closeRef}
              onClick={onClose}
              aria-label="Close quick preview"
              className="p-2.5 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-400"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* ── Image section ── */}
            <div className="space-y-3">
              {/* Hero image */}
              <div className="h-80 bg-brand-50 rounded-2xl overflow-hidden relative">
                {heroImage ? (
                  <img
                    src={heroImage}
                    alt={title}
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-brand-200">
                    <Building className="w-16 h-16" aria-hidden="true" />
                  </div>
                )}

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                  {product?.featured && (
                    <Badge variant="brand">
                      <Award className="w-3 h-3" aria-hidden="true" />
                      Featured
                    </Badge>
                  )}
                  {product?.newListing && (
                    <Badge variant="accent">New</Badge>
                  )}
                </div>
              </div>

              {/* Thumbnails — only render if they exist */}
              {thumbs.length > 0 && (
                <div className="grid grid-cols-3 gap-2" aria-label="Additional views">
                  {thumbs.map((src, i) => (
                    <div key={i} className="h-20 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={src}
                        alt={`View ${i + 2} of ${title}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Details section ── */}
            <div className="space-y-5">
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-1">{title}</h3>

                {architect && (
                  <p className="text-gray-500 text-sm mb-3">Designed by {architect}</p>
                )}

                {/* Rating row */}
                {rating != null && (
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <div className="flex items-center gap-1" aria-label={`Rating: ${rating} out of 5`}>
                      <Star className="w-4 h-4 text-brand-accent fill-current" aria-hidden="true" />
                      <span className="font-semibold text-sm">{rating}</span>
                      {reviewCount != null && (
                        <span className="text-gray-500 text-xs">({reviewCount.toLocaleString()} reviews)</span>
                      )}
                    </div>
                    {(views != null || saved != null) && (
                      <p className="text-xs text-gray-400">
                        {views != null && `${views.toLocaleString()} views`}
                        {views != null && saved != null && " · "}
                        {saved != null && `${saved.toLocaleString()} saved`}
                      </p>
                    )}
                  </div>
                )}

                {/* Price */}
                <p className="text-3xl font-bold text-brand-700 mb-1">{price}</p>
                {delivery && (
                  <p className="text-sm text-gray-500">Delivery: {delivery}</p>
                )}
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3" aria-label="Property specifications">
                <StatTile
                  Icon={Bed}
                  value={rooms}
                  label="Bedrooms"
                  iconColor="text-brand-600"
                  bgColor="bg-brand-50"
                />
                {/* ✅ Bug fix: use real bathrooms field, not derived */}
                <StatTile
                  Icon={Bath}
                  value={bathrooms}
                  label="Bathrooms"
                  iconColor="text-lime-600"
                  bgColor="bg-lime-50"
                />
                <StatTile
                  Icon={Building}
                  value={floors}
                  label="Floors"
                  iconColor="text-brand-700"
                  bgColor="bg-brand-100"
                />
                <StatTile
                  Icon={Square}
                  value={area}
                  label="Area"
                  iconColor="text-brand-600"
                  bgColor="bg-brand-50"
                />
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <Link
                  to={`/product/${productId}`}
                  onClick={onClose}
                  className="flex-1 bg-brand-600 hover:bg-brand-700 text-white py-3 px-5 rounded-xl font-semibold text-center transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 text-sm"
                >
                  View Full Details
                </Link>
                <button
                  type="button"
                  onClick={handleQuickBuy}
                  className="bg-lime-600 hover:bg-lime-700 text-white px-5 py-3 rounded-xl font-semibold transition-colors flex items-center gap-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:ring-offset-2"
                >
                  <Zap className="w-4 h-4" aria-hidden="true" />
                  Quick Buy
                </button>
              </div>

              {/* Contact */}
              <div className="bg-brand-50 border border-brand-100 rounded-xl p-4">
                <h4 className="font-semibold text-gray-800 text-sm mb-3">Need Help?</h4>
                <div className="space-y-2">
                  <a
                    href="tel:+254763831806"
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-brand-700 transition-colors focus:outline-none focus:underline"
                  >
                    <Phone className="w-4 h-4 text-brand-600 flex-shrink-0" aria-hidden="true" />
                    +254 763 831 806
                  </a>
                  {/* ✅ Bug fix: plain span → real mailto link */}
                  <a
                    href="mailto:HillersonsDesigns@gmail.com"
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-brand-700 transition-colors focus:outline-none focus:underline"
                  >
                    <Mail className="w-4 h-4 text-brand-600 flex-shrink-0" aria-hidden="true" />
                    HillersonsDesigns@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;