import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../lib/api";
import { useProjects } from "../context/ProjectsContext";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import Footer from "../components/Footer";

/* ─── SEO helper ──────────────────────────────────────────────── */
function useDocumentTitle(title) {
  useEffect(() => {
    const prev = document.title;
    document.title = title;
    return () => { document.title = prev; };
  }, [title]);
}

/* ─── SVG Icons (no emojis) ──────────────────────────────────── */
const Icons = {
  Package: () => (
    <svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
    </svg>
  ),
  Bookmark: () => (
    <svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
    </svg>
  ),
  Calendar: () => (
    <svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Edit: () => (
    <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  Logout: () => (
    <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
  Cart: () => (
    <svg aria-hidden="true" className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  Plans: () => (
    <svg aria-hidden="true" className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  Trash: () => (
    <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  Alert: () => (
    <svg aria-hidden="true" className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  ArrowRight: () => (
    <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ),
};

/* ─── Confirm Modal (replaces window.confirm) ─────────────────── */
function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmLabel = "Confirm", danger = false }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === "Escape") onCancel(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-desc"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 z-10">
        <div className="flex items-start gap-4 mb-6">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <Icons.Alert />
          </div>
          <div>
            <h2 id="modal-title" className="text-lg font-semibold text-gray-900 mb-1">{title}</h2>
            <p id="modal-desc" className="text-sm text-gray-600 leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-colors focus:outline-none focus:ring-2 ${
              danger
                ? "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
                : "bg-brand-600 text-white hover:bg-brand-700 focus:ring-brand-500"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── StatCard ────────────────────────────────────────────────── */
function StatCard({ title, value, Icon, variant = "primary" }) {
  const variants = {
    primary: "bg-brand-50 border-brand-200 text-brand-700",
    accent:  "bg-lime-50  border-lime-200  text-lime-700",
    muted:   "bg-brand-50 border-brand-100 text-brand-600",
  };
  return (
    <article className={`rounded-2xl p-6 shadow-sm border-2 ${variants[variant]} hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center shadow-sm">
          <Icon />
        </div>
        <p className="text-3xl font-bold tabular-nums">{value}</p>
      </div>
      <p className="text-sm font-medium text-gray-600">{title}</p>
    </article>
  );
}

/* ─── OrderCard ───────────────────────────────────────────────── */
function OrderCard({ order }) {
  const statusStyles = {
    completed: "bg-brand-100 text-brand-800",
    pending:   "bg-lime-100  text-lime-800",
    cancelled: "bg-red-100   text-red-800",
  };
  const statusKey = order.status?.toLowerCase();
  const statusClass = statusStyles[statusKey] || "bg-gray-100 text-gray-700";

  return (
    <article className="border border-gray-100 rounded-xl p-5 hover:border-brand-200 hover:shadow-sm transition-all bg-white">
      <div className="flex items-start justify-between gap-3 mb-3">
        <h4 className="font-semibold text-gray-900 text-base leading-snug">
          {order.planTitle || "Unnamed Plan"}
        </h4>
        <span className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${statusClass}`}>
          {order.status || "Unknown"}
        </span>
      </div>
      <dl className="text-sm text-gray-500 space-y-1">
        {order.createdAt && (
          <div className="flex gap-2">
            <dt className="text-gray-400 w-24 flex-shrink-0">Date</dt>
            <dd className="text-gray-700">{new Date(order.createdAt).toLocaleDateString("en-KE", { dateStyle: "medium" })}</dd>
          </div>
        )}
        {order.amount && (
          <div className="flex gap-2">
            <dt className="text-gray-400 w-24 flex-shrink-0">Amount</dt>
            <dd className="font-semibold text-brand-700">KES {order.amount.toLocaleString("en-KE")}</dd>
          </div>
        )}
        {order.orderId && (
          <div className="flex gap-2">
            <dt className="text-gray-400 w-24 flex-shrink-0">Order ID</dt>
            <dd className="font-mono text-xs text-gray-600">{order.orderId}</dd>
          </div>
        )}
      </dl>
    </article>
  );
}

/* ─── SavedPlanCard ───────────────────────────────────────────── */
function SavedPlanCard({ plan, onView }) {
  return (
    <article className="border border-gray-100 rounded-xl overflow-hidden hover:border-brand-200 hover:shadow-md transition-all bg-white flex flex-col">
      {plan.image && (
        <img
          src={plan.image}
          alt={plan.title || "Saved plan"}
          className="w-full h-36 object-cover"
          loading="lazy"
        />
      )}
      <div className="p-5 flex flex-col flex-1">
        <h4 className="font-semibold text-gray-900 mb-1 leading-snug">
          {plan.title || "Untitled Plan"}
        </h4>
        <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-1">
          {plan.description || "No description available."}
        </p>
        <div className="flex items-center justify-between mt-auto">
          {plan.price && (
            <span className="font-bold text-brand-600 text-sm">
              KES {plan.price.toLocaleString("en-KE")}
            </span>
          )}
          <button
            onClick={() => onView?.(plan)}
            className="flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-800 transition-colors focus:outline-none focus:underline"
            aria-label={`View plan: ${plan.title || "Untitled Plan"}`}
          >
            View Plan <Icons.ArrowRight />
          </button>
        </div>
      </div>
    </article>
  );
}

/* ─── EmptyState ──────────────────────────────────────────────── */
function EmptyState({ Icon, title, message, actionText, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="w-20 h-20 rounded-full bg-brand-50 flex items-center justify-center mb-5 text-brand-400">
        <Icon />
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-500 text-sm max-w-xs leading-relaxed mb-6">{message}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="bg-brand-600 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-brand-700 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}

/* ─── Skeleton Loader ─────────────────────────────────────────── */
function ProfileSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-pulse" aria-busy="true" aria-label="Loading profile">
      <div className="bg-gradient-to-r from-brand-600 to-brand-accent rounded-2xl p-6 mb-8">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 bg-white/30 rounded-full flex-shrink-0" />
          <div className="space-y-2.5 flex-1">
            <div className="h-5 bg-white/30 rounded-lg w-48" />
            <div className="h-4 bg-white/20 rounded-lg w-64" />
            <div className="h-3 bg-white/15 rounded-lg w-32" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {[0, 1, 2].map((i) => (
          <div key={i} className="bg-brand-50 rounded-2xl p-6 border-2 border-brand-100">
            <div className="h-8 bg-brand-100 rounded-lg mb-3 w-16" />
            <div className="h-4 bg-brand-100 rounded-lg w-24" />
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex gap-6 mb-6 border-b border-gray-100 pb-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-4 bg-gray-100 rounded w-24" />
          ))}
        </div>
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 bg-gray-50 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Main ProfilePage ────────────────────────────────────────── */
export default function ProfilePage() {
  const { projects } = useProjects();
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  useDocumentTitle(user ? `${user.name} — My Profile` : "My Profile");

  /* ── Fetch profile ── */
  const fetchUserProfile = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          logout();
          navigate("/login");
          return;
        }
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to load profile. Please try again.");
      }

      const userData = await response.json();
      setUser(userData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, logout, navigate]);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchUserProfile();
  }, [token, navigate, fetchUserProfile]);

  /* ── Delete account ── */
  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/delete`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        logout();
        navigate("/login");
      } else {
        const errData = await response.json().catch(() => ({}));
        setDeleteError(errData.message || "Failed to delete account. Please try again.");
        setDeleteModal(false);
      }
    } catch {
      setDeleteError("A network error occurred. Please try again.");
      setDeleteModal(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const avatarSrc = (name) =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "User")}&background=059669&color=ffffff&size=128`;

  /* ── States ── */
  if (loading) return <ProfileSkeleton />;

  if (error) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-8" role="alert">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center max-w-md mx-auto">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icons.Alert />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Could not load profile</h2>
          <p className="text-sm text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchUserProfile}
            className="bg-brand-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  if (!user) return null;

  const tabs = [
    { label: "Orders", count: user.orders?.length ?? 0 },
    { label: "Saved Plans", count: user.savedPlans?.length ?? 0 },
    { label: "Account Settings", count: null },
  ];

  return (
    <>
      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={deleteModal}
        title="Delete your account?"
        message="This will permanently remove all your data including orders and saved plans. This action cannot be undone."
        confirmLabel={deleteLoading ? "Deleting…" : "Yes, Delete Account"}
        onConfirm={handleDeleteAccount}
        onCancel={() => setDeleteModal(false)}
        danger
      />

      <div className="min-h-screen bg-gray-50">
        <Header
          showSearch={showSearch}
          setShowSearch={setShowSearch}
          setSearchQuery={setSearchQuery}
          searchQuery={searchQuery}
          showMobileMenu={showMobileMenu}
          setShowMobileMenu={setShowMobileMenu}
          projects={projects}
        />

        <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">

          {/* ── Profile Banner ── */}
          <section
            aria-label="Profile overview"
            className="bg-gradient-to-r from-brand-600 to-brand-700 rounded-2xl p-6 md:p-8 shadow-lg"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              {/* Avatar + info */}
              <div className="flex items-center gap-5">
                <div className="relative flex-shrink-0">
                  <img
                    src={user.profilePicture || avatarSrc(user.name)}
                    alt={`${user.name || "User"}'s profile picture`}
                    className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-white/80 shadow-md object-cover"
                    onError={(e) => { e.currentTarget.src = avatarSrc(user.name); }}
                    width={96}
                    height={96}
                  />
                  <span
                    aria-label="Online"
                    className="absolute bottom-0.5 right-0.5 w-4 h-4 bg-brand-accent rounded-full border-2 border-white"
                  />
                </div>
                <div>
                  <h1 className="text-white text-2xl md:text-3xl font-bold leading-tight">
                    {user.name || "Unknown User"}
                  </h1>
                  <p className="text-white/80 text-sm md:text-base mt-0.5">{user.email}</p>
                  {user.phone && (
                    <p className="text-white/60 text-xs mt-0.5">{user.phone}</p>
                  )}
                  <span
                    className={`inline-block mt-2 px-3 py-0.5 rounded-full text-xs font-bold tracking-widest uppercase ${
                      user.membership === "premium"
                        ? "bg-brand-accent text-gray-900"
                        : "bg-white/20 text-white/90"
                    }`}
                  >
                    {user.membership || "Free"} Member
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 flex-shrink-0">
                <button
                  onClick={() => navigate("/edit-profile")}
                  className="flex items-center gap-2 bg-white text-brand-700 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-50 transition-colors shadow focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-brand-600"
                  aria-label="Edit your profile"
                >
                  <Icons.Edit />
                  Edit Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-white/10 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-white/20 transition-colors border border-white/20 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-brand-600"
                  aria-label="Log out of your account"
                >
                  <Icons.Logout />
                  Logout
                </button>
              </div>
            </div>
          </section>

          {/* ── Stats ── */}
          <section aria-label="Account statistics">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <StatCard
                title="Total Orders"
                value={user.orders?.length ?? 0}
                Icon={Icons.Package}
                variant="primary"
              />
              <StatCard
                title="Saved Plans"
                value={user.savedPlans?.length ?? 0}
                Icon={Icons.Bookmark}
                variant="accent"
              />
              <StatCard
                title="Member Since"
                value={user.createdAt ? new Date(user.createdAt).getFullYear() : "—"}
                Icon={Icons.Calendar}
                variant="muted"
              />
            </div>
          </section>

          {/* ── Tabs ── */}
          <section aria-label="Account details" className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Tab nav */}
            <nav
              role="tablist"
              aria-label="Profile sections"
              className="flex border-b border-gray-100 overflow-x-auto"
            >
              {tabs.map((tab, index) => (
                <button
                  key={tab.label}
                  role="tab"
                  aria-selected={activeTab === index}
                  aria-controls={`tabpanel-${index}`}
                  id={`tab-${index}`}
                  onClick={() => setActiveTab(index)}
                  className={`flex-shrink-0 px-5 py-4 text-sm font-semibold border-b-2 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-500 ${
                    activeTab === index
                      ? "border-brand-600 text-brand-700 bg-brand-50/50"
                      : "border-transparent text-gray-500 hover:text-brand-600 hover:bg-gray-50"
                  }`}
                >
                  {tab.label}
                  {tab.count !== null && (
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                      activeTab === index ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-500"
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            {/* Tab panels */}
            <div className="p-6">

              {/* Orders */}
              <div
                role="tabpanel"
                id="tabpanel-0"
                aria-labelledby="tab-0"
                hidden={activeTab !== 0}
              >
                {!user.orders?.length ? (
                  <EmptyState
                    Icon={Icons.Cart}
                    title="No Orders Yet"
                    message="You haven't purchased any plans yet. Browse our plans to get started."
                    actionText="Browse Plans"
                    onAction={() => navigate("/allproducts")}
                  />
                ) : (
                  <ul className="space-y-4" aria-label="Your orders">
                    {user.orders.map((order, i) => (
                      <li key={order._id || i}>
                        <OrderCard order={order} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Saved Plans */}
              <div
                role="tabpanel"
                id="tabpanel-1"
                aria-labelledby="tab-1"
                hidden={activeTab !== 1}
              >
                {!user.savedPlans?.length ? (
                  <EmptyState
                    Icon={Icons.Plans}
                    title="No Saved Plans"
                    message="Save plans you're interested in and find them here anytime."
                    actionText="Explore Plans"
                    onAction={() => navigate("/AllProducts")}
                  />
                ) : (
                  <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" aria-label="Saved plans">
                    {user.savedPlans.map((plan, i) => (
                      <li key={plan._id || i}>
                        <SavedPlanCard
                          plan={plan}
                          onView={(p) => navigate(`/products/${p._id || p.slug}`)}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Account Settings */}
              <div
                role="tabpanel"
                id="tabpanel-2"
                aria-labelledby="tab-2"
                hidden={activeTab !== 2}
              >
                <div className="space-y-8">
                  {/* Info grid */}
                  <div className="bg-brand-50 rounded-xl p-6 border border-brand-100">
                    <h3 className="text-sm font-semibold text-brand-800 uppercase tracking-wider mb-5">
                      Account Information
                    </h3>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                      {[
                        { label: "Email address", value: user.email },
                        { label: "Phone number",  value: user.phone || "Not provided" },
                        { label: "Membership",    value: user.membership ? user.membership.charAt(0).toUpperCase() + user.membership.slice(1) : "Free" },
                        { label: "Joined",        value: user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-KE", { dateStyle: "long" }) : "—" },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">{label}</dt>
                          <dd className="text-sm font-medium text-gray-800">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>

                  {/* Danger zone */}
                  <div>
                    <h3 className="text-sm font-semibold text-red-700 uppercase tracking-wider mb-4">
                      Danger Zone
                    </h3>
                    <div className="border border-red-200 rounded-xl p-6 bg-red-50">
                      <h4 className="font-semibold text-gray-900 mb-1">Delete Account</h4>
                      <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                        Permanently removes your account and all associated data. This cannot be reversed.
                      </p>
                      {deleteError && (
                        <p role="alert" className="text-sm text-red-600 mb-3 font-medium">{deleteError}</p>
                      )}
                      <button
                        onClick={() => setDeleteModal(true)}
                        disabled={deleteLoading}
                        className="flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        aria-label="Delete your account permanently"
                      >
                        <Icons.Trash />
                        {deleteLoading ? "Deleting…" : "Delete Account"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}