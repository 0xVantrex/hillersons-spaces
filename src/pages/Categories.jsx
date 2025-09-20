// Categories.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";

const categoryData = [
  {
    main: "Commercial Projects",
    subcategories: [
      { name: "Mixed Use Development", count: 12, image: "/images/mixed-use.jpg" },
      { name: "Office Park", count: 8, image: "/images/office-park.jpg" },
      { name: "Commercial Plaza", count: 15, image: "/images/commercial-plaza.jpg" },
      { name: "Retail Shops", count: 24, image: "/images/retail-shops.jpg" },
      { name: "Godowns & Warehouses", count: 18, image: "/images/warehouses.jpg" },
      { name: "Service Station", count: 6, image: "/images/service-station.jpg" },
      { name: "Hospitality Development", count: 9, image: "/images/hospitality.jpg" }
    ]
  },
  {
    main: "Residential Projects",
    subcategories: [
      { name: "Residential Apartment Development", count: 22, image: "/images/apartments.jpg" },
      { name: "Residential House Development", count: 35, image: "/images/houses.jpg" },
      { name: "Residential Estate Development", count: 14, image: "/images/estates.jpg" }
    ]
  },
  {
    main: "Social Amenities Projects",
    subcategories: [
      { name: "Hospital Development", count: 7, image: "/images/hospital.jpg" },
      { name: "Education Facility Development", count: 11, image: "/images/education.jpg" },
      { name: "Social Market Development", count: 5, image: "/images/social-market.jpg" },
      { name: "Religion Facility Development", count: 8, image: "/images/religious.jpg" }
    ]
  },
  {
    main: "Interior Design",
    subcategories: [
      { name: "Commercial Interior Design", count: 28, image: "/images/commercial-interior.jpg" },
      { name: "Residential Interior Design", count: 42, image: "/images/residential-interior.jpg" },
      { name: "Hospitality Interior Design", count: 16, image: "/images/hospitality-interior.jpg" },
      { name: "Office Interior Design", count: 19, image: "/images/office-interior.jpg" }
    ]
  },
  {
    main: "Renovation Work",
    subcategories: [
      { name: "Commercial Renovation", count: 21, image: "/images/commercial-renovation.jpg" },
      { name: "Residential Renovation", count: 33, image: "/images/residential-renovation.jpg" },
      { name: "Facility Upgrades", count: 17, image: "/images/facility-upgrades.jpg" },
      { name: "Heritage Building Restoration", count: 8, image: "/images/heritage-restoration.jpg" }
    ]
  }
];

const Categories = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="px-6 py-12 max-w-7xl mx-auto bg-white">
      <Header 
        showSearch={showSearch}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        showMobileMenu={showMobileMenu}
        setShowMobileMenu={setShowMobileMenu}
        setShowSearch={setShowSearch}
      />

      <h1 className="text-4xl font-extrabold text-emerald-700 mb-4 text-center">
        Explore Our Project Categories
      </h1>
      <p className="text-lg text-lime-600 max-w-2xl mx-auto text-center mb-12">
        Explore Hillersons Investment Company's comprehensive portfolio of commercial, residential, and social amenity development projects across Kenya.
      </p>

      {categoryData.map((category) => (
        <div key={category.main} className="mb-16">
          <h2 className="text-2xl font-semibold text-lime-600 border-b-4 border-emerald-500 inline-block pb-1 mb-6">
            {category.main}
          </h2>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {category.subcategories.map((sub) => (
              <Link 
                key={sub.name}
                to={`/category/${encodeURIComponent(category.main)}/${encodeURIComponent(sub.name)}`}
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transform hover:-translate-y-1 transition duration-300 border border-lime-100"
              >
                <div className="h-48 bg-cover bg-center relative" style={{ backgroundImage: `url(${sub.image})` }}>
                  <span className="absolute top-3 right-3 bg-emerald-600 text-white text-sm font-semibold rounded-full px-3 py-1 shadow">
                    {sub.count} plans
                  </span>
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-semibold text-emerald-800 mb-1">
                    {sub.name}
                  </h3>
                  <p className="text-sm text-emerald-600">
                    Explore {sub.count} professionally designed {sub.name.toLowerCase()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}

      <div className="bg-gradient-to-r from-emerald-700 to-lime-600 text-white p-8 rounded-xl mt-16 text-center">
        <h3 className="text-xl font-semibold mb-6">Why Choose Our Designs?</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div>
            <div className="text-2xl font-bold text-white">300+</div>
            <p className="text-lime-100">Completed Projects</p>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">15+</div>
            <p className="text-lime-100">Years Experience</p>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">500+</div>
            <p className="text-lime-100">Satisfied Clients</p>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">24/7</div>
            <p className="text-lime-100">Professional Support</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;
