import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../lib/api";
import { useProjects } from "../context/ProjectsContext";
import Header from "../components/Header";
import Footer from "../components/Footer";

const Categories = () => {
  const { projects } = useProjects();
  const [categories, setCategories]     = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [showSearch, setShowSearch]     = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery]   = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/categories`);
        setCategories(res.data);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setError("Failed to load categories.");
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-50 flex items-center justify-center">
        <div className="text-brand-600 font-medium animate-pulse">Loading categories...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-brand-50 flex items-center justify-center">
        <div className="text-brand-800 font-medium">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-brand-50 min-h-screen">
      <Header
        showSearch={showSearch}
        setShowSearch={setShowSearch}
        showMobileMenu={showMobileMenu}
        setShowMobileMenu={setShowMobileMenu}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        projects={projects}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page heading */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-brand-800 mb-4">
            Explore Our Project Categories
          </h1>
          <p className="text-lg text-brand-600 max-w-2xl mx-auto">
            Explore Hillersons Investment Company's portfolio of commercial,
            residential, and social amenity projects across Kenya.
          </p>
        </div>

        {/* Category sections */}
        {categories.map((category) => (
          <div key={category._id} className="mb-16">
            <h2 className="text-2xl font-semibold text-brand-700 border-b-4 border-brand-500 inline-block pb-1 mb-6">
              {category._id}
            </h2>

            {(category.subcategories || []).length === 0 ? (
              <div className="text-brand-400 italic text-sm">
                No subcategories available
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {category.subcategories.map((sub) => (
                  <Link
                    key={sub.name}
                    to={`/categories/${encodeURIComponent(category._id)}/${encodeURIComponent(sub.name)}`}
                    className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl border border-brand-100 transform hover:-translate-y-1 transition duration-300 group"
                  >
                    {/* Image */}
                    <div
                      className="h-48 bg-cover bg-center relative"
                      style={{
                        backgroundImage: `url(${sub.image?.[0] || "/images/placeholder.jpg"})`,
                      }}
                    >
                      <span className="absolute top-3 right-3 bg-brand-600 text-white text-xs font-semibold rounded-full px-3 py-1 shadow">
                        {sub.count || 0} plans
                      </span>
                    </div>

                    {/* Card body */}
                    <div className="p-4">
                      <h3 className="text-base font-semibold text-brand-900 mb-1 group-hover:text-brand-600 transition-colors">
                        {sub.name}
                      </h3>
                      <p className="text-sm text-brand-600">
                        Explore {sub.count || 0} professionally designed{" "}
                        {sub.name.toLowerCase()}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <Footer />
    </div>
  );
};

export default Categories;