import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, Filter, Grid, List,
  SlidersHorizontal, X, Zap, Award, Pencil, Mail,
  Users, CheckCircle, Layers, Home, Briefcase,
  Shield, Sparkles, Crown, Star,
} from "lucide-react";
import QuickViewModal from "../components/QuickViewModal";
import ProductCard from "../components/ProductCard";
import { API_BASE_URL } from "../lib/api";
import { useProjects } from "../context/ProjectsContext";
import Header from "../components/Header";
import Footer from "../components/Footer";

const AllProducts = () => {
  const { projects } = useProjects();
  const navigate = useNavigate();

  const [quickViewPlan, setQuickViewPlan]     = useState(null);
  const [products, setProducts]               = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [viewMode, setViewMode]               = useState("grid");
  const [showFilters, setShowFilters]         = useState(false);
  const [searchQuery, setSearchQuery]         = useState("");
  const [favorites, setFavorites]             = useState(new Set());
  const [showQuickView, setShowQuickView]     = useState(false);
  const [showSearch, setShowSearch]           = useState(false);
  const [showMobileMenu, setShowMobileMenu]   = useState(false);
  const [activeCategory, setActiveCategory]   = useState("all");
  const [isMobile, setIsMobile]               = useState(false);

  const [filters, setFilters] = useState({
    category: "", rooms: "", floors: "",
    featured: false, newListing: false, premium: false,
  });
  const [sort, setSort] = useState("featured");

  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth < 1024);
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  const categories = [
    { id: "all",         name: "All Designs",      icon: Layers },
    { id: "Residential", name: "Residential",       icon: Home },
    { id: "Commercial",  name: "Commercial",        icon: Briefcase },
    { id: "Social",      name: "Social Amenities",  icon: Users },
    { id: "Interior",    name: "Interior Design",   icon: Sparkles },
    { id: "Renovation",  name: "Renovation",        icon: Zap },
    { id: "Premium",     name: "Premium",           icon: Crown },
  ];

  const trustIndicators = [
    { icon: Shield, text: "100% Verified Architects" },
    { icon: Users,  text: "10,000+ Happy Clients" },
    { icon: Award,  text: "Award-Winning Designs" },
    { icon: Star,   text: "Free Access to All Plans" },
  ];

  useEffect(() => { fetchPlans(); }, []);

  const fetchPlans = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/plans`);
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      const normalized = data.map((item) => ({
        ...item,
        images:
          Array.isArray(item.finalImageURLs) && item.finalImageURLs.length > 0
            ? item.finalImageURLs
            : ["https://via.placeholder.com/600x400?text=No+Image"],
      }));
      setProducts(normalized);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesSearch =
          !searchQuery ||
          p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory =
          activeCategory === "all" ||
          (activeCategory === "Premium"
            ? p.premium
            : p.subCategoryGroup?.includes(activeCategory));

        return (
          matchesSearch &&
          matchesCategory &&
          (!filters.category   || p.subCategoryGroup?.includes(filters.category)) &&
          (!filters.rooms      || parseInt(p.rooms      || 0) >= parseInt(filters.rooms)) &&
          (!filters.floors     || parseInt(p.floorCount || 0) >= parseInt(filters.floors)) &&
          (!filters.featured   || p.featured) &&
          (!filters.newListing || p.newListing) &&
          (!filters.premium    || p.premium)
        );
      })
      .sort((a, b) => {
        if (sort === "featured") return (b.featured   ? 1 : 0) - (a.featured   ? 1 : 0);
        if (sort === "newest")   return (b.newListing ? 1 : 0) - (a.newListing ? 1 : 0);
        if (sort === "popular")  return (b.views  || 0) - (a.views  || 0);
        if (sort === "rating")   return parseFloat(b.rating || 0) - parseFloat(a.rating || 0);
        return 0;
      });
  }, [products, filters, sort, searchQuery, activeCategory]);

  const toggleFavorite = (productId) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(productId) ? next.delete(productId) : next.add(productId);
      return next;
    });
  };

  const clearFilters = () => {
    setFilters({ category: "", rooms: "", floors: "", featured: false, newListing: false, premium: false });
    setSort("featured");
    setSearchQuery("");
    setActiveCategory("all");
  };

  const activeFiltersCount =
    Object.values(filters).filter(Boolean).length +
    (activeCategory !== "all" ? 1 : 0);

  const handleQuickView = useCallback((plan) => {
    setQuickViewPlan(plan);
    setShowQuickView(true);
  }, []);

  // ── Filter panel (shared between sidebar + mobile sheet) ────────────────────
  const FilterContent = () => (
    <>
      {/* Categories */}
      <div className="mb-6">
        <h3 className="font-semibold text-brand-900 mb-3 text-sm uppercase tracking-wide">
          Categories
        </h3>
        <div className="space-y-1">
          {categories.map(({ id, name, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveCategory(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition ${
                activeCategory === id
                  ? "bg-brand-600 text-white font-medium"
                  : "text-brand-700 hover:bg-brand-50"
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="mb-6">
        <h3 className="font-semibold text-brand-900 mb-3 text-sm uppercase tracking-wide">
          Features
        </h3>
        <div className="space-y-2">
          {[
            { key: "featured",   label: "Featured",    icon: Award },
            { key: "newListing", label: "New Listing",  icon: Sparkles },
            { key: "premium",    label: "Premium",      icon: Crown },
          ].map((feature) => (
            <label
              key={feature.key}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-brand-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={filters[feature.key]}
                onChange={(e) =>
                  setFilters({ ...filters, [feature.key]: e.target.checked })
                }
                className="w-4 h-4 accent-brand-600 rounded"
              />
              <feature.icon className="w-4 h-4 text-brand-400" />
              <span className="text-sm text-brand-800">{feature.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div>
        <h3 className="font-semibold text-brand-900 mb-3 text-sm uppercase tracking-wide">
          Sort By
        </h3>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="w-full p-3 border-2 border-brand-200 rounded-xl text-sm text-brand-900 focus:outline-none focus:border-brand-500"
        >
          <option value="featured">Featured</option>
          <option value="newest">Newest</option>
          <option value="popular">Most Popular</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>
    </>
  );

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-brand-50">
        <Header
          showSearch={showSearch} searchQuery={searchQuery}
          setSearchQuery={setSearchQuery} showMobileMenu={showMobileMenu}
          setShowMobileMenu={setShowMobileMenu} setShowSearch={setShowSearch}
          projects={projects}
        />
        <div className="container mx-auto px-4 py-8 pt-24 animate-pulse space-y-8">
          <div className="h-40 bg-brand-100 rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow">
                <div className="h-56 bg-brand-100" />
                <div className="p-6 space-y-3">
                  <div className="h-5 bg-brand-50 rounded w-3/4" />
                  <div className="h-4 bg-brand-50 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Main ─────────────────────────────────────────────────────────────────────
  return (
    <div className="bg-brand-50 min-h-screen">
      <Header
        showSearch={showSearch} searchQuery={searchQuery}
        setSearchQuery={setSearchQuery} showMobileMenu={showMobileMenu}
        setShowMobileMenu={setShowMobileMenu} setShowSearch={setShowSearch}
      />

      <main className="container mx-auto px-4 py-6 pt-24">

        {/* ── Hero banner ───────────────────────────────────────────────────── */}
        <section className="mb-10">
          <div className="bg-brand-600 rounded-2xl p-8 text-white">
            <h1 className="text-4xl font-bold mb-3">Browse House Plans</h1>
            <p className="text-brand-100 text-lg mb-6 max-w-2xl">
              {products.length} professionally crafted architectural plans — all free, no purchase required.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {trustIndicators.map(({ icon: Icon, text }, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm text-brand-100">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Mobile filter bar ─────────────────────────────────────────────── */}
        {isMobile && (
          <div className="sticky top-20 z-40 mb-6 bg-white p-3 rounded-xl shadow-sm border border-brand-100 flex justify-between items-center">
            <button
              onClick={() => setShowFilters(true)}
              className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              <Filter className="w-4 h-4" />
              Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </button>
            <div className="flex bg-brand-50 rounded-lg p-1">
              {["grid", "list"].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`p-2 rounded-md transition ${
                    viewMode === mode
                      ? "bg-white shadow-sm text-brand-600"
                      : "text-brand-400"
                  }`}
                >
                  {mode === "grid" ? <Grid className="w-4 h-4" /> : <List className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Desktop sidebar ───────────────────────────────────────────────── */}
          {!isMobile && (
            <aside className="lg:w-72 flex-shrink-0">
              <div className="bg-white rounded-2xl shadow-sm border border-brand-100 p-6 sticky top-24">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold text-brand-900 flex items-center gap-2">
                    <Filter className="w-5 h-5 text-brand-600" />
                    Filters
                  </h2>
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-brand-600 hover:text-brand-800 font-medium transition"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                <FilterContent />
              </div>
            </aside>
          )}

          {/* ── Products area ─────────────────────────────────────────────────── */}
          <div className="flex-1">

            {/* Results header */}
            <div className="bg-white rounded-2xl shadow-sm border border-brand-100 p-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-brand-900">
                  {filteredProducts.length} Design{filteredProducts.length !== 1 ? "s" : ""} Found
                </h2>
                <p className="text-brand-500 text-sm">
                  {activeCategory === "all"
                    ? "All categories"
                    : categories.find((c) => c.id === activeCategory)?.name}
                </p>
              </div>
              {!isMobile && (
                <div className="flex bg-brand-50 rounded-lg p-1">
                  {["grid", "list"].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className={`p-2 rounded-md transition ${
                        viewMode === mode
                          ? "bg-white shadow-sm text-brand-600"
                          : "text-brand-400 hover:text-brand-600"
                      }`}
                    >
                      {mode === "grid" ? <Grid className="w-4 h-4" /> : <List className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Grid / empty state */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-brand-100 p-12 text-center">
                <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-10 h-10 text-brand-400" />
                </div>
                <h3 className="text-xl font-bold text-brand-900 mb-3">No designs found</h3>
                <p className="text-brand-500 mb-6 max-w-sm mx-auto">
                  Try adjusting your filters or search terms.
                </p>
                <button
                  onClick={clearFilters}
                  className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-xl font-medium transition"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-6"
              }>
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    isFavorite={favorites.has(product._id)}
                    onToggleFavorite={() => toggleFavorite(product._id)}
                    viewMode={viewMode}
                    onQuickView={() => handleQuickView(product)}
                  />
                ))}
              </div>
            )}

            {/* CTA banner */}
            <div className="mt-12 bg-brand-600 rounded-2xl p-8 text-white text-center">
              <h3 className="text-2xl font-bold mb-3">Can't find what you're looking for?</h3>
              <p className="text-brand-100 mb-6 max-w-md mx-auto">
                Our architects can create a custom design tailored to your specific needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => navigate("/custom-design")}
                  className="bg-white text-brand-700 hover:bg-brand-50 px-6 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2"
                >
                  <Pencil className="w-5 h-5" />
                  Request Custom Design
                </button>
                <a
                  href="mailto:HillersonsDesigns@gmail.com"
                  className="bg-brand-500 hover:bg-brand-400 text-white px-6 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2"
                >
                  <Mail className="w-5 h-5" />
                  Contact Our Team
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* ── Mobile filter sheet ───────────────────────────────────────────────── */}
      {isMobile && showFilters && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center">
          <div className="bg-white w-full max-h-[85vh] rounded-t-2xl overflow-hidden">
            <div className="sticky top-0 bg-white border-b border-brand-100 p-4 flex justify-between items-center">
              <h2 className="text-lg font-bold text-brand-900">Filters</h2>
              <button
                onClick={() => setShowFilters(false)}
                className="p-2 rounded-full hover:bg-brand-50 transition"
              >
                <X className="w-5 h-5 text-brand-600" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto max-h-[calc(85vh-60px)]">
              <FilterContent />
              <button
                onClick={() => setShowFilters(false)}
                className="w-full mt-6 bg-brand-600 hover:bg-brand-700 text-white py-3 rounded-xl font-semibold transition"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Quick view modal ──────────────────────────────────────────────────── */}
      {showQuickView && quickViewPlan && (
        <QuickViewModal
          product={{
            ...quickViewPlan,
            bedrooms: quickViewPlan.rooms,
            floorCount: quickViewPlan.floorCount,
          }}
          isOpen={showQuickView}
          onClose={() => setShowQuickView(false)}
        />
      )}
    </div>
  );
};

export default AllProducts;