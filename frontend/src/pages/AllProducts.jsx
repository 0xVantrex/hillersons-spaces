import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  Grid,
  List,
  Eye,
  ArrowRight,
  SlidersHorizontal,
  X,
  Zap,
  Award,
  Pencil,
  Mail,
  Users,
  CheckCircle,
  Layers,
  Home,
  Briefcase,
  Shield,
  Flashlight,
  Sparkles,
  Crown,
  Heart,
  Star,
  MapPin,
  Clock,
  Download,
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
  const [quickViewPlan, setQuickViewPlan] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState(new Set());
  const [showQuickView, setShowQuickView] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [isMobile, setIsMobile] = useState(false);

  const [filters, setFilters] = useState({
    category: "",
    rooms: "",
    floors: "",
    featured: false,
    newListing: false,
    customizable: false,
    premium: false,
    quickDelivery: false,
  });
  const [priceRange, setPriceRange] = useState([0, 10000000]);
  const [sort, setSort] = useState("featured");

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => {
      window.removeEventListener("resize", checkIsMobile);
    };
  }, []);

  // Categories with icons
  const categories = [
    {
      id: "all",
      name: "All Designs",
      icon: Layers,
      color: "from-gray-500 to-gray-700",
    },
    {
      id: "Residential",
      name: "Residential",
      icon: Home,
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: "Commercial",
      name: "Commercial",
      icon: Briefcase,
      color: "from-purple-500 to-pink-500",
    },
    {
      id: "Social",
      name: "Social Amenities",
      icon: Users,
      color: "from-green-500 to-emerald-500",
    },
    {
      id: "Interior",
      name: "Interior Design",
      icon: Sparkles,
      color: "from-yellow-500 to-amber-500",
    },
    {
      id: "Renovation",
      name: "Renovation",
      icon: Zap,
      color: "from-orange-500 to-red-500",
    },
    {
      id: "Premium",
      name: "Premium",
      icon: Crown,
      color: "from-amber-500 to-yellow-500",
    },
  ];

  // Trust indicators
  const trustIndicators = [
    { icon: Shield, text: "100% Verified Architects", color: "text-green-600" },
    { icon: Flashlight, text: "Instant Download", color: "text-blue-600" },
    { icon: Users, text: "10,000+ Happy Clients", color: "text-purple-600" },
    { icon: Award, text: "Award-Winning Designs", color: "text-yellow-600" },
  ];

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/plans`);
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      const normalizedData = data.map((item) => {
        const images =
          Array.isArray(item.finalImageURLs) && item.finalImageURLs.length > 0
            ? item.finalImageURLs
            : ["https://via.placeholder.com/600x400?text=No+Image"];

        return { ...item, images };
      });

      setProducts(normalizedData);
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
          p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.architect?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.tags?.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          );

        const matchesCategory =
          activeCategory === "all" ||
          (activeCategory === "Residential" &&
            p.subCategoryGroup?.includes("Residential")) ||
          (activeCategory === "Commercial" &&
            p.subCategoryGroup?.includes("Commercial")) ||
          (activeCategory === "Social" &&
            p.subCategoryGroup?.includes("Social")) ||
          (activeCategory === "Interior" &&
            p.subCategoryGroup?.includes("Interior")) ||
          (activeCategory === "Renovation" &&
            p.subCategoryGroup?.includes("Renovation")) ||
          (activeCategory === "Premium" && p.premium);

        return (
          matchesSearch &&
          matchesCategory &&
          (!filters.category ||
            p.subCategoryGroup?.includes(filters.category)) &&
          (!filters.rooms ||
            parseInt(p.rooms || 0) >= parseInt(filters.rooms)) &&
          (!filters.floors ||
            parseInt(p.floorCount || 0) >= parseInt(filters.floors)) &&
          (!filters.featured || p.featured) &&
          (!filters.newListing || p.newListing) &&
          (!filters.customizable || p.customizable) &&
          (!filters.premium || p.premium) &&
          p.price >= priceRange[0] &&
          p.price <= priceRange[1]
        );
      })
      .sort((a, b) => {
        if (sort === "featured")
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        if (sort === "price-low") return a.price - b.price;
        if (sort === "price-high") return b.price - a.price;
        if (sort === "newest")
          return (b.newListing ? 1 : 0) - (a.newListing ? 1 : 0);
        if (sort === "popular") return b.views - a.views;
        if (sort === "rating")
          return parseFloat(b.rating) - parseFloat(a.rating);
        if (sort === "downloads") return b.downloads - a.downloads;
        return 0;
      });
  }, [products, filters, priceRange, sort, searchQuery, activeCategory]);

  const toggleFavorite = (productId) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
      } else {
        newFavorites.add(productId);
      }
      return newFavorites;
    });
  };

  const clearFilters = () => {
    setFilters({
      category: "",
      rooms: "",
      floors: "",
      featured: false,
      newListing: false,
      customizable: false,
      premium: false,
      quickDelivery: false,
    });
    setPriceRange([0, 10000000]);
    setSort("featured");
    setSearchQuery("");
    setActiveCategory("all");
  };

  const activeFiltersCount =
    Object.values(filters).filter(Boolean).length +
    (priceRange[0] > 0 || priceRange[1] < 10000000 ? 1 : 0) +
    (activeCategory !== "all" ? 1 : 0);

  const handleQuickView = useCallback((plan) => {
    setQuickViewPlan(plan);
    setShowQuickView(true);
  }, []);

  // Mobile Filter Component
  const MobileFilterPopup = () => {
    if (!isMobile || !showFilters) return null;

    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-end justify-center">
        <div className="bg-white w-full max-h-[85vh] rounded-t-3xl overflow-hidden animate-slide-up">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
            <h2 className="text-xl font-bold">Filters</h2>
            <button
              onClick={() => setShowFilters(false)}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-4 overflow-y-auto max-h-[calc(85vh-60px)]">
            {/* Categories */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                        activeCategory === category.id
                          ? "bg-emerald-50 text-emerald-700 font-medium"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-lg bg-gradient-to-r ${category.color} flex items-center justify-center`}
                      >
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <span>{category.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Price Range (KES)</h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) =>
                      setPriceRange([Number(e.target.value), priceRange[1]])
                    }
                    className="w-1/2 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Min"
                  />
                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([priceRange[0], Number(e.target.value)])
                    }
                    className="w-1/2 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Max"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Under 100K", range: [0, 100000] },
                    { label: "100K-500K", range: [100000, 500000] },
                    { label: "500K-1M", range: [500000, 1000000] },
                    { label: "1M+", range: [1000000, 10000000] },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => setPriceRange(preset.range)}
                      className="text-xs bg-gray-100 hover:bg-emerald-100 text-gray-700 px-3 py-2 rounded-lg transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Features</h3>
              <div className="space-y-2">
                {[
                  { key: "featured", label: "Featured", icon: Award },
                  { key: "newListing", label: "New", icon: Sparkles },
                  {
                    key: "customizable",
                    label: "Customizable",
                    icon: SlidersHorizontal,
                  },
                  { key: "premium", label: "Premium", icon: Crown },
                ].map((feature) => (
                  <label
                    key={feature.key}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={filters[feature.key]}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          [feature.key]: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                    <feature.icon className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{feature.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Sort By</h3>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>

            {/* Apply Filters Button */}
            <button
              onClick={() => setShowFilters(false)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-medium mt-4"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50">
        <Header
          showSearch={showSearch}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          showMobileMenu={showMobileMenu}
          setShowMobileMenu={setShowMobileMenu}
          setShowSearch={setShowSearch}
          projects={projects}
        />
        <div className="container mx-auto px-4 py-8 pt-24">
          <div className="animate-pulse space-y-8">
            {/* Hero Loading */}
            <div className="h-32 bg-gradient-to-r from-green-100 via-blue-100 to-purple-100 rounded-3xl"></div>

            {/* Categories Loading */}
            <div className="flex gap-4 overflow-hidden">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-48 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl"
                ></div>
              ))}
            </div>

            {/* Products Loading */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden"
                >
                  <div className="h-56 bg-gradient-to-br from-green-100 via-blue-100 to-purple-100"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-6 bg-gray-200 rounded-lg"></div>
                    <div className="h-4 bg-gray-100 rounded w-2/3"></div>
                    <div className="flex gap-2">
                      <div className="h-4 bg-gray-100 rounded flex-1"></div>
                      <div className="h-4 bg-gray-100 rounded flex-1"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-emerald-50 to-white min-h-screen">
      <Header
        showSearch={showSearch}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        showMobileMenu={showMobileMenu}
        setShowMobileMenu={setShowMobileMenu}
        setShowSearch={setShowSearch}
      />

      <main className="container mx-auto px-4 py-6 pt-24">
        {/* Hero Section */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-emerald-800 to-emerald-600 rounded-3xl p-8 text-white shadow-2xl overflow-hidden relative">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-72 h-72 bg-white rounded-full blur-3xl opacity-10"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-lime-300 rounded-full blur-3xl opacity-10"></div>
            </div>

            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-yellow-300" />
                      <span className="text-sm font-semibold">
                        Premium Collection
                      </span>
                    </div>
                    <div className="bg-emerald-700/50 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-200" />
                      <span className="text-sm font-semibold">
                        Verified Designs
                      </span>
                    </div>
                  </div>

                  <h1 className="text-4xl md:text-5xl font-bold mb-4">
                    Discover Your Dream Home Design
                  </h1>
                  <p className="text-lg text-emerald-100 mb-8 max-w-2xl">
                    Browse {products.length} professionally crafted
                    architectural plans. Find the perfect design for your next
                    project.
                  </p>

                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                    <h3 className="font-bold text-white mb-4">Why Choose Us</h3>
                    <div className="space-y-3">
                      {trustIndicators.map((indicator, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                            <indicator.icon
                              className={`w-4 h-4 ${indicator.color}`}
                            />
                          </div>
                          <span className="text-sm text-emerald-100">
                            {indicator.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mobile Filter Button */}
        {isMobile && (
          <div className="sticky top-20 z-40 mb-6 bg-white p-4 rounded-xl shadow-lg flex justify-between items-center">
            <button
              onClick={() => setShowFilters(true)}
              className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium"
            >
              <Filter className="w-5 h-5" />
              Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </button>

            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "grid"
                    ? "bg-white shadow-sm text-emerald-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "list"
                    ? "bg-white shadow-sm text-emerald-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar - Desktop Only */}
          {!isMobile && (
            <aside className="lg:w-80">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Filter className="w-5 h-5 text-emerald-600" />
                    Filters
                  </h2>
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {/* Categories */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Categories</h3>
                  <div className="space-y-2">
                    {categories.map((category) => {
                      const IconComponent = category.icon;
                      return (
                        <button
                          key={category.id}
                          onClick={() => setActiveCategory(category.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                            activeCategory === category.id
                              ? "bg-emerald-50 text-emerald-700 font-medium"
                              : "hover:bg-gray-50"
                          }`}
                        >
                          <div
                            className={`w-10 h-10 rounded-lg bg-gradient-to-r ${category.color} flex items-center justify-center`}
                          >
                            <IconComponent className="w-5 h-5 text-white" />
                          </div>
                          <span>{category.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Price Range (KES)</h3>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <input
                        type="number"
                        value={priceRange[0]}
                        onChange={(e) =>
                          setPriceRange([Number(e.target.value), priceRange[1]])
                        }
                        className="w-1/2 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Min"
                      />
                      <input
                        type="number"
                        value={priceRange[1]}
                        onChange={(e) =>
                          setPriceRange([priceRange[0], Number(e.target.value)])
                        }
                        className="w-1/2 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Max"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: "Under 100K", range: [0, 100000] },
                        { label: "100K-500K", range: [100000, 500000] },
                        { label: "500K-1M", range: [500000, 1000000] },
                        { label: "1M+", range: [1000000, 10000000] },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          onClick={() => setPriceRange(preset.range)}
                          className="text-xs bg-gray-100 hover:bg-emerald-100 text-gray-700 px-3 py-2 rounded-lg transition-colors"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Features</h3>
                  <div className="space-y-2">
                    {[
                      { key: "featured", label: "Featured", icon: Award },
                      { key: "newListing", label: "New", icon: Sparkles },
                      {
                        key: "customizable",
                        label: "Customizable",
                        icon: SlidersHorizontal,
                      },
                      { key: "premium", label: "Premium", icon: Crown },
                    ].map((feature) => (
                      <label
                        key={feature.key}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={filters[feature.key]}
                          onChange={(e) =>
                            setFilters({
                              ...filters,
                              [feature.key]: e.target.checked,
                            })
                          }
                          className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                        <feature.icon className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{feature.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <h3 className="font-semibold mb-3">Sort By</h3>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="featured">Featured</option>
                    <option value="newest">Newest</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="popular">Most Popular</option>
                  </select>
                </div>
              </div>
            </aside>
          )}

          {/* Products Grid */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold">
                    {filteredProducts.length} Design
                    {filteredProducts.length !== 1 ? "s" : ""} Found
                  </h2>
                  <p className="text-gray-600">
                    {activeCategory === "all"
                      ? "All categories"
                      : `Filtered by ${
                          categories.find((c) => c.id === activeCategory)?.name
                        }`}
                  </p>
                </div>

                {!isMobile && (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Eye className="w-4 h-4" />
                      <span>Live results</span>
                    </div>

                    <div className="flex bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => setViewMode("grid")}
                        className={`p-2 rounded-md transition-colors ${
                          viewMode === "grid"
                            ? "bg-white shadow-sm text-emerald-600"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        <Grid className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setViewMode("list")}
                        className={`p-2 rounded-md transition-colors ${
                          viewMode === "list"
                            ? "bg-white shadow-sm text-emerald-600"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        <List className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Products */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-12 h-12 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-bold mb-4">No designs found</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Try adjusting your filters or search terms to find what you're
                  looking for.
                </p>
                <button
                  onClick={clearFilters}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "space-y-6"
                }
              >
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

            {/* Load More */}
            {filteredProducts.length > 0 &&
              filteredProducts.length % 9 === 0 && (
                <div className="mt-12 text-center">
                  <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-lg font-medium transition-colors inline-flex items-center gap-2">
                    Load More
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              )}

            {/* Call to Action */}
            <div className="mt-16 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-8 text-white text-center">
              <h3 className="text-2xl font-bold mb-4">
                Can't find what you're looking for?
              </h3>
              <p className="mb-6 max-w-md mx-auto">
                Our architects can create a custom design tailored to your
                specific needs and preferences.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate("/custom-design")}
                  className="bg-white text-emerald-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                >
                  <Pencil className="w-5 h-5" />
                  Request Custom Design
                </button>
                <button className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                  <Mail className="w-5 h-5" />
                  Contact Our Team
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Mobile Filter Popup */}
      <MobileFilterPopup />

      {/* Quick View Modal */}
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

      {/* Add custom CSS for animation */}
      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AllProducts;
