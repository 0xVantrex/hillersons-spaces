import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../lib/api";
import { useProjects } from "../context/ProjectsContext";
import { Navigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function ProfilePage() {
  const { projects } = useProjects();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        Navigate("/login");
        return;
      }

      const userData = await response.json();
      setUser(userData);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching profile:", err);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/delete`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        alert("Failed to delete account. Please try again.");
      }
    } catch (err) {
      console.error("Error deleting account:", err);
      alert("An error occurred. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="bg-gradient-to-r from-emerald-600 to-lime-500 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-lime-400 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-6 bg-white/30 rounded w-48"></div>
                <div className="h-4 bg-white/20 rounded w-64"></div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-4 shadow">
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-100 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <div className="text-red-600 text-lg font-semibold mb-2">
            Error Loading Profile
          </div>
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchUserProfile}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
          <div className="text-yellow-600 text-lg font-semibold mb-2">
            Please Log In
          </div>
          <p className="text-yellow-600 mb-4">
            You need to be logged in to view your profile.
          </p>
          <button
            onClick={() => handleNavigation("/login")}
            className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <Header
        showSearch={showSearch}
        setShowSearch={setShowSearch}
        setSearchQuery={setSearchQuery}
        searchQuery={searchQuery}
        showMobileMenu={showMobileMenu}
        setShowMobileMenu={setShowMobileMenu}
        projects={projects}
      />
      <div className="bg-gradient-to-r from-emerald-600 to-lime-500 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="relative">
              <img
                src={
                  user.profilePicture ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    user.name || "User"
                  )}&background=10b981&color=ffffff&size=128`
                }
                alt="Profile"
                className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    user.name || "User"
                  )}&background=10b981&color=ffffff&size=128`;
                }}
              />
              <div className="absolute bottom-0 right-0 w-6 h-6 bg-lime-400 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h1 className="text-white text-3xl font-bold mb-1">
                {user.name || "Unknown User"}
              </h1>
              <p className="text-white/90 text-lg mb-1">{user.email}</p>
              {user.phone && (
                <p className="text-white/80 text-sm">{user.phone}</p>
              )}
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2 ${
                  user.membership === "premium"
                    ? "bg-yellow-400 text-yellow-900"
                    : "bg-white/20 text-white"
                }`}
              >
                {user.membership?.toUpperCase() || "FREE"} MEMBER
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => handleNavigation("/edit-profile")}
              className="bg-white text-emerald-700 px-6 py-3 rounded-xl font-semibold hover:bg-lime-50 transition shadow-lg flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit Profile
            </button>
            <button
              onClick={handleLogout}
              className="bg-white/20 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition border border-white/30"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <StatCard
          title="Total Orders"
          value={user.orders?.length || 0}
          icon="📦"
          color="emerald"
        />
        <StatCard
          title="Saved Plans"
          value={user.savedPlans?.length || 0}
          icon="💾"
          color="lime"
        />
        <StatCard
          title="Member Since"
          value={
            user.createdAt ? new Date(user.createdAt).getFullYear() : "N/A"
          }
          icon="📅"
          color="teal"
        />
      </div>

      {/* Tabs */}
      <div className="mt-8 bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 px-6 flex">
          {["Orders", "Saved Plans", "Account Settings"].map((tab, index) => (
            <button
              key={tab}
              onClick={() => setActiveTab(index)}
              className={`px-6 py-4 font-semibold cursor-pointer transition border-b-2 ${
                activeTab === index
                  ? "border-emerald-600 text-emerald-600"
                  : "border-transparent text-gray-600 hover:text-emerald-600"
              }`}
            >
              {tab}{" "}
              {index < 2
                ? `(${
                    index === 0
                      ? user.orders?.length || 0
                      : user.savedPlans?.length || 0
                  })`
                : ""}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Orders Tab */}
          {activeTab === 0 && (
            <div>
              {!user.orders || user.orders.length === 0 ? (
                <EmptyState
                  icon="🛒"
                  title="No Orders Yet"
                  message="You haven't purchased any plans yet. Start browsing our meal plans to get started!"
                  actionText="Browse Plans"
                  onAction={() => handleNavigation("/allproducts")}
                />
              ) : (
                <div className="space-y-4">
                  {user.orders.map((order, i) => (
                    <OrderCard key={order._id || i} order={order} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Saved Plans Tab */}
          {activeTab === 1 && (
            <div>
              {!user.savedPlans || user.savedPlans.length === 0 ? (
                <EmptyState
                  icon="💾"
                  title="No Saved Plans"
                  message="You haven't saved any plans yet. Save plans you're interested in for easy access later."
                  actionText="Explore Plans"
                  onAction={() => handleNavigation("/allproducts")}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {user.savedPlans.map((plan, i) => (
                    <SavedPlanCard key={plan._id || i} plan={plan} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 2 && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Account Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Email:</span>
                    <p className="font-medium">{user.email}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Phone:</span>
                    <p className="font-medium">
                      {user.phone || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Membership:</span>
                    <p className="font-medium capitalize">
                      {user.membership || "Free"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Joined:</span>
                    <p className="font-medium">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-red-600 mb-4">
                  Danger Zone
                </h3>
                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                  <h4 className="font-semibold text-red-800 mb-2">
                    Delete Account
                  </h4>
                  <p className="text-red-600 text-sm mb-4">
                    Once you delete your account, there is no going back. This
                    will permanently delete your profile, orders, and saved
                    plans.
                  </p>
                  <button
                    onClick={handleDeleteAccount}
                    className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color = "emerald" }) {
  const colorClasses = {
    emerald: "text-emerald-700 bg-emerald-50 border-emerald-200",
    lime: "text-lime-700 bg-lime-50 border-lime-200",
    teal: "text-teal-700 bg-teal-50 border-teal-200",
  };

  return (
    <div
      className={`rounded-2xl p-6 shadow-lg border-2 ${colorClasses[color]} transition hover:shadow-xl`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        <h2
          className={`text-3xl font-bold ${
            color === "emerald"
              ? "text-emerald-700"
              : color === "lime"
              ? "text-lime-700"
              : "text-teal-700"
          }`}
        >
          {value}
        </h2>
      </div>
      <p className="text-gray-600 font-medium">{title}</p>
    </div>
  );
}

function OrderCard({ order }) {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-lg">
          {order.planTitle || "Unknown Plan"}
        </h4>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
            order.status
          )}`}
        >
          {order.status?.toUpperCase() || "UNKNOWN"}
        </span>
      </div>
      <div className="text-sm text-gray-600 space-y-1">
        <p>
          Order Date:{" "}
          {order.createdAt
            ? new Date(order.createdAt).toLocaleDateString()
            : "N/A"}
        </p>
        {order.amount && <p>Amount: ${order.amount}</p>}
        {order.orderId && <p>Order ID: {order.orderId}</p>}
      </div>
    </div>
  );
}

function SavedPlanCard({ plan }) {
  return (
    <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition">
      <div className="mb-4">
        {plan.image && (
          <img
            src={plan.image}
            alt={plan.title}
            className="w-full h-32 object-cover rounded-lg mb-3"
          />
        )}
        <h4 className="font-semibold text-lg mb-2">
          {plan.title || "Untitled Plan"}
        </h4>
        <p className="text-gray-600 text-sm line-clamp-2">
          {plan.description || "No description available"}
        </p>
      </div>
      <div className="flex items-center justify-between">
        {plan.price && (
          <span className="font-bold text-emerald-600">${plan.price}</span>
        )}
        <button className="text-emerald-600 hover:text-emerald-700 font-medium text-sm">
          View Plan →
        </button>
      </div>
    </div>
  );
}

function EmptyState({ icon, title, message, actionText, onAction }) {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{message}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition"
        >
          {actionText}
        </button>
      )}
      <Footer />
    </div>
  );
}
