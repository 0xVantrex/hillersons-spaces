import React, { useEffect, useState, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../lib/api";

const COLORS = ["#10B981", "#84CC16", "#F59E0B", "#EF4444", "#8B5CF6"];

const VENDOR_STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-800 border-amber-300",
  approved: "bg-emerald-100 text-emerald-800 border-emerald-300",
  rejected: "bg-red-100 text-red-800 border-red-300",
  banned: "bg-gray-100 text-gray-600 border-gray-300",
};

const LISTING_STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-800 border-amber-300",
  approved: "bg-emerald-100 text-emerald-800 border-emerald-300",
  rejected: "bg-red-100 text-red-800 border-red-300",
  draft: "bg-gray-100 text-gray-500 border-gray-200",
};

const AdminDashboard = () => {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Existing data
  const [plans, setPlans] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [customRequests, setCustomRequests] = useState([]);

  // New vendor + listings data
  const [vendors, setVendors] = useState([]);
  const [vendorFilter, setVendorFilter] = useState("pending");
  const [listings, setListings] = useState([]);
  const [listingFilter, setListingFilter] = useState("pending");
  const [vendorsLoading, setVendorsLoading] = useState(false);
  const [listingsLoading, setListingsLoading] = useState(false);

  // Reject modal state
  const [rejectNote, setRejectNote] = useState("");
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null); // "vendor" | "listing"

  const [analytics, setAnalytics] = useState({
    totalPlans: 0, totalInquiries: 0, totalCustomRequests: 0, totalLikes: 0,
    monthlyUploads: [], categoryBreakdown: [], customRequestsBreakdown: [],
    recentActivity: [], engagementStats: [],
  });

  const getHeaders = useCallback(() => ({
    Authorization: `Bearer ${token || localStorage.getItem("authToken")}`,
    "Content-Type": "application/json",
  }), [token]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const formatTimeAgo = (d) => {
    if (!d) return "Unknown";
    const diff = Date.now() - new Date(d).getTime();
    const h = Math.floor(diff / 36e5), days = Math.floor(diff / 864e5);
    if (h < 1) return "Just now";
    if (h < 24) return `${h}h ago`;
    return `${days}d ago`;
  };

  const computeCategoryBreakdown = (plans) => {
    const c = {};
    plans.forEach((p) => { const k = p.subCategoryGroup || p.subCategory || "Uncategorized"; c[k] = (c[k] || 0) + 1; });
    return Object.entries(c).map(([name, value]) => ({ name, value }));
  };

  const computeCustomBreakdown = (reqs) => {
    const c = {};
    reqs.forEach((r) => { const k = r.projectType || "Other"; c[k] = (c[k] || 0) + 1; });
    return Object.entries(c).map(([name, value]) => ({ name, value }));
  };

  const generateMonthlyUploads = (plans) => {
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const counts = Object.fromEntries(months.map((m) => [m, 0]));
    plans.forEach((p) => {
      if (p.createdAt) { const m = new Date(p.createdAt).toLocaleString("default", { month: "short" }); if (counts[m] !== undefined) counts[m]++; }
    });
    return months.map((month) => ({ month, uploads: counts[month] }));
  };

  const generateRecentActivity = (plans, inquiries, requests) => {
    const a = [];
    [...plans].sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt)).slice(0,2)
      .forEach((p) => a.push({ message: `New plan uploaded: ${p.title}`, time: formatTimeAgo(p.createdAt) }));
    [...inquiries].sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt)).slice(0,2)
      .forEach((i) => a.push({ message: `New inquiry from ${i.name}`, time: formatTimeAgo(i.createdAt) }));
    [...requests].sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt)).slice(0,2)
      .forEach((r) => a.push({ message: `Custom request from ${r.name} — ${r.projectType || "unspecified"}`, time: formatTimeAgo(r.createdAt) }));
    return a.slice(0, 6);
  };

  // ── Fetch existing data ────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    const activeToken = token || localStorage.getItem("authToken");
    if (!activeToken) return;
    setLoading(true);
    const headers = getHeaders();
    const safeFetch = async (url) => {
      try {
        const res = await fetch(url, { headers });
        if (!res.ok) { console.warn(`${url} returned ${res.status}`); return []; }
        const data = await res.json();
        return Array.isArray(data) ? data : [];
      } catch (e) { console.warn(`Failed: ${url}`, e.message); return []; }
    };
    const [safePlans, safeInquiries, safeRequests] = await Promise.all([
      safeFetch(`${API_BASE_URL}/api/plans`),
      safeFetch(`${API_BASE_URL}/api/inquiries`),
      safeFetch(`${API_BASE_URL}/api/custom-requests/custom-design`),
    ]);
    setPlans(safePlans); setInquiries(safeInquiries); setCustomRequests(safeRequests);
    setAnalytics({
      totalPlans: safePlans.length, totalInquiries: safeInquiries.length,
      totalCustomRequests: safeRequests.length,
      totalLikes: safePlans.reduce((s, p) => s + (p.likes_count || 0), 0),
      categoryBreakdown: computeCategoryBreakdown(safePlans),
      customRequestsBreakdown: computeCustomBreakdown(safeRequests),
      monthlyUploads: generateMonthlyUploads(safePlans),
      recentActivity: generateRecentActivity(safePlans, safeInquiries, safeRequests),
      engagementStats: [...safePlans].sort((a,b) => (b.likes_count||0)-(a.likes_count||0)).slice(0,10)
        .map((p) => ({ name: (p.title?.substring(0,20)||"Unnamed")+"...", likes: p.likes_count||0 })),
    });
    setLoading(false);
  }, [token]);

  // ── Fetch vendors ──────────────────────────────────────────────────────────
  const fetchVendors = useCallback(async (status) => {
    setVendorsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/vendor/admin/applications?status=${status}`, { headers: getHeaders() });
      const data = await res.json();
      setVendors(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
    finally { setVendorsLoading(false); }
  }, [token]);

  // ── Fetch listings ─────────────────────────────────────────────────────────
  const fetchListings = useCallback(async (status) => {
    setListingsLoading(true);
    try {
      const url = status === "all"
        ? `${API_BASE_URL}/api/listings/admin/all`
        : `${API_BASE_URL}/api/listings/admin/all?status=${status}`;
      const res = await fetch(url, { headers: getHeaders() });
      const data = await res.json();
      setListings(Array.isArray(data?.listings) ? data.listings : []);
    } catch (err) { console.error(err); }
    finally { setListingsLoading(false); }
  }, [token]);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useEffect(() => { if (activeTab === "vendors") fetchVendors(vendorFilter); }, [activeTab, vendorFilter]);
  useEffect(() => { if (activeTab === "listings") fetchListings(listingFilter); }, [activeTab, listingFilter]);

  // ── Existing actions ───────────────────────────────────────────────────────
  const deletePlan = async (id) => {
    if (!window.confirm("Delete this plan?")) return;
    await fetch(`${API_BASE_URL}/api/plans/${id}`, { method: "DELETE", headers: getHeaders() });
    fetchAll();
  };
  const deleteInquiry = async (id) => {
    if (!window.confirm("Delete this inquiry?")) return;
    await fetch(`${API_BASE_URL}/api/inquiries/${id}`, { method: "DELETE", headers: getHeaders() });
    fetchAll();
  };
  const deleteRequest = async (id) => {
    if (!window.confirm("Delete this request?")) return;
    await fetch(`${API_BASE_URL}/api/custom-requests/custom-design/${id}`, { method: "DELETE", headers: getHeaders() });
    fetchAll();
  };
  const updateInquiryStatus = async (id, status) => {
    await fetch(`${API_BASE_URL}/api/inquiries/${id}`, { method: "PATCH", headers: getHeaders(), body: JSON.stringify({ status }) });
    fetchAll();
  };
  const updateRequestStatus = async (id, status) => {
    await fetch(`${API_BASE_URL}/api/custom-requests/custom-design/${id}`, { method: "PATCH", headers: getHeaders(), body: JSON.stringify({ status }) });
    fetchAll();
  };

  // ── Vendor actions ─────────────────────────────────────────────────────────
  const approveVendor = async (id) => {
    await fetch(`${API_BASE_URL}/api/vendor/admin/${id}/approve`, { method: "PATCH", headers: getHeaders() });
    fetchVendors(vendorFilter);
  };
  const banVendor = async (id) => {
    if (!window.confirm("Ban this vendor?")) return;
    await fetch(`${API_BASE_URL}/api/vendor/admin/${id}/ban`, { method: "PATCH", headers: getHeaders() });
    fetchVendors(vendorFilter);
  };

  // ── Listing actions ────────────────────────────────────────────────────────
  const approveListing = async (id) => {
    await fetch(`${API_BASE_URL}/api/listings/admin/${id}/approve`, { method: "PATCH", headers: getHeaders() });
    fetchListings(listingFilter);
  };

  // ── Reject modal ───────────────────────────────────────────────────────────
  const openRejectModal = (id, target) => { setRejectingId(id); setRejectTarget(target); setRejectNote(""); };
  const confirmReject = async () => {
    const url = rejectTarget === "vendor"
      ? `${API_BASE_URL}/api/vendor/admin/${rejectingId}/reject`
      : `${API_BASE_URL}/api/listings/admin/${rejectingId}/reject`;
    await fetch(url, { method: "PATCH", headers: getHeaders(), body: JSON.stringify({ note: rejectNote }) });
    if (rejectTarget === "vendor") fetchVendors(vendorFilter);
    if (rejectTarget === "listing") fetchListings(listingFilter);
    setRejectingId(null); setRejectTarget(null); setRejectNote("");
  };

  const handleLogout = () => { logout(); navigate("/login"); };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "plans", label: "Plans" },
    { id: "inquiries", label: "Inquiries" },
    { id: "custom-designs", label: "Custom Designs" },
    { id: "vendors", label: "Vendors" },
    { id: "listings", label: "Listings" },
    { id: "analytics", label: "Analytics" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Reject Modal ── */}
      {rejectingId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Reason for Rejection</h3>
            <textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="Provide a reason (optional but recommended)..."
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-red-400 resize-none text-sm"
            />
            <div className="flex gap-3 mt-4">
              <button onClick={() => { setRejectingId(null); setRejectTarget(null); }}
                className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition text-sm">
                Cancel
              </button>
              <button onClick={confirmReject}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition text-sm">
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-5">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium">Admin</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">{user?.email}</span>
              <button onClick={handleLogout} className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors text-sm">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <nav className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm mb-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id ? "bg-emerald-600 text-white shadow-sm" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}>
              {tab.label}
            </button>
          ))}
        </nav>

        {/* ── OVERVIEW ── */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: "Total Plans", value: analytics.totalPlans },
                { title: "Inquiries", value: analytics.totalInquiries },
                { title: "Custom Requests", value: analytics.totalCustomRequests },
                { title: "Total Likes", value: analytics.totalLikes },
              ].map((s) => (
                <div key={s.title} className="bg-white rounded-xl shadow p-6">
                  <p className="text-gray-500 text-sm">{s.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{s.value}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Monthly Uploads</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={analytics.monthlyUploads}>
                    <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" tick={{ fontSize: 11 }} /><YAxis /><Tooltip />
                    <Line type="monotone" dataKey="uploads" stroke="#10B981" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Plan Categories</h3>
                {analytics.categoryBreakdown.length === 0 ? <p className="text-gray-400 text-sm text-center mt-16">No data yet</p> : (
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart><Pie data={analytics.categoryBreakdown} cx="50%" cy="50%" outerRadius={90} dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}>
                      {analytics.categoryBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie><Tooltip /></PieChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Custom Request Types</h3>
                {analytics.customRequestsBreakdown.length === 0 ? <p className="text-gray-400 text-sm text-center mt-16">No requests yet</p> : (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={analytics.customRequestsBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis /><Tooltip />
                      <Bar dataKey="value" fill="#84CC16" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Recent Activity</h3>
              {analytics.recentActivity.length === 0 ? <p className="text-gray-400 text-sm">No recent activity</p> : (
                <div className="space-y-3">
                  {analytics.recentActivity.map((a, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="text-gray-800 text-sm">{a.message}</p>
                        <p className="text-gray-400 text-xs">{a.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── PLANS ── */}
        {activeTab === "plans" && (
          <div className="bg-white rounded-xl shadow">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Plans ({plans.length})</h2>
              <button onClick={() => navigate("/admin/upload")} className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 text-sm">+ Upload Plan</button>
            </div>
            {plans.length === 0 ? <p className="p-6 text-gray-400">No plans uploaded yet.</p> : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50"><tr>
                    {["Title","Category","Price","Rooms","Likes","Date","Actions"].map((h) => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody className="divide-y divide-gray-200">
                    {plans.map((plan) => (
                      <tr key={plan._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {(plan.finalImageURLs?.[0] || plan.planImageURLs?.[0]) && (
                              <img src={plan.finalImageURLs?.[0] || plan.planImageURLs?.[0]} alt={plan.title} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                            )}
                            <div>
                              <p className="text-sm font-medium text-gray-900">{plan.title}</p>
                              <p className="text-xs text-gray-400 line-clamp-1">{plan.description?.substring(0,50)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{plan.subCategoryGroup || plan.subCategory || "—"}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{plan.price ? `KES ${Number(plan.price).toLocaleString()}` : "—"}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{plan.rooms || "—"}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{plan.likes_count || 0}</td>
                        <td className="px-6 py-4 text-sm text-gray-400">{new Date(plan.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-sm">
                          <button onClick={() => deletePlan(plan._id)} className="text-red-600 hover:text-red-800 font-medium">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── INQUIRIES ── */}
        {activeTab === "inquiries" && (
          <div className="bg-white rounded-xl shadow">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Inquiries ({inquiries.length})</h2>
            </div>
            {inquiries.length === 0 ? <p className="p-6 text-gray-400">No inquiries yet.</p> : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50"><tr>
                    {["Client","Project Type","Budget","Date","Status","Actions"].map((h) => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody className="divide-y divide-gray-200">
                    {inquiries.map((inq) => (
                      <tr key={inq._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-gray-900">{inq.name}</p>
                          <p className="text-xs text-gray-400">{inq.email}</p>
                          {inq.phone && <p className="text-xs text-gray-400">{inq.phone}</p>}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{inq.projectType || "—"}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{inq.budget || "—"}</td>
                        <td className="px-6 py-4 text-sm text-gray-400">{new Date(inq.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <select value={inq.status || "new"} onChange={(e) => updateInquiryStatus(inq._id, e.target.value)}
                            className={`px-2 py-1 text-xs font-medium rounded-full border ${
                              inq.status === "resolved" ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                              : inq.status === "in-progress" ? "bg-blue-100 text-blue-800 border-blue-300"
                              : "bg-yellow-100 text-yellow-800 border-yellow-300"}`}>
                            <option value="new">New</option>
                            <option value="in-progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <details className="relative">
                            <summary className="text-emerald-600 hover:text-emerald-800 text-sm cursor-pointer font-medium">View</summary>
                            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border z-50 p-4 text-sm">
                              <p className="font-semibold mb-2 text-gray-800">Message</p>
                              <p className="text-gray-600 whitespace-pre-wrap">{inq.description || "No message"}</p>
                              <button onClick={() => deleteInquiry(inq._id)} className="mt-3 text-red-600 hover:text-red-800 text-xs font-medium">Delete Inquiry</button>
                            </div>
                          </details>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── CUSTOM DESIGNS ── */}
        {activeTab === "custom-designs" && (
          <div className="bg-white rounded-xl shadow">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Custom Design Requests ({customRequests.length})</h2>
            </div>
            {customRequests.length === 0 ? <p className="p-6 text-gray-400">No custom design requests yet.</p> : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50"><tr>
                    {["Client","Project Type","Rooms","Budget","Date","Status","Actions"].map((h) => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody className="divide-y divide-gray-200">
                    {customRequests.map((req) => (
                      <tr key={req._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-gray-900">{req.name}</p>
                          <p className="text-xs text-gray-400">{req.email}</p>
                          {req.phone && <p className="text-xs text-gray-400">{req.phone}</p>}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 capitalize">{req.projectType?.replace(/-/g," ") || "—"}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{req.rooms || "—"}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{req.budget?.replace(/-/g," – ") || "—"}</td>
                        <td className="px-6 py-4 text-sm text-gray-400">{new Date(req.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <select value={req.status || "new"} onChange={(e) => updateRequestStatus(req._id, e.target.value)}
                            className={`px-2 py-1 text-xs font-medium rounded-full border ${
                              req.status === "completed" ? "bg-green-100 text-green-800 border-green-300"
                              : req.status === "in-progress" ? "bg-blue-100 text-blue-800 border-blue-300"
                              : req.status === "contacted" ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                              : "bg-yellow-100 text-yellow-800 border-yellow-300"}`}>
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <details className="relative">
                            <summary className="text-emerald-600 hover:text-emerald-800 text-sm cursor-pointer font-medium">View</summary>
                            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border z-50 p-4 text-sm">
                              <p className="font-semibold mb-2 text-gray-800">Description</p>
                              <p className="text-gray-600 whitespace-pre-wrap">{req.description || "No description"}</p>
                              <div className="mt-3 flex gap-3">
                                <a href={`mailto:${req.email}`} className="text-emerald-600 hover:text-emerald-800 text-xs font-medium">Email Client</a>
                                <button onClick={() => deleteRequest(req._id)} className="text-red-600 hover:text-red-800 text-xs font-medium">Delete</button>
                              </div>
                            </div>
                          </details>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── VENDORS ── */}
        {activeTab === "vendors" && (
          <div className="space-y-6">
            <div className="flex gap-2 bg-white rounded-xl p-1 shadow-sm w-fit">
              {["pending","approved","rejected","banned"].map((s) => (
                <button key={s} onClick={() => setVendorFilter(s)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${vendorFilter === s ? "bg-emerald-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
                  {s}
                </button>
              ))}
            </div>
            <div className="bg-white rounded-xl shadow">
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900 capitalize">{vendorFilter} Vendor Applications ({vendors.length})</h2>
              </div>
              {vendorsLoading ? <div className="p-8 text-center text-gray-400">Loading...</div>
              : vendors.length === 0 ? <p className="p-6 text-gray-400">No {vendorFilter} vendor applications.</p>
              : (
                <div className="divide-y">
                  {vendors.map((v) => (
                    <div key={v._id} className="p-6">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <p className="font-semibold text-gray-900">{v.name}</p>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${VENDOR_STATUS_STYLES[v.vendorStatus] || ""}`}>{v.vendorStatus}</span>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200 capitalize">{v.role}</span>
                          </div>
                          <p className="text-sm text-gray-500 mb-1">{v.email}</p>
                          {v.vendorProfile?.businessName && <p className="text-sm font-medium text-gray-700">Business: {v.vendorProfile.businessName}</p>}
                          {v.vendorProfile?.location && <p className="text-sm text-gray-500">Location: {v.vendorProfile.location}</p>}
                          {v.vendorProfile?.businessDescription && (
                            <p className="text-sm text-gray-600 mt-2 max-w-xl line-clamp-2">{v.vendorProfile.businessDescription}</p>
                          )}
                          {v.vendorProfile?.specialization && <p className="text-sm text-gray-500 mt-1">Specialization: {v.vendorProfile.specialization}</p>}
                          {v.vendorStatusNote && <p className="text-sm text-red-500 mt-2 italic">Note: {v.vendorStatusNote}</p>}
                          <p className="text-xs text-gray-400 mt-2">Applied: {new Date(v.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0 flex-wrap">
                          {v.vendorStatus === "pending" && (<>
                            <button onClick={() => approveVendor(v._id)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition">Approve</button>
                            <button onClick={() => openRejectModal(v._id, "vendor")} className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-semibold hover:bg-red-200 transition">Reject</button>
                          </>)}
                          {v.vendorStatus === "approved" && (
                            <button onClick={() => banVendor(v._id)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition">Ban</button>
                          )}
                          {(v.vendorStatus === "rejected" || v.vendorStatus === "banned") && (
                            <button onClick={() => approveVendor(v._id)} className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-semibold hover:bg-emerald-200 transition">Re-approve</button>
                          )}
                          {v.vendorProfile?.phone && (
                            <a href={`tel:${v.vendorProfile.phone}`} className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold hover:bg-blue-200 transition">Call</a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── LISTINGS ── */}
        {activeTab === "listings" && (
          <div className="space-y-6">
            <div className="flex gap-2 bg-white rounded-xl p-1 shadow-sm w-fit">
              {["pending","approved","rejected","all"].map((s) => (
                <button key={s} onClick={() => setListingFilter(s)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${listingFilter === s ? "bg-emerald-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
                  {s}
                </button>
              ))}
            </div>
            <div className="bg-white rounded-xl shadow">
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900 capitalize">{listingFilter} Listings ({listings.length})</h2>
              </div>
              {listingsLoading ? <div className="p-8 text-center text-gray-400">Loading...</div>
              : listings.length === 0 ? <p className="p-6 text-gray-400">No {listingFilter} listings.</p>
              : (
                <div className="divide-y">
                  {listings.map((listing) => (
                    <div key={listing._id} className="p-6">
                      <div className="flex items-start gap-4 flex-wrap">
                        {listing.images?.[0] && (
                          <img src={listing.images[0]} alt={listing.title} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1 flex-wrap">
                            <p className="font-semibold text-gray-900">{listing.title}</p>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${LISTING_STATUS_STYLES[listing.status] || ""}`}>{listing.status}</span>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200 capitalize">{listing.listingType}</span>
                          </div>
                          <p className="text-sm text-gray-500 mb-1">By: {listing.sellerId?.name || listing.sellerName} ({listing.sellerId?.email || listing.sellerEmail})</p>
                          {listing.location && <p className="text-sm text-gray-500">Location: {listing.location}</p>}
                          {listing.price && <p className="text-sm font-medium text-emerald-700">KES {Number(listing.price).toLocaleString()}</p>}
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{listing.description}</p>
                          {listing.rejectionNote && <p className="text-sm text-red-500 mt-1 italic">Rejected: {listing.rejectionNote}</p>}
                          <p className="text-xs text-gray-400 mt-2">Submitted: {new Date(listing.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0 flex-wrap">
                          {listing.status === "pending" && (<>
                            <button onClick={() => approveListing(listing._id)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition">Approve</button>
                            <button onClick={() => openRejectModal(listing._id, "listing")} className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-semibold hover:bg-red-200 transition">Reject</button>
                          </>)}
                          {listing.status === "approved" && (
                            <button onClick={() => openRejectModal(listing._id, "listing")} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition">Revoke</button>
                          )}
                          {listing.status === "rejected" && (
                            <button onClick={() => approveListing(listing._id)} className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-semibold hover:bg-emerald-200 transition">Re-approve</button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── ANALYTICS ── */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Monthly Uploads</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={analytics.monthlyUploads}>
                    <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" tick={{ fontSize: 11 }} /><YAxis /><Tooltip />
                    <Bar dataKey="uploads" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Top Plans by Likes</h3>
                <div className="space-y-3 max-h-72 overflow-y-auto">
                  {analytics.engagementStats.map((p, i) => (
                    <div key={i} className="flex items-center justify-between gap-4">
                      <span className="text-sm text-gray-700 truncate flex-1">{p.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-emerald-500 h-2 rounded-full"
                            style={{ width: `${analytics.engagementStats[0]?.likes > 0 ? (p.likes / analytics.engagementStats[0].likes) * 100 : 0}%` }} />
                        </div>
                        <span className="text-xs text-gray-500 w-6 text-right">{p.likes}</span>
                      </div>
                    </div>
                  ))}
                  {analytics.engagementStats.length === 0 && <p className="text-gray-400 text-sm">No data yet</p>}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Conversion Metrics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between"><span className="text-gray-600 text-sm">Inquiry to Plan Ratio</span>
                    <span className="font-semibold text-emerald-600">{analytics.totalPlans > 0 ? ((analytics.totalInquiries/analytics.totalPlans)*100).toFixed(1) : 0}%</span></div>
                  <div className="flex justify-between"><span className="text-gray-600 text-sm">Custom Request Rate</span>
                    <span className="font-semibold text-emerald-600">{analytics.totalInquiries > 0 ? ((analytics.totalCustomRequests/analytics.totalInquiries)*100).toFixed(1) : 0}%</span></div>
                  <div className="flex justify-between"><span className="text-gray-600 text-sm">Avg Likes per Plan</span>
                    <span className="font-semibold text-emerald-600">{analytics.totalPlans > 0 ? (analytics.totalLikes/analytics.totalPlans).toFixed(1) : 0}</span></div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Activity Summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between"><span className="text-gray-600 text-sm">New Inquiries</span>
                    <span className="font-semibold text-yellow-600">{inquiries.filter((i) => i.status === "new").length}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600 text-sm">In-Progress Inquiries</span>
                    <span className="font-semibold text-blue-600">{inquiries.filter((i) => i.status === "in-progress").length}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600 text-sm">Pending Custom Requests</span>
                    <span className="font-semibold text-yellow-600">{customRequests.filter((r) => r.status === "new").length}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600 text-sm">Completed Requests</span>
                    <span className="font-semibold text-emerald-600">{customRequests.filter((r) => r.status === "completed").length}</span></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;