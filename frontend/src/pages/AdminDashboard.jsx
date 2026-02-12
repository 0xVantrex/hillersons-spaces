import React, { useEffect, useState, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { API_BASE_URL } from "../lib/api";

const AdminDashboard = ({ token, user }) => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Data states
  const [projects, setProjects] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [customDesignRequests, setCustomDesignRequests] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalProjects: 0,
    totalInquiries: 0,
    totalCustomRequests: 0,
    totalFavorites: 0,
    totalViews: 0,
    monthlyUploads: [],
    categoryBreakdown: [],
    recentActivity: [],
    engagementStats: [],
    customRequestsBreakdown: [],
  });

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch projects
      const resProjects = await fetch(`${API_BASE_URL}api/plans`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const projectData = await resProjects.json();
      setProjects(projectData);

      // Fetch inquiries
      const resInquiries = await fetch(`${API_BASE_URL}api/inquiries`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const inquiryData = await resInquiries.json();
      setInquiries(inquiryData);

      // Fetch custom design requests
      const resCustomRequests = await fetch(
        `${API_BASE_URL}api/custom-requests/custom-design`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const customRequestData = await resCustomRequests.json();
      setCustomDesignRequests(customRequestData);

      // Compute analytics
      setAnalytics({
        totalProjects: projectData.length,
        totalInquiries: inquiryData.length,
        totalCustomRequests: customRequestData.length,
        totalFavorites: projectData.reduce(
          (sum, project) => sum + (project.favorites_count || 0),
          0
        ),
        totalViews: projectData.reduce(
          (sum, project) => sum + (project.views_count || 0),
          0
        ),
        categoryBreakdown: computeCategoryBreakdown(projectData),
        customRequestsBreakdown:
          computeCustomRequestsBreakdown(customRequestData),
        monthlyUploads: generateMonthlyUploads(projectData),
        recentActivity: generateRecentActivity(
          projectData,
          inquiryData,
          customRequestData
        ),
        engagementStats: generateEngagementStats(projectData),
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Helper functions
  const computeCategoryBreakdown = (projects) => {
    const counts = {};
    projects.forEach((p) => {
      const category = p.category || "Uncategorized";
      counts[category] = (counts[category] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  };

  const computeCustomRequestsBreakdown = (requests) => {
    const counts = {};
    requests.forEach((r) => {
      const projectType = r.projectType || "Other";
      counts[projectType] = (counts[projectType] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  };

  const generateMonthlyUploads = (projects) => {
    const monthCounts = {};
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // Initialize all months with 0
    months.forEach((month) => {
      monthCounts[month] = 0;
    });

    // Count projects by creation month
    projects.forEach((project) => {
      if (project.created_at) {
        const month = new Date(project.created_at).toLocaleString("default", {
          month: "short",
        });
        if (monthCounts.hasOwnProperty(month)) {
          monthCounts[month]++;
        }
      }
    });

    return months.map((month) => ({
      month,
      uploads: monthCounts[month],
    }));
  };

  const generateEngagementStats = (projects) => {
    return projects
      .map((project) => ({
        name: project.title?.substring(0, 20) + "..." || "Unnamed Project",
        views: project.views_count || 0,
        favorites: project.favorites_count || 0,
        inquiries: project.inquiries_count || 0,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);
  };

  const generateRecentActivity = (projects, inquiries, customRequests) => {
    const activities = [];

    // Recent project uploads
    const recentProjects = projects
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 2);

    recentProjects.forEach((project) => {
      activities.push({
        type: "project",
        message: `New project uploaded: ${project.title}`,
        time: formatTimeAgo(project.created_at),
        icon: "🏗️",
      });
    });

    // Recent inquiries
    const recentInquiries = inquiries
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 2);

    recentInquiries.forEach((inquiry) => {
      activities.push({
        type: "inquiry",
        message: `New inquiry for: ${inquiry.project_title || inquiry.subject}`,
        time: formatTimeAgo(inquiry.created_at),
        icon: "💬",
      });
    });

    // Recent custom design requests
    const recentCustomRequests = customRequests
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 2);

    recentCustomRequests.forEach((request) => {
      activities.push({
        type: "custom",
        message: `New custom design request from ${request.name} for ${request.projectType}`,
        time: formatTimeAgo(request.created_at),
        icon: "✨",
      });
    });

    return activities.slice(0, 6);
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    }
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  };

  const handleDeleteProject = async (id) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await fetch(`${API_BASE_URL}api/plans/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchAllData();
      } catch (err) {
        console.error("Failed to delete project:", err);
      }
    }
  };

  const handleDeleteInquiry = async (id) => {
    if (window.confirm("Are you sure you want to delete this inquiry?")) {
      try {
        await fetch(`${API_BASE_URL}api/inquiries/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchAllData();
      } catch (err) {
        console.error("Failed to delete inquiry:", err);
      }
    }
  };

  const handleDeleteCustomRequest = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this custom design request?"
      )
    ) {
      try {
        await fetch(`${API_BASE_URL}api/custom-requests/custom-design/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchAllData();
      } catch (err) {
        console.error("Failed to delete custom request:", err);
      }
    }
  };

  const handleUpdateProjectStatus = async (id, status) => {
    try {
      await fetch(`${API_BASE_URL}api/plans/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      fetchAllData();
    } catch (err) {
      console.error("Failed to update project status:", err);
    }
  };

  const handleUpdateInquiryStatus = async (id, status) => {
    try {
      await fetch(`${API_BASE_URL}api/inquiries/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      fetchAllData();
    } catch (err) {
      console.error("Failed to update inquiry status:", err);
    }
  };

  const handleUpdateCustomRequestStatus = async (id, status) => {
    try {
      await fetch(`${API_BASE_URL}api/custom-requests/custom-design/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      fetchAllData();
    } catch (err) {
      console.error("Failed to update custom request status:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "projects", label: "Projects", icon: "🏗️" },
    { id: "inquiries", label: "Inquiries", icon: "💬" },
    { id: "custom-designs", label: "Custom Designs", icon: "✨" },
    { id: "analytics", label: "Analytics", icon: "📈" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  const StatCard = ({ title, value, icon, trend }) => (
    <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {trend && (
            <p
              className={`text-sm mt-2 ${
                trend > 0 ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {trend > 0 ? "↗" : "↘"} {Math.abs(trend)}% from last month
            </p>
          )}
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">
                🏛️ Admin Dashboard
              </h1>
              <span className="ml-4 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium">
                Admin
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Welcome, {user?.email}
              </div>
              <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <StatCard
                title="Total Projects"
                value={analytics.totalProjects}
  
                trend={12}
              />
              <StatCard
                title="Total Inquiries"
                value={analytics.totalInquiries}
              
                trend={8}
              />
              <StatCard
                title="Custom Designs"
                value={analytics.totalCustomRequests}
             
                trend={23}
              />
              <StatCard
                title="Total Favorites"
                value={analytics.totalFavorites}
             
                trend={15}
              />
              <StatCard
                title="Total Views"
                value={analytics.totalViews}
             
                trend={25}
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Monthly Uploads Chart */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Monthly Project Uploads
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.monthlyUploads}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [value, "Uploads"]} />
                    <Line
                      type="monotone"
                      dataKey="uploads"
                      stroke="#10B981"
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Category Breakdown */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Project Categories
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {analytics.categoryBreakdown.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            [
                              "#10B981",
                              "#84CC16",
                              "#F59E0B",
                              "#EF4444",
                              "#8B5CF6",
                            ][index % 5]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Custom Requests Breakdown */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Custom Request Types
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.customRequestsBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [value, "Requests"]} />
                    <Bar dataKey="value" fill="#84CC16" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Activity
              </h3>
              <div className="space-y-4">
                {analytics.recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="text-2xl mr-3">{activity.icon}</span>
                    <div className="flex-1">
                      <p className="text-gray-900">{activity.message}</p>
                      <p className="text-gray-500 text-sm">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Projects Tab */}
        {activeTab === "projects" && (
          <div className="bg-white rounded-lg shadow-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  Project Management
                </h2>
                <button
                  onClick={() => (window.location.href = "/admin/upload")}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  + Upload New Project
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Views
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Favorites
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {projects.map((project) => (
                    <tr key={project.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {project.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {project.description?.substring(0, 50)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {project.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {project.views_count || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {project.favorites_count || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={project.status || "draft"}
                          onChange={(e) =>
                            handleUpdateProjectStatus(
                              project.id,
                              e.target.value
                            )
                          }
                          className={`px-2 py-1 text-xs font-medium rounded-full border ${
                            project.status === "published"
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                              : project.status === "draft"
                              ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                              : "bg-gray-100 text-gray-800 border-gray-300"
                          }`}
                        >
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                          <option value="archived">Archived</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-emerald-600 hover:text-emerald-900 mr-3">
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProject(project.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Inquiries Tab */}
        {activeTab === "inquiries" && (
          <div className="bg-white rounded-lg shadow-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Client Inquiries
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {inquiries.map((inquiry) => (
                    <tr key={inquiry.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {inquiry.client_name || inquiry.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {inquiry.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {inquiry.project_title || inquiry.subject}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(inquiry.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={inquiry.status || "new"}
                          onChange={(e) =>
                            handleUpdateInquiryStatus(
                              inquiry.id,
                              e.target.value
                            )
                          }
                          className={`px-2 py-1 text-xs font-medium rounded-full border ${
                            inquiry.status === "contacted"
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                              : inquiry.status === "in-progress"
                              ? "bg-blue-100 text-blue-800 border-blue-300"
                              : inquiry.status === "closed"
                              ? "bg-gray-100 text-gray-800 border-gray-300"
                              : "bg-yellow-100 text-yellow-800 border-yellow-300"
                          }`}
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="in-progress">In Progress</option>
                          <option value="closed">Closed</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => {
                            const modal = document.getElementById(
                              `inquiry-modal-${inquiry.id}`
                            );
                            modal.style.display = "block";
                          }}
                          className="text-emerald-600 hover:text-emerald-900 mr-3"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleDeleteInquiry(inquiry.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>

                        {/* Inquiry Modal */}
                        <div
                          id={`inquiry-modal-${inquiry.id}`}
                          className="fixed inset-0 bg-gray-600 bg-opacity-50 hidden z-50"
                          onClick={(e) => {
                            if (e.target.id === `inquiry-modal-${inquiry.id}`) {
                              e.target.style.display = "none";
                            }
                          }}
                        >
                          <div className="flex items-center justify-center min-h-screen p-4">
                            <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
                              <div className="bg-gradient-to-r from-emerald-600 to-lime-500 p-6 text-white">
                                <div className="flex justify-between items-center">
                                  <h3 className="text-xl font-bold">
                                    Inquiry Details
                                  </h3>
                                  <button
                                    onClick={() => {
                                      document.getElementById(
                                        `inquiry-modal-${inquiry.id}`
                                      ).style.display = "none";
                                    }}
                                    className="text-white hover:text-gray-200"
                                  >
                                    ✕
                                  </button>
                                </div>
                                <p className="text-emerald-100">
                                  ID: #{inquiry.id}
                                </p>
                              </div>

                              <div className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-semibold text-gray-800">
                                      Client Information
                                    </h4>
                                    <p>
                                      <strong>Name:</strong>{" "}
                                      {inquiry.client_name || inquiry.name}
                                    </p>
                                    <p>
                                      <strong>Email:</strong> {inquiry.email}
                                    </p>
                                    {inquiry.phone && (
                                      <p>
                                        <strong>Phone:</strong> {inquiry.phone}
                                      </p>
                                    )}
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-gray-800">
                                      Inquiry Details
                                    </h4>
                                    <p>
                                      <strong>Project:</strong>{" "}
                                      {inquiry.project_title || inquiry.subject}
                                    </p>
                                    <p>
                                      <strong>Date:</strong>{" "}
                                      {new Date(
                                        inquiry.created_at
                                      ).toLocaleString()}
                                    </p>
                                  </div>
                                </div>

                                {inquiry.message && (
                                  <div>
                                    <h4 className="font-semibold text-gray-800">
                                      Message
                                    </h4>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                      <p className="text-gray-700">
                                        {inquiry.message}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Custom Designs Tab */}
        {activeTab === "custom-designs" && (
          <div className="bg-white rounded-lg shadow-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Custom Design Requests
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Budget
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {customDesignRequests.map((request) => (
                    <tr
                      key={request._id || request.id}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {request.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {request.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request.projectType
                          ?.replace("-", " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request.budget
                          ?.replace("-", " - ")
                          .replace(/\b\w/g, (l) => l.toUpperCase()) ||
                          "Not specified"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(
                          request.created_at || request.createdAt
                        ).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={request.status || "new"}
                          onChange={(e) =>
                            handleUpdateCustomRequestStatus(
                              request._id || request.id,
                              e.target.value
                            )
                          }
                          className={`px-2 py-1 text-xs font-medium rounded-full border ${
                            request.status === "contacted"
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                              : request.status === "in-progress"
                              ? "bg-blue-100 text-blue-800 border-blue-300"
                              : request.status === "completed"
                              ? "bg-green-100 text-green-800 border-green-300"
                              : "bg-yellow-100 text-yellow-800 border-yellow-300"
                          }`}
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => {
                            const modal = document.getElementById(
                              `modal-${request._id || request.id}`
                            );
                            modal.style.display = "block";
                          }}
                          className="text-emerald-600 hover:text-emerald-900 mr-3"
                        >
                          View Details
                        </button>
                        <button className="text-blue-600 hover:text-blue-900 mr-3">
                          Contact
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteCustomRequest(request._id || request.id)
                          }
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>

                        {/* Modal for detailed view */}
                        <div
                          id={`modal-${request._id || request.id}`}
                          className="fixed inset-0 bg-gray-600 bg-opacity-50 hidden z-50"
                          onClick={(e) => {
                            if (
                              e.target.id ===
                              `modal-${request._id || request.id}`
                            ) {
                              e.target.style.display = "none";
                            }
                          }}
                        >
                          <div className="flex items-center justify-center min-h-screen p-4">
                            <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
                              <div className="bg-gradient-to-r from-emerald-600 to-lime-500 p-6 text-white">
                                <div className="flex justify-between items-center">
                                  <h3 className="text-xl font-bold">
                                    Custom Design Request
                                  </h3>
                                  <button
                                    onClick={() => {
                                      document.getElementById(
                                        `modal-${request._id || request.id}`
                                      ).style.display = "none";
                                    }}
                                    className="text-white hover:text-gray-200"
                                  >
                                    ✕
                                  </button>
                                </div>
                                <p className="text-emerald-100">
                                  ID: #
                                  {(request._id || request.id)
                                    .toString()
                                    .slice(-8)}
                                </p>
                              </div>

                              <div className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-semibold text-gray-800">
                                      Client Information
                                    </h4>
                                    <p>
                                      <strong>Name:</strong> {request.name}
                                    </p>
                                    <p>
                                      <strong>Email:</strong> {request.email}
                                    </p>
                                    {request.phone && (
                                      <p>
                                        <strong>Phone:</strong> {request.phone}
                                      </p>
                                    )}
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-gray-800">
                                      Project Details
                                    </h4>
                                    <p>
                                      <strong>Type:</strong>{" "}
                                      {request.projectType
                                        ?.replace("-", " ")
                                        .replace(/\b\w/g, (l) =>
                                          l.toUpperCase()
                                        )}
                                    </p>
                                    {request.rooms && (
                                      <p>
                                        <strong>Rooms:</strong>{" "}
                                        {request.rooms.replace("-", " ")}
                                      </p>
                                    )}
                                    {request.budget && (
                                      <p>
                                        <strong>Budget:</strong>{" "}
                                        {request.budget
                                          .replace("-", " - ")
                                          .replace(/\b\w/g, (l) =>
                                            l.toUpperCase()
                                          )}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                {request.description && (
                                  <div>
                                    <h4 className="font-semibold text-gray-800">
                                      Project Description
                                    </h4>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                      <p className="text-gray-700">
                                        {request.description}
                                      </p>
                                    </div>
                                  </div>
                                )}

                                <div className="pt-4 border-t">
                                  <p className="text-sm text-gray-500">
                                    Submitted:{" "}
                                    {new Date(
                                      request.created_at || request.createdAt
                                    ).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Engagement Analytics
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Monthly Project Uploads
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.monthlyUploads}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => [value, "Projects Uploaded"]}
                      />
                      <Bar dataKey="uploads" fill="#10B981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Top Performing Projects
                  </h3>
                  <div className="space-y-4 max-h-80 overflow-y-auto">
                    {analytics.engagementStats.map((project, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <span className="font-medium text-sm">
                            {project.name}
                          </span>
                          <div className="flex space-x-4 text-xs text-gray-600 mt-1">
                            <span>👁️ {project.views}</span>
                            <span>❤️ {project.favorites}</span>
                            <span>💬 {project.inquiries}</span>
                          </div>
                        </div>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-emerald-600 h-2 rounded-full"
                            style={{
                              width: `${Math.min(
                                (project.views /
                                  Math.max(
                                    ...analytics.engagementStats.map(
                                      (p) => p.views
                                    )
                                  )) *
                                  100,
                                100
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Additional Analytics Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Conversion Metrics
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">
                        View to Inquiry Rate
                      </span>
                      <span className="font-semibold text-emerald-600">
                        {analytics.totalViews > 0
                          ? (
                              (analytics.totalInquiries /
                                analytics.totalViews) *
                              100
                            ).toFixed(1)
                          : 0}
                        %
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">
                        Project Favorite Rate
                      </span>
                      <span className="font-semibold text-emerald-600">
                        {analytics.totalViews > 0
                          ? (
                              (analytics.totalFavorites /
                                analytics.totalViews) *
                              100
                            ).toFixed(1)
                          : 0}
                        %
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">
                        Average Views per Project
                      </span>
                      <span className="font-semibold text-emerald-600">
                        {analytics.totalProjects > 0
                          ? Math.round(
                              analytics.totalViews / analytics.totalProjects
                            )
                          : 0}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Activity Summary
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Active Projects</span>
                      <span className="font-semibold text-emerald-600">
                        {
                          projects.filter((p) => p.status === "published")
                            .length
                        }
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Pending Inquiries</span>
                      <span className="font-semibold text-yellow-600">
                        {inquiries.filter((i) => i.status === "new").length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">
                        Custom Requests in Progress
                      </span>
                      <span className="font-semibold text-blue-600">
                        {
                          customDesignRequests.filter(
                            (r) => r.status === "in-progress"
                          ).length
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Platform Settings
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Content Management
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Auto-publish projects</p>
                      <p className="text-sm text-gray-600">
                        Automatically publish uploaded projects without review
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Email notifications</p>
                      <p className="text-sm text-gray-600">
                        Receive email alerts for new inquiries and project
                        uploads
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        defaultChecked
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Track user engagement</p>
                      <p className="text-sm text-gray-600">
                        Enable detailed analytics for project views and
                        interactions
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        defaultChecked
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Data Management
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Export Data</p>
                      <p className="text-sm text-gray-600">
                        Download all platform data as CSV files
                      </p>
                    </div>
                    <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors">
                      Export All
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                    <div>
                      <p className="font-medium text-red-900">Danger Zone</p>
                      <p className="text-sm text-red-700">
                        Permanently delete all data. This action cannot be
                        undone.
                      </p>
                    </div>
                    <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                      Delete All Data
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Backup & Security
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Auto Backup</p>
                      <p className="text-sm text-gray-600">
                        Automatically backup database weekly
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        defaultChecked
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-600">
                        Enhance security with 2FA for admin accounts
                      </p>
                    </div>
                    <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors">
                      Setup 2FA
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">API Rate Limiting</p>
                      <p className="text-sm text-gray-600">
                        Limit API requests per IP to prevent abuse
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        defaultChecked
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
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
