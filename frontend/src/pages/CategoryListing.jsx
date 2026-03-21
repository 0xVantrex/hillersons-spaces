// src/pages/CategoryListing.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../lib/api";
import { useProjects } from "../context/ProjectsContext";
import Header from "../components/Header";
import ProductCard from "../components/ProductCard";
import QuickViewModal from "../components/QuickViewModal";
import Footer from "../components/Footer";
import { Grid, List, AlertCircle, LayoutGrid } from "lucide-react";

const CategoryListing = () => {
  const { subCategoryGroup, subCategory } = useParams();
  const navigate = useNavigate();

  const [projects, setProjects]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [sortBy, setSortBy]               = useState("newest");
  const [viewMode, setViewMode]           = useState("grid");
  const [searchTerm, setSearchTerm]       = useState("");
  const [priceRange, setPriceRange]       = useState({ min: "", max: "" });
  const [showSearch, setShowSearch]       = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery]     = useState("");
  const [showQuickView, setShowQuickView] = useState(false);
  const [quickViewPlan, setQuickViewPlan] = useState(null);

  const decodedGroup   = decodeURIComponent(subCategoryGroup || "");
  const decodedSub     = decodeURIComponent(subCategory || "");
  const displayTitle   = subCategory ? decodedSub : decodedGroup;

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        const queryParams = new URLSearchParams({
          subCategoryGroup: decodedGroup,
          subCategory:      decodedSub,
          sortBy,
          search:   searchTerm  || "",
          minPrice: priceRange.min || "",
          maxPrice: priceRange.max || "",
        });
        const res = await fetch(`${API_BASE_URL}/api/projects?${queryParams}`);
        if (!res.ok) throw new Error("Failed to fetch projects");
        setProjects(await res.json());
      } catch (err) {
        console.error("Error fetching projects:", err);
        setError("Failed to load projects for this category.");
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [decodedGroup, decodedSub, sortBy, searchTerm, priceRange]);

  const handleQuickView = useCallback((project) => {
    setQuickViewPlan(project);
    setShowQuickView(true);
  }, []);

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPrice =
      (!priceRange.min || project.price >= parseInt(priceRange.min)) &&
      (!priceRange.max || project.price <= parseInt(priceRange.max));
    return matchesSearch && matchesPrice;
  });

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-brand-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-brand-500 mx-auto mb-4" />
          <p className="text-brand-600 font-semibold">Loading {displayTitle}...</p>
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-brand-50 p-4">
        <div className="bg-white border-2 border-brand-200 rounded-2xl p-8 text-center max-w-md w-full shadow-lg">
          <div className="w-14 h-14 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7 text-brand-600" />
          </div>
          <h3 className="text-xl font-semibold text-brand-800 mb-4">{error}</h3>
          <button
            onClick={() => window.location.reload()}
            className="bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 px-6 rounded-xl transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ── Main ─────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-brand-50">
      <Header
        showSearch={showSearch}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        showMobileMenu={showMobileMenu}
        setShowMobileMenu={setShowMobileMenu}
        setShowSearch={setShowSearch}
        projects={projects}
      />

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <div
        className="relative h-[60vh] md:h-[70vh] bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://res.cloudinary.com/dbj7nhyy4/image/upload/v1750537577/IMG-20250616-WA0197_qgi54a.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 to-black/40 z-0" />

        <div className="relative z-10 max-w-6xl mx-auto h-full flex flex-col justify-center px-6 text-white">
          {/* Breadcrumb */}
          <nav className="text-sm text-white/70 mb-4 flex items-center flex-wrap gap-1">
            <Link to="/" className="hover:text-white transition">Home</Link>
            <span className="mx-1">›</span>
            <Link to="/categories" className="hover:text-white transition">Categories</Link>
            {subCategoryGroup && (
              <>
                <span className="mx-1">›</span>
                <Link
                  to={`/category/${encodeURIComponent(decodedGroup)}`}
                  className="hover:text-white transition"
                >
                  {decodedGroup}
                </Link>
              </>
            )}
            {subCategory && (
              <>
                <span className="mx-1">›</span>
                <span className="font-semibold text-white">{decodedSub}</span>
              </>
            )}
          </nav>

          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight drop-shadow-md">
            {displayTitle}
          </h1>
          <p className="mt-4 text-lg md:text-xl max-w-2xl text-white/90 drop-shadow-sm">
            Explore our expertly designed {displayTitle.toLowerCase()} — blending
            style, comfort, and architectural innovation. We currently have{" "}
            <span className="font-bold">{filteredProjects.length}</span> premium
            listing{filteredProjects.length === 1 ? "" : "s"} available.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* ── Filters bar ──────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm border border-brand-100">
          <div className="flex flex-wrap items-center justify-between gap-4">

            {/* Sort */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-brand-700 font-medium mr-1 text-sm">Sort by:</span>
              {[
                { value: "newest",     label: "Newest" },
                { value: "price-low",  label: "Price: Low to High" },
                { value: "price-high", label: "Price: High to Low" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                    sortBy === option.value
                      ? "bg-brand-600 text-white shadow"
                      : "bg-brand-50 text-brand-700 hover:bg-brand-100"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* Price range */}
            <div className="flex items-center gap-2">
              <span className="text-brand-700 font-medium text-sm">Price:</span>
              <input
                type="number"
                placeholder="Min"
                value={priceRange.min}
                onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                className="w-20 px-3 py-2 border-2 border-brand-200 rounded-xl text-sm text-brand-900 placeholder-brand-300 focus:outline-none focus:border-brand-500"
              />
              <span className="text-brand-300">–</span>
              <input
                type="number"
                placeholder="Max"
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                className="w-20 px-3 py-2 border-2 border-brand-200 rounded-xl text-sm text-brand-900 placeholder-brand-300 focus:outline-none focus:border-brand-500"
              />
            </div>

            {/* View mode */}
            <div className="flex bg-brand-50 rounded-xl p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition ${
                  viewMode === "grid"
                    ? "bg-brand-600 text-white shadow"
                    : "text-brand-600 hover:text-brand-800"
                }`}
              >
                <Grid className="w-4 h-4" />
                Grid
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition ${
                  viewMode === "list"
                    ? "bg-brand-600 text-white shadow"
                    : "text-brand-600 hover:text-brand-800"
                }`}
              >
                <List className="w-4 h-4" />
                List
              </button>
            </div>
          </div>
        </div>

        {/* ── Projects grid ─────────────────────────────────────────────────────── */}
        {filteredProjects.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-brand-100">
            <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <LayoutGrid className="w-10 h-10 text-brand-300" />
            </div>
            <h3 className="text-2xl font-semibold text-brand-800 mb-4">
              No projects found in {displayTitle}
            </h3>
            <p className="text-brand-500 mb-8 text-base">
              We're constantly adding new projects. Check back soon or explore other categories.
            </p>
            <button
              onClick={() => navigate("/categories")}
              className="bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 px-8 rounded-xl transition shadow"
            >
              Browse All Categories
            </button>
          </div>
        ) : (
          <div className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              : "space-y-6"
          }>
            {filteredProjects.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                viewMode={viewMode}
                onQuickView={() => handleQuickView(product)}
              />
            ))}
          </div>
        )}

        {/* Load more */}
        {filteredProjects.length > 0 && (
          <div className="text-center mt-12">
            <button className="bg-white hover:bg-brand-50 text-brand-600 font-semibold py-4 px-8 rounded-xl border-2 border-brand-500 transition shadow hover:shadow-md">
              Load More Projects
            </button>
          </div>
        )}
      </div>

      <Footer />

      {/* Quick view modal */}
      {showQuickView && quickViewPlan && (
        <QuickViewModal
          product={{
            ...quickViewPlan,
            bedrooms:   quickViewPlan.rooms,
            floorCount: quickViewPlan.floorCount,
          }}
          isOpen={showQuickView}
          onClose={() => setShowQuickView(false)}
        />
      )}
    </div>
  );
};

export default CategoryListing;