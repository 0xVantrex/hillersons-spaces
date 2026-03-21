import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../lib/api";
import {
  LayoutDashboard,
  ListPlus,
  Package,
  LogOut,
  User,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  Trash2,
  MapPin,
  Tag,
  Calendar,
  Users,
  Phone,
  Mail,
  Heart,
} from "lucide-react";

const LISTING_TYPE_LABELS = {
  housePlan: "House Plan",
  land: "Land",
  house: "House / Property",
  bnb: "BNB",
  book: "Book",
  service: "Service",
};

const LISTING_STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-800 border-amber-300",
  approved: "bg-emerald-100 text-emerald-800 border-emerald-300",
  rejected: "bg-red-100 text-red-800 border-red-300",
  draft: "bg-gray-100 text-gray-600 border-gray-300",
  archived: "bg-gray-100 text-gray-500 border-gray-200",
};

const BOOKING_STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-800 border-amber-300",
  confirmed: "bg-emerald-100 text-emerald-800 border-emerald-300",
  cancelled: "bg-red-100 text-red-700 border-red-300",
  completed: "bg-gray-100 text-gray-700 border-gray-300",
  rejected: "bg-red-100 text-red-800 border-red-300",
};

export default function VendorDashboard() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [listings, setListings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [error, setError] = useState("");
  const [bookingFilter, setBookingFilter] = useState("all");

  const isBnbHost = user?.role === "bnbHost" || user?.role === "admin";

  const authHeaders = {
    Authorization: `Bearer ${token || localStorage.getItem("authToken")}`,
    "Content-Type": "application/json",
  };

  // ── Fetch listings ──────────────────────────────────────────────────────────
  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/listings/vendor/mine`, {
        headers: authHeaders,
      });
      const data = await res.json();
      setListings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch listings:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // ── Fetch bookings (BNB hosts only) ────────────────────────────────────────
  const fetchBookings = useCallback(async () => {
    if (!isBnbHost) return;
    setBookingsLoading(true);
    try {
      const url = bookingFilter === "all"
        ? `${API_BASE_URL}/api/bnb/host/bookings`
        : `${API_BASE_URL}/api/bnb/host/bookings?status=${bookingFilter}`;
      const res = await fetch(url, { headers: authHeaders });
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    } finally {
      setBookingsLoading(false);
    }
  }, [token, bookingFilter, isBnbHost]);

  useEffect(() => { fetchListings(); }, [fetchListings]);
  useEffect(() => { if (activeTab === "bookings") fetchBookings(); }, [activeTab, fetchBookings]);

  // ── Actions ─────────────────────────────────────────────────────────────────
  const deleteListing = async (id) => {
    if (!window.confirm("Delete this listing?")) return;
    try {
      await fetch(`${API_BASE_URL}/api/listings/${id}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      fetchListings();
    } catch (err) {
      setError("Failed to delete listing.");
    }
  };

  const handleBookingAction = async (bookingId, action) => {
    const url = `${API_BASE_URL}/api/bnb/host/${bookingId}/${action}`;
    try {
      const res = await fetch(url, { method: "PATCH", headers: authHeaders });
      if (!res.ok) throw new Error("Action failed");
      fetchBookings();
    } catch (err) {
      setError(`Failed to ${action} booking.`);
    }
  };

  const handleLogout = () => { logout(); navigate("/login"); };

  // ── Stats ───────────────────────────────────────────────────────────────────
  const stats = {
    total: listings.length,
    approved: listings.filter((l) => l.status === "approved").length,
    pending: listings.filter((l) => l.status === "pending").length,
    totalLikes: listings.reduce((s, l) => s + (l.likes_count || 0), 0),
    totalViews: listings.reduce((s, l) => s + (l.views_count || 0), 0),
    pendingBookings: bookings.filter((b) => b.status === "pending").length,
    confirmedBookings: bookings.filter((b) => b.status === "confirmed").length,
    totalRevenue: bookings
      .filter((b) => ["confirmed", "completed"].includes(b.status))
      .reduce((s, b) => s + (b.totalAmount || 0), 0),
  };

  // ── Tabs ────────────────────────────────────────────────────────────────────
  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "listings", label: "My Listings", icon: Package },
    ...(isBnbHost ? [{ id: "bookings", label: "Bookings", icon: Calendar }] : []),
    { id: "new", label: "New Listing", icon: ListPlus },
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <Link to="/" className="text-emerald-600 font-bold text-xl">Hillersons</Link>
              <span className="text-gray-300">|</span>
              <span className="text-gray-600 font-medium">Vendor Dashboard</span>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold capitalize">
                {user?.role}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500 hidden sm:block">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition font-medium"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <nav className="flex gap-1 bg-white rounded-xl p-1 shadow-sm mb-8 overflow-x-auto">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                activeTab === id
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {id === "bookings" && stats.pendingBookings > 0 && (
                <span className="w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
                  {stats.pendingBookings}
                </span>
              )}
            </button>
          ))}
        </nav>

        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 mb-6 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
            <button onClick={() => setError("")} className="ml-auto text-red-400 hover:text-red-600">
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── OVERVIEW ── */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Welcome banner */}
            <div className="bg-emerald-600 rounded-2xl p-6 text-white">
              <h2 className="text-2xl font-bold mb-1">
                Welcome back, {user?.name?.split(" ")[0]}
              </h2>
              <p className="text-emerald-100 text-sm">
                {user?.vendorProfile?.businessName || "Your vendor dashboard"}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Listings", value: stats.total, icon: Package, color: "emerald" },
                { label: "Approved", value: stats.approved, icon: CheckCircle2, color: "emerald" },
                { label: "Pending Review", value: stats.pending, icon: Clock, color: "amber" },
                { label: "Total Views", value: stats.totalViews, icon: Eye, color: "blue" },
                ...(isBnbHost ? [
                  { label: "Pending Bookings", value: stats.pendingBookings, icon: Calendar, color: "amber" },
                  { label: "Confirmed Bookings", value: stats.confirmedBookings, icon: CheckCircle2, color: "emerald" },
                  { label: "Total Likes", value: stats.totalLikes, icon: Heart, color: "red" },
                  { label: "Revenue (KES)", value: stats.totalRevenue.toLocaleString(), icon: Users, color: "green" },
                ] : [
                  { label: "Total Likes", value: stats.totalLikes, icon: Heart, color: "red" },
                ]),
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-gray-500 text-sm">{label}</p>
                    <Icon className={`w-5 h-5 text-${color}-500`} />
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{value}</p>
                </div>
              ))}
            </div>

            {/* Recent listings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="px-6 py-4 border-b flex justify-between items-center">
                <h3 className="font-semibold text-gray-800">Recent Listings</h3>
                <button
                  onClick={() => setActiveTab("listings")}
                  className="text-sm text-emerald-600 hover:underline font-medium flex items-center gap-1"
                >
                  View all <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              {loading ? (
                <div className="p-6 text-center text-gray-400">Loading...</div>
              ) : listings.length === 0 ? (
                <div className="p-10 text-center">
                  <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No listings yet</p>
                  <button
                    onClick={() => setActiveTab("new")}
                    className="mt-4 bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition"
                  >
                    Create your first listing
                  </button>
                </div>
              ) : (
                <div className="divide-y">
                  {listings.slice(0, 5).map((listing) => (
                    <ListingRow key={listing._id} listing={listing} onDelete={deleteListing} />
                  ))}
                </div>
              )}
            </div>

            {/* Recent bookings preview (BNB hosts) */}
            {isBnbHost && bookings.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="px-6 py-4 border-b flex justify-between items-center">
                  <h3 className="font-semibold text-gray-800">Recent Bookings</h3>
                  <button
                    onClick={() => setActiveTab("bookings")}
                    className="text-sm text-emerald-600 hover:underline font-medium flex items-center gap-1"
                  >
                    View all <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="divide-y">
                  {bookings.slice(0, 3).map((b) => (
                    <BookingRow key={b._id} booking={b} onAction={handleBookingAction} compact />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── MY LISTINGS ── */}
        {activeTab === "listings" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">All Listings ({listings.length})</h3>
              <button
                onClick={() => setActiveTab("new")}
                className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition flex items-center gap-2"
              >
                <ListPlus className="w-4 h-4" />
                New Listing
              </button>
            </div>
            {loading ? (
              <div className="p-6 text-center text-gray-400">Loading...</div>
            ) : listings.length === 0 ? (
              <div className="p-10 text-center">
                <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500">No listings yet</p>
              </div>
            ) : (
              <div className="divide-y">
                {listings.map((listing) => (
                  <ListingRow key={listing._id} listing={listing} onDelete={deleteListing} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── BOOKINGS (BNB hosts) ── */}
        {activeTab === "bookings" && isBnbHost && (
          <div className="space-y-6">
            {/* Filter tabs */}
            <div className="flex gap-2 bg-white rounded-xl p-1 shadow-sm overflow-x-auto">
              {["all", "pending", "confirmed", "completed", "cancelled"].map((f) => (
                <button
                  key={f}
                  onClick={() => setBookingFilter(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition whitespace-nowrap ${
                    bookingFilter === f
                      ? "bg-emerald-600 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {f}
                  {f !== "all" && (
                    <span className="ml-1 text-xs opacity-70">
                      ({bookings.filter((b) => b.status === f).length})
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="px-6 py-4 border-b">
                <h3 className="font-semibold text-gray-800 capitalize">
                  {bookingFilter === "all" ? "All" : bookingFilter} Bookings ({bookings.filter((b) => bookingFilter === "all" || b.status === bookingFilter).length})
                </h3>
              </div>

              {bookingsLoading ? (
                <div className="p-8 text-center text-gray-400">Loading...</div>
              ) : bookings.filter((b) => bookingFilter === "all" || b.status === bookingFilter).length === 0 ? (
                <div className="p-10 text-center">
                  <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500">No {bookingFilter === "all" ? "" : bookingFilter} bookings yet</p>
                </div>
              ) : (
                <div className="divide-y">
                  {bookings
                    .filter((b) => bookingFilter === "all" || b.status === bookingFilter)
                    .map((b) => (
                      <BookingRow key={b._id} booking={b} onAction={handleBookingAction} />
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── NEW LISTING ── */}
        {activeTab === "new" && (
          <NewListingForm
            token={token}
            userRole={user?.role}
            onSuccess={() => { fetchListings(); setActiveTab("listings"); }}
          />
        )}

        {/* ── PROFILE ── */}
        {activeTab === "profile" && (
          <VendorProfile user={user} token={token} />
        )}
      </div>
    </div>
  );
}

// ── Listing row ────────────────────────────────────────────────────────────────
function ListingRow({ listing, onDelete }) {
  return (
    <div className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition">
      {listing.images?.[0] ? (
        <img src={listing.images[0]} alt={listing.title} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
      ) : (
        <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
          <Package className="w-6 h-6 text-gray-300" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-800 truncate">{listing.title}</p>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Tag className="w-3 h-3" />
            {LISTING_TYPE_LABELS[listing.listingType] || listing.listingType}
          </span>
          {listing.location && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {listing.location}
            </span>
          )}
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {listing.views_count || 0}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${LISTING_STATUS_STYLES[listing.status] || LISTING_STATUS_STYLES.draft}`}>
          {listing.status}
        </span>
        {listing.price && (
          <span className="text-sm font-bold text-emerald-700 hidden sm:block">
            KES {Number(listing.price).toLocaleString()}
          </span>
        )}
        <button
          onClick={() => onDelete(listing._id)}
          className="p-2 text-gray-400 hover:text-red-600 transition rounded-lg hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ── Booking row ────────────────────────────────────────────────────────────────
function BookingRow({ booking, onAction, compact = false }) {
  const guest = booking.guestId;
  const listing = booking.listingId;
  const checkIn = new Date(booking.checkIn).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
  const checkOut = new Date(booking.checkOut).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="px-6 py-5 hover:bg-gray-50 transition">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          {/* Guest info */}
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm flex-shrink-0">
              {(guest?.name || booking.guestName || "G")[0].toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">
                {guest?.name || booking.guestName || "Guest"}
              </p>
              <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                {(guest?.email || booking.guestEmail) && (
                  <a href={`mailto:${guest?.email || booking.guestEmail}`} className="flex items-center gap-1 hover:text-emerald-600">
                    <Mail className="w-3 h-3" />
                    {guest?.email || booking.guestEmail}
                  </a>
                )}
                {booking.guestPhone && (
                  <a href={`tel:${booking.guestPhone}`} className="flex items-center gap-1 hover:text-emerald-600">
                    <Phone className="w-3 h-3" />
                    {booking.guestPhone}
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Listing title */}
          {listing?.title && (
            <p className="text-xs text-gray-500 mb-2">
              Listing: <span className="font-medium text-gray-700">{listing.title || booking.listingTitle}</span>
            </p>
          )}

          {/* Dates + details */}
          <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {checkIn} → {checkOut}
            </span>
            <span>{booking.nights} night{booking.nights > 1 ? "s" : ""}</span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {booking.guests} guest{booking.guests > 1 ? "s" : ""}
            </span>
            <span className="font-semibold text-emerald-700">
              KES {booking.totalAmount?.toLocaleString()}
            </span>
          </div>

          {booking.specialRequests && !compact && (
            <p className="text-xs text-gray-400 mt-2 italic">
              Request: {booking.specialRequests}
            </p>
          )}
        </div>

        {/* Status + Actions */}
        <div className="flex flex-col items-end gap-3 flex-shrink-0">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${BOOKING_STATUS_STYLES[booking.status] || ""}`}>
            {booking.status}
          </span>

          {!compact && booking.status === "pending" && (
            <div className="flex gap-2">
              <button
                onClick={() => onAction(booking._id, "confirm")}
                className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition"
              >
                Confirm
              </button>
              <button
                onClick={() => onAction(booking._id, "reject")}
                className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-200 transition"
              >
                Reject
              </button>
            </div>
          )}
          {!compact && booking.status === "confirmed" && (
            <button
              onClick={() => onAction(booking._id, "complete")}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200 transition"
            >
              Mark Complete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── New listing form ───────────────────────────────────────────────────────────
function NewListingForm({ token, userRole, onSuccess }) {
  const [form, setForm] = useState({
    listingType: "",
    title: "",
    description: "",
    price: "",
    location: "",
    county: "",
    town: "",
    // BNB specific
    pricePerNight: "",
    maxGuests: "",
    bedrooms: "",
    bathrooms: "",
    checkInTime: "14:00",
    checkOutTime: "11:00",
    amenities: [],
    rules: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const toggleAmenity = (amenity) => {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(amenity)
        ? f.amenities.filter((a) => a !== amenity)
        : [...f.amenities, amenity],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.listingType) return setError("Please select a listing type.");
    if (!form.title.trim()) return setError("Title is required.");
    if (!form.description.trim()) return setError("Description is required.");

    setLoading(true);
    setError("");

    const body = {
      listingType: form.listingType,
      title: form.title,
      description: form.description,
      price: form.listingType === "bnb" ? Number(form.pricePerNight) : (form.price ? Number(form.price) : undefined),
      location: form.location,
      county: form.county,
      town: form.town,
    };

    if (form.listingType === "bnb") {
      body.bnb = {
        pricePerNight: Number(form.pricePerNight),
        maxGuests: Number(form.maxGuests) || 1,
        bedrooms: Number(form.bedrooms) || 1,
        bathrooms: Number(form.bathrooms) || 1,
        checkInTime: form.checkInTime,
        checkOutTime: form.checkOutTime,
        amenities: form.amenities,
        rules: form.rules ? form.rules.split("\n").filter(Boolean) : [],
      };
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/listings`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token || localStorage.getItem("authToken")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create listing");
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const availableTypes = Object.entries(LISTING_TYPE_LABELS).filter(([id]) => {
    if (userRole === "bnbHost") return id === "bnb";
    if (userRole === "contractor") return id === "service";
    return true;
  });

  const AMENITY_OPTIONS = ["wifi", "parking", "pool", "ac", "breakfast", "security"];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
      <h3 className="text-xl font-bold text-gray-800 mb-6">Create New Listing</h3>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 mb-6 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Listing type */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Listing Type <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {availableTypes.map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setForm((f) => ({ ...f, listingType: id }))}
                className={`p-3 rounded-xl border-2 text-sm font-medium transition ${
                  form.listingType === id
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-gray-200 text-gray-600 hover:border-emerald-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Common fields */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Title <span className="text-red-500">*</span></label>
          <input name="title" value={form.title} onChange={handleChange}
            placeholder="e.g. Cozy Studio in Karen"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 transition" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Description <span className="text-red-500">*</span></label>
          <textarea name="description" value={form.description} onChange={handleChange}
            placeholder="Describe your listing in detail..."
            rows={4}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 transition resize-none" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
            <input name="location" value={form.location} onChange={handleChange}
              placeholder="e.g. Karen, Nairobi"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 transition" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">County</label>
            <input name="county" value={form.county} onChange={handleChange}
              placeholder="e.g. Nairobi"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 transition" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Town / Area</label>
            <input name="town" value={form.town} onChange={handleChange}
              placeholder="e.g. Karen"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 transition" />
          </div>
        </div>

        {/* BNB-specific fields */}
        {form.listingType === "bnb" && (
          <div className="space-y-5 border-t pt-5">
            <h4 className="font-semibold text-gray-700">BNB Details</h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Price per Night (KES) <span className="text-red-500">*</span></label>
                <input name="pricePerNight" type="number" value={form.pricePerNight} onChange={handleChange}
                  placeholder="e.g. 5000"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 transition" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Max Guests</label>
                <input name="maxGuests" type="number" value={form.maxGuests} onChange={handleChange}
                  placeholder="e.g. 4" min="1"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 transition" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Bedrooms</label>
                <input name="bedrooms" type="number" value={form.bedrooms} onChange={handleChange}
                  placeholder="e.g. 2" min="1"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 transition" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Bathrooms</label>
                <input name="bathrooms" type="number" value={form.bathrooms} onChange={handleChange}
                  placeholder="e.g. 1" min="1"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 transition" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Check-in Time</label>
                <input name="checkInTime" type="time" value={form.checkInTime} onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 transition" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Check-out Time</label>
                <input name="checkOutTime" type="time" value={form.checkOutTime} onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 transition" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Amenities</label>
              <div className="flex flex-wrap gap-2">
                {AMENITY_OPTIONS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => toggleAmenity(a)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border-2 capitalize transition ${
                      form.amenities.includes(a)
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-gray-200 text-gray-600 hover:border-emerald-300"
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">House Rules (one per line)</label>
              <textarea name="rules" value={form.rules} onChange={handleChange}
                placeholder="No smoking&#10;No pets&#10;No parties"
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 transition resize-none" />
            </div>
          </div>
        )}

        {/* Price for non-BNB */}
        {form.listingType && form.listingType !== "bnb" && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Price (KES)</label>
            <input name="price" type="number" value={form.price} onChange={handleChange}
              placeholder="e.g. 250000"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 transition" />
          </div>
        )}

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
          Your listing will be submitted for admin review before going live.
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Submitting...</>
          ) : "Submit for Approval"}
        </button>
      </form>
    </div>
  );
}

// ── Vendor profile tab ─────────────────────────────────────────────────────────
function VendorProfile({ user, token }) {
  const [form, setForm] = useState({
    businessName: user?.vendorProfile?.businessName || "",
    businessDescription: user?.vendorProfile?.businessDescription || "",
    location: user?.vendorProfile?.location || "",
    phone: user?.vendorProfile?.phone || user?.phone || "",
    website: user?.vendorProfile?.website || "",
    specialization: user?.vendorProfile?.specialization || "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const res = await fetch(`${API_BASE_URL}/api/vendor/profile`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token || localStorage.getItem("authToken")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: "businessName", label: "Business Name" },
    { name: "location", label: "Location" },
    { name: "phone", label: "Phone" },
    { name: "website", label: "Website" },
    ...(user?.role === "contractor" ? [{ name: "specialization", label: "Specialization" }] : []),
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 max-w-2xl">
      <h3 className="text-xl font-bold text-gray-800 mb-6">Vendor Profile</h3>

      {success && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 mb-6 text-sm">
          <CheckCircle2 className="w-5 h-5" />
          Profile updated successfully.
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 mb-6 text-sm">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      <div className="space-y-5">
        {fields.map(({ name, label }) => (
          <div key={name}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
            <input
              name={name}
              value={form[name]}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 transition"
            />
          </div>
        ))}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Business Description</label>
          <textarea
            name="businessDescription"
            value={form.businessDescription}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 transition resize-none"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-bold hover:bg-emerald-700 transition disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}