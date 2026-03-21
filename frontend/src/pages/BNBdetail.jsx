import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../lib/api";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useProjects } from "../context/ProjectsContext";
import {
  MapPin, Users, Bed, Bath, Wifi, Car, Waves, Wind,
  Coffee, Shield, Star, Heart, Share2, ChevronLeft,
  ChevronRight, X, Check, AlertCircle, Calendar,
  Phone, Mail, ArrowRight, Clock,
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

  // Availability
  const [availability, setAvailability] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  // Booking form
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
      const data = await res.json();
      setListing(data);
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
        `${API_BASE_URL}/api/bnb/${id}/availability?checkIn=${bookingForm.checkIn}&checkOut=${bookingForm.checkOut}`
      );
      const data = await res.json();
      setAvailability(data);
    } catch (err) {
      console.error("Availability check failed:", err);
    } finally {
      setCheckingAvailability(false);
    }
  };

  useEffect(() => {
    if (bookingForm.checkIn && bookingForm.checkOut) {
      checkAvailability();
    }
  }, [bookingForm.checkIn, bookingForm.checkOut]);

  const handleBook = async () => {
    if (!user) {
      navigate("/login", { state: { from: { pathname: `/bnb/${id}` } } });
      return;
    }

    if (!bookingForm.checkIn || !bookingForm.checkOut) {
      return setBookingError("Please select check-in and check-out dates.");
    }
    if (availability && !availability.available) {
      return setBookingError("Selected dates are not available.");
    }

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

  // Calculate nights and total
  const nights =
    bookingForm.checkIn && bookingForm.checkOut
      ? Math.ceil(
          (new Date(bookingForm.checkOut) - new Date(bookingForm.checkIn)) /
            (1000 * 60 * 60 * 24)
        )
      : 0;
  const pricePerNight = listing?.bnb?.pricePerNight || listing?.price || 0;
  const serviceFee = nights > 0 ? Math.round(pricePerNight * nights * 0.05) : 0;
  const total = pricePerNight * nights + serviceFee;

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header showSearch={showSearch} setShowSearch={setShowSearch}
          setSearchQuery={setSearchQuery} searchQuery={searchQuery}
          showMobileMenu={showMobileMenu} setShowMobileMenu={setShowMobileMenu}
          projects={projects} />
        <div className="max-w-6xl mx-auto px-4 py-10 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-6" />
          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="h-80 bg-gray-200 rounded-2xl" />
            <div className="grid grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => <div key={i} className="h-36 bg-gray-200 rounded-xl" />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Listing not found</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button onClick={() => navigate("/bnb")} className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition">
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
    <div className="min-h-screen bg-gray-50">
      <Header showSearch={showSearch} setShowSearch={setShowSearch}
        setSearchQuery={setSearchQuery} searchQuery={searchQuery}
        showMobileMenu={showMobileMenu} setShowMobileMenu={setShowMobileMenu}
        projects={projects} />

      {/* Fullscreen gallery modal */}
      {showGallery && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <button onClick={() => setShowGallery(false)} className="absolute top-4 right-4 text-white hover:text-gray-300 z-10">
            <X className="w-8 h-8" />
          </button>
          <button
            onClick={() => setActiveImg((i) => (i - 1 + images.length) % images.length)}
            className="absolute left-4 text-white hover:text-gray-300 z-10"
          >
            <ChevronLeft className="w-10 h-10" />
          </button>
          <img src={images[activeImg]} alt="" className="max-h-screen max-w-full object-contain px-16" />
          <button
            onClick={() => setActiveImg((i) => (i + 1) % images.length)}
            className="absolute right-4 text-white hover:text-gray-300 z-10"
          >
            <ChevronRight className="w-10 h-10" />
          </button>
          <div className="absolute bottom-4 text-white text-sm">{activeImg + 1} / {images.length}</div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <button onClick={() => navigate("/bnb")} className="flex items-center gap-2 text-gray-500 hover:text-emerald-600 transition mb-6 text-sm font-medium">
          <ChevronLeft className="w-4 h-4" />
          Back to BNBs
        </button>

        {/* Title row */}
        <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{listing.title}</h1>
            <div className="flex items-center gap-4 flex-wrap text-sm text-gray-500">
              {reviews.length > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="font-semibold text-gray-800">{listing.averageRating}</span>
                  <span>({reviews.length} reviews)</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-emerald-500" />
                <span>{[listing.town, listing.county, listing.location].filter(Boolean).join(", ")}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setLiked(!liked)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-gray-200 text-sm font-medium hover:border-red-300 transition"
            >
              <Heart className={`w-4 h-4 ${liked ? "fill-red-500 text-red-500" : "text-gray-500"}`} />
              Save
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-gray-200 text-sm font-medium hover:border-emerald-300 transition">
              <Share2 className="w-4 h-4 text-gray-500" />
              Share
            </button>
          </div>
        </div>

        {/* Photo gallery */}
        {images.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 mb-10 rounded-2xl overflow-hidden cursor-pointer" onClick={() => setShowGallery(true)}>
            <div className="row-span-2">
              <img src={images[0]} alt={listing.title} className="w-full h-full object-cover hover:opacity-95 transition" />
            </div>
            {images.slice(1, 5).map((img, i) => (
              <div key={i} className="relative">
                <img src={img} alt="" className="w-full h-44 object-cover hover:opacity-95 transition" />
                {i === 3 && images.length > 5 && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">+{images.length - 5} more</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="h-72 bg-gradient-to-br from-emerald-50 to-lime-50 rounded-2xl flex items-center justify-center mb-10">
            <p className="text-gray-300 text-lg">No photos available</p>
          </div>
        )}

        {/* Main content + booking sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left — listing details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick stats */}
            <div className="flex items-center gap-6 flex-wrap text-sm text-gray-600 pb-6 border-b">
              {listing.bnb?.bedrooms && (
                <div className="flex items-center gap-2">
                  <Bed className="w-5 h-5 text-emerald-500" />
                  <span>{listing.bnb.bedrooms} bedroom{listing.bnb.bedrooms > 1 ? "s" : ""}</span>
                </div>
              )}
              {listing.bnb?.bathrooms && (
                <div className="flex items-center gap-2">
                  <Bath className="w-5 h-5 text-emerald-500" />
                  <span>{listing.bnb.bathrooms} bathroom{listing.bnb.bathrooms > 1 ? "s" : ""}</span>
                </div>
              )}
              {listing.bnb?.maxGuests && (
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-500" />
                  <span>Up to {listing.bnb.maxGuests} guests</span>
                </div>
              )}
              {listing.bnb?.minimumStay && listing.bnb.minimumStay > 1 && (
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-500" />
                  <span>Min. {listing.bnb.minimumStay} nights</span>
                </div>
              )}
            </div>

            {/* Host info */}
            {listing.sellerId && (
              <div className="flex items-center gap-4 pb-6 border-b">
                <img
                  src={
                    listing.sellerId.profilePicture ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(listing.sellerId.name || "Host")}&background=10b981&color=fff&size=64`
                  }
                  alt="Host"
                  className="w-14 h-14 rounded-full object-cover border-2 border-emerald-100"
                />
                <div>
                  <p className="font-semibold text-gray-800">
                    Hosted by {listing.sellerId.vendorProfile?.businessName || listing.sellerId.name}
                  </p>
                  {listing.sellerId.vendorProfile?.location && (
                    <p className="text-sm text-gray-500">{listing.sellerId.vendorProfile.location}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1">
                    {listing.sellerId.email && (
                      <a href={`mailto:${listing.sellerId.email}`} className="text-xs text-emerald-600 hover:underline flex items-center gap-1">
                        <Mail className="w-3 h-3" /> Email host
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="pb-6 border-b">
              <h2 className="text-xl font-bold text-gray-800 mb-3">About this place</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{listing.description}</p>
            </div>

            {/* Amenities */}
            {amenities.length > 0 && (
              <div className="pb-6 border-b">
                <h2 className="text-xl font-bold text-gray-800 mb-4">What this place offers</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {amenities.map((amenity) => {
                    const config = AMENITY_ICONS[amenity.toLowerCase()];
                    const Icon = config?.icon;
                    return (
                      <div key={amenity} className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl">
                        {Icon ? <Icon className="w-5 h-5 text-emerald-600 flex-shrink-0" /> : <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />}
                        <span className="text-sm text-gray-700 font-medium">{config?.label || amenity}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Check in/out times */}
            {(listing.bnb?.checkInTime || listing.bnb?.checkOutTime) && (
              <div className="pb-6 border-b">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Check-in / Check-out</h2>
                <div className="grid grid-cols-2 gap-4">
                  {listing.bnb.checkInTime && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-500 mb-1">Check-in after</p>
                      <p className="text-xl font-bold text-gray-800">{listing.bnb.checkInTime}</p>
                    </div>
                  )}
                  {listing.bnb.checkOutTime && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-500 mb-1">Check-out before</p>
                      <p className="text-xl font-bold text-gray-800">{listing.bnb.checkOutTime}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* House rules */}
            {rules.length > 0 && (
              <div className="pb-6 border-b">
                <h2 className="text-xl font-bold text-gray-800 mb-4">House rules</h2>
                <div className="space-y-2">
                  {rules.map((rule, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                      {rule}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            {reviews.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
                  <h2 className="text-xl font-bold text-gray-800">
                    {listing.averageRating} · {reviews.length} review{reviews.length > 1 ? "s" : ""}
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {reviews.slice(0, 4).map((review, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">
                          {review.userName?.[0] || "G"}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{review.userName || "Guest"}</p>
                          <div className="flex">
                            {[...Array(5)].map((_, s) => (
                              <Star key={s} className={`w-3 h-3 ${s < review.rating ? "text-amber-400 fill-amber-400" : "text-gray-200"}`} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right — Booking card */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              {bookingSuccess ? (
                <BookingSuccess booking={bookingSuccess} onViewBookings={() => navigate("/my-bookings")} />
              ) : (
                <>
                  {/* Price */}
                  <div className="flex items-end gap-2 mb-6">
                    <span className="text-3xl font-bold text-grayald-900">
                      KES {pricePerNight.toLocaleString()}
                    </span>
                    <span className="text-gray-400 text-sm mb-1">/ night</span>
                  </div>

                  {/* Date picker */}
                  <div className="border-2 border-gray-200 rounded-2xl overflow-hidden mb-4">
                    <div className="grid grid-cols-2 divide-x divide-gray-200">
                      <div className="p-3">
                        <p className="text-xs font-bold text-gray-500 uppercase mb-1">Check-in</p>
                        <input
                          type="date"
                          value={bookingForm.checkIn}
                          min={new Date().toISOString().split("T")[0]}
                          onChange={(e) => setBookingForm((f) => ({ ...f, checkIn: e.target.value, checkOut: "" }))}
                          className="w-full text-sm text-gray-700 outline-none"
                        />
                      </div>
                      <div className="p-3">
                        <p className="text-xs font-bold text-gray-500 uppercase mb-1">Check-out</p>
                        <input
                          type="date"
                          value={bookingForm.checkOut}
                          min={bookingForm.checkIn || new Date().toISOString().split("T")[0]}
                          onChange={(e) => setBookingForm((f) => ({ ...f, checkOut: e.target.value }))}
                          className="w-full text-sm text-gray-700 outline-none"
                        />
                      </div>
                    </div>
                    <div className="border-t border-gray-200 p-3">
                      <p className="text-xs font-bold text-gray-500 uppercase mb-1">Guests</p>
                      <select
                        value={bookingForm.guests}
                        onChange={(e) => setBookingForm((f) => ({ ...f, guests: Number(e.target.value) }))}
                        className="w-full text-sm text-gray-700 outline-none"
                      >
                        {[...Array(listing.bnb?.maxGuests || 10)].map((_, i) => (
                          <option key={i + 1} value={i + 1}>{i + 1} guest{i > 0 ? "s" : ""}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Availability indicator */}
                  {bookingForm.checkIn && bookingForm.checkOut && (
                    <div className={`flex items-center gap-2 p-3 rounded-xl mb-4 text-sm ${
                      checkingAvailability ? "bg-gray-50 text-gray-500"
                      : availability?.available ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-700"
                    }`}>
                      {checkingAvailability ? (
                        <><div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" /> Checking availability...</>
                      ) : availability?.available ? (
                        <><Check className="w-4 h-4" /> Available for selected dates</>
                      ) : (
                        <><X className="w-4 h-4" /> Not available for these dates</>
                      )}
                    </div>
                  )}

                  {/* Phone */}
                  <input
                    type="tel"
                    placeholder="Your phone number (M-Pesa)"
                    value={bookingForm.guestPhone}
                    onChange={(e) => setBookingForm((f) => ({ ...f, guestPhone: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 mb-3"
                  />

                  {/* Special requests */}
                  <textarea
                    placeholder="Special requests (optional)"
                    value={bookingForm.specialRequests}
                    onChange={(e) => setBookingForm((f) => ({ ...f, specialRequests: e.target.value }))}
                    rows={2}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 resize-none mb-4"
                  />

                  {/* Price breakdown */}
                  {nights > 0 && (
                    <div className="space-y-2 mb-4 pb-4 border-b border-gray-100">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>KES {pricePerNight.toLocaleString()} × {nights} night{nights > 1 ? "s" : ""}</span>
                        <span>KES {(pricePerNight * nights).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Service fee (5%)</span>
                        <span>KES {serviceFee.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-bold text-gray-900 pt-2">
                        <span>Total</span>
                        <span>KES {total.toLocaleString()}</span>
                      </div>
                    </div>
                  )}

                  {bookingError && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm mb-4">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {bookingError}
                    </div>
                  )}

                  <button
                    onClick={handleBook}
                    disabled={bookingLoading || (availability && !availability.available)}
                    className="w-full bg-gradient-to-r from-emerald-600 to-lime-600 text-white py-4 rounded-2xl font-bold hover:from-emerald-700 hover:to-lime-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {bookingLoading ? (
                      <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
                    ) : !user ? (
                      <>Sign in to Book <ArrowRight className="w-4 h-4" /></>
                    ) : (
                      <>Reserve Now <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>

                  <p className="text-center text-xs text-gray-400 mt-3">
                    You won't be charged yet — payment is collected after host confirms
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

// ── Booking success screen ─────────────────────────────────────────────────────
function BookingSuccess({ booking, onViewBookings }) {
  return (
    <div className="text-center py-4">
      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Check className="w-8 h-8 text-emerald-600" />
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">Booking Requested!</h3>
      <p className="text-sm text-gray-500 mb-4">
        Your booking is pending host confirmation. You'll be notified once confirmed.
      </p>
      <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2 mb-5 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Check-in</span>
          <span className="font-medium">{new Date(booking.checkIn).toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Check-out</span>
          <span className="font-medium">{new Date(booking.checkOut).toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Nights</span>
          <span className="font-medium">{booking.nights}</span>
        </div>
        <div className="flex justify-between font-bold">
          <span>Total</span>
          <span className="text-emerald-700">KES {booking.totalAmount.toLocaleString()}</span>
        </div>
      </div>
      <button
        onClick={onViewBookings}
        className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition text-sm"
      >
        View My Bookings
      </button>
    </div>
  );
}