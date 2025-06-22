import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { Search, Filter, Grid, List, Heart, Share2, MapPin, Bed, Bath, Square, Building, Eye, ArrowRight, SlidersHorizontal, X, ChevronDown, Star, Zap, TrendingUp, Award, Download, Phone, Mail } from "lucide-react";
import '../index.css';

const AllProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState(new Set());
  const [hoveredCard, setHoveredCard] = useState(null);
  const [showQuickView, setShowQuickView] = useState(null);
  
  const [filters, setFilters] = useState({
    category: "",
    rooms: "",
    floors: "",
    featured: false,
    newListing: false,
    customizable: false
  });
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [areaRange, setAreaRange] = useState([0, 1000]);
  const [sort, setSort] = useState("featured");

  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, "projects"));
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        price: parseFloat(doc.data().price || 0),
        area: parseFloat(doc.data().length || 0) * parseFloat(doc.data().width || 0),
        featured: Math.random() > 0.7,
        newListing: Math.random() > 0.8,
        customizable: Math.random() > 0.6,
        rating: (Math.random() * 2 + 3).toFixed(1),
        views: Math.floor(Math.random() * 1000) + 100,
        saved: Math.floor(Math.random() * 50) + 5,
        architect: ["John Mbugua", "Sarah Kimani", "David Ochieng", "Grace Wanjiku"][Math.floor(Math.random() * 4)],
        completionTime: ["2-4 weeks", "3-6 weeks", "1-2 months"][Math.floor(Math.random() * 3)],
        includes: ["Architectural Plans", "Structural Plans", "3D Renders", "Material List"]
      }));
      setProducts(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = !searchQuery || 
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.architect?.toLowerCase().includes(searchQuery.toLowerCase());
      
      return (
        matchesSearch &&
        (!filters.category || p.subCategoryGroup?.includes(filters.category)) &&
        (!filters.rooms || parseInt(p.rooms || 0) >= parseInt(filters.rooms)) &&
        (!filters.floors || parseInt(p.floorCount || 0) >= parseInt(filters.floors)) &&
        (!filters.featured || p.featured) &&
        (!filters.newListing || p.newListing) &&
        (!filters.customizable || p.customizable) &&
        p.price >= priceRange[0] && p.price <= priceRange[1] &&
        p.area >= areaRange[0] && p.area <= areaRange[1]
      );
    }).sort((a, b) => {
      if (sort === "featured") return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      if (sort === "price-low") return a.price - b.price;
      if (sort === "price-high") return b.price - a.price;
      if (sort === "newest") return (b.newListing ? 1 : 0) - (a.newListing ? 1 : 0);
      if (sort === "popular") return b.views - a.views;
      if (sort === "rating") return parseFloat(b.rating) - parseFloat(a.rating);
      return 0;
    });
  }, [products, filters, priceRange, areaRange, sort, searchQuery]);

  const toggleFavorite = (productId) => {
    setFavorites(prev => {
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
      customizable: false
    });
    setPriceRange([0, 1000000]);
    setAreaRange([0, 1000]);
    setSort("featured");
    setSearchQuery("");
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length + 
    (priceRange[0] > 0 || priceRange[1] < 1000000 ? 1 : 0) +
    (areaRange[0] > 0 || areaRange[1] < 1000 ? 1 : 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50">
        <div className="container mx-auto px-4 py-8">
          {/* Premium Loading Animation */}
          <div className="animate-pulse">
            <div className="h-20 bg-gradient-to-r from-green-100 to-lime-100 rounded-2xl mb-8"></div>
            <div className="flex gap-6">
              <div className="w-80 h-96 bg-gradient-to-b from-gray-100 to-gray-200 rounded-2xl"></div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="h-56 bg-gradient-to-br from-green-100 to-lime-100"></div>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        {/* Premium Header Section */}
        <div className="mb-12">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200/50 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 via-lime-600 to-emerald-600 p-8 text-white">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                  <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-white to-green-100 bg-clip-text">
                    Professional House Plans & Designs
                  </h1>
                  <p className="text-green-100 text-lg font-medium">
                    {filteredProducts.length} Premium Architectural Designs • Trusted by 10,000+ Builders
                  </p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                    <Award className="w-5 h-5 text-yellow-300" />
                    <span className="text-sm font-semibold">Award Winning</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                    <TrendingUp className="w-5 h-5 text-lime-300" />
                    <span className="text-sm font-semibold">Fast Delivery</span>
                  </div>
                </div>
              </div>
              
              {/* Advanced Search Bar */}
              <div className="mt-8 relative">
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search by plan name, architect, or features..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-6 py-4 rounded-2xl border-0 shadow-lg text-gray-700 placeholder-gray-500 focus:ring-4 focus:ring-green-500/20 focus:outline-none text-lg"
                    />
                  </div>
                  
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-4 rounded-2xl transition-all duration-300 flex items-center gap-2 shadow-lg"
                  >
                    <SlidersHorizontal className="w-5 h-5" />
                    <span className="font-semibold">Filters</span>
                    {activeFiltersCount > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {activeFiltersCount}
                      </span>
                    )}
                  </button>
                  
                  <div className="flex bg-white/20 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-4 transition-all duration-300 ${viewMode === 'grid' ? 'bg-white/30 text-white' : 'text-white/70 hover:text-white'}`}
                    >
                      <Grid className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-4 transition-all duration-300 ${viewMode === 'list' ? 'bg-white/30 text-white' : 'text-white/70 hover:text-white'}`}
                    >
                      <List className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Enhanced Filter Sidebar */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block w-80 sticky top-4 h-fit`}>
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200/50 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-50 to-green-50 p-6 border-b border-slate-200/50">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-800">Refine Your Search</h2>
                  <div className="flex items-center gap-2">
                    {activeFiltersCount > 0 && (
                      <button 
                        onClick={clearFilters}
                        className="text-sm text-green-600 hover:text-green-700 font-semibold transition-colors"
                      >
                        Clear All
                      </button>
                    )}
                    <button 
                      onClick={() => setShowFilters(false)}
                      className="lg:hidden p-1 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-8">
                {/* Quick Filters */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    Quick Filters
                  </h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={filters.featured}
                        onChange={(e) => setFilters({...filters, featured: e.target.checked})}
                        className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                      />
                      <span className="text-sm font-medium text-gray-700 group-hover:text-green-600 transition-colors">
                        Featured Plans
                      </span>
                      <Award className="w-4 h-4 text-yellow-500 ml-auto" />
                    </label>
                    
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={filters.newListing}
                        onChange={(e) => setFilters({...filters, newListing: e.target.checked})}
                        className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                      />
                      <span className="text-sm font-medium text-gray-700 group-hover:text-green-600 transition-colors">
                        New Releases
                      </span>
                      <div className="w-2 h-2 bg-lime-500 rounded-full ml-auto animate-pulse"></div>
                    </label>
                    
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={filters.customizable}
                        onChange={(e) => setFilters({...filters, customizable: e.target.checked})}
                        className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                      />
                      <span className="text-sm font-medium text-gray-700 group-hover:text-green-600 transition-colors">
                        Customizable
                      </span>
                      <SlidersHorizontal className="w-4 h-4 text-green-500 ml-auto" />
                    </label>
                  </div>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block mb-3 font-semibold text-gray-800">Building Type</label>
                  <select
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all"
                    value={filters.category}
                    onChange={(e) => setFilters({...filters, category: e.target.value})}
                  >
                    <option value="">All Categories</option>
                    <option value="Commercial Projects">Commercial Buildings</option>
                    <option value="Residential Projects">Residential Homes</option>
                    <option value="Social Amenities Projects">Social Amenities</option>
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block mb-3 font-semibold text-gray-800">Price Range (KES)</label>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <input
                        type="number"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                        className="w-1/2 p-4 border border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all"
                        placeholder="Min"
                      />
                      <input
                        type="number"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                        className="w-1/2 p-4 border border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all"
                        placeholder="Max"
                      />
                    </div>
                    <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      Popular: KES 50,000 - 500,000
                    </div>
                  </div>
                </div>

                {/* Area Range */}
                <div>
                  <label className="block mb-3 font-semibold text-gray-800">Floor Area (sqm)</label>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      value={areaRange[0]}
                      onChange={(e) => setAreaRange([Number(e.target.value), areaRange[1]])}
                      className="w-1/2 p-4 border border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all"
                      placeholder="Min"
                    />
                    <input
                      type="number"
                      value={areaRange[1]}
                      onChange={(e) => setAreaRange([areaRange[0], Number(e.target.value)])}
                      className="w-1/2 p-4 border border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all"
                      placeholder="Max"
                    />
                  </div>
                </div>

                {/* Rooms & Floors */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-3 font-semibold text-gray-800">Min Rooms</label>
                    <input
                      type="number"
                      value={filters.rooms}
                      onChange={(e) => setFilters({...filters, rooms: e.target.value})}
                      className="w-full p-4 border border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all"
                      placeholder="Any"
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-3 font-semibold text-gray-800">Min Floors</label>
                    <input
                      type="number"
                      value={filters.floors}
                      onChange={(e) => setFilters({...filters, floors: e.target.value})}
                      className="w-full p-4 border border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all"
                      placeholder="Any"
                    />
                  </div>
                </div>

                {/* Sort Options */}
                <div>
                  <label className="block mb-3 font-semibold text-gray-800">Sort By</label>
                  <select
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all"
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                  >
                    <option value="featured">Featured First</option>
                    <option value="newest">Newest Designs</option>
                    <option value="popular">Most Popular</option>
                    <option value="rating">Highest Rated</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200/50 p-12 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-lime-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <Search className="w-12 h-12 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">No Plans Found</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  We couldn't find any house plans matching your criteria. Try adjusting your filters or explore our featured collection.
                </p>
                <button
                  onClick={clearFilters}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8" 
                : "space-y-6"
              }>
                {filteredProducts.map((product, index) => (
                  <div key={product.id || index}>
                    <ProductCard 
                      product={product} 
                      isFavorite={favorites.has(product.id)}
                      onToggleFavorite={() => toggleFavorite(product.id)}
                      viewMode={viewMode}
                      onQuickView={() => setShowQuickView(product)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick View Modal */}
        {showQuickView && (
          <QuickViewModal 
            product={showQuickView} 
            onClose={() => setShowQuickView(null)}
            isFavorite={favorites.has(showQuickView.id)}
            onToggleFavorite={() => toggleFavorite(showQuickView.id)}
          />
        )}
      </div>
    </div>
  );
};

const ProductCard = ({ product, isFavorite, onToggleFavorite, viewMode, onQuickView }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleImageClick = (e) => {
    const isInteractiveElement = e.target.closest('button, a, [role="button"]');
      if (!isInteractiveElement) {
          navigate(`/product/${product.id}`);
      }
  };

  const handleQuickBuy = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/quick-buy/${product.id}`);

  };
  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView();
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50 overflow-hidden hover:shadow-2xl transition-all duration-500 group">
        <div className="flex">
          <div className="w-80 h-48 bg-gradient-to-br from-green-100 to-lime-100 relative overflow-hidden">
            <img
              onClick={handleImageClick}
              src={product.finalImageURLs?.[0] || ''}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              onLoad={() => setImageLoaded(true)}
            />
            {product.featured && (
              <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                <Award className="w-3 h-3 inline mr-1" />
                FEATURED
              </div>
            )}
            {product.newListing && (
              <div className="absolute top-4 right-4 bg-gradient-to-r from-lime-400 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                NEW
              </div>
            )}
          </div>
          
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-green-600 transition-colors">
                    {product.title || "Premium House Plan"}
                  </h3>
                  <p className="text-gray-600 text-sm">by {product.architect}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      onToggleFavorite();
                    }}
                    className={`p-2 rounded-full transition-all duration-300 ${
                      isFavorite 
                        ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                        : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>
                  <button className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-600 transition-all duration-300">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <Bed className="w-5 h-5 text-green-600 mx-auto mb-1" />
                  <span className="text-sm font-semibold text-gray-800">{product.rooms || "-"}</span>
                  <p className="text-xs text-gray-600">Rooms</p>
                </div>
                <div className="text-center">
                  <Building className="w-5 h-5 text-green-600 mx-auto mb-1" />
                  <span className="text-sm font-semibold text-gray-800">{product.floorCount || "-"}</span>
                  <p className="text-xs text-gray-600">Floors</p>
                </div>
                <div className="text-center">
                  <Square className="w-5 h-5 text-green-600 mx-auto mb-1" />
                  <span className="text-sm font-semibold text-gray-800">{product.area ? `${product.area.toFixed(0)}` : "-"}</span>
                  <p className="text-xs text-gray-600">sqm</p>
                </div>
                <div className="text-center">
                  <Star className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
                  <span className="text-sm font-semibold text-gray-800">{product.rating}</span>
                  <p className="text-xs text-gray-600">Rating</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <span className="text-2xl font-bold text-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {product.price ? `KES ${product.price.toLocaleString()}` : "Contact for Price"}
                </span>
                <p className="text-sm text-gray-600">Delivery: {product.completionTime}</p>
              </div>
              
              <div className="flex gap-2">

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    onQuickView();
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-300 text-sm font-semibold"
                >
                  Quick View
                </button>
                <Link
                  to={`/product/${product.id}`}
                  className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                >
                  View Details
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="group relative bg-white rounded-2xl shadow-lg border border-slate-200/50 overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative h-64 bg-gradient-to-br from-green-100 to-lime-100 overflow-hidden"
      onClick={handleImageClick}
      >
        <img
          src={product.finalImageURLs?.[0] || ''}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          onLoad={() => setImageLoaded(true)}
        />
        
        {/* Overlay with Quick Actions */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
            <div className="flex gap-2">
              <button
                onClick={handleQuickView}
               className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-all duration-300 text-sm font-semibold"
              >
               <Eye className="w-4 h-4 inline mr-1" />
                Quick View
              </button>
              
              <button className="bg-white/20 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-white/30 transition-all duration-300">
                <Download className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onToggleFavorite();
                }}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  isFavorite 
                    ? 'bg-red-500 text-white' 
                    : 'bg-white/20 backdrop-blur-sm text-white hover:bg-red-500'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
              <button className="bg-white/20 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-green-500 transition-all duration-300">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Status Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {product.featured && (
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
              <Award className="w-3 h-3" />
              FEATURED
            </div>
          )}
          {product.newListing && (
            <div className="bg-gradient-to-r from-lime-400 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              NEW
            </div>
          )}
          {product.customizable && (
            <div className="bg-gradient-to-r from-emerald-400 to-teal-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              CUSTOMIZABLE
            </div>
          )}
        </div>

        {/* Rating Badge */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
          <Star className="w-3 h-3 text-yellow-500 fill-current" />
          <span className="text-xs font-semibold text-gray-800">{product.rating}</span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-green-600 transition-colors line-clamp-1">
            {product.title || "Premium House Plan"}
          </h3>
          <p className="text-sm text-gray-600 mb-2">by {product.architect}</p>
          
          <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {product.views} views
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              {product.saved} saved
            </span>
          </div>
        </div>

        {/* Property Features */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center bg-green-50 rounded-lg p-2">
            <Bed className="w-4 h-4 text-green-600 mx-auto mb-1" />
            <span className="text-sm font-semibold text-gray-800 block">{product.rooms || "-"}</span>
            <span className="text-xs text-gray-600">Rooms</span>
          </div>
          <div className="text-center bg-lime-50 rounded-lg p-2">
            <Building className="w-4 h-4 text-lime-600 mx-auto mb-1" />
            <span className="text-sm font-semibold text-gray-800 block">{product.floorCount || "-"}</span>
            <span className="text-xs text-gray-600">Floors</span>
          </div>
          <div className="text-center bg-emerald-50 rounded-lg p-2">
            <Square className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
            <span className="text-sm font-semibold text-gray-800 block">{product.area ? `${product.area.toFixed(0)}` : "-"}</span>
            <span className="text-xs text-gray-600">sqm</span>
          </div>
        </div>

        {/* Price and Action */}
        <div className="flex justify-between items-center w-full">
       <div className="min-w-0">
       <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent block break-words">
       {product.price ? `KES ${product.price.toLocaleString()}` : "Contact"}
       </span>
       <p className="text-xs text-gray-600">{product.completionTime}</p>
       </div>

          
          <Link
            to={`/product/${product.id}`}
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2 text-sm"
          >
            View Plan
            <ArrowRight className="w-4 h-4" />
          </Link>

          <button
            onClick={handleQuickBuy}
            className="bg-lime-600 text-white px-4 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2 text-sm"
          >
            Quick Buy
            <Zap className="w-4 h-4" />
          </button>

        </div>

        {/* What's Included */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-600 mb-2">Includes:</p>
          <div className="flex flex-wrap gap-1">
            {product.includes?.slice(0, 2).map((item, index) => (
              <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                {item}
              </span>
            ))}
            {product.includes?.length > 2 && (
              <span className="text-xs text-green-600 font-semibold">
                +{product.includes.length - 2} more
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const QuickViewModal = ({ product, onClose, isFavorite, onToggleFavorite }) => {
      const navigate = useNavigate();
      
      const handleQuickBuy = (e) => {
        onClose();
        navigate(`/quick-buy/${product.id}`);
      };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-green-50 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center rounded-t-3xl">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Quick Preview
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleFavorite}
              className={`p-3 rounded-full transition-all duration-300 ${
                isFavorite 
                  ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-3 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Section */}
            <div className="space-y-4">
              <div className="h-80 bg-gradient-to-br from-green-100 to-lime-100 rounded-2xl overflow-hidden relative">
                <img
                  src={product.finalImageURLs?.[0] || ''}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.featured && (
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      FEATURED
                    </div>
                  )}
                  {product.newListing && (
                    <div className="bg-gradient-to-r from-lime-400 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      NEW
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Images */}
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={product.finalImageURLs?.[i] || ''}
                      alt={`View ${i + 1}`}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300 cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Details Section */}
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {product.title || "Premium House Plan"}
                </h3>
                <p className="text-gray-600 mb-4">Designed by {product.architect}</p>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="font-semibold">{product.rating}</span>
                    <span className="text-gray-600 text-sm">(125 reviews)</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {product.views} views • {product.saved} saved
                  </div>
                </div>

                <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                  {product.price ? `KES ${product.price.toLocaleString()}` : "Contact for Price"}
                </div>
                <p className="text-gray-600">Delivery: {product.completionTime}</p>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <Bed className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <span className="text-lg font-bold text-gray-800 block">{product.rooms || "-"}</span>
                  <span className="text-sm text-gray-600">Bedrooms</span>
                </div>
                <div className="bg-lime-50 rounded-xl p-4 text-center">
                  <Bath className="w-6 h-6 text-lime-600 mx-auto mb-2" />
                  <span className="text-lg font-bold text-gray-800 block">{Math.ceil((product.rooms || 0) * 0.75)}</span>
                  <span className="text-sm text-gray-600">Bathrooms</span>
                </div>
                <div className="bg-emerald-50 rounded-xl p-4 text-center">
                  <Building className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                  <span className="text-lg font-bold text-gray-800 block">{product.floorCount || "-"}</span>
                  <span className="text-sm text-gray-600">Floors</span>
                </div>
                <div className="bg-teal-50 rounded-xl p-4 text-center">
                  <Square className="w-6 h-6 text-teal-600 mx-auto mb-2" />
                  <span className="text-lg font-bold text-gray-800 block">{product.area ? `${product.area.toFixed(0)}` : "-"}</span>
                  <span className="text-sm text-gray-600">sqm</span>
                </div>
              </div>

              {/* What's Included */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">What's Included:</h4>
                <div className="grid grid-cols-2 gap-2">
                  {product.includes?.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-lime-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Link
                  to={`/product/${product.id}`}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-xl font-semibold text-center hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  View Full Details
                </Link>
                <button
                onClick={handleQuickBuy}
                 className="bg-lime-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-lime-700 transition-colors flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Quick Buy
                </button>
                <button>
                  <Phone className="w-4 h-4" />
                  Contact
                </button>
              </div>

              {/* Contact Info */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Need Help?</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-green-600" />
                    <span>+254 763 831806</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-green-600" />
                    <span>HillersonsCompany@gmail.com</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllProducts;