import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../lib/api";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useProjects } from "../context/ProjectsContext";
import {
  MapPin,
  Users,
  Bed,
  Bath,
  Wifi,
  Car,
  Waves,
  Wind,
  Coffee,
  Shield,
  Star,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  AlertCircle,
  ArrowRight,
  Clock,
  Mail,
} from "lucide-react";

const AMENITY_ICONS = {
  wifi: { icon: Wifi, label: "WiFi" },
  parking: { icon: Car, label: "Free Parking" },
  pool: { icon: Waves, label: "Swimming Pool" },
  ac: { icon: Wind, label: "Air Conditioning" },
  breakfast: { icon: Coffee, label: "Breakfast Included" },
  security: { icon: Shield, label: "24/7 Security" },
};

export default function BNBDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { projects } = useProjects();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImg, setActiveImg] = useState(0);
  const [showGallery, setShowGallery] = useState(false);
  const [liked, setLiked] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const [availability, setAvailability] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  const [bookingForm, setBookingForm] = useState({
    checkIn: "",
    checkOut: "",
    guests: 1,
    guestPhone: "",
    specialRequests: "",
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(null);

  useEffect(() => {
    fetchListing();
  }, [id]);

  const fetchListing = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/bnb/${id}`);
      if (!res.ok) throw new Error("Listing not found");
      setListing(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkAvailability = async () => {
    if (!bookingForm.checkIn || !bookingForm.checkOut) return;
    setCheckingAvailability(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/bnb/${id}/availability?checkIn=${bookingForm.checkIn}&checkOut=${bookingForm.checkOut}`,
      );
      setAvailability(await res.json());
    } catch (err) {
      console.error("Availability check failed:", err);
    } finally {
      setCheckingAvailability(false);
    }
  };

  useEffect(() => {
    if (bookingForm.checkIn && bookingForm.checkOut) checkAvailability();
  }, [bookingForm.checkIn, bookingForm.checkOut]);

  const handleBook = async () => {
    if (!user) {
      navigate("/login", { state: { from: { pathname: `/bnb/${id}` } } });
      return;
    }
    if (!bookingForm.checkIn || !bookingForm.checkOut)
      return setBookingError("Please select check-in and check-out dates.");
    if (availability && !availability.available)
      return setBookingError("Selected dates are not available.");

    setBookingLoading(true);
    setBookingError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/bnb/${id}/book`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token || localStorage.getItem("authToken")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Booking failed");
      setBookingSuccess(data.booking);
    } catch (err) {
      setBookingError(err.message);
    } finally {
      setBookingLoading(false);
    }
  };

  const nights =
    bookingForm.checkIn && bookingForm.checkOut
      ? Math.ceil(
          (new Date(bookingForm.checkOut) - new Date(bookingForm.checkIn)) /
            (1000 * 60 * 60 * 24),
        )
      : 0;
  const pricePerNight = listing?.bnb?.pricePerNight || listing?.price || 0;
  const serviceFee = nights > 0 ? Math.round(pricePerNight * nights * 0.05) : 0;
  const total = pricePerNight * nights + serviceFee;

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header
          showSearch={showSearch}
          setShowSearch={setShowSearch}
          setSearchQuery={setSearchQuery}
          searchQuery={searchQuery}
          showMobileMenu={showMobileMenu}
          setShowMobileMenu={setShowMobileMenu}
          projects={projects}
        />
        <div className="max-w-6xl mx-auto px-4 py-10 animate-pulse">
          <div className="h-7 bg-brand-50 rounded w-1/3 mb-6" />
          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="h-80 bg-brand-50 rounded-xl" />
            <div className="grid grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-36 bg-brand-50 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Error state ─────────────────────────────────────────────────────────────
  if (error || !listing) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center px-4">
          <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-brand-600" />
          </div>
          <h2 className="text-2xl font-bold text-brand-900 mb-2">
            Listing not found
          </h2>
          <p className="text-brand-700 mb-6 text-sm">{error}</p>
          <button
            onClick={() => navigate("/bnb")}
            className="bg-brand-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-brand-700 transition"
          >
            Browse BNBs
          </button>
        </div>
      </div>
    );
  }

  const images = listing.images?.length > 0 ? listing.images : [];
  const amenities = listing.bnb?.amenities || [];
  const rules = listing.bnb?.rules || [];
  const reviews = listing.reviews || [];

  return (
    <div className="min-h-screen bg-white">
      <Header
        showSearch={showSearch}
        setShowSearch={setShowSearch}
        setSearchQuery={setSearchQuery}
        searchQuery={searchQuery}
        showMobileMenu={showMobileMenu}
        setShowMobileMenu={setShowMobileMenu}
        projects={projects}
      />

      {/* ── Fullscreen gallery modal ─────────────────────────────────────────── */}
      {showGallery && (
        <div className="fixed inset-0 bg-brand-900 z-50 flex items-center justify-center">
          <button
            onClick={() => setShowGallery(false)}
            className="absolute top-4 right-4 text-white hover:text-brand-300 z-10 transition"
          >
            <X className="w-7 h-7" />
          </button>
          <button
            onClick={() =>
              setActiveImg((i) => (i - 1 + images.length) % images.length)
            }
            className="absolute left-4 text-white hover:text-brand-300 z-10 transition"
          >
            <ChevronLeft className="w-9 h-9" />
          </button>
          <img
            src={images[activeImg]}
            alt=""
            className="max-h-screen max-w-full object-contain px-20"
          />
          <button
            onClick={() => setActiveImg((i) => (i + 1) % images.length)}
            className="absolute right-4 text-white hover:text-brand-300 z-10 transition"
          >
            <ChevronRight className="w-9 h-9" />
          </button>
          <div className="absolute bottom-4 text-brand-200 text-sm font-medium tracking-wide">
            {activeImg + 1} / {images.length}
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back */}
        <button
          onClick={() => navigate("/bnb")}
          className="flex items-center gap-1.5 text-brand-700 hover:text-brand-900 transition mb-6 text-sm font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to BNBs
        </button>

        {/* Title row */}
        <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-brand-900 mb-2">
              {listing.title}
            </h1>
            <div className="flex items-center gap-4 flex-wrap text-sm text-brand-700">
              {reviews.length > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-brand-accent fill-brand-accent" />
                  <span className="font-semibold text-brand-900">
                    {listing.averageRating}
                  </span>
                  <span className="text-brand-600">
                    ({reviews.length} reviews)
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-brand-500" />
                <span>
                  {[listing.town, listing.county, listing.location]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setLiked(!liked)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-medium transition ${
                liked
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-brand-200 text-brand-600 hover:border-brand-400"
              }`}
            >
              <Heart
                className={`w-4 h-4 ${liked ? "fill-brand-500 text-brand-500" : ""}`}
              />
              Save
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-brand-200 text-sm font-medium text-brand-600 hover:border-brand-400 transition">
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>

        {/* Photo gallery */}
        {images.length > 0 ? (
          <div
            className="grid grid-cols-2 gap-2 mb-10 rounded-2xl overflow-hidden cursor-pointer"
            onClick={() => setShowGallery(true)}
          >
            <div className="row-span-2">
              <img
                src={images[0]}
                alt={listing.title}
                className="w-full h-full object-cover hover:brightness-95 transition"
              />
            </div>
            {images.slice(1, 5).map((img, i) => (
              <div key={i} className="relative">
                <img
                  src={img}
                  alt=""
                  className="w-full h-44 object-cover hover:brightness-95 transition"
                />
                {i === 3 && images.length > 5 && (
                  <div className="absolute inset-0 bg-brand-900/50 flex items-center justify-center">
                    <span className="text-white font-semibold text-base">
                      +{images.length - 5} more
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="h-72 bg-brand-50 rounded-2xl flex items-center justify-center mb-10 border border-brand-100">
            <p className="text-brand-300 text-base">No photos available</p>
          </div>
        )}

        {/* Main content + booking sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* ── Left: listing details ──────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick stats */}
            <div className="flex items-center gap-6 flex-wrap text-sm text-brand-700 pb-6 border-b border-brand-100">
              {listing.bnb?.bedrooms && (
                <div className="flex items-center gap-2">
                  <Bed className="w-5 h-5 text-brand-500" />
                  <span>
                    {listing.bnb.bedrooms} bedroom
                    {listing.bnb.bedrooms > 1 ? "s" : ""}
                  </span>
                </div>
              )}
              {listing.bnb?.bathrooms && (
                <div className="flex items-center gap-2">
                  <Bath className="w-5 h-5 text-brand-500" />
                  <span>
                    {listing.bnb.bathrooms} bathroom
                    {listing.bnb.bathrooms > 1 ? "s" : ""}
                  </span>
                </div>
              )}
              {listing.bnb?.maxGuests && (
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-brand-500" />
                  <span>Up to {listing.bnb.maxGuests} guests</span>
                </div>
              )}
              {listing.bnb?.minimumStay && listing.bnb.minimumStay > 1 && (
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-brand-500" />
                  <span>Min. {listing.bnb.minimumStay} nights</span>
                </div>
              )}
            </div>

            {/* Host info */}
            {listing.sellerId && (
              <div className="flex items-center gap-4 pb-6 border-b border-brand-100">
                <img
                  src={
                    listing.sellerId.profilePicture ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      listing.sellerId.name || "Host",
                    )}&background=059669&color=fff&size=64`
                  }
                  alt="Host"
                  className="w-14 h-14 rounded-full object-cover border-2 border-brand-200"
                />
                <div>
                  <p className="font-semibold text-brand-900">
                    Hosted by{" "}
                    {listing.sellerId.vendorProfile?.businessName ||
                      listing.sellerId.name}
                  </p>
                  {listing.sellerId.vendorProfile?.location && (
                    <p className="text-sm text-brand-600 mt-0.5">
                      {listing.sellerId.vendorProfile.location}
                    </p>
                  )}
                  {listing.sellerId.email && (
                    <a
                      href={`mailto:${listing.sellerId.email}`}
                      className="text-xs text-brand-600 hover:text-brand-800 underline flex items-center gap-1 mt-1 transition"
                    >
                      <Mail className="w-3 h-3" /> Email host
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="pb-6 border-b border-brand-100">
              <h2 className="text-lg font-bold text-brand-900 mb-3">
                About this place
              </h2>
              <p className="text-brand-800 leading-relaxed whitespace-pre-line text-sm">
                {listing.description}
              </p>
            </div>

            {/* Amenities */}
            {amenities.length > 0 && (
              <div className="pb-6 border-b border-brand-100">
                <h2 className="text-lg font-bold text-brand-900 mb-4">
                  What this place offers
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {amenities.map((amenity) => {
                    const config = AMENITY_ICONS[amenity.toLowerCase()];
                    const Icon = config?.icon;
                    return (
                      <div
                        key={amenity}
                        className="flex items-center gap-3 p-3 bg-brand-50 border border-brand-100 rounded-xl"
                      >
                        {Icon ? (
                          <Icon className="w-4 h-4 text-brand-600 flex-shrink-0" />
                        ) : (
                          <Check className="w-4 h-4 text-brand-600 flex-shrink-0" />
                        )}
                        <span className="text-sm text-brand-800 font-medium">
                          {config?.label || amenity}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Check-in / Check-out times */}
            {(listing.bnb?.checkInTime || listing.bnb?.checkOutTime) && (
              <div className="pb-6 border-b border-brand-100">
                <h2 className="text-lg font-bold text-brand-900 mb-4">
                  Check-in / Check-out
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {listing.bnb.checkInTime && (
                    <div className="bg-brand-50 border border-brand-100 rounded-xl p-4">
                      <p className="text-xs text-brand-600 uppercase font-semibold mb-1 tracking-wide">
                        Check-in after
                      </p>
                      <p className="text-xl font-bold text-brand-900">
                        {listing.bnb.checkInTime}
                      </p>
                    </div>
                  )}
                  {listing.bnb.checkOutTime && (
                    <div className="bg-brand-50 border border-brand-100 rounded-xl p-4">
                      <p className="text-xs text-brand-600 uppercase font-semibold mb-1 tracking-wide">
                        Check-out before
                      </p>
                      <p className="text-xl font-bold text-brand-900">
                        {listing.bnb.checkOutTime}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* House rules */}
            {rules.length > 0 && (
              <div className="pb-6 border-b border-brand-100">
                <h2 className="text-lg font-bold text-brand-900 mb-4">
                  House rules
                </h2>
                <div className="space-y-2">
                  {rules.map((rule, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 text-sm text-brand-800"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0" />
                      {rule}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            {reviews.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <Star className="w-5 h-5 text-brand-accent fill-brand-accent" />
                  <h2 className="text-lg font-bold text-brand-900">
                    {listing.averageRating} · {reviews.length} review
                    {reviews.length > 1 ? "s" : ""}
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {reviews.slice(0, 4).map((review, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm border border-brand-200">
                          {review.userName?.[0] || "G"}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-brand-900">
                            {review.userName || "Guest"}
                          </p>
                          <div className="flex gap-0.5 mt-0.5">
                            {[...Array(5)].map((_, s) => (
                              <Star
                                key={s}
                                className={`w-3 h-3 ${
                                  s < review.rating
                                    ? "text-brand-accent fill-brand-accent"
                                    : "text-brand-100"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-brand-700 leading-relaxed">
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Right: Booking card ────────────────────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 bg-white rounded-2xl shadow-lg border border-brand-100 p-6">
              {bookingSuccess ? (
                <BookingSuccess
                  booking={bookingSuccess}
                  onViewBookings={() => navigate("/my-bookings")}
                />
              ) : (
                <>
                  {/* Price */}
                  <div className="flex items-end gap-2 mb-6 pb-4 border-b border-brand-100">
                    <span className="text-3xl font-bold text-brand-900">
                      KES {pricePerNight.toLocaleString()}
                    </span>
                    <span className="text-brand-500 text-sm mb-1">/ night</span>
                  </div>

                  {/* Date + guests picker */}
                  <div className="border-2 border-brand-200 rounded-xl overflow-hidden mb-4 focus-within:border-brand-500 transition">
                    <div className="grid grid-cols-2 divide-x divide-brand-200">
                      <div className="p-3">
                        <p className="text-xs font-bold text-brand-600 uppercase tracking-wide mb-1">
                          Check-in
                        </p>
                        <input
                          type="date"
                          value={bookingForm.checkIn}
                          min={new Date().toISOString().split("T")[0]}
                          onChange={(e) =>
                            setBookingForm((f) => ({
                              ...f,
                              checkIn: e.target.value,
                              checkOut: "",
                            }))
                          }
                          className="w-full text-sm text-brand-900 outline-none bg-transparent"
                        />
                      </div>
                      <div className="p-3">
                        <p className="text-xs font-bold text-brand-600 uppercase tracking-wide mb-1">
                          Check-out
                        </p>
                        <input
                          type="date"
                          value={bookingForm.checkOut}
                          min={
                            bookingForm.checkIn ||
                            new Date().toISOString().split("T")[0]
                          }
                          onChange={(e) =>
                            setBookingForm((f) => ({
                              ...f,
                              checkOut: e.target.value,
                            }))
                          }
                          className="w-full text-sm text-brand-900 outline-none bg-transparent"
                        />
                      </div>
                    </div>
                    <div className="border-t border-brand-200 p-3">
                      <p className="text-xs font-bold text-brand-600 uppercase tracking-wide mb-1">
                        Guests
                      </p>
                      <select
                        value={bookingForm.guests}
                        onChange={(e) =>
                          setBookingForm((f) => ({
                            ...f,
                            guests: Number(e.target.value),
                          }))
                        }
                        className="w-full text-sm text-brand-900 outline-none bg-transparent"
                      >
                        {[...Array(listing.bnb?.maxGuests || 10)].map(
                          (_, i) => (
                            <option key={i + 1} value={i + 1}>
                              {i + 1} guest{i > 0 ? "s" : ""}
                            </option>
                          ),
                        )}
                      </select>
                    </div>
                  </div>

                  {/* Availability indicator */}
                  {bookingForm.checkIn && bookingForm.checkOut && (
                    <div
                      className={`flex items-center gap-2 p-3 rounded-xl mb-4 text-sm font-medium ${
                        checkingAvailability
                          ? "bg-brand-50 text-brand-600"
                          : availability?.available
                            ? "bg-brand-50 text-brand-700 border border-brand-200"
                            : "bg-brand-100 text-brand-800 border border-brand-300"
                      }`}
                    >
                      {checkingAvailability ? (
                        <>
                          <div className="w-4 h-4 border-2 border-brand-300 border-t-brand-600 rounded-full animate-spin" />
                          Checking availability...
                        </>
                      ) : availability?.available ? (
                        <>
                          <Check className="w-4 h-4 text-brand-600" />
                          Available for selected dates
                        </>
                      ) : (
                        <>
                          <X className="w-4 h-4 text-brand-700" />
                          Not available for these dates
                        </>
                      )}
                    </div>
                  )}

                  {/* Phone */}
                  <input
                    type="tel"
                    placeholder="Your phone number (M-Pesa)"
                    value={bookingForm.guestPhone}
                    onChange={(e) =>
                      setBookingForm((f) => ({
                        ...f,
                        guestPhone: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 border-2 border-brand-200 rounded-xl text-sm text-brand-900 placeholder-brand-400 focus:outline-none focus:border-brand-500 mb-3 transition"
                  />

                  {/* Special requests */}
                  <textarea
                    placeholder="Special requests (optional)"
                    value={bookingForm.specialRequests}
                    onChange={(e) =>
                      setBookingForm((f) => ({
                        ...f,
                        specialRequests: e.target.value,
                      }))
                    }
                    rows={2}
                    className="w-full px-4 py-3 border-2 border-brand-200 rounded-xl text-sm text-brand-900 placeholder-brand-400 focus:outline-none focus:border-brand-500 resize-none mb-4 transition"
                  />

                  {/* Price breakdown */}
                  {nights > 0 && (
                    <div className="space-y-2 mb-4 pb-4 border-b border-brand-100">
                      <div className="flex justify-between text-sm text-brand-700">
                        <span>
                          KES {pricePerNight.toLocaleString()} × {nights} night
                          {nights > 1 ? "s" : ""}
                        </span>
                        <span>
                          KES {(pricePerNight * nights).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-brand-700">
                        <span>Service fee (5%)</span>
                        <span>KES {serviceFee.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-bold text-brand-900 pt-2 text-base">
                        <span>Total</span>
                        <span>KES {total.toLocaleString()}</span>
                      </div>
                    </div>
                  )}

                  {/* Error */}
                  {bookingError && (
                    <div className="flex items-center gap-2 p-3 bg-brand-50 border border-brand-200 rounded-xl text-brand-800 text-sm mb-4">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 text-brand-600" />
                      {bookingError}
                    </div>
                  )}

                  {/* Book button — fixed ternary */}
                  <button
                    onClick={handleBook}
                    disabled={
                      bookingLoading ||
                      (availability && !availability.available)
                    }
                    className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white py-4 rounded-xl font-bold transition flex items-center justify-center gap-2 text-sm"
                  >
                    {bookingLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : user ? (
                      <>
                        Reserve Now
                        <ArrowRight className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        Sign in to Book
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <p className="text-center text-xs text-brand-500 mt-3">
                    You won't be charged yet — payment is collected after host
                    confirms
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

// ── Booking success screen ──────────────────────────────────────────────────────
function BookingSuccess({ booking, onViewBookings }) {
  return (
    <div className="text-center py-4">
      <div className="w-16 h-16 bg-brand-100 border border-brand-200 rounded-full flex items-center justify-center mx-auto mb-4">
        <Check className="w-8 h-8 text-brand-600" />
      </div>
      <h3 className="text-xl font-bold text-brand-900 mb-2">
        Booking Requested
      </h3>
      <p className="text-sm text-brand-600 mb-5">
        Your booking is pending host confirmation. You'll be notified once
        confirmed.
      </p>
      <div className="bg-brand-50 border border-brand-100 rounded-xl p-4 text-left space-y-2 mb-5 text-sm">
        <div className="flex justify-between">
          <span className="text-brand-600">Check-in</span>
          <span className="font-medium text-brand-900">
            {new Date(booking.checkIn).toLocaleDateString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-brand-600">Check-out</span>
          <span className="font-medium text-brand-900">
            {new Date(booking.checkOut).toLocaleDateString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-brand-600">Nights</span>
          <span className="font-medium text-brand-900">{booking.nights}</span>
        </div>
        <div className="flex justify-between font-bold border-t border-brand-100 pt-2">
          <span className="text-brand-800">Total</span>
          <span className="text-brand-700">
            KES {booking.totalAmount.toLocaleString()}
          </span>
        </div>
      </div>
      <button
        onClick={onViewBookings}
        className="w-full bg-brand-600 text-white py-3 rounded-xl font-semibold hover:bg-brand-700 transition text-sm"
      >
        View My Bookings
      </button>
    </div>
  );
}
