import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProfilePage from "./pages/Profile";
import HomePage from "./pages/Home";
import UploadProject from "./pages/UploadProject";
import ProductDetail from "./pages/productDetail";
import AllProducts from "./pages/AllProducts";
import Categories from "./pages/Categories";
import CategoryListing from "./pages/CategoryListing";
import AdminDashboard from "./pages/AdminDashboard";
import CartPage from "./App/cart/page";
import AboutUs from "./pages/AboutUs";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import ResetPassword from "./pages/ResetPassword";
import CustomDesignForm from "./pages/CustomDesignForm";
import Contact from "./pages/Contact";
import VendorApply from "./pages/VendorApply";
import VendorDashboard from "./pages/VendorDashboard";

function App() {
  const { user, loading, isAdmin, isApprovedVendor } = useAuth();

  // ── Any logged-in user ─────────────────────────────────────────────────────
  const RequireAuth = ({ children }) => {
    const location = useLocation();
    if (loading) return null;
    if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
    return children;
  };

  // ── Admin only ─────────────────────────────────────────────────────────────
  const RequireAdmin = ({ children }) => {
    const location = useLocation();
    if (loading) return null;
    if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
    if (!isAdmin) return <Navigate to="/" replace />;
    return children;
  };

  // ── Approved vendors + admins ──────────────────────────────────────────────
  const RequireVendor = ({ children }) => {
    const location = useLocation();
    if (loading) return null;
    if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
    if (!isApprovedVendor && !isAdmin) return <Navigate to="/vendor/apply" replace />;
    return children;
  };

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/productDetail" element={<ProductDetail />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/quick-buy/:id" element={<CartPage />} />
      <Route path="/categories/:subCategoryGroup" element={<CategoryListing />} />
      <Route path="/categories/:subCategoryGroup/:subCategory" element={<CategoryListing />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/allproducts" element={<AllProducts />} />
      <Route path="/categories" element={<Categories />} />
      <Route path="/categorylisting" element={<CategoryListing />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/aboutus" element={<AboutUs />} />
      <Route path="/custom-design" element={<CustomDesignForm />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* Any logged-in user */}
      <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />

      {/* Vendor apply — any logged-in user can apply */}
      <Route path="/vendor/apply" element={<RequireAuth><VendorApply /></RequireAuth>} />

      {/* Approved vendor only */}
      <Route path="/vendor/dashboard" element={<RequireVendor><VendorDashboard /></RequireVendor>} />

      {/* Admin only */}
      <Route path="/admin/dashboard" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
      <Route path="/admin/upload" element={<RequireAdmin><UploadProject /></RequireAdmin>} />
    </Routes>
  );
}

export default App;