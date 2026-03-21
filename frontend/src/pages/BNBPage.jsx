import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../lib/api";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useProjects } from "../context/ProjectsContext";
import {
  Search, MapPin, Users, Star, Heart,
  SlidersHorizontal, X, Wifi, Car, Waves, Wind, Coffee, Shield,
} from "lucide-react";

const AMENITY_ICONS = {
  wifi:      Wifi,
  parking:   Car,
  pool:      Waves,
  ac:        Wind,
  breakfast: Coffee,
  security:  Shield,
};

const KENYAN_COUNTIES = [
  "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret",
  "Thika", "Malindi", "Kitale", "Garissa", "Kakamega",
  "Nyeri", "Meru", "Machakos", "Kilifi", "Kwale",
  "Laikipia", "Nanyuki", "Diani", "Watamu", "Naivasha",
];

export default function BNBPage() {
  const navigate = useNavigate();
  const { projects } = useProjects();

  const [listings, setListings]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showFilters, setShowFilters]   = useState(false);
  const [searchQuery, setSearchQuery]   = useState("");
  const [showSearch, setShowSearch]     = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [page, setPage]                 = useState(1);
  const [totalPages, setTotalPages]     = useState(1);
  const [total, setTotal]               = useState(0);

  const [filters, setFilters] = useState({
    county: "", town: "", guests: "",
    minPrice: "", maxPrice: "",
    checkIn: "", checkOut: "",
    featured: false,
  });

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 12 });
      if (filters.county)   params.append("county",    filters.county);
      if (filters.town)     params.append("town",      filters.town);
      if (filters.guests)   params.append("guests",    filters.guests);
      if (filters.minPrice) params.append("minPrice",  filters.minPrice);
      if (filters.maxPrice) params.append("maxPrice",  filters.maxPrice);
      if (filters.checkIn)  params.append("checkIn",   filters.checkIn);
      if (filters.checkOut) params.append("checkOut",  filters.checkOut);
      if (filters.featured) params.append("featured",  "true");

      const res  = await fetch(`${API_BASE_URL}/api/bnb?${params}`);
      const data = await res.json();
      setListings(data.listings || []);
      setTotalPages(data.pages  || 1);
      setTotal(data.total       || 0);
    } catch (err) {
      console.error("Failed to fetch BNBs:", err);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ county: "", town: "", guests: "", minPrice: "", maxPrice: "", checkIn: "", checkOut: "", featured: false });
    setPage(1);
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== "" && v !== false);

  const displayed = searchQuery.trim()
    ? listings.filter((l) =>
        l.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.county?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.town?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : listings;

  return (
    <div className="min-h-screen bg-brand-50">
      <Header
        showSearch={showSearch} setShowSearch={setShowSearch}
        setSearchQuery={setSearchQuery} searchQuery={searchQuery}
        showMobileMenu={showMobileMenu} setShowMobileMenu={setShowMobileMenu}
        projects={projects}
      />

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-brand-800 via-brand-600 to-brand-500 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Find Your Perfect Stay</h1>
          <p className="text-brand-100 text-lg mb-10">Unique BNBs and guesthouses across Kenya</p>

          {/* Search bar */}
          <div className="bg-white rounded-2xl shadow-2xl p-4 flex flex-col sm:flex-row gap-3 max-w-3xl mx-auto">
            <div className="flex-1 flex items-center gap-3 border-b sm:border-b-0 sm:border-r border-brand-100 pb-3 sm:pb-0 sm:pr-3">
              <MapPin className="w-5 h-5 text-brand-500 flex-shrink-0" />
              <input
                type="text"
                placeholder="Where are you going?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 outline-none text-brand-900 placeholder-brand-300 text-sm"
              />
            </div>
            <div className="flex items-center gap-3 border-b sm:border-b-0 sm:border-r border-brand-100 pb-3 sm:pb-0 sm:pr-3">
              <input
                type="date"
                name="checkIn"
                value={filters.checkIn}
                onChange={handleFilterChange}
                min={new Date().toISOString().split("T")[0]}
                className="outline-none text-brand-900 text-sm w-32"
              />
              <span className="text-brand-300">→</span>
              <input
                type="date"
                name="checkOut"
                value={filters.checkOut}
                onChange={handleFilterChange}
                min={filters.checkIn || new Date().toISOString().split("T")[0]}
                className="outline-none text-brand-900 text-sm w-32"
              />
            </div>
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-brand-500 flex-shrink-0" />
              <input
                type="number"
                name="guests"
                value={filters.guests}
                onChange={handleFilterChange}
                placeholder="Guests"
                min="1"
                className="outline-none text-brand-900 text-sm w-16"
              />
              <button
                onClick={() => { setPage(1); fetchListings(); }}
                className="bg-brand-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-brand-700 transition text-sm flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Filter bar ───────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <p className="text-brand-700 text-sm">
              <span className="font-bold text-brand-900">{total}</span> stays found
              {hasActiveFilters && " with current filters"}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-900 font-medium transition"
              >
                <X className="w-3.5 h-3.5" />
                Clear filters
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-medium transition ${
              showFilters || hasActiveFilters
                ? "border-brand-500 bg-brand-50 text-brand-700"
                : "border-brand-200 text-brand-600 hover:border-brand-400"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="w-5 h-5 bg-brand-600 text-white rounded-full text-xs flex items-center justify-center">
                {Object.values(filters).filter((v) => v !== "" && v !== false).length}
              </span>
            )}
          </button>
        </div>

        {/* ── Filter panel ─────────────────────────────────────────────────────── */}
        {showFilters && (
          <div className="bg-white rounded-2xl shadow-sm border border-brand-100 p-6 mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div>
                <label className="block text-sm font-semibold text-brand-800 mb-2">County</label>
                <select
                  name="county"
                  value={filters.county}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2.5 border-2 border-brand-200 rounded-xl text-sm text-brand-900 focus:outline-none focus:border-brand-500"
                >
                  <option value="">All counties</option>
                  {KENYAN_COUNTIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-brand-800 mb-2">Town / Area</label>
                <input
                  type="text"
                  name="town"
                  value={filters.town}
                  onChange={handleFilterChange}
                  placeholder="e.g. Karen, Westlands"
                  className="w-full px-3 py-2.5 border-2 border-brand-200 rounded-xl text-sm text-brand-900 placeholder-brand-300 focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-brand-800 mb-2">Min Price (KES/night)</label>
                <input
                  type="number"
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  placeholder="e.g. 2000"
                  className="w-full px-3 py-2.5 border-2 border-brand-200 rounded-xl text-sm text-brand-900 placeholder-brand-300 focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-brand-800 mb-2">Max Price (KES/night)</label>
                <input
                  type="number"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  placeholder="e.g. 20000"
                  className="w-full px-3 py-2.5 border-2 border-brand-200 rounded-xl text-sm text-brand-900 placeholder-brand-300 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="featured"
                  checked={filters.featured}
                  onChange={handleFilterChange}
                  className="w-4 h-4 accent-brand-600"
                />
                <span className="text-sm font-medium text-brand-800">Featured stays only</span>
              </label>
            </div>
          </div>
        )}

        {/* ── Listings grid ─────────────────────────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow animate-pulse">
                <div className="h-52 bg-brand-100" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-brand-50 rounded w-3/4" />
                  <div className="h-3 bg-brand-50 rounded w-1/2" />
                  <div className="h-4 bg-brand-50 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-10 h-10 text-brand-300" />
            </div>
            <h3 className="text-xl font-semibold text-brand-800 mb-2">No stays found</h3>
            <p className="text-brand-500 mb-6">Try adjusting your filters or search in a different area</p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="bg-brand-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-brand-700 transition"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayed.map((listing) => (
              <BNBCard key={listing._id} listing={listing} />
            ))}
          </div>
        )}

        {/* ── Pagination ────────────────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-xl border-2 border-brand-200 text-brand-700 text-sm font-medium disabled:opacity-40 hover:border-brand-400 transition"
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-10 h-10 rounded-xl text-sm font-medium transition ${
                  page === i + 1
                    ? "bg-brand-600 text-white"
                    : "border-2 border-brand-200 text-brand-700 hover:border-brand-400"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-xl border-2 border-brand-200 text-brand-700 text-sm font-medium disabled:opacity-40 hover:border-brand-400 transition"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

// ── BNB Card ───────────────────────────────────────────────────────────────────
function BNBCard({ listing }) {
  const navigate = useNavigate();
  const [liked, setLiked]       = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const image         = listing.images?.[0] || null;
  const pricePerNight = listing.bnb?.pricePerNight || listing.price || 0;
  const maxGuests     = listing.bnb?.maxGuests;
  const bedrooms      = listing.bnb?.bedrooms;
  const amenities     = listing.bnb?.amenities || [];
  const rating        = listing.averageRating || null;
  const reviewCount   = listing.reviews?.length || 0;
  const isFeatured    = listing.featured;

  return (
    <div
      onClick={() => navigate(`/bnb/${listing._id}`)}
      className="bg-white rounded-2xl shadow-sm border border-brand-100 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden bg-brand-50">
        {!imgLoaded && <div className="absolute inset-0 bg-brand-100 animate-pulse" />}
        {image ? (
          <img
            src={image}
            alt={listing.title}
            onLoad={() => setImgLoaded(true)}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
              imgLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-brand-50">
            <MapPin className="w-12 h-12 text-brand-200" />
          </div>
        )}

        {/* Featured badge */}
        {isFeatured && (
          <div className="absolute top-3 left-3 bg-brand-accent text-white text-xs font-bold px-2.5 py-1 rounded-xl">
            Featured
          </div>
        )}

        {/* Like button */}
        <button
          onClick={(e) => { e.stopPropagation(); setLiked(!liked); }}
          className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow hover:scale-110 transition"
        >
          <Heart className={`w-4 h-4 ${liked ? "fill-brand-500 text-brand-500" : "text-brand-400"}`} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Location */}
        <div className="flex items-center gap-1 text-brand-400 text-xs mb-1.5">
          <MapPin className="w-3 h-3" />
          <span>{[listing.town, listing.county].filter(Boolean).join(", ") || listing.location || "Kenya"}</span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-brand-900 text-sm leading-snug mb-2 line-clamp-2 group-hover:text-brand-600 transition-colors">
          {listing.title}
        </h3>

        {/* Details */}
        <div className="flex items-center gap-3 text-xs text-brand-500 mb-3">
          {bedrooms  && <span>{bedrooms} bed{bedrooms > 1 ? "s" : ""}</span>}
          {maxGuests && <span>· Up to {maxGuests} guests</span>}
        </div>

        {/* Amenity icons */}
        {amenities.length > 0 && (
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {amenities.slice(0, 3).map((amenity) => {
              const Icon = AMENITY_ICONS[amenity.toLowerCase()] || null;
              return Icon ? (
                <div key={amenity} title={amenity} className="w-6 h-6 bg-brand-50 border border-brand-100 rounded-lg flex items-center justify-center">
                  <Icon className="w-3.5 h-3.5 text-brand-600" />
                </div>
              ) : null;
            })}
          </div>
        )}

        {/* Price + Rating */}
        <div className="flex items-end justify-between">
          <div>
            <span className="text-lg font-bold text-brand-700">
              KES {pricePerNight.toLocaleString()}
            </span>
            <span className="text-xs text-brand-400"> / night</span>
          </div>
          {rating && (
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-brand-accent fill-brand-accent" />
              <span className="text-xs font-semibold text-brand-800">{rating}</span>
              {reviewCount > 0 && (
                <span className="text-xs text-brand-400">({reviewCount})</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}