import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../lib/api";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useProjects } from "../context/ProjectsContext";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  Bed,
} from "lucide-react";

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    bg: "bg-amber-100",
    text: "text-amber-800",
    border: "border-amber-300",
    icon: Clock,
    description: "Awaiting host confirmation",
  },
  confirmed: {
    label: "Confirmed",
    bg: "bg-emerald-100",
    text: "text-emerald-800",
    border: "border-emerald-300",
    icon: CheckCircle2,
    description: "Your booking is confirmed",
  },
  cancelled: {
    label: "Cancelled",
    bg: "bg-red-100",
    text: "text-red-800",
    border: "border-red-300",
    icon: XCircle,
    description: "This booking was cancelled",
  },
  completed: {
    label: "Completed",
    bg: "bg-gray-100",
    text: "text-gray-700",
    border: "border-gray-300",
    icon: CheckCircle2,
    description: "Stay completed",
  },
  rejected: {
    label: "Rejected",
    bg: "bg-red-100",
    text: "text-red-800",
    border: "border-red-300",
    icon: XCircle,
    description: "Host could not accommodate this booking",
  },
};

export default function MyBookings() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const { projects } = useProjects();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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
    } catch (err) {
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

  const filters = ["all", "pending", "confirmed", "completed", "cancelled"];

  const filtered = activeFilter === "all"
    ? bookings
    : bookings.filter((b) => b.status === activeFilter);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cancel modal */}
      {cancellingId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Cancel Booking</h3>
            <p className="text-sm text-gray-500 mb-4">
              Are you sure you want to cancel this booking? This action cannot be undone.
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Reason for cancellation (optional)"
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-400 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setCancellingId(null); setCancelReason(""); }}
                className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition text-sm"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelLoading}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition text-sm disabled:opacity-50"
              >
                {cancelLoading ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Header
        showSearch={showSearch}
        setShowSearch={setShowSearch}
        setSearchQuery={setSearchQuery}
        searchQuery={searchQuery}
        showMobileMenu={showMobileMenu}
        setShowMobileMenu={setShowMobileMenu}
        projects={projects}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">My Bookings</h1>
          <p className="text-gray-500">Track and manage your BNB reservations</p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize whitespace-nowrap transition border-2 ${
                activeFilter === f
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "border-gray-200 text-gray-600 hover:border-emerald-400"
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
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 mb-6 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
                <div className="flex gap-4">
                  <div className="w-24 h-24 bg-gray-200 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                    <div className="h-3 bg-gray-100 rounded w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {activeFilter === "all" ? "No bookings yet" : `No ${activeFilter} bookings`}
            </h3>
            <p className="text-gray-400 mb-6">
              {activeFilter === "all"
                ? "Start exploring BNBs and make your first booking"
                : "No bookings match this filter"}
            </p>
            <Link
              to="/bnb"
              className="inline-block bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition"
            >
              Browse BNBs
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((booking) => (
              <BookingCard
                key={booking._id}
                booking={booking}
                onCancel={() => setCancellingId(booking._id)}
              />
            ))}
          </div>
        )}
      </div>

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
  const image = booking.listingImage || listing?.images?.[0] || null;
  const title = booking.listingTitle || listing?.title || "BNB Listing";
  const location = listing
    ? [listing.town, listing.county].filter(Boolean).join(", ")
    : "";

  const canCancel = ["pending", "confirmed"].includes(booking.status);
  const checkInDate = new Date(booking.checkIn).toLocaleDateString("en-KE", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  });
  const checkOutDate = new Date(booking.checkOut).toLocaleDateString("en-KE", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <div className="sm:w-40 h-40 sm:h-auto flex-shrink-0 bg-gray-100">
          {image ? (
            <img src={image} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Bed className="w-10 h-10 text-gray-200" />
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 p-5">
          <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
            <div>
              <h3
                className="font-semibold text-gray-800 hover:text-emerald-700 cursor-pointer transition"
                onClick={() => listing?._id && navigate(`/bnb/${listing._id}`)}
              >
                {title}
              </h3>
              {location && (
                <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                  <MapPin className="w-3 h-3" />
                  {location}
                </div>
              )}
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border} flex items-center gap-1.5`}>
              <StatusIcon className="w-3.5 h-3.5" />
              {config.label}
            </span>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-0.5">Check-in</p>
              <p className="text-sm font-semibold text-gray-700">{checkInDate}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-0.5">Check-out</p>
              <p className="text-sm font-semibold text-gray-700">{checkOutDate}</p>
            </div>
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-4 text-xs text-gray-500 mb-4 flex-wrap">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {booking.nights} night{booking.nights > 1 ? "s" : ""}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {booking.guests} guest{booking.guests > 1 ? "s" : ""}
            </span>
            <span className="font-semibold text-emerald-700 text-sm">
              KES {booking.totalAmount?.toLocaleString()}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              booking.paymentStatus === "paid"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-700"
            }`}>
              {booking.paymentStatus === "paid" ? "Paid" : "Payment pending"}
            </span>
          </div>

          {/* Status message */}
          <p className="text-xs text-gray-400 italic mb-4">{config.description}</p>

          {/* Actions */}
          <div className="flex gap-3 flex-wrap">
            {listing?._id && (
              <button
                onClick={() => navigate(`/bnb/${listing._id}`)}
                className="flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                View listing <ChevronRight className="w-4 h-4" />
              </button>
            )}
            {canCancel && (
              <button
                onClick={onCancel}
                className="text-sm text-red-500 hover:text-red-700 font-medium"
              >
                Cancel booking
              </button>
            )}
            {booking.cancellationReason && (
              <p className="text-xs text-red-400 w-full">
                Reason: {booking.cancellationReason}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}