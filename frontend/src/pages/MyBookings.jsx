import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../lib/api";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useProjects } from "../context/ProjectsContext";
import {
  Calendar, MapPin, Users, Clock, CheckCircle2,
  XCircle, AlertCircle, ChevronRight, Bed, Loader2,
} from "lucide-react";

// ── Status config — all brand-* ───────────────────────────────────────────────
const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    bg: "bg-brand-100",
    text: "text-brand-800",
    border: "border-brand-300",
    icon: Clock,
    description: "Awaiting host confirmation",
  },
  confirmed: {
    label: "Confirmed",
    bg: "bg-brand-100",
    text: "text-brand-700",
    border: "border-brand-400",
    icon: CheckCircle2,
    description: "Your booking is confirmed",
  },
  cancelled: {
    label: "Cancelled",
    bg: "bg-brand-50",
    text: "text-brand-600",
    border: "border-brand-200",
    icon: XCircle,
    description: "This booking was cancelled",
  },
  completed: {
    label: "Completed",
    bg: "bg-brand-50",
    text: "text-brand-600",
    border: "border-brand-200",
    icon: CheckCircle2,
    description: "Stay completed",
  },
  rejected: {
    label: "Rejected",
    bg: "bg-brand-50",
    text: "text-brand-600",
    border: "border-brand-200",
    icon: XCircle,
    description: "Host could not accommodate this booking",
  },
};

const FILTERS = ["all", "pending", "confirmed", "completed", "cancelled"];

export default function MyBookings() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const { projects } = useProjects();

  const [bookings, setBookings]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showSearch, setShowSearch]     = useState(false);
  const [searchQuery, setSearchQuery]   = useState("");
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/bnb/user/my-bookings`, {
        headers: {
          Authorization: `Bearer ${token || localStorage.getItem("authToken")}`,
        },
      });
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch {
      setError("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!cancellingId) return;
    setCancelLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/bnb/${cancellingId}/cancel`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token || localStorage.getItem("authToken")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: cancelReason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Cancellation failed");
      fetchBookings();
      setCancellingId(null);
      setCancelReason("");
    } catch (err) {
      setError(err.message);
    } finally {
      setCancelLoading(false);
    }
  };

  const filtered = activeFilter === "all"
    ? bookings
    : bookings.filter((b) => b.status === activeFilter);

  return (
    <div className="min-h-screen bg-brand-50">

      {/* ── Cancel modal ────────────────────────────────────────────────────── */}
      {cancellingId && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-modal-title"
        >
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md border border-brand-100">
            <h3 id="cancel-modal-title" className="text-lg font-bold text-brand-900 mb-3">
              Cancel Booking
            </h3>
            <p className="text-sm text-brand-600 mb-4">
              Are you sure you want to cancel this booking? This action cannot be undone.
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Reason for cancellation (optional)"
              rows={3}
              className="w-full px-4 py-3 border-2 border-brand-200 rounded-xl text-sm text-brand-900 placeholder-brand-300 focus:outline-none focus:border-brand-500 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setCancellingId(null); setCancelReason(""); }}
                className="flex-1 py-2.5 rounded-xl border-2 border-brand-200 text-brand-700 font-semibold hover:bg-brand-50 transition text-sm"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelLoading}
                className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white font-semibold transition text-sm disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {cancelLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Cancelling...</>
                ) : (
                  "Yes, Cancel"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <Header
        showSearch={showSearch} setShowSearch={setShowSearch}
        setSearchQuery={setSearchQuery} searchQuery={searchQuery}
        showMobileMenu={showMobileMenu} setShowMobileMenu={setShowMobileMenu}
        projects={projects}
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Page header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-brand-900 mb-1">My Bookings</h1>
          <p className="text-brand-600 text-sm">Track and manage your BNB reservations across Kenya</p>
        </header>

        {/* Filter tabs */}
        <nav aria-label="Booking status filters" className="flex gap-2 mb-8 overflow-x-auto pb-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              aria-pressed={activeFilter === f}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize whitespace-nowrap transition border-2 ${
                activeFilter === f
                  ? "bg-brand-600 text-white border-brand-600"
                  : "border-brand-200 text-brand-600 hover:border-brand-400"
              }`}
            >
              {f}
              {f !== "all" && (
                <span className="ml-1.5 text-xs opacity-75">
                  ({bookings.filter((b) => b.status === f).length})
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-brand-50 border border-brand-200 rounded-xl text-brand-800 mb-6 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-brand-600" />
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading ? (
          <div className="space-y-4" aria-busy="true" aria-label="Loading bookings">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm animate-pulse border border-brand-100">
                <div className="flex gap-4">
                  <div className="w-24 h-24 bg-brand-100 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-brand-100 rounded w-2/3" />
                    <div className="h-3 bg-brand-50 rounded w-1/2" />
                    <div className="h-3 bg-brand-50 rounded w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>

        ) : filtered.length === 0 ? (
          /* Empty state */
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-10 h-10 text-brand-400" aria-hidden="true" />
            </div>
            <h2 className="text-xl font-semibold text-brand-800 mb-2">
              {activeFilter === "all" ? "No bookings yet" : `No ${activeFilter} bookings`}
            </h2>
            <p className="text-brand-500 mb-6 text-sm">
              {activeFilter === "all"
                ? "Start exploring BNBs across Kenya and make your first booking"
                : "No bookings match this filter"}
            </p>
            <Link
              to="/bnb"
              className="inline-block bg-brand-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-brand-700 transition text-sm"
            >
              Browse BNBs
            </Link>
          </div>

        ) : (
          /* Bookings list */
          <ol className="space-y-4 list-none">
            {filtered.map((booking) => (
              <li key={booking._id}>
                <BookingCard
                  booking={booking}
                  onCancel={() => setCancellingId(booking._id)}
                />
              </li>
            ))}
          </ol>
        )}
      </main>

      <Footer />
    </div>
  );
}

// ── Booking card ───────────────────────────────────────────────────────────────
function BookingCard({ booking, onCancel }) {
  const navigate = useNavigate();
  const config = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
  const StatusIcon = config.icon;

  const listing = booking.listingId;
  const image   = booking.listingImage || listing?.images?.[0] || null;
  const title   = booking.listingTitle || listing?.title || "BNB Listing";
  const location = listing
    ? [listing.town, listing.county].filter(Boolean).join(", ")
    : "";

  const canCancel = ["pending", "confirmed"].includes(booking.status);

  const fmt = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-KE", {
      weekday: "short", day: "numeric", month: "short", year: "numeric",
    });

  return (
    <article className="bg-white rounded-2xl shadow-sm border border-brand-100 overflow-hidden hover:shadow-md transition">
      <div className="flex flex-col sm:flex-row">

        {/* Image */}
        <div className="sm:w-40 h-40 sm:h-auto flex-shrink-0 bg-brand-50">
          {image ? (
            <img
              src={image}
              alt={`${title} — BNB booking`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Bed className="w-10 h-10 text-brand-200" aria-hidden="true" />
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 p-5">
          {/* Title + status badge */}
          <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
            <div>
              <h2
                className="font-semibold text-brand-900 hover:text-brand-600 cursor-pointer transition text-base"
                onClick={() => listing?._id && navigate(`/bnb/${listing._id}`)}
              >
                {title}
              </h2>
              {location && (
                <div className="flex items-center gap-1 text-xs text-brand-400 mt-1">
                  <MapPin className="w-3 h-3" aria-hidden="true" />
                  {location}
                </div>
              )}
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${config.bg} ${config.text} ${config.border}`}
              aria-label={`Booking status: ${config.label}`}
            >
              <StatusIcon className="w-3.5 h-3.5" aria-hidden="true" />
              {config.label}
            </span>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-brand-50 rounded-xl p-3">
              <p className="text-xs text-brand-400 mb-0.5">Check-in</p>
              <p className="text-sm font-semibold text-brand-800">{fmt(booking.checkIn)}</p>
            </div>
            <div className="bg-brand-50 rounded-xl p-3">
              <p className="text-xs text-brand-400 mb-0.5">Check-out</p>
              <p className="text-sm font-semibold text-brand-800">{fmt(booking.checkOut)}</p>
            </div>
          </div>

          {/* Meta */}
          <div className="flex items-center gap-4 text-xs text-brand-500 mb-4 flex-wrap">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
              {booking.nights} night{booking.nights > 1 ? "s" : ""}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" aria-hidden="true" />
              {booking.guests} guest{booking.guests > 1 ? "s" : ""}
            </span>
            <span className="font-bold text-brand-700 text-sm">
              KES {booking.totalAmount?.toLocaleString()}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              booking.paymentStatus === "paid"
                ? "bg-brand-100 text-brand-700"
                : "bg-brand-50 text-brand-500 border border-brand-200"
            }`}>
              {booking.paymentStatus === "paid" ? "Paid" : "Payment pending"}
            </span>
          </div>

          {/* Status description */}
          <p className="text-xs text-brand-400 italic mb-4">{config.description}</p>

          {/* Actions */}
          <div className="flex gap-4 flex-wrap items-center">
            {listing?._id && (
              <button
                onClick={() => navigate(`/bnb/${listing._id}`)}
                className="flex items-center gap-1 text-sm text-brand-600 hover:text-brand-800 font-medium transition"
                aria-label={`View listing: ${title}`}
              >
                View listing
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
            {canCancel && (
              <button
                onClick={onCancel}
                className="text-sm text-brand-500 hover:text-brand-800 font-medium transition border-b border-transparent hover:border-brand-500"
                aria-label={`Cancel booking for ${title}`}
              >
                Cancel booking
              </button>
            )}
            {booking.cancellationReason && (
              <p className="text-xs text-brand-400 w-full italic">
                Reason: {booking.cancellationReason}
              </p>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}