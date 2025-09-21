// Categories.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../lib/api";
import { useProjects } from "../context/ProjectsContext";
import Header from "../components/Header";
import Footer from "../components/Footer";

const categoryOptions = {
  Commercial: [
    "Mixed use development",
    "Office park",
    "Commercial plaza",
    "Retail shops",
    "Godowns & warehouses",
    "Service station",
    "Hospitality development",
  ],
  Residential: [
    "Residential apartment development",
    "Residential house development",
    "Residential estate development",
  ],
  Social: [
    "Hospital development",
    "Education facility development",
    "Social market development",
    "Religion facility development",
  ],
  Interior: [],
  Renovation: [],
};

const Categories = () => {
  const { projects } = useProjects();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showSearch, setShowSearch] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

  if (loading)
    return <div className="text-center p-12">Loading categories...</div>;
  if (error)
    return <div className="text-center text-red-600 p-12">{error}</div>;

  return (
    <div className="bg-white min-h-screen px-6 py-12 max-w-7xl mx-auto">
      <Header
        showSearch={showSearch}
        setShowSearch={setShowSearch}
        showMobileMenu={showMobileMenu}
        setShowMobileMenu={setShowMobileMenu}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        projects={projects}
      />

      <h1 className="text-4xl font-extrabold text-emerald-700 text-center mb-4">
        Explore Our Project Categories
      </h1>
      <p className="text-lg text-lime-600 text-center max-w-2xl mx-auto mb-12">
        Explore Hillersons Investment Company's portfolio of commercial,
        residential, and social amenity projects across Kenya.
      </p>

      {Object.entries(categoryOptions).map(([mainCategory, subcategories]) => (
        <div key={mainCategory} className="mb-16">
          <h2 className="text-2xl font-semibold text-lime-600 border-b-4 border-emerald-500 inline-block pb-1 mb-6">
            {mainCategory}
          </h2>

          {subcategories.length === 0 ? (
            <div className="text-gray-500 italic">
              No subcategories available
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {subcategories.map((subName) => {
                // Find category in backend response
                const backendCategory = categories.find(
                  (c) => c._id === mainCategory
                );
                const subData =
                  backendCategory?.subcategories?.find(
                    (s) => s.name === subName
                  ) || {};

                return (
                  <Link
                    key={subName}
                    to={`/category/${encodeURIComponent(
                      mainCategory
                    )}/${encodeURIComponent(subName)}`}
                    className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transform hover:-translate-y-1 transition duration-300 border border-lime-100"
                  >
                    <div
                      className="h-48 bg-cover bg-center relative"
                      style={{
                        backgroundImage: `url(${
                          subData.image?.[0] || "/images/placeholder.jpg"
                        })`,
                      }}
                    >
                      <span className="absolute top-3 right-3 bg-emerald-600 text-white text-sm font-semibold rounded-full px-3 py-1 shadow">
                        {subData.count || 0} plans
                      </span>
                    </div>

                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-emerald-800 mb-1">
                        {subName}
                      </h3>
                      <p className="text-sm text-emerald-600">
                        Explore {subData.count || 0} professionally designed{" "}
                        {subName.toLowerCase()}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      ))}

      <Footer />
    </div>
  );
};

export default Categories;
