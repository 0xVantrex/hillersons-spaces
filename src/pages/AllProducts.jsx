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
  ChevronDown,
  Zap,
  TrendingUp,
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
} from "lucide-react";
import "../index.css";
import QuickViewModal from "../components/QuickViewModal";
import ProductCard from "../components/ProductCard";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { API_BASE_URL } from "../lib/api";

const AllProducts = () => {
  const navigate = useNavigate();
  const [quickViewPlan, setQuickViewPlan] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState(new Set());
  const [showQuickView, setShowQuickView] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [categories, setCategories] = useState([]);

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
      console.log("Fetched plans:", data); // 👈 check fields
      const normalizedData = data.map((item) => {
        const images =
          Array.isArray(item.finalImageURLs) && item.finalImageURLs.length > 0
            ? item.finalImageURLs
            : ["https://via.placeholder.com/600x400?text=No+Image"];

        return { ...item, images };
      });

      setProducts(normalizedData);
      console.log("🛠 Normalized products:", normalizedData);
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
          (activeCategory === "Luxury" && p.premium);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50">
        <div className="container mx-auto px-4 py-8">
          {/* Premium Loading Animation */}
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
            <div className="flex gap-6">
              <div className="w-80 h-96 bg-gradient-to-b from-gray-100 to-gray-200 rounded-2xl"></div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(9)].map((_, i) => (
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
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-emerald-50 to-white overflow-x-hidden">
      <Header
        showSearch={showSearch}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        showMobileMenu={showMobileMenu}
        setShowMobileMenu={setShowMobileMenu}
        setShowSearch={setShowSearch}
      />

      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Enhanced Hero Section */}
          <div className="mb-12">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/50 overflow-hidden backdrop-blur-sm">
              <div className="relative bg-gradient-to-r from-emerald-800 via-emerald-600 to-lime-500 p-10 text-white rounded-2xl shadow-xl overflow-hidden">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
                  <div className="absolute bottom-10 right-10 w-24 h-24 bg-yellow-300/20 rounded-full blur-lg animate-bounce"></div>
                  <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-pink-300/20 rounded-full blur-md animate-pulse delay-1000"></div>
                </div>

                <div className="relative z-10">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                          <Sparkles className="w-4 h-4 text-yellow-300" />
                          <span className="text-sm font-bold">
                            Premium Collection
                          </span>
                        </div>
                        <div className="flex items-center gap-2 bg-green-500/30 backdrop-blur-sm rounded-full px-4 py-2">
                          <CheckCircle className="w-4 h-4 text-green-200" />
                          <span className="text-sm font-semibold">
                            Verified Designs
                          </span>
                        </div>
                      </div>

                      <h1 className="text-5xl lg:text-6xl font-black mb-4 bg-gradient-to-r from-white via-yellow-100 to-green-100 bg-clip-text text-transparent leading-tight">
                        World-Class House Plans
                      </h1>
                      <p className="text-xl text-green-50 font-medium max-w-2xl">
                        {filteredProducts.length} Premium Architectural Designs
                        • Trusted by 10,000+ Builders Worldwide
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {trustIndicators.map((indicator, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 hover:bg-white/30 transition-all"
                        >
                          <indicator.icon
                            className={`w-5 h-5 ${indicator.color
                              .replace("text-", "text-")
                              .replace("-600", "-300")}`}
                          />
                          <span className="text-sm font-semibold">
                            {indicator.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Advanced Search Bar */}
                  <div className="relative">
                    <div className="flex flex-col lg:flex-row gap-4">
                      <div className="flex-1 relative">
                        <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                        <input
                          type="text"
                          placeholder="Search by plan name, architect, style, or features..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-16 pr-6 py-5 rounded-2xl border-0 shadow-xl text-gray-700 placeholder-gray-500 focus:ring-4 focus:ring-green-500/20 focus:outline-none text-lg font-medium backdrop-blur-sm"
                        />
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowFilters(!showFilters)}
                          className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-5 rounded-2xl transition-all duration-300 flex items-center gap-3 shadow-xl hover:shadow-2xl transform hover:scale-105"
                        >
                          <SlidersHorizontal className="w-5 h-5" />
                          <span className="font-bold">Advanced Filters</span>
                          {activeFiltersCount > 0 && (
                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                              {activeFiltersCount}
                            </span>
                          )}
                        </button>

                        <div className="flex bg-white/20 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl">
                          <button
                            onClick={() => setViewMode("grid")}
                            className={`p-5 transition-all duration-300 ${
                              viewMode === "grid"
                                ? "bg-white/30 text-white scale-110"
                                : "text-white/70 hover:text-white hover:bg-white/10"
                            }`}
                          >
                            <Grid className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => setViewMode("list")}
                            className={`p-5 transition-all duration-300 ${
                              viewMode === "list"
                                ? "bg-white/30 text-white scale-110"
                                : "text-white/70 hover:text-white hover:bg-white/10"
                            }`}
                          >
                            <List className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Category Navigation */}
          <div className="mb-12">
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {categories.map((category) => {
                const IconComponent = category.icon;
                const isActive = activeCategory === category.id;
                const categoryCount =
                  category.id === "all"
                    ? products.length
                    : products.filter((p) => {
                        if (category.id === "Residential")
                          return p.subCategoryGroup?.includes("Residential");
                        if (category.id === "Commercial")
                          return p.subCategoryGroup?.includes("Commercial");
                        if (category.id === "Social")
                          return p.subCategoryGroup?.includes("Social");
                        if (category.id === "Interior")
                          return p.subCategoryGroup?.includes("Interior");
                        if (category.id === "Renovation")
                          return p.subCategoryGroup?.includes("Renovation");
                        if (category.id === "Premium")
                          return p.premium?.includes("Luxury");
                        return false;
                      }).length;

                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`flex-shrink-0 group relative overflow-hidden rounded-2xl transition-all duration-500 transform hover:scale-105 ${
                      isActive
                        ? "bg-white shadow-2xl scale-105"
                        : "bg-white/80 hover:bg-white shadow-lg hover:shadow-xl"
                    }`}
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${
                        category.color
                      } opacity-${
                        isActive ? "20" : "10"
                      } group-hover:opacity-20 transition-opacity`}
                    ></div>
                    <div className="relative p-6 min-w-[200px]">
                      <div className="flex items-center justify-between mb-3">
                        <div
                          className={`p-3 rounded-xl bg-gradient-to-br ${category.color} text-white shadow-lg`}
                        >
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-800">
                            {categoryCount}
                          </div>
                          <div className="text-xs text-gray-500 font-medium">
                            designs
                          </div>
                        </div>
                      </div>
                      <h3 className="font-bold text-gray-800 text-lg">
                        {category.name}
                      </h3>
                      {isActive && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-blue-500 rounded-full"></div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-8">
            {/* Enhanced Filter Sidebar */}
            <div
              className={`${
                showFilters ? "block" : "hidden"
              } lg:block w-80 sticky top-4 h-[calc(100vh-1rem)] overflow-y-auto`}
            >
              <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/50 overflow-hidden backdrop-blur-sm">
                <div className="bg-gradient-to-r from-slate-50 via-green-50 to-blue-50 p-6 border-b border-slate-200/50">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      <Filter className="w-5 h-5 text-green-600" />
                      Filters
                    </h2>
                    <div className="flex items-center gap-3">
                      {activeFiltersCount > 0 && (
                        <button
                          onClick={clearFilters}
                          className="text-sm text-red-600 hover:text-red-700 font-bold transition-colors flex items-center gap-1"
                        >
                          <X className="w-4 h-4" />
                          Clear All
                        </button>
                      )}
                      <button
                        onClick={() => setShowFilters(false)}
                        className="lg:hidden p-2 hover:bg-gray-200 rounded-xl transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-8 max-h-[calc(100vh-200px)] overflow-y-auto">
                  {/* Premium Quick Filters */}
                  <div>
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-yellow-500" />
                      Premium Features
                    </h3>
                    <div className="space-y-4">
                      {[
                        {
                          key: "featured",
                          label: "Featured Plans",
                          icon: Award,
                          color: "text-yellow-500",
                        },
                        {
                          key: "newListing",
                          label: "New Releases",
                          icon: Sparkles,
                          color: "text-green-500",
                        },
                        {
                          key: "customizable",
                          label: "Customizable",
                          icon: SlidersHorizontal,
                          color: "text-blue-500",
                        },
                        {
                          key: "premium",
                          label: "Luxury Collection",
                          icon: Crown,
                          color: "text-purple-500",
                        },
                        {
                          key: "quickDelivery",
                          label: "Quick Delivery",
                          icon: Flashlight,
                          color: "text-orange-500",
                        },
                      ].map((filter) => (
                        <label
                          key={filter.key}
                          className="flex items-center gap-3 cursor-pointer group p-3 rounded-xl hover:bg-gray-50 transition-all"
                        >
                          <input
                            type="checkbox"
                            checked={filters[filter.key]}
                            onChange={(e) =>
                              setFilters({
                                ...filters,
                                [filter.key]: e.target.checked,
                              })
                            }
                            className="w-5 h-5 text-green-600 rounded focus:ring-green-500 focus:ring-2"
                          />
                          <filter.icon className={`w-5 h-5 ${filter.color}`} />
                          <span className="text-sm font-semibold text-gray-700 group-hover:text-green-600 transition-colors flex-1">
                            {filter.label}
                          </span>
                          {filters[filter.key] && (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Enhanced Price Range */}
                  <div>
                    <label className="block mb-4 font-bold text-gray-800 flex items-center gap-2">
                      <span>💰</span>
                      Price Range (KES)
                    </label>
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <input
                          type="number"
                          value={priceRange[0]}
                          onChange={(e) =>
                            setPriceRange([
                              Number(e.target.value),
                              priceRange[1],
                            ])
                          }
                          className="w-1/2 p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all font-medium"
                          placeholder="Min"
                        />
                        <input
                          type="number"
                          value={priceRange[1]}
                          onChange={(e) =>
                            setPriceRange([
                              priceRange[0],
                              Number(e.target.value),
                            ])
                          }
                          className="w-1/2 p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all font-medium"
                          placeholder="Max"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { label: "Under 100K", range: [0, 100000] },
                          { label: "100K - 500K", range: [100000, 500000] },
                          { label: "500K - 1M", range: [500000, 1000000] },
                          { label: "1M+", range: [1000000, 10000000] },
                        ].map((preset) => (
                          <button
                            key={preset.label}
                            onClick={() => setPriceRange(preset.range)}
                            className="text-xs bg-gray-100 hover:bg-green-100 text-gray-700 hover:text-green-700 px-3 py-2 rounded-lg transition-all font-medium"
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Sort Options */}
                  <div>
                    <label className="block mb-4 font-bold text-gray-800 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-500" />
                      Sort Results
                    </label>
                    <select
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all font-medium bg-white"
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                    >
                      <option value="featured">🏆 Featured First</option>
                      <option value="newest">✨ Newest Designs</option>
                      <option value="popular">🔥 Most Popular</option>
                      <option value="rating">⭐ Highest Rated</option>
                      <option value="downloads">📥 Most Downloaded</option>
                      <option value="price-low">💰 Price: Low to High</option>
                      <option value="price-high">💎 Price: High to Low</option>
                    </select>
                  </div>

                  {/* Advanced Filters Toggle */}
                  <button
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className="w-full p-4 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl font-bold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <SlidersHorizontal className="w-5 h-5" />
                    {showAdvancedFilters ? "Hide" : "Show"} Advanced Filters
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        showAdvancedFilters ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Advanced Filters Panel */}
                  {showAdvancedFilters && (
                    <div className="space-y-6 p-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block mb-3 font-semibold text-gray-800">
                            Min Rooms
                          </label>
                          <input
                            type="number"
                            value={filters.rooms}
                            onChange={(e) =>
                              setFilters({
                                ...filters,
                                rooms: Number(e.target.value),
                              })
                            }
                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                            placeholder="Any"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Enhanced Products Grid */}
            <div className="flex-1">
              {/* Results Header */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 p-6 bg-white rounded-2xl shadow-lg border border-slate-200/50">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {filteredProducts.length} Premium Designs Found
                  </h2>
                  <p className="text-gray-600">
                    {activeCategory === "all"
                      ? "Showing all categories"
                      : `Filtered by ${
                          categories.find((c) => c.id === activeCategory)?.name
                        }`}
                    {searchQuery && ` • Search: "${searchQuery}"`}
                  </p>
                </div>

                <div className="flex items-center gap-4 mt-4 lg:mt-0">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Eye className="w-4 h-4" />
                    <span>Live results</span>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>

                  <div className="flex bg-gray-100 rounded-xl p-1">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-3 rounded-lg transition-all duration-300 ${
                        viewMode === "grid"
                          ? "bg-white shadow-md text-green-600 scale-105"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <Grid className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-3 rounded-lg transition-all duration-300 ${
                        viewMode === "list"
                          ? "bg-white shadow-md text-green-600 scale-105"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <List className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/50 p-16 text-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-green-100 via-blue-100 to-purple-100 rounded-full mx-auto mb-8 flex items-center justify-center">
                    <Search className="w-16 h-16 text-green-600" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-800 mb-4">
                    No Designs Found
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
                    We couldn't find any house plans matching your criteria. Try
                    adjusting your filters or explore our featured collection.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={clearFilters}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                    >
                      Reset All Filters
                    </button>
                    <button
                      onClick={() => setActiveCategory("featured")}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                    >
                      Browse Featured
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {filteredProducts.map((product, index) => (
                    <div
                      key={product._id || index}
                      className="group transition-all duration-500 hover:scale-[1.02]"
                    >
                      <ProductCard
                        product={product}
                        isFavorite={favorites.has(product._id)}
                        onToggleFavorite={() => toggleFavorite(product._id)}
                        viewMode={viewMode}
                        onQuickView={() => handleQuickView(product)}
                        enhanced={true}
                      />
                    </div>
                  ))}

                  {/* Load More / Pagination */}
                  {filteredProducts.length >= 12 && (
                    <div className="mt-16 text-center">
                      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/50 p-8">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">
                          Showing {Math.min(filteredProducts.length, 12)} of{" "}
                          {filteredProducts.length} designs
                        </h3>
                        <button className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2 mx-auto">
                          <ArrowRight className="w-5 h-5" />
                          Load More Designs
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Call to Action Section */}
                  <div className="mt-16 bg-gradient-to-r from-white-600 to-white-700 rounded-3xl shadow-2xl text-green-600 p-12 text-center overflow-hidden relative">
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
                      <div className="absolute bottom-10 right-10 w-24 h-24 bg-yellow-300/20 rounded-full blur-lg animate-bounce"></div>
                    </div>

                    <div className="relative z-10">
                      <h2 className="text-4xl font-bold mb-4">
                        Can't Find Your Dream Design?
                      </h2>
                      <p className="text-xl text-green-600 mb-8 max-w-2xl mx-auto">
                        Our expert architects are ready to create a custom
                        design just for you. Get started today!
                      </p>

                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                          onClick={() => navigate("/custom-design")}
                          className="bg-white text-green-600 px-8 py-4 rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                        >
                          <Pencil className="w-5 h-5" />
                          Request Custom Design
                        </button>
                        <button className="bg-white/20 backdrop-blur-sm text-green-600 px-8 py-4 rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2">
                          <Mail className="w-5 h-5" />
                          Contact Architect
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Footer */}
          <Footer />

          {/*Quick View Modal */}
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
      </div>
    </div>
  );
};

export default AllProducts;
