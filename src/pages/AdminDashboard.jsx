import React, { useEffect, useState, useCallback } from "react";
import { collection, getDocs, deleteDoc, doc, updateDoc, query, where, orderBy, limit } from "firebase/firestore";
import { db, auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
// import { Link } from "react-router-dom"; 
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

const ADMIN_UID = "Sgq6bMDa6FhYznUUNKP6G97y0iM2"; // Replace with actual admin UID

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  
  // Data states
  const [projects, setProjects] = useState([]);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalProjects: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingReviews: 0,
    monthlyRevenue: [],
    categoryBreakdown: [],
    recentActivity: []
  });

  // Auth check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    try {
      // Fetch projects
      const projectSnapshot = await getDocs(collection(db, "projects"));
      const projectData = projectSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProjects(projectData);

      // Fetch pending reviews
      const reviewsQuery = query(collection(db, "reviews"), where("status", "==", "pending"));
      const reviewSnapshot = await getDocs(reviewsQuery);
      const reviewData = reviewSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPendingReviews(reviewData);

      // Fetch orders (assuming you have an orders collection)
      const orderSnapshot = await getDocs(collection(db, "orders"));
      const orderData = orderSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(orderData);

      // Calculate analytics
      const totalRevenue = orderData.reduce((sum, order) => sum + (order.total || 0), 0);
      const categoryBreakdown = projectData.reduce((acc, project) => {
        const category = project.category || 'Uncategorized';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {});

      setAnalytics({
        totalProjects: projectData.length,
        totalOrders: orderData.length,
        totalRevenue,
        pendingReviews: reviewData.length,
        categoryBreakdown: Object.entries(categoryBreakdown).map(([name, value]) => ({ name, value })),
        monthlyRevenue: generateMonthlyData(orderData),
        recentActivity: generateRecentActivity(projectData, orderData, reviewData)
      });

    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, []);

  useEffect(() => {
    if (user && user.uid === ADMIN_UID) {
      fetchAllData();
    }
  }, [user, fetchAllData]);

  const generateMonthlyData = (orders) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({
      month,
      revenue: Math.floor(Math.random() * 50000) + 10000
    }));
  };

  const generateRecentActivity = (projects, orders, reviews) => {
    const activities = [];
    projects.slice(0, 3).forEach(project => {
      activities.push({
        type: 'project',
        message: `New project uploaded: ${project.title}`,
        time: '2 hours ago',
        icon: '🏗️'
      });
    });
    orders.slice(0, 2).forEach(order => {
      activities.push({
        type: 'order',
        message: `New order: KES ${order.total?.toLocaleString()}`,
        time: '4 hours ago',
        icon: '💰'
      });
    });
    return activities.slice(0, 5);
  };

  const handleDeleteProject = async (id) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      await deleteDoc(doc(db, "projects", id));
      fetchAllData();
    }
  };

  const handleApproveReview = async (reviewId) => {
    await updateDoc(doc(db, "reviews", reviewId), { status: "approved" });
    fetchAllData();
  };

  const handleRejectReview = async (reviewId) => {
    await updateDoc(doc(db, "reviews", reviewId), { status: "rejected" });
    fetchAllData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || user.uid !== ADMIN_UID) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600">You are not authorized to access this admin panel.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'projects', label: 'Projects', icon: '🏗️' },
    { id: 'orders', label: 'Orders', icon: '🛒' },
    { id: 'reviews', label: 'Reviews', icon: '⭐' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  const StatCard = ({ title, value, icon, trend }) => (
    <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {trend && (
            <p className={`text-sm mt-2 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}% from last month
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
              <h1 className="text-3xl font-bold text-gray-900">🏛️ Admin Dashboard</h1>
              <span className="ml-4 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Admin
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Welcome, {user?.email}
              </div>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
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
                    ? 'bg-green-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard 
                title="Total Projects" 
                value={analytics.totalProjects} 
                icon="🏗️" 
                trend={12}
              />
              <StatCard 
                title="Total Orders" 
                value={analytics.totalOrders} 
                icon="🛒" 
                trend={8}
              />
              <StatCard 
                title="Revenue" 
                value={`KES ${analytics.totalRevenue.toLocaleString()}`} 
                icon="💰" 
                trend={15}
              />
              <StatCard 
                title="Pending Reviews" 
                value={analytics.pendingReviews} 
                icon="⭐" 
                trend={-5}
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Chart */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`KES ${value.toLocaleString()}`, 'Revenue']} />
                    <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Category Breakdown */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Categories</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {analytics.categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#10B981', '#84CC16', '#F59E0B', '#EF4444'][index % 4]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {analytics.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
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
        {activeTab === 'projects' && (
          <div className="bg-white rounded-lg shadow-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Project Management</h2>
                <button 
                  onClick={() => window.location.href = '/admin/upload'}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  + Add New Project
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {projects.map((project) => (
                    <tr key={project.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img 
                            className="h-12 w-12 rounded-lg object-cover" 
                            src={project.images?.[0] || '/placeholder.jpg'} 
                            alt={project.title}
                          />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{project.title}</div>
                            <div className="text-sm text-gray-500">{project.rooms} rooms • {project.area} sqm</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          {project.category || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        KES {project.price?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button 
                          onClick={() => window.location.href = `/project/${project.id}`}
                          className="text-green-600 hover:text-green-900"
                        >
                          View
                        </button>
                        <button 
                          onClick={() => window.location.href = `/admin/edit/${project.id}`}
                          className="text-lime-600 hover:text-lime-900"
                        >
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

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="bg-white rounded-lg shadow-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Review Management</h2>
              <p className="text-gray-600 mt-1">Approve or reject customer reviews</p>
            </div>
            <div className="p-6">
              {pendingReviews.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">✅</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
                  <p className="text-gray-500">No reviews awaiting approval.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {pendingReviews.map((review) => (
                    <div key={review.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-medium text-gray-900">{review.displayName}</h4>
                          <div className="flex items-center mt-1">
                            <div className="flex text-yellow-400">
                              {[...Array(5)].map((_, i) => (
                                <span key={i}>{i < review.rating ? '★' : '☆'}</span>
                              ))}
                            </div>
                            <span className="ml-2 text-sm text-gray-500">{review.rating}/5</span>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                          Pending
                        </span>
                      </div>
                      
                      <p className="text-gray-700 mb-4">{review.comment}</p>
                      
                      {review.imageUrl && (
                        <img 
                          src={review.imageUrl} 
                          alt="Review" 
                          className="w-32 h-32 object-cover rounded-lg mb-4"
                        />
                      )}
                      
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleApproveReview(review.id)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => handleRejectReview(review.id)}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                        >
                          ✗ Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-lg shadow-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Order Management</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                        #{order.id.slice(-8)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                        <div className="text-sm text-gray-500">{order.customerEmail}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.items?.length || 0} items
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        KES {order.total?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          {order.status || 'Completed'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-green-600 hover:text-green-900">View Details</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Advanced Analytics</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Sales Performance</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.monthlyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`KES ${value.toLocaleString()}`, 'Revenue']} />
                      <Bar dataKey="revenue" fill="#10B981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Top Categories</h3>
                  <div className="space-y-4">
                    {analytics.categoryBreakdown.map((category, index) => (
                      <div key={category.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">{category.name}</span>
                        <div className="flex items-center">
                          <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${(category.value / Math.max(...analytics.categoryBreakdown.map(c => c.value))) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">{category.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">System Settings</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">General Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Auto-approve reviews</p>
                      <p className="text-sm text-gray-600">Automatically approve reviews from verified buyers</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Email notifications</p>
                      <p className="text-sm text-gray-600">Receive email alerts for new orders and reviews</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
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