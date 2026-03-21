import React, { useState, useEffect, useCallback, useId } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../lib/api";
import {
  LayoutDashboard, ListPlus, Package, LogOut, User,
  Eye, Clock, CheckCircle2, XCircle, AlertCircle,
  ChevronRight, Trash2, MapPin, Tag, Calendar,
  Users, Phone, Mail, Heart,
} from "lucide-react";

/* ─── Constants ───────────────────────────────────────────────── */
const LISTING_TYPE_LABELS = {
  housePlan: "House Plan",
  land:      "Land",
  house:     "House / Property",
  bnb:       "BNB",
  book:      "Book",
  service:   "Service",
};

// ✅ Bug fix: no dynamic Tailwind color interpolation — use full static class strings
const STAT_ICON_COLORS = {
  brand:  "text-brand-500",
  lime:   "text-lime-500",
  red:    "text-red-500",
  amber:  "text-amber-500",
  gray:   "text-gray-400",
};

const LISTING_STATUS_STYLES = {
  pending:  "bg-amber-50  text-amber-800  border-amber-200",
  approved: "bg-brand-50  text-brand-800  border-brand-200",
  rejected: "bg-red-50    text-red-700    border-red-200",
  draft:    "bg-gray-100  text-gray-600   border-gray-200",
  archived: "bg-gray-50   text-gray-500   border-gray-100",
};

const BOOKING_STATUS_STYLES = {
  pending:   "bg-amber-50 text-amber-800 border-amber-200",
  confirmed: "bg-brand-50 text-brand-800 border-brand-200",
  cancelled: "bg-red-50   text-red-700   border-red-200",
  completed: "bg-gray-100 text-gray-700  border-gray-200",
  rejected:  "bg-red-50   text-red-800   border-red-200",
};

const AMENITY_OPTIONS = [
  { id: "wifi",      label: "Wi-Fi" },
  { id: "parking",   label: "Parking" },
  { id: "pool",      label: "Pool" },
  { id: "ac",        label: "Air Con" },
  { id: "breakfast", label: "Breakfast" },
  { id: "security",  label: "Security" },
];

/* ─── Shared input class ──────────────────────────────────────── */
const inputCls =
  "w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm " +
  "focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 " +
  "hover:border-gray-300 transition placeholder-gray-400";

/* ─── Inline alert ────────────────────────────────────────────── */
function InlineAlert({ type, message, onDismiss }) {
  if (!message) return null;
  const styles = {
    success: "bg-brand-50 border-brand-200 text-brand-800",
    error:   "bg-red-50   border-red-200   text-red-700",
    warn:    "bg-amber-50 border-amber-200  text-amber-800",
  };
  const Icon = type === "success" ? CheckCircle2 : AlertCircle;
  return (
    <div
      role={type === "error" ? "alert" : "status"}
      aria-live="polite"
      className={`flex items-start gap-3 p-4 border rounded-xl text-sm mb-6 ${styles[type]}`}
    >
      <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
      <span className="flex-1">{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          className="ml-auto opacity-60 hover:opacity-100 transition"
        >
          <XCircle className="w-4 h-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

/* ─── Confirm modal ───────────────────────────────────────────── */
function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === "Escape") onCancel(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} aria-hidden="true" />
      <div
        role="dialog" aria-modal="true"
        aria-labelledby="confirm-title" aria-describedby="confirm-desc"
        className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-7 z-10"
      >
        <div className="flex items-start gap-4 mb-6">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-red-600" aria-hidden="true" />
          </div>
          <div>
            <h2 id="confirm-title" className="font-semibold text-gray-900 mb-1">{title}</h2>
            <p id="confirm-desc"   className="text-sm text-gray-500 leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition focus:outline-none focus:ring-2 focus:ring-brand-400"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Skeleton ────────────────────────────────────────────────── */
function RowSkeleton({ rows = 3 }) {
  return (
    <div className="divide-y animate-pulse" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-6 py-4">
          <div className="w-14 h-14 rounded-xl bg-gray-100 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-100 rounded w-48" />
            <div className="h-3 bg-gray-100 rounded w-32" />
          </div>
          <div className="h-6 bg-gray-100 rounded w-20" />
        </div>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════ */
export default function VendorDashboard() {
  const { user, token, logout } = useAuth(); // ✅ AuthContext only — no localStorage
  const navigate = useNavigate();

  const [activeTab,       setActiveTab]       = useState("overview");
  const [listings,        setListings]        = useState([]);
  const [bookings,        setBookings]        = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [globalError,     setGlobalError]     = useState("");
  const [bookingFilter,   setBookingFilter]   = useState("all");
  const [deleteTarget,    setDeleteTarget]    = useState(null); // listing to confirm delete

  const isBnbHost = user?.role === "bnbHost" || user?.role === "admin";

  // ✅ Bug fix: memoized headers so useCallback deps are stable
  const authHeaders = useCallback(() => ({
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  }), [token]);

  /* ── Fetch listings ── */
  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/listings/vendor/mine`, {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch listings.");
      const data = await res.json();
      setListings(Array.isArray(data) ? data : []);
    } catch (err) {
      setGlobalError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, authHeaders]);

  /* ── Fetch bookings ── */
  const fetchBookings = useCallback(async () => {
    if (!isBnbHost) return;
    setBookingsLoading(true);
    try {
      const url = bookingFilter === "all"
        ? `${API_BASE_URL}/api/bnb/host/bookings`
        : `${API_BASE_URL}/api/bnb/host/bookings?status=${bookingFilter}`;
      const res = await fetch(url, { headers: authHeaders() });
      if (!res.ok) throw new Error("Failed to fetch bookings.");
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      setGlobalError(err.message);
    } finally {
      setBookingsLoading(false);
    }
  }, [token, bookingFilter, isBnbHost, authHeaders]);

  useEffect(() => { fetchListings(); }, [fetchListings]);
  useEffect(() => { if (activeTab === "bookings") fetchBookings(); }, [activeTab, fetchBookings]);

  /* ── Delete listing ── */
  const confirmDelete = (listing) => setDeleteTarget(listing);
  const cancelDelete  = () => setDeleteTarget(null);

  const executDelete = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget._id;
    setDeleteTarget(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/listings/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Failed to delete listing.");
      fetchListings();
    } catch (err) {
      setGlobalError(err.message);
    }
  };

  /* ── Booking action ── */
  const handleBookingAction = async (bookingId, action) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/bnb/host/${bookingId}/${action}`, {
        method: "PATCH",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`Failed to ${action} booking.`);
      fetchBookings();
    } catch (err) {
      setGlobalError(err.message);
    }
  };

  /* ── Stats ── */
  const stats = {
    total:             listings.length,
    approved:          listings.filter((l) => l.status === "approved").length,
    pending:           listings.filter((l) => l.status === "pending").length,
    totalLikes:        listings.reduce((s, l) => s + (l.likes_count  || 0), 0),
    totalViews:        listings.reduce((s, l) => s + (l.views_count  || 0), 0),
    pendingBookings:   bookings.filter((b) => b.status === "pending").length,
    confirmedBookings: bookings.filter((b) => b.status === "confirmed").length,
    totalRevenue:      bookings
      .filter((b) => ["confirmed","completed"].includes(b.status))
      .reduce((s, b) => s + (b.totalAmount || 0), 0),
  };

  const tabs = [
    { id: "overview",  label: "Overview",     Icon: LayoutDashboard },
    { id: "listings",  label: "My Listings",  Icon: Package },
    ...(isBnbHost ? [{ id: "bookings", label: "Bookings", Icon: Calendar }] : []),
    { id: "new",       label: "New Listing",  Icon: ListPlus },
    { id: "profile",   label: "Profile",      Icon: User },
  ];

  const overviewStats = [
    { label: "Total Listings",  value: stats.total,    Icon: Package,       color: "brand" },
    { label: "Approved",        value: stats.approved, Icon: CheckCircle2,  color: "brand" },
    { label: "Pending Review",  value: stats.pending,  Icon: Clock,         color: "amber" },
    { label: "Total Views",     value: stats.totalViews, Icon: Eye,         color: "gray"  },
    ...(isBnbHost ? [
      { label: "Pending Bookings",   value: stats.pendingBookings,   Icon: Calendar,    color: "amber" },
      { label: "Confirmed Bookings", value: stats.confirmedBookings, Icon: CheckCircle2,color: "brand" },
      { label: "Total Likes",        value: stats.totalLikes,        Icon: Heart,       color: "red"   },
      { label: "Revenue (KES)",      value: stats.totalRevenue.toLocaleString("en-KE"), Icon: Users, color: "brand" },
    ] : [
      { label: "Total Likes", value: stats.totalLikes, Icon: Heart, color: "red" },
    ]),
  ];

  /* ═══════════════════════════════════════════════════════════ */
  return (
    <>
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete this listing?"
        message={`"${deleteTarget?.title}" will be permanently removed. This cannot be undone.`}
        onConfirm={executDelete}
        onCancel={cancelDelete}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center gap-3">
                <Link to="/" className="text-brand-600 font-bold text-lg hover:text-brand-800 transition">
                  Hillersons
                </Link>
                <span className="text-gray-200" aria-hidden="true">|</span>
                <span className="text-gray-500 text-sm font-medium">Vendor Dashboard</span>
                <span className="px-2 py-0.5 bg-brand-50 text-brand-700 rounded-full text-xs font-semibold capitalize border border-brand-100">
                  {user?.role}
                </span>
              </div>
              <div className="flex items-center gap-5">
                <span className="text-xs text-gray-400 hidden sm:block">{user?.email}</span>
                <button
                  onClick={() => { logout(); navigate("/login"); }}
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition font-medium focus:outline-none focus:ring-2 focus:ring-red-400 rounded"
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4" aria-hidden="true" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Tab nav */}
          <nav
            role="tablist"
            aria-label="Dashboard sections"
            className="flex gap-1 bg-white rounded-xl p-1 shadow-sm mb-8 overflow-x-auto"
          >
            {tabs.map(({ id, label, Icon }) => (
              <button
                key={id}
                role="tab"
                aria-selected={activeTab === id}
                aria-controls={`panel-${id}`}
                id={`tab-${id}`}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-brand-400 ${
                  activeTab === id
                    ? "bg-brand-600 text-white shadow-sm"
                    : "text-gray-500 hover:bg-gray-100 hover:text-brand-600"
                }`}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
                {label}
                {id === "bookings" && stats.pendingBookings > 0 && (
                  <span className="w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center" aria-label={`${stats.pendingBookings} pending`}>
                    {stats.pendingBookings}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <InlineAlert
            type="error"
            message={globalError}
            onDismiss={() => setGlobalError("")}
          />

          {/* ── OVERVIEW ── */}
          <div role="tabpanel" id="panel-overview" aria-labelledby="tab-overview" hidden={activeTab !== "overview"}>
            <div className="space-y-8">
              {/* Welcome banner */}
              <div className="bg-gradient-to-r from-brand-600 to-brand-700 rounded-2xl p-6 text-white">
                <h2 className="text-2xl font-bold mb-1">
                  Welcome back, {user?.name?.split(" ")[0] || "there"}
                </h2>
                <p className="text-brand-100 text-sm">
                  {user?.vendorProfile?.businessName || "Your vendor dashboard"}
                </p>
              </div>

              {/* Stat cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {overviewStats.map(({ label, value, Icon, color }) => (
                  <article key={label} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs text-gray-500 font-medium">{label}</p>
                      {/* ✅ Bug fix: static class strings, not dynamic interpolation */}
                      <Icon className={`w-5 h-5 ${STAT_ICON_COLORS[color]}`} aria-hidden="true" />
                    </div>
                    <p className="text-2xl font-bold text-gray-800 tabular-nums">{value}</p>
                  </article>
                ))}
              </div>

              {/* Recent listings */}
              <section className="bg-white rounded-xl shadow-sm border border-gray-100" aria-label="Recent listings">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-800 text-sm">Recent Listings</h3>
                  <button
                    onClick={() => setActiveTab("listings")}
                    className="text-xs text-brand-600 hover:text-brand-800 font-semibold flex items-center gap-1 transition focus:outline-none focus:underline"
                  >
                    View all <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
                {loading ? <RowSkeleton rows={3} /> : listings.length === 0 ? (
                  <EmptyState Icon={Package} message="No listings yet." action="Create your first listing" onAction={() => setActiveTab("new")} />
                ) : (
                  <ul className="divide-y divide-gray-50" aria-label="Recent listings">
                    {listings.slice(0, 5).map((l) => (
                      <li key={l._id}>
                        <ListingRow listing={l} onDelete={() => confirmDelete(l)} />
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {/* Recent bookings preview */}
              {isBnbHost && bookings.length > 0 && (
                <section className="bg-white rounded-xl shadow-sm border border-gray-100" aria-label="Recent bookings">
                  <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-800 text-sm">Recent Bookings</h3>
                    <button
                      onClick={() => setActiveTab("bookings")}
                      className="text-xs text-brand-600 hover:text-brand-800 font-semibold flex items-center gap-1 transition focus:outline-none focus:underline"
                    >
                      View all <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                  <ul className="divide-y divide-gray-50">
                    {bookings.slice(0, 3).map((b) => (
                      <li key={b._id}>
                        <BookingRow booking={b} onAction={handleBookingAction} compact />
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </div>

          {/* ── MY LISTINGS ── */}
          <div role="tabpanel" id="panel-listings" aria-labelledby="tab-listings" hidden={activeTab !== "listings"}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-semibold text-gray-800 text-sm">
                  All Listings <span className="text-gray-400 font-normal">({listings.length})</span>
                </h3>
                <button
                  onClick={() => setActiveTab("new")}
                  className="bg-brand-600 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-brand-700 transition flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                >
                  <ListPlus className="w-4 h-4" aria-hidden="true" />
                  New Listing
                </button>
              </div>
              {loading ? <RowSkeleton rows={5} /> : listings.length === 0 ? (
                <EmptyState Icon={Package} message="No listings yet." />
              ) : (
                <ul className="divide-y divide-gray-50" aria-label="All listings">
                  {listings.map((l) => (
                    <li key={l._id}>
                      <ListingRow listing={l} onDelete={() => confirmDelete(l)} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* ── BOOKINGS ── */}
          {isBnbHost && (
            <div role="tabpanel" id="panel-bookings" aria-labelledby="tab-bookings" hidden={activeTab !== "bookings"}>
              <div className="space-y-6">
                {/* Filter pills */}
                <nav
                  role="tablist"
                  aria-label="Booking status filter"
                  className="flex gap-1.5 bg-white rounded-xl p-1.5 shadow-sm overflow-x-auto"
                >
                  {["all","pending","confirmed","completed","cancelled"].map((f) => (
                    <button
                      key={f}
                      role="tab"
                      aria-selected={bookingFilter === f}
                      onClick={() => setBookingFilter(f)}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold capitalize transition whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-brand-400 ${
                        bookingFilter === f
                          ? "bg-brand-600 text-white"
                          : "text-gray-500 hover:bg-gray-100"
                      }`}
                    >
                      {f}
                      {f !== "all" && (
                        <span className="ml-1 opacity-60">
                          ({bookings.filter((b) => b.status === f).length})
                        </span>
                      )}
                    </button>
                  ))}
                </nav>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-800 text-sm capitalize">
                      {bookingFilter === "all" ? "All" : bookingFilter} Bookings
                    </h3>
                  </div>
                  {bookingsLoading ? <RowSkeleton rows={4} /> : (
                    (() => {
                      const filtered = bookings.filter((b) => bookingFilter === "all" || b.status === bookingFilter);
                      return filtered.length === 0
                        ? <EmptyState Icon={Calendar} message={`No ${bookingFilter === "all" ? "" : bookingFilter} bookings yet.`} />
                        : (
                          <ul className="divide-y divide-gray-50">
                            {filtered.map((b) => (
                              <li key={b._id}>
                                <BookingRow booking={b} onAction={handleBookingAction} />
                              </li>
                            ))}
                          </ul>
                        );
                    })()
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── NEW LISTING ── */}
          <div role="tabpanel" id="panel-new" aria-labelledby="tab-new" hidden={activeTab !== "new"}>
            <NewListingForm
              userRole={user?.role}
              onSuccess={() => { fetchListings(); setActiveTab("listings"); }}
            />
          </div>

          {/* ── PROFILE ── */}
          <div role="tabpanel" id="panel-profile" aria-labelledby="tab-profile" hidden={activeTab !== "profile"}>
            <VendorProfile user={user} />
          </div>

        </div>
      </div>
    </>
  );
}

/* ─── Empty state ─────────────────────────────────────────────── */
function EmptyState({ Icon, message, action, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center px-4">
      <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-brand-300" aria-hidden="true" />
      </div>
      <p className="text-gray-500 text-sm mb-4">{message}</p>
      {action && onAction && (
        <button
          onClick={onAction}
          className="bg-brand-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-700 transition focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
        >
          {action}
        </button>
      )}
    </div>
  );
}

/* ─── Listing row ─────────────────────────────────────────────── */
function ListingRow({ listing, onDelete }) {
  return (
    <div className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition">
      {listing.images?.[0] ? (
        <img
          src={listing.images[0]}
          alt={listing.title}
          className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
          loading="lazy"
          width={56} height={56}
        />
      ) : (
        <div className="w-14 h-14 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
          <Package className="w-6 h-6 text-brand-200" aria-hidden="true" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-800 text-sm truncate">{listing.title}</p>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Tag className="w-3 h-3" aria-hidden="true" />
            {LISTING_TYPE_LABELS[listing.listingType] || listing.listingType}
          </span>
          {listing.location && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <MapPin className="w-3 h-3" aria-hidden="true" />
              {listing.location}
            </span>
          )}
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Eye className="w-3 h-3" aria-hidden="true" />
            {listing.views_count || 0} views
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${LISTING_STATUS_STYLES[listing.status] || LISTING_STATUS_STYLES.draft}`}>
          {listing.status}
        </span>
        {listing.price && (
          <span className="text-sm font-bold text-brand-700 hidden sm:block">
            KES {Number(listing.price).toLocaleString("en-KE")}
          </span>
        )}
        <button
          onClick={onDelete}
          aria-label={`Delete listing: ${listing.title}`}
          className="p-2 text-gray-300 hover:text-red-600 transition rounded-lg hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400"
        >
          <Trash2 className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

/* ─── Booking row ─────────────────────────────────────────────── */
function BookingRow({ booking, onAction, compact = false }) {
  const guest = booking.guestId;

  // ✅ Bug fix: null-guard date parsing
  const fmt = (d) => {
    if (!d) return "—";
    const parsed = new Date(d);
    return isNaN(parsed) ? "—" : parsed.toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
  };

  const checkIn  = fmt(booking.checkIn);
  const checkOut = fmt(booking.checkOut);
  const guestName = guest?.name || booking.guestName || "Guest";

  return (
    <div className="px-6 py-5 hover:bg-gray-50 transition">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          {/* Guest info */}
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm flex-shrink-0"
              aria-hidden="true"
            >
              {guestName[0].toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">{guestName}</p>
              <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap mt-0.5">
                {(guest?.email || booking.guestEmail) && (
                  <a
                    href={`mailto:${guest?.email || booking.guestEmail}`}
                    className="flex items-center gap-1 hover:text-brand-600 transition focus:outline-none focus:underline"
                  >
                    <Mail className="w-3 h-3" aria-hidden="true" />
                    {guest?.email || booking.guestEmail}
                  </a>
                )}
                {booking.guestPhone && (
                  <a
                    href={`tel:${booking.guestPhone}`}
                    className="flex items-center gap-1 hover:text-brand-600 transition focus:outline-none focus:underline"
                  >
                    <Phone className="w-3 h-3" aria-hidden="true" />
                    {booking.guestPhone}
                  </a>
                )}
              </div>
            </div>
          </div>

          {booking.listingId?.title && (
            <p className="text-xs text-gray-400 mb-2">
              Listing: <span className="font-medium text-gray-700">{booking.listingId.title}</span>
            </p>
          )}

          <div className="flex items-center gap-4 text-xs text-gray-400 flex-wrap">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" aria-hidden="true" />
              {checkIn} — {checkOut}
            </span>
            {booking.nights > 0 && (
              <span>{booking.nights} night{booking.nights !== 1 ? "s" : ""}</span>
            )}
            {booking.guests > 0 && (
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" aria-hidden="true" />
                {booking.guests} guest{booking.guests !== 1 ? "s" : ""}
              </span>
            )}
            {booking.totalAmount > 0 && (
              <span className="font-semibold text-brand-700">
                KES {booking.totalAmount.toLocaleString("en-KE")}
              </span>
            )}
          </div>

          {!compact && booking.specialRequests && (
            <p className="text-xs text-gray-400 mt-2 italic">
              Note: {booking.specialRequests}
            </p>
          )}
        </div>

        {/* Status + actions */}
        <div className="flex flex-col items-end gap-3 flex-shrink-0">
          <span className={`px-3 py-0.5 rounded-full text-xs font-semibold border capitalize ${BOOKING_STATUS_STYLES[booking.status] || ""}`}>
            {booking.status}
          </span>

          {!compact && booking.status === "pending" && (
            <div className="flex gap-2">
              <button
                onClick={() => onAction(booking._id, "confirm")}
                className="px-3 py-1.5 bg-brand-600 text-white rounded-lg text-xs font-semibold hover:bg-brand-700 transition focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                Confirm
              </button>
              <button
                onClick={() => onAction(booking._id, "reject")}
                className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-100 transition focus:outline-none focus:ring-2 focus:ring-red-400"
              >
                Reject
              </button>
            </div>
          )}
          {!compact && booking.status === "confirmed" && (
            <button
              onClick={() => onAction(booking._id, "complete")}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200 transition focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              Mark Complete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── New listing form ────────────────────────────────────────── */
function NewListingForm({ userRole, onSuccess }) {
  const { token } = useAuth(); // ✅ AuthContext only — no prop drilling token
  const uid = useId();

  const [form, setForm] = useState({
    listingType: "", title: "", description: "", price: "",
    location: "", county: "", town: "",
    pricePerNight: "", maxGuests: "", bedrooms: "", bathrooms: "",
    checkInTime: "14:00", checkOutTime: "11:00",
    amenities: [], rules: "",
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const toggleAmenity = (id) => setForm((f) => ({
    ...f,
    amenities: f.amenities.includes(id)
      ? f.amenities.filter((a) => a !== id)
      : [...f.amenities, id],
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.listingType)        return setError("Please select a listing type.");
    if (!form.title.trim())       return setError("Title is required.");
    if (!form.description.trim()) return setError("Description is required.");
    if (form.listingType === "bnb" && !form.pricePerNight) return setError("Price per night is required for BNB listings.");

    setLoading(true);
    const body = {
      listingType:  form.listingType,
      title:        form.title,
      description:  form.description,
      price:        form.listingType === "bnb"
                      ? Number(form.pricePerNight)
                      : (form.price ? Number(form.price) : undefined),
      location:     form.location,
      county:       form.county,
      town:         form.town,
    };

    if (form.listingType === "bnb") {
      body.bnb = {
        pricePerNight: Number(form.pricePerNight),
        maxGuests:     Number(form.maxGuests)  || 1,
        bedrooms:      Number(form.bedrooms)   || 1,
        bathrooms:     Number(form.bathrooms)  || 1,
        checkInTime:   form.checkInTime,
        checkOutTime:  form.checkOutTime,
        amenities:     form.amenities,
        rules: form.rules
          ? form.rules.split("\n").map((r) => r.trim()).filter(Boolean)
          : [],
      };
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/listings`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // ✅ no localStorage fallback
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to create listing.");
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const availableTypes = Object.entries(LISTING_TYPE_LABELS).filter(([id]) => {
    if (userRole === "bnbHost")     return id === "bnb";
    if (userRole === "contractor")  return id === "service";
    return true;
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 max-w-2xl">
      <h3 className="text-xl font-bold text-gray-800 mb-6">Create New Listing</h3>
      <InlineAlert type="error" message={error} onDismiss={() => setError("")} />

      <form onSubmit={handleSubmit} noValidate className="space-y-6" aria-label="Create new listing">

        {/* Listing type */}
        <fieldset>
          <legend className="text-sm font-semibold text-gray-700 mb-3">
            Listing Type <span className="text-red-500" aria-hidden="true">*</span>
          </legend>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3" role="group">
            {availableTypes.map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setForm((f) => ({ ...f, listingType: id }))}
                aria-pressed={form.listingType === id}
                className={`p-3 rounded-xl border-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-brand-400 ${
                  form.listingType === id
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-gray-200 text-gray-500 hover:border-brand-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Title */}
        <div>
          <label htmlFor={`${uid}-title`} className="block text-sm font-semibold text-gray-700 mb-1.5">
            Title <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <input id={`${uid}-title`} name="title" value={form.title} onChange={handleChange}
            placeholder="e.g. Cozy Studio in Karen" required aria-required="true" className={inputCls} />
        </div>

        {/* Description */}
        <div>
          <label htmlFor={`${uid}-desc`} className="block text-sm font-semibold text-gray-700 mb-1.5">
            Description <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <textarea id={`${uid}-desc`} name="description" value={form.description} onChange={handleChange}
            placeholder="Describe your listing in detail…" rows={4} required aria-required="true"
            className={inputCls + " resize-none"} />
        </div>

        {/* Location */}
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { name: "location", label: "Location",    placeholder: "e.g. Karen, Nairobi" },
            { name: "county",   label: "County",      placeholder: "e.g. Nairobi" },
            { name: "town",     label: "Town / Area", placeholder: "e.g. Karen" },
          ].map(({ name, label, placeholder }) => (
            <div key={name}>
              <label htmlFor={`${uid}-${name}`} className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
              <input id={`${uid}-${name}`} name={name} value={form[name]} onChange={handleChange}
                placeholder={placeholder} className={inputCls} />
            </div>
          ))}
        </div>

        {/* BNB-specific */}
        {form.listingType === "bnb" && (
          <div className="space-y-5 border-t border-gray-100 pt-5">
            <h4 className="font-semibold text-gray-700 text-sm">BNB Details</h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { name: "pricePerNight", label: "Price / Night (KES)", req: true, placeholder: "5000" },
                { name: "maxGuests",     label: "Max Guests",          placeholder: "4" },
                { name: "bedrooms",      label: "Bedrooms",            placeholder: "2" },
                { name: "bathrooms",     label: "Bathrooms",           placeholder: "1" },
              ].map(({ name, label, req, placeholder }) => (
                <div key={name}>
                  <label htmlFor={`${uid}-${name}`} className="block text-xs font-semibold text-gray-700 mb-1.5">
                    {label}{req && <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>}
                  </label>
                  <input id={`${uid}-${name}`} name={name} type="number" min="0"
                    value={form[name]} onChange={handleChange}
                    placeholder={placeholder} required={req} aria-required={req ? "true" : undefined}
                    className={inputCls} />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { name: "checkInTime",  label: "Check-in Time" },
                { name: "checkOutTime", label: "Check-out Time" },
              ].map(({ name, label }) => (
                <div key={name}>
                  <label htmlFor={`${uid}-${name}`} className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
                  <input id={`${uid}-${name}`} name={name} type="time" value={form[name]} onChange={handleChange} className={inputCls} />
                </div>
              ))}
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Amenities</p>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Select amenities">
                {AMENITY_OPTIONS.map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggleAmenity(id)}
                    aria-pressed={form.amenities.includes(id)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border-2 transition focus:outline-none focus:ring-2 focus:ring-brand-400 ${
                      form.amenities.includes(id)
                        ? "border-brand-500 bg-brand-50 text-brand-700"
                        : "border-gray-200 text-gray-500 hover:border-brand-300"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor={`${uid}-rules`} className="block text-sm font-semibold text-gray-700 mb-1.5">
                House Rules <span className="text-gray-400 font-normal">(one per line)</span>
              </label>
              <textarea id={`${uid}-rules`} name="rules" value={form.rules} onChange={handleChange}
                placeholder={"No smoking\nNo pets\nNo parties"} rows={3}
                className={inputCls + " resize-none"} />
            </div>
          </div>
        )}

        {/* Price for non-BNB */}
        {form.listingType && form.listingType !== "bnb" && (
          <div>
            <label htmlFor={`${uid}-price`} className="block text-sm font-semibold text-gray-700 mb-1.5">Price (KES)</label>
            <input id={`${uid}-price`} name="price" type="number" min="0" value={form.price} onChange={handleChange}
              placeholder="e.g. 250,000" className={inputCls} />
          </div>
        )}

        <div className="bg-brand-50 border border-brand-100 rounded-xl p-4 text-sm text-brand-700">
          Your listing will be submitted for admin review before going live.
        </div>

        <button
          type="submit"
          disabled={loading}
          aria-busy={loading}
          className="w-full bg-brand-600 text-white py-3.5 rounded-xl font-bold hover:bg-brand-700 transition disabled:opacity-50 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 shadow-md"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
              Submitting…
            </>
          ) : "Submit for Approval"}
        </button>
      </form>
    </div>
  );
}

/* ─── Vendor profile ──────────────────────────────────────────── */
function VendorProfile({ user }) {
  const { token } = useAuth(); // ✅ AuthContext only
  const uid = useId();

  const [form, setForm] = useState({
    businessName:        user?.vendorProfile?.businessName        || "",
    businessDescription: user?.vendorProfile?.businessDescription || "",
    location:            user?.vendorProfile?.location            || "",
    phone:               user?.vendorProfile?.phone || user?.phone || "",
    website:             user?.vendorProfile?.website             || "",
    specialization:      user?.vendorProfile?.specialization      || "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState("");

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const res = await fetch(`${API_BASE_URL}/api/vendor/profile`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`, // ✅ no localStorage fallback
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to update profile.");
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: "businessName", label: "Business Name" },
    { name: "location",     label: "Location" },
    { name: "phone",        label: "Phone" },
    { name: "website",      label: "Website" },
    ...(user?.role === "contractor" ? [{ name: "specialization", label: "Specialization" }] : []),
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 max-w-2xl">
      <h3 className="text-xl font-bold text-gray-800 mb-6">Vendor Profile</h3>
      <InlineAlert type="success" message={success ? "Profile updated successfully." : ""} onDismiss={() => setSuccess(false)} />
      <InlineAlert type="error"   message={error}   onDismiss={() => setError("")} />

      <form onSubmit={handleSave} noValidate className="space-y-5" aria-label="Update vendor profile">
        {fields.map(({ name, label }) => (
          <div key={name}>
            <label htmlFor={`${uid}-vp-${name}`} className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
            <input
              id={`${uid}-vp-${name}`}
              name={name}
              value={form[name]}
              onChange={handleChange}
              className={inputCls}
            />
          </div>
        ))}

        <div>
          <label htmlFor={`${uid}-vp-desc`} className="block text-sm font-semibold text-gray-700 mb-1.5">Business Description</label>
          <textarea
            id={`${uid}-vp-desc`}
            name="businessDescription"
            value={form.businessDescription}
            onChange={handleChange}
            rows={4}
            className={inputCls + " resize-none"}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          aria-busy={loading}
          className="w-full bg-brand-600 text-white py-3.5 rounded-xl font-bold hover:bg-brand-700 transition disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
        >
          {loading ? "Saving…" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}