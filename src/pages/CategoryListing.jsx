// src/pages/CategoryListing.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../lib/api";
import { useProjects } from "../context/ProjectsContext";
import Header from "../components/Header";
import Footer from "../components/Footer";

const CategoryListing = () => {
  const { projects } = useProjects();
  const { subCategoryGroup, subCategory } = useParams();
  const navigate = useNavigate();
  const [setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [showSearch, setShowSearch] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Decode URL parameters
  const decodedGroup = decodeURIComponent(subCategoryGroup || "");
  const decodedSub = decodeURIComponent(subCategory || "");
  const displayTitle = subCategory ? decodedSub : decodedGroup;

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);

        const queryParams = new URLSearchParams({
          subCategoryGroup: decodedGroup,
          subCategory: decodedSub,
          sortBy,
          search: searchTerm || "",
          minPrice: priceRange.min || "",
          maxPrice: priceRange.max || "",
        });

        const res = await fetch(`${API_BASE_URL}/api/projects?${queryParams}`);
        if (!res.ok) throw new Error("Failed to fetch projects");

        const data = await res.json();
        setProjects(data);
      } catch (err) {
        console.error("Error fetching projects:", err);
        setError("Failed to load projects for this category.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [decodedGroup, decodedSub, sortBy, searchTerm, priceRange]);

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
  };

  const formatPrice = (price) => {
    if (!price) return "Price on Request";
    return `KES ${price.toLocaleString()}`;
  };

  const formatSpecs = (project) => {
    const specs = [];
    if (project.area) specs.push(`${project.area} sq ft`);
    if (project.bedrooms) specs.push(`${project.bedrooms} bed`);
    if (project.bathrooms) specs.push(`${project.bathrooms} bath`);
    if (project.floors) specs.push(`${project.floors} floors`);
    return specs.join(" • ");
  };

  // Filter projects based on search and price range
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPrice =
      (!priceRange.min || project.price >= parseInt(priceRange.min)) &&
      (!priceRange.max || project.price <= parseInt(priceRange.max));

    return matchesSearch && matchesPrice;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
          <div className="text-xl text-green-600 font-semibold">
            Loading {displayTitle}...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-green-50 p-4">
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center max-w-md w-full shadow-lg">
          <div className="text-5xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-red-600 mb-4">{error}</h3>
          <button
            onClick={() => window.location.reload()}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50">
      <Header
        showSearch={showSearch}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        showMobileMenu={showMobileMenu}
        setShowMobileMenu={setShowMobileMenu}
        setShowSearch={setShowSearch}
        projects={projects}
      />
      {/* Hero Section with Background Image */}
      <div
        className="relative h-[60vh] md:h-[70vh] bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://res.cloudinary.com/dbj7nhyy4/image/upload/v1750537577/IMG-20250616-WA0197_qgi54a.jpg')",
        }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 to-black/40 z-0" />

        {/* Breadcrumb + Text Content */}
        <div className="relative z-10 max-w-6xl mx-auto h-full flex flex-col justify-center px-6 text-white">
          {/* Breadcrumb Navigation */}
          <nav className="text-sm text-white/70 mb-4">
            <Link to="/" className="hover:text-white transition">
              Home
            </Link>
            <span className="mx-2">›</span>
            <Link to="/categories" className="hover:text-white transition">
              Categories
            </Link>
            {subCategoryGroup && (
              <>
                <span className="mx-2">›</span>
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
                <span className="mx-2">›</span>
                <span className="font-semibold">{decodedSub}</span>
              </>
            )}
          </nav>

          {/* Main Heading + Description */}
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight drop-shadow-md">
            {displayTitle}
          </h1>
          <p className="mt-4 text-lg md:text-xl max-w-2xl text-white/90 drop-shadow-sm">
            Explore our expertly designed {displayTitle.toLowerCase()} —
            blending style, comfort, and architectural innovation. We currently
            have <span className="font-bold">{filteredProjects.length}</span>{" "}
            premium listing{filteredProjects.length === 1 ? "" : "s"} available.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Advanced Filters */}
        <div className="bg-white rounded-2xl p-6 mb-8 shadow-lg border border-green-100">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Sort Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-gray-600 font-medium mr-2">Sort by:</span>
              {[
                { value: "newest", label: "Newest" },
                { value: "price-low", label: "Price: Low to High" },
                { value: "price-high", label: "Price: High to Low" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSortChange(option.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    sortBy === option.value
                      ? "bg-green-500 text-white shadow-lg"
                      : "bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-600"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* Price Range */}
            <div className="flex items-center gap-2">
              <span className="text-gray-600 font-medium">Price:</span>
              <input
                type="number"
                placeholder="Min"
                value={priceRange.min}
                onChange={(e) =>
                  setPriceRange({ ...priceRange, min: e.target.value })
                }
                className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <span className="text-gray-400">-</span>
              <input
                type="number"
                placeholder="Max"
                value={priceRange.max}
                onChange={(e) =>
                  setPriceRange({ ...priceRange, max: e.target.value })
                }
                className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-full p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  viewMode === "grid"
                    ? "bg-green-500 text-white shadow-md"
                    : "text-gray-600 hover:text-green-600"
                }`}
              >
                ⊞ Grid
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  viewMode === "list"
                    ? "bg-green-500 text-white shadow-md"
                    : "text-gray-600 hover:text-green-600"
                }`}
              >
                ☰ List
              </button>
            </div>
          </div>
        </div>

        {/* Projects Display */}
        {filteredProjects.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-lg border border-green-100">
            <div className="text-6xl mb-6">🏗️</div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-4">
              No projects found in {displayTitle}
            </h3>
            <p className="text-gray-500 mb-8 text-lg">
              We're constantly adding new projects. Check back soon or explore
              other categories.
            </p>
            <button
              onClick={() => navigate("/categories")}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Browse All Categories
            </button>
          </div>
        ) : (
          <div
            className={`${
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                : "space-y-6"
            }`}
          >
            {filteredProjects.map((project) => (
              <div
                key={project._id}
                className={`bg-white rounded-2xl overflow-hidden shadow-lg border border-green-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group ${
                  viewMode === "list" ? "flex" : "block"
                }`}
              >
                {/* Project Image */}
                <div
                  className={`relative overflow-hidden ${
                    viewMode === "list"
                      ? "w-80 h-48 flex-shrink-0"
                      : "w-full h-64"
                  }`}
                >
                  {project.finalImageURLs && project.finalImageURLs[0] ? (
                    <img
                      src={project.finalImageURLs[0]}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-green-50 flex items-center justify-center text-5xl text-green-300">
                      🏗️
                    </div>
                  )}

                  {/* Price Badge */}
                  <div className="absolute top-4 right-4 bg-lime-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                    {formatPrice(project.price)}
                  </div>

                  {/* Favorite Button */}
                  <button className="absolute top-4 left-4 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 transition-all duration-300 shadow-lg">
                    <span className="text-red-500 hover:text-red-600 text-lg">
                      ♡
                    </span>
                  </button>
                </div>

                {/* Project Details */}
                <div className="p-6 flex-1">
                  <h2 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2 group-hover:text-green-600 transition-colors">
                    {project.title}
                  </h2>

                  {/* Specifications */}
                  {formatSpecs(project) && (
                    <div className="flex items-center text-gray-600 text-sm mb-3">
                      <span className="mr-2">📐</span>
                      <span className="font-medium">
                        {formatSpecs(project)}
                      </span>
                    </div>
                  )}

                  {/* Description Preview */}
                  {project.description && (
                    <p
                      className={`text-gray-600 mb-4 leading-relaxed ${
                        viewMode === "list" ? "line-clamp-3" : "line-clamp-2"
                      }`}
                    >
                      {project.description}
                    </p>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between">
                    <Link
                      to={`/project/${project._id}`}
                      className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl group-hover:scale-105"
                    >
                      View Details →
                    </Link>

                    <div className="flex gap-2">
                      <button className="bg-green-50 hover:bg-green-100 text-green-600 p-3 rounded-full transition-all duration-300 shadow-md hover:shadow-lg">
                        📞
                      </button>
                      <button className="bg-lime-50 hover:bg-lime-100 text-lime-600 p-3 rounded-full transition-all duration-300 shadow-md hover:shadow-lg">
                        💬
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {filteredProjects.length > 0 && (
          <div className="text-center mt-12">
            <button className="bg-white hover:bg-green-50 text-green-600 font-semibold py-4 px-8 rounded-full border-2 border-green-500 transition-all duration-300 shadow-lg hover:shadow-xl">
              Load More Projects
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default CategoryListing;
